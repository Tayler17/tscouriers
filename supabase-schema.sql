-- ============================================================
-- TS COURIERS — Supabase Schema
-- Ejecuta esto en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name                  TEXT NOT NULL DEFAULT '',
  email                 TEXT NOT NULL DEFAULT '',
  role                  TEXT NOT NULL DEFAULT 'CUSTOMER',
  phone                 TEXT,
  can_access_accounting BOOLEAN DEFAULT FALSE,
  can_access_hr         BOOLEAN DEFAULT FALSE,
  can_access_shipments  BOOLEAN DEFAULT TRUE,
  can_access_containers BOOLEAN DEFAULT TRUE,
  can_access_analytics  BOOLEAN DEFAULT FALSE,
  can_access_settings   BOOLEAN DEFAULT FALSE,
  can_access_users      BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONTAINERS
CREATE TABLE IF NOT EXISTS public.containers (
  id          TEXT PRIMARY KEY,
  vessel      TEXT DEFAULT '',
  flight      TEXT DEFAULT '-',
  destination TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Loading',
  count       INTEGER DEFAULT 0,
  date        TEXT DEFAULT '',
  type        TEXT NOT NULL DEFAULT '40ft',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SHIPMENTS
CREATE TABLE IF NOT EXISTS public.shipments (
  id           TEXT PRIMARY KEY,
  customer     TEXT NOT NULL,
  destination  TEXT NOT NULL,
  origin       TEXT,
  type         TEXT NOT NULL DEFAULT 'Box',
  weight       TEXT DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'In Warehouse',
  date         TEXT DEFAULT '',
  container_id TEXT REFERENCES public.containers(id),
  notes        TEXT,
  metadata     JSONB DEFAULT '{}',
  items        JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id                 TEXT PRIMARY KEY,
  customer           TEXT NOT NULL,
  route              TEXT NOT NULL,
  date               TEXT DEFAULT '',
  status             TEXT NOT NULL DEFAULT 'Pending Pickup',
  type               TEXT NOT NULL DEFAULT 'Box',
  collection_address TEXT,
  delivery_address   TEXT,
  total_amount       DECIMAL(10,2),
  plan_id            TEXT DEFAULT 'standard',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUOTES
CREATE TABLE IF NOT EXISTS public.quotes (
  id          TEXT PRIMARY KEY,
  customer    TEXT NOT NULL,
  origin      TEXT NOT NULL,
  destination TEXT NOT NULL,
  weight      TEXT DEFAULT '',
  service     TEXT NOT NULL DEFAULT 'Sea Freight',
  status      TEXT NOT NULL DEFAULT 'Pending',
  date        TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRACKING EVENTS
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id TEXT REFERENCES public.shipments(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  location    TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.containers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Profiles: cada usuario ve el suyo, admins ven todos
CREATE POLICY "Own profile read" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin full profile access" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Shipments, Bookings, Containers, Quotes: lectura pública (tracking), escritura solo admins/staff
CREATE POLICY "Public read shipments" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Staff write shipments" ON public.shipments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF'))
);

CREATE POLICY "Public read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Staff write bookings" ON public.bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF'))
);

CREATE POLICY "Public read containers" ON public.containers FOR SELECT USING (true);
CREATE POLICY "Staff write containers" ON public.containers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF'))
);

CREATE POLICY "Public read quotes" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Staff write quotes" ON public.quotes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF'))
);

CREATE POLICY "Public read tracking" ON public.tracking_events FOR SELECT USING (true);
CREATE POLICY "Staff write tracking" ON public.tracking_events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF'))
);

-- ============================================================
-- TRIGGER: auto-crear profile cuando se registra un usuario
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER');
  INSERT INTO public.profiles (
    id, name, email, role,
    can_access_accounting, can_access_hr, can_access_shipments,
    can_access_containers, can_access_analytics, can_access_settings, can_access_users
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    v_role,
    (v_role = 'ADMIN'),
    (v_role = 'ADMIN'),
    (v_role IN ('ADMIN','STAFF')),
    (v_role IN ('ADMIN','STAFF')),
    (v_role = 'ADMIN'),
    (v_role = 'ADMIN'),
    (v_role = 'ADMIN')
  )
  ON CONFLICT (id) DO UPDATE SET
    name  = EXCLUDED.name,
    email = EXCLUDED.email,
    role  = EXCLUDED.role,
    can_access_accounting  = EXCLUDED.can_access_accounting,
    can_access_hr          = EXCLUDED.can_access_hr,
    can_access_shipments   = EXCLUDED.can_access_shipments,
    can_access_containers  = EXCLUDED.can_access_containers,
    can_access_analytics   = EXCLUDED.can_access_analytics,
    can_access_settings    = EXCLUDED.can_access_settings,
    can_access_users       = EXCLUDED.can_access_users;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- DATOS INICIALES (los mismos que tenías en localStorage)
-- ============================================================

INSERT INTO public.containers (id, vessel, flight, destination, status, count, date, type) VALUES
  ('CONT-4091', 'MSC VALENCIA',   '-',     'SDQ - Haina',    'In Transit',    142, '25 Mar', '40ft'),
  ('CONT-4092', 'SEA PROMISE',    '-',     'SDQ - Haina',    'Loading',        85, '28 Mar', '40ft'),
  ('CONT-4093', '-',              'AM621', 'Puj - Punta Cana','Ready to Ship', 12, '29 Mar', 'Air Cargo'),
  ('CONT-4094', 'MAERSK ALABAMA', '-',     'SDQ - Caucedo',  'Delivered',     156, '10 Mar', '20ft')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.shipments (id, customer, destination, type, weight, status, date) VALUES
  ('TS-9011', 'Carlos Ruiz',   'Santo Domingo', 'Barrel',      '45kg',  'In Warehouse',  '28 Mar'),
  ('TS-9012', 'Elena Gomez',   'Santiago',      'Box x3',      '22kg',  'In Warehouse',  '28 Mar'),
  ('TS-9013', 'Juan Valdez',   'Puerto Plata',  'Furniture',   '120kg', 'In Warehouse',  '27 Mar'),
  ('TS-9014', 'Sofia Loren',   'Santo Domingo', 'Electronics', '15kg',  'Ready to Ship', '27 Mar'),
  ('TS-9015', 'Miguel Angel',  'La Vega',       'Barrel x2',   '90kg',  'In Warehouse',  '26 Mar'),
  ('TS-9016', 'Rosa Parks',    'Santo Domingo', 'Box',         '10kg',  'In Warehouse',  '26 Mar')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.bookings (id, customer, route, date, status, type) VALUES
  ('TS-7821', 'Ricardo Peña',    'London ➔ SDQ',          '28 Mar 2026', 'In Warehouse',  'Barrel'),
  ('TS-7822', 'Sarah Johnson',   'Madrid ➔ Santiago',      '27 Mar 2026', 'At Sea',        'Box x3'),
  ('TS-7823', 'Juan Perez',      'London ➔ Puerto Plata',  '26 Mar 2026', 'Delivered',     'Furniture'),
  ('TS-7824', 'Maria Rodriguez', 'London ➔ SDQ',           '25 Mar 2026', 'Pending Pickup','Barrel x2'),
  ('TS-7825', 'David Smith',     'Barcelona ➔ SDQ',        '24 Mar 2026', 'In Custom',     'Electronics')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quotes (id, customer, origin, destination, weight, service, status, date) VALUES
  ('QT-8801', 'Sarah Johnson',   'London, UK',    'Santo Domingo, DR', '450kg',   'Sea Freight',    'Pending',  '28 Mar'),
  ('QT-8802', 'David Smith',     'Madrid, ES',    'Santiago, DR',      '120kg',   'Air Freight',    'Approved', '27 Mar'),
  ('QT-8803', 'Maria Rodriguez', 'London, UK',    'Puerto Plata, DR',  '2 Barrels','Sea Freight',   'Expired',  '25 Mar'),
  ('QT-8804', 'John Doe',        'Barcelona, ES', 'Santo Domingo, DR', '1500kg',  'Full Container', 'Approved', '24 Mar'),
  ('QT-8805', 'Elena Perez',     'Manchester, UK','Samana, DR',        '55kg',    'Air Freight',    'Pending',  '23 Mar')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TABLAS ADICIONALES (módulos del sistema)
-- ============================================================

-- 7. ROUTES
CREATE TABLE IF NOT EXISTS public.routes (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  origin      TEXT NOT NULL,
  destination TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'Sea',
  duration    TEXT DEFAULT '',
  frequency   TEXT DEFAULT 'Monthly',
  status      TEXT NOT NULL DEFAULT 'Active',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DRIVERS
CREATE TABLE IF NOT EXISTS public.drivers (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  phone            TEXT DEFAULT '',
  email            TEXT DEFAULT '',
  vehicle          TEXT DEFAULT '',
  plate            TEXT DEFAULT '',
  zone             TEXT DEFAULT 'London',
  status           TEXT NOT NULL DEFAULT 'Available',
  shipments_count  INTEGER DEFAULT 0,
  joined_at        TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 9. EMPLOYEES (HR)
CREATE TABLE IF NOT EXISTS public.employees (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL,
  department  TEXT DEFAULT 'Operations',
  email       TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  location    TEXT DEFAULT 'London',
  status      TEXT NOT NULL DEFAULT 'Active',
  salary      TEXT DEFAULT '',
  joined_at   TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BRANCHES
CREATE TABLE IF NOT EXISTS public.branches (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  type    TEXT DEFAULT 'Warehouse',
  address TEXT DEFAULT '',
  country TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  staff   INTEGER DEFAULT 0,
  status  TEXT NOT NULL DEFAULT 'Active'
);

-- 11. RATES (Tarifas de flete)
CREATE TABLE IF NOT EXISTS public.rates (
  id          TEXT PRIMARY KEY,
  item        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'Sea Freight',
  origin      TEXT DEFAULT 'London',
  destination TEXT DEFAULT 'DR',
  rate        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Active',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 12. MATERIALS (Inventario de almacén)
CREATE TABLE IF NOT EXISTS public.materials (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  stock        INTEGER DEFAULT 0,
  min_required INTEGER DEFAULT 10,
  price        TEXT DEFAULT '',
  category     TEXT DEFAULT 'Supplies',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 13. INVOICES (Contabilidad)
CREATE TABLE IF NOT EXISTS public.invoices (
  id         TEXT PRIMARY KEY,
  client     TEXT NOT NULL,
  amount     TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'Pending',
  date       TEXT DEFAULT '',
  due        TEXT DEFAULT 'In 30 Days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EXPENSES (Contabilidad)
CREATE TABLE IF NOT EXISTS public.expenses (
  id         TEXT PRIMARY KEY,
  category   TEXT DEFAULT '',
  vendor     TEXT NOT NULL,
  amount     TEXT NOT NULL,
  date       TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. NEWS (Noticias del sitio público)
CREATE TABLE IF NOT EXISTS public.news (
  id          TEXT PRIMARY KEY,
  tag         TEXT DEFAULT 'NEW UPDATE',
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  more_info   TEXT DEFAULT '',
  urgent      BOOLEAN DEFAULT FALSE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 16. FAQS (Preguntas frecuentes del sitio público)
CREATE TABLE IF NOT EXISTS public.faqs (
  id         TEXT PRIMARY KEY,
  q          TEXT NOT NULL,
  a          TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ADDRESS BOOK (Admin — contactos frecuentes)
CREATE TABLE IF NOT EXISTS public.address_book (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  phone   TEXT DEFAULT '',
  email   TEXT DEFAULT '',
  address TEXT NOT NULL,
  city    TEXT DEFAULT '',
  country TEXT DEFAULT 'Dominican Republic',
  notes   TEXT DEFAULT ''
);

-- 18. CONTACTS (Customer — agenda personal por usuario)
CREATE TABLE IF NOT EXISTS public.contacts (
  id           TEXT PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  city         TEXT NOT NULL,
  address      TEXT DEFAULT '',
  phone        TEXT DEFAULT '',
  relationship TEXT DEFAULT 'Other',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 19. PLAN SETTINGS (Sobrecargos de planes de servicio)
CREATE TABLE IF NOT EXISTS public.plan_settings (
  id        TEXT PRIMARY KEY,
  surcharge NUMERIC DEFAULT 0
);
INSERT INTO public.plan_settings (id, surcharge) VALUES
  ('standard', 0),
  ('premium', 15)
ON CONFLICT (id) DO NOTHING;

-- 20. COMPANY SETTINGS (Configuración global de la empresa)
CREATE TABLE IF NOT EXISTS public.company_settings (
  id                TEXT PRIMARY KEY DEFAULT 'main',
  company_name      TEXT DEFAULT 'TS Couriers',
  support_email     TEXT DEFAULT '',
  warehouse_address TEXT DEFAULT '',
  currency          TEXT DEFAULT 'GBP'
);
INSERT INTO public.company_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS para tablas adicionales (acceso staff/admin)
-- ============================================================

ALTER TABLE public.routes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.address_book  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Lectura pública para contenido del sitio
CREATE POLICY "Public read news"          ON public.news          FOR SELECT USING (true);
CREATE POLICY "Public read faqs"          ON public.faqs          FOR SELECT USING (true);
CREATE POLICY "Public read routes"        ON public.routes        FOR SELECT USING (true);
CREATE POLICY "Public read rates"         ON public.rates         FOR SELECT USING (true);
CREATE POLICY "Public read plan_settings" ON public.plan_settings FOR SELECT USING (true);

-- Staff/Admin write para tablas de operación
CREATE POLICY "Staff manage routes"    ON public.routes    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));
CREATE POLICY "Staff manage drivers"   ON public.drivers   FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));
CREATE POLICY "Staff manage employees" ON public.employees FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));
CREATE POLICY "Staff manage branches"  ON public.branches  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));
CREATE POLICY "Staff manage rates"     ON public.rates     FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));
CREATE POLICY "Staff manage materials" ON public.materials FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));
CREATE POLICY "Staff manage invoices"  ON public.invoices  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));
CREATE POLICY "Staff manage expenses"  ON public.expenses  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));
CREATE POLICY "Staff manage news"      ON public.news      FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));
CREATE POLICY "Staff manage faqs"      ON public.faqs      FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));
CREATE POLICY "Staff manage address_book" ON public.address_book FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));
CREATE POLICY "Admin manage plan_settings" ON public.plan_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admin manage company_settings" ON public.company_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Public read company_settings" ON public.company_settings FOR SELECT USING (true);

-- Contacts: cada usuario ve y gestiona los suyos
CREATE POLICY "Own contacts access" ON public.contacts
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 23. PARTNERS (empresas socias / subcontratistas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.partners (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'Freight Agent',
  country      TEXT DEFAULT '',
  city         TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  phone        TEXT DEFAULT '',
  email        TEXT DEFAULT '',
  specialties  TEXT DEFAULT '',
  commission   NUMERIC DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'Active',
  notes        TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage partners" ON public.partners
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));

-- Campo en shipments para subcontratación
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS partner_id   TEXT DEFAULT NULL;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS partner_name TEXT DEFAULT NULL;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS partner_ref  TEXT DEFAULT NULL;

-- Campo en bookings para subcontratación
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS partner_id   TEXT DEFAULT NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS partner_name TEXT DEFAULT NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS partner_ref  TEXT DEFAULT NULL;

-- ============================================================
-- MIGRATIONS (ejecutar en Supabase SQL Editor si la tabla ya existe)
-- ============================================================

-- Agregar columna metadata a shipments (datos extendidos del envío)
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Agregar campos de driver a quotes (para asignación de recogida/entrega)
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS driver_id   TEXT DEFAULT NULL;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS driver_name TEXT DEFAULT NULL;

-- Tabla de órdenes de materiales (shop orders)
CREATE TABLE IF NOT EXISTS public.material_orders (
  id               TEXT PRIMARY KEY,
  customer_name    TEXT NOT NULL DEFAULT '',
  email            TEXT DEFAULT '',
  phone            TEXT DEFAULT '',
  delivery_address TEXT DEFAULT '',
  items            JSONB DEFAULT '[]',
  total            TEXT DEFAULT '£0.00',
  status           TEXT NOT NULL DEFAULT 'Pending',
  driver_id        TEXT DEFAULT NULL,
  driver_name      TEXT DEFAULT NULL,
  notes            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.material_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage material_orders" ON public.material_orders
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF')));

-- ============================================================
-- 21. NOTIFICATIONS (driver/user assignment notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'info',
  title      TEXT NOT NULL DEFAULT '',
  message    TEXT DEFAULT '',
  read       BOOLEAN NOT NULL DEFAULT false,
  data       JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 22. RATE ZONES (group cities/postcodes into logical zones)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rate_zones (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  country    TEXT NOT NULL DEFAULT '',
  keywords   TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.rate_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read zones" ON public.rate_zones
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage zones" ON public.rate_zones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF'))
  );

-- ============================================================
-- 23. BOOKING CUSTOMER IDENTITY FIELDS
--     Allows customer portal to filter bookings by email
--     instead of relying on the (fragile) name match.
-- ============================================================
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_email TEXT DEFAULT NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT DEFAULT NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_type  TEXT DEFAULT 'international';

-- Cross-reference: which quote originated this booking
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS source_quote_id TEXT DEFAULT NULL;

-- quotes: mark when converted to a booking
-- (quotes.status can now also be 'Converted')

-- Create an index so the customer portal query is fast
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings (customer_email);

-- quotes: 'Converted' is already handled by the TEXT status column (no schema change needed)

-- ============================================================
-- 24. SHIPMENT STATUS NOTES & ID FIELDS
-- ============================================================
-- Visible customer-facing note attached to the latest status change
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS status_note TEXT DEFAULT NULL;
-- Sender/receiver identity documents (stored in metadata JSONB, no extra column needed)
-- History is stored in metadata->status_history JSONB array: [{status, note, date}]
-- No schema change needed — metadata column already exists as JSONB
