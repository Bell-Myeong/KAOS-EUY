'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { ArrowRight } from 'lucide-react';

export function CTABanner() {
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
            Have a Design Idea?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Our design team is ready to help bring it to life! From concept to production,
            we guide you through every step.
          </p>

          <Link href="/custom-order">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
            >
              Start Custom Order
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
