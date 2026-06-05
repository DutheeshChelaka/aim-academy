'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

// Optimized Custom Cubic Bezier curves for smooth interaction
const cubicBezierEase = [0.16, 1, 0.3, 1] as const;

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: cubicBezierEase }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-zinc-950 via-zinc-900/95 to-zinc-950 text-white border-t border-zinc-800/60 overflow-hidden">
      
      {/* Premium ambient light accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-red-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Thin glowing top border accent */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/25 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        
        {/* Main Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-16"
        >
          {/* Brand Column (5 columns width) */}
          <motion.div variants={fadeInUp} className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-block group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Image
                  src="/images/logo-dark-removebg-preview.png"
                  alt="AIM Academy Logo"
                  width={150}
                  height={60}
                  className="object-contain transition-opacity duration-300 group-hover:opacity-90"
                  loading="lazy" // Lazy loaded as it's at the very bottom of the page
                />
              </motion.div>
            </Link>
            
            <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-sm">
              Aiming for educational excellence across Sri Lanka. Offering immersive, high-quality online learning tailored for Grades 1 through 11.
            </p>
            
            {/* Social Links - Clean Premium Glassmorphic Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {/* WhatsApp Icon Link */}
              <motion.a
                href="https://wa.me/94721154777"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Profile"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 bg-white/5 border border-white/10 hover:border-green-500/35 hover:bg-green-600/10 hover:text-green-400 rounded-xl flex items-center justify-center text-zinc-300 transition-all duration-300 shadow-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </motion.a>

              {/* Facebook Icon Link */}
              <motion.a
                href="https://www.facebook.com/share/1CnkVyUbSV/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Profile"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 bg-white/5 border border-white/10 hover:border-blue-500/35 hover:bg-blue-600/10 hover:text-blue-400 rounded-xl flex items-center justify-center text-zinc-300 transition-all duration-300 shadow-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </motion.a>
            </div>
          </motion.div>
          
          {/* Quick Links Column (3 columns width) */}
          <motion.div variants={fadeInUp} className="md:col-span-3 space-y-5">
            <h3 className="font-extrabold text-sm uppercase tracking-widest text-zinc-200 relative inline-block">
              Quick Links
              <span className="absolute -bottom-1.5 left-0 w-8 h-[2px] bg-gradient-to-r from-red-600 to-rose-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3.5 text-sm font-light">
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '/#about' },
                { label: 'Browse Grades', href: '/grade' },
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-zinc-400 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    {/* Inline micro indicator on hover */}
                    <span className="w-0 h-[1.5px] bg-red-50 mr-0 opacity-0 group-hover:w-3 group-hover:mr-2 group-hover:opacity-100 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Contact Column (4 columns width) */}
          <motion.div variants={fadeInUp} className="md:col-span-4 space-y-5">
            <h3 className="font-extrabold text-sm uppercase tracking-widest text-zinc-200 relative inline-block">
              Contact Us
              <span className="absolute -bottom-1.5 left-0 w-8 h-[2px] bg-gradient-to-r from-red-600 to-rose-600 rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-sm font-light">
              
              {/* WhatsApp Card Contact Info */}
              <li>
                <a 
                  href="https://wa.me/94721154777" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start text-zinc-400 hover:text-white transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 bg-white/5 group-hover:bg-green-600/10 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 border border-white/5 group-hover:border-green-500/25 transition-all">
                    <svg className="w-5 h-5 text-zinc-400 group-hover:text-green-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">WhatsApp Link</p>
                    <p className="font-bold text-zinc-200 group-hover:text-white mt-0.5">072 115 4777</p>
                  </div>
                </a>
              </li>

              {/* Location Card Info */}
              <li>
                <div className="flex items-start text-zinc-400 group">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 border border-white/5">
                    <svg className="w-5 h-5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Location</p>
                    <p className="font-bold text-zinc-200 mt-0.5">Puttalam, Sri Lanka</p>
                  </div>
                </div>
              </li>

            </ul>
          </motion.div>
        </motion.div>
        
        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="border-t border-zinc-800/60 pt-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-xs text-zinc-500 font-light">
              &copy; {currentYear} <span className="font-semibold text-zinc-300">AIM Academy</span>. All rights reserved.
            </p>
            
            {/* Made with love developer badge */}
            <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              Made with
              <svg className="w-3.5 h-3.5 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              by <span className="font-bold text-zinc-300 hover:text-red-400 transition-colors cursor-pointer">Dutheesh Karunarathne</span>
            </p>
          </div>
        </motion.div>

      </div>
    </footer>
  );
}