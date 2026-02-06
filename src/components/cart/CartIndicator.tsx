'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { useCartItems } from '@/lib/hooks/useCart';

export function CartIndicator() {
  const { data } = useCartItems();
  const itemCount = useMemo(() => {
    return (data ?? []).reduce((sum, item) => sum + item.quantity, 0);
  }, [data]);

  return (
    <Link
      href="/cart"
      className="relative group"
      aria-label={`Cart (${itemCount} items)`}
    >
      <div className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <ShoppingCart className="w-6 h-6 text-secondary group-hover:text-primary transition-colors" />

        <AnimatePresence>
          {itemCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
            >
              {itemCount > 99 ? '99+' : itemCount}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Cart {itemCount > 0 && `(${itemCount})`}
      </div>
    </Link>
  );
}
