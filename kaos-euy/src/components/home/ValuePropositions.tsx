'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Heart, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const valueProps: ValueProp[] = [
  {
    icon: Sparkles,
    title: '100% Custom',
    description: 'Your design, from sketch to finished product',
    color: 'text-yellow-500',
  },
  {
    icon: Zap,
    title: 'Fast Process',
    description: '7-10 days from order to your hands',
    color: 'text-orange-500',
  },
  {
    icon: Heart,
    title: 'Premium Quality',
    description: 'Selected materials, neat screen printing/DTF',
    color: 'text-red-500',
  },
  {
    icon: MapPin,
    title: 'Local Pride',
    description: 'Made in Bandung with love',
    color: 'text-green-500',
  },
];

export function ValuePropositions() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Why Choose Kaos EUY?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We don't just make t-shirts, we create works that tell your story
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {valueProps.map((prop, index) => (
            <motion.div
              key={index}
              variants={staggerItem}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="bg-gray-50 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-primary/5 hover:shadow-xl">
                <div
                  className={`w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${prop.color}`}
                >
                  <prop.icon className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-bold text-secondary mb-3">
                  {prop.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {prop.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
