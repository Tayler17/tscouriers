'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppFloat() {
  return (
    <motion.a
      href="https://wa.me/message/MW3IK3B7LUTSG1"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center group"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-4 transition-all duration-500 font-bold whitespace-nowrap">
        Hablamos Español / English
      </span>
    </motion.a>
  );
}
