'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Heart, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export function ValuePropositions() {
  const { t } = useLanguage();

  const valueProps: ValueProp[] = [
    {
      icon: Sparkles,
      title: t('valueProps.custom.title'),
      description: t('valueProps.custom.description'),
      color: 'text-yellow-500',
    },
    {
      icon: Zap,
      title: t('valueProps.fast.title'),
      description: t('valueProps.fast.description'),
      color: 'text-orange-500',
    },
    {
      icon: Heart,
      title: t('valueProps.quality.title'),
      description: t('valueProps.quality.description'),
      color: 'text-red-500',
    },
    {
      icon: MapPin,
      title: t('valueProps.local.title'),
      description: t('valueProps.local.description'),
      color: 'text-green-500',
    },
  ];

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
            {t('valueProps.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('valueProps.subtitle')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {valueProps.map((prop, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
        </div>
      </div>
    </section>
  );
}
