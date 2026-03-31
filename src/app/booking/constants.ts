import { 
  Box, 
  Archive, 
  Layout, 
  HardDrive, 
  Bed, 
  Armchair, 
  Table, 
  Utensils, 
  Bath, 
  Briefcase, 
  Warehouse,
  Truck
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', name: 'All items', icon: Archive },
  { id: 'living-room', name: 'Living Room Furniture', icon: Armchair },
  { id: 'bedroom', name: 'Bedroom Furniture', icon: Bed },
  { id: 'dining-room', name: 'Dining Furniture', icon: Table },
  { id: 'kitchen', name: 'Kitchen Furniture', icon: Utensils },
  { id: 'bathroom', name: 'Bathroom Items', icon: Bath },
  { id: 'office', name: 'Office Furniture', icon: Briefcase },
  { id: 'storage', name: 'Storage Solutions', icon: Warehouse },
  { id: 'vehicle', name: 'Vehicle Parts', icon: Truck },
];

export const ITEMS = [
  // Living Room
  { id: 'sofa-2', name: '2 Seater Sofa', category: 'living-room', basePrice: 45 },
  { id: 'sofa-3', name: '3 Seater Sofa', category: 'living-room', basePrice: 65 },
  { id: 'armchair', name: 'Armchair', category: 'living-room', basePrice: 25 },
  { id: 'tv-stand', name: 'TV Stand', category: 'living-room', basePrice: 15 },
  { id: 'coffee-table', name: 'Coffee Table', category: 'living-room', basePrice: 15 },
  
  // Bedroom
  { id: 'bed-single', name: 'Single Bed Frame', category: 'bedroom', basePrice: 30 },
  { id: 'bed-double', name: 'Double Bed Frame', category: 'bedroom', basePrice: 50 },
  { id: 'wardrobe-small', name: 'Small Wardrobe', category: 'bedroom', basePrice: 40 },
  { id: 'wardrobe-large', name: 'Large Wardrobe', category: 'bedroom', basePrice: 70 },
  { id: 'chest-drawers', name: 'Chest of Drawers', category: 'bedroom', basePrice: 25 },
  
  // Storage / Logistics (Specific to TS Couriers)
  { id: 'barrel-small', name: 'Small Barrel (Tanque)', category: 'storage', basePrice: 35 },
  { id: 'barrel-large', name: 'Large Shipping Barrel', category: 'storage', basePrice: 55 },
  { id: 'box-small', name: 'Small Shipping Box', category: 'storage', basePrice: 5 },
  { id: 'box-medium', name: 'Medium Shipping Box', category: 'storage', basePrice: 10 },
  { id: 'box-large', name: 'Large Shipping Box', category: 'storage', basePrice: 15 },
  
  // Kitchen
  { id: 'fridge', name: 'Fridge Freezer', category: 'kitchen', basePrice: 50 },
  { id: 'washing-machine', name: 'Washing Machine', category: 'kitchen', basePrice: 45 },
  { id: 'microwave', name: 'Microwave', category: 'kitchen', basePrice: 10 },
  
  // Vehicle Parts (From Proovia reference)
  { id: 'car-door', name: 'Car Door', category: 'vehicle', basePrice: 30 },
  { id: 'bumper-kit', name: 'Bumpers Kit', category: 'vehicle', basePrice: 25 },
  { id: 'bodykit-lwb', name: 'Custom Bodykit LWB', category: 'vehicle', basePrice: 60 },
];

export const SERVICE_FEATURES = [
  'Delivery timescale',
  'Exclusivity',
  'State of the art service',
  'Two men team',
  'Careful protection',
  'In time delivery',
  'Level of service',
  'Damage cover',
  'Time slot',
  'Tracking (basic)',
  'Time slot the day before',
  'Real time tracking',
  'SMS updates',
  '1-2 stops away notifications'
];

export const SERVICE_PLANS = [
  {
    id: 'eco',
    name: 'Proovia Eco',
    surcharge: 25,
    details: {
      'Delivery timescale': '7-10 working days',
      'Exclusivity': false,
      'State of the art service': true,
      'Two men team': true,
      'Careful protection': true,
      'In time delivery': true,
      'Level of service': 'door to door',
      'Damage cover': '£0',
      'Time slot': 'whole day',
      'Tracking (basic)': false,
      'Time slot the day before': false,
      'Real time tracking': false,
      'SMS updates': false,
      '1-2 stops away notifications': false
    }
  },
  {
    id: 'standard',
    name: 'Standard',
    surcharge: 45,
    details: {
      'Delivery timescale': '5-7 working days',
      'Exclusivity': false,
      'State of the art service': true,
      'Two men team': true,
      'Careful protection': true,
      'In time delivery': true,
      'Level of service': 'ground floor',
      'Damage cover': 'up to £100',
      'Time slot': '4 hours',
      'Tracking (basic)': true,
      'Time slot the day before': false,
      'Real time tracking': false,
      'SMS updates': true,
      '1-2 stops away notifications': false
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    surcharge: 85,
    details: {
      'Delivery timescale': '2-4 working days',
      'Exclusivity': false,
      'State of the art service': true,
      'Two men team': true,
      'Careful protection': true,
      'In time delivery': true,
      'Level of service': 'room of choice',
      'Damage cover': 'up to £300',
      'Time slot': '2 hours',
      'Tracking (basic)': true,
      'Time slot the day before': true,
      'Real time tracking': true,
      'SMS updates': true,
      '1-2 stops away notifications': true
    }
  }
];
