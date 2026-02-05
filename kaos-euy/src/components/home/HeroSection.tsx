'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-background/30 to-primary/5 overflow-hidden">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <motion.div variants={staggerItem}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-secondary leading-tight">
                Bandung's Pride,
                <br />
                <span className="text-primary">Your Style</span>
              </h1>
            </motion.div>

            <motion.div variants={staggerItem}>
              <h2 className="text-4xl md:text-5xl font-bold text-primary font-pacifico">
                EUY! 🎨
              </h2>
            </motion.div>

            <motion.p
              variants={staggerItem}
              className="text-lg md:text-xl text-gray-600 max-w-lg"
            >
              Premium custom t-shirts with Bandung's pride. We bring your ideas
              to life.
            </motion.p>

            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link href="/custom-order">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Order Custom 👕
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  View Catalog 🛍️
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={staggerItem}
              className="flex gap-8 pt-8 border-t border-gray-200"
            >
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-gray-600">Custom Designs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">7-10</div>
                <div className="text-sm text-gray-600">Days Production</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Placeholder for product image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-pulse" />
              <div className="absolute inset-8 bg-white rounded-full shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">👕</div>
                  <p className="text-2xl font-bold text-secondary">
                    Your Design
                    <br />
                    Your Story
                  </p>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-0 right-0 bg-white px-4 py-2 rounded-full shadow-lg"
              >
                <div className="text-sm font-semibold text-primary">
                  ✨ Premium Quality
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="absolute bottom-0 left-0 bg-white px-4 py-2 rounded-full shadow-lg"
              >
                <div className="text-sm font-semibold text-accent">
                  🚀 Fast Production
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
    </section>
  );
}
