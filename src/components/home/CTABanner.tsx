'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function CTABanner() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-r from-primary to-accent relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {t('ctaBanner.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('ctaBanner.description')}
          </p>

          <Link href="/products">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
            >
              {t('ctaBanner.button')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
    </section>
  );
}
