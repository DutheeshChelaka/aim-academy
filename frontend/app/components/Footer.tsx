'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700/50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12"
        >
          {/* Brand Section */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <Link href="/dashboard" className="inline-block group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src="/images/logo-dark-removebg-preview.png"
                  alt="AIM Academy"
                  width={150}
                  height={60}
                  className="object-contain mb-6 group-hover:opacity-80 transition-opacity"
                />
              </motion.div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Aiming for excellence in education across Sri Lanka. Quality online learning for grades 1-11.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { 
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  ),
                  href: '#',
                  label: 'Facebook'
                },
                { 
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                    </svg>
                  ),
                  href: '#',
                  label: 'Twitter'
                },
                { 
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  ),
                  href: '#',
                  label: 'Instagram'
                },
                { 
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  ),
                  href: '#',
                  label: 'YouTube'
                },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-white/5 hover:bg-red-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 border border-white/10 hover:border-red-500"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div variants={fadeInUp}>
            <h3 className="font-bold mb-6 text-lg relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'About Us', href: '/dashboard#about' },
                { label: 'Courses', href: '/dashboard#courses' },
                { label: 'My Courses', href: '/my-courses' },
                { label: 'Browse Grades', href: '/grade' },
                { label: 'Profile', href: '/profile' },
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Support */}
          <motion.div variants={fadeInUp}>
            <h3 className="font-bold mb-6 text-lg relative inline-block">
              Support
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Help Center', href: '/dashboard' },
                { label: 'Contact Us', href: '/dashboard' },
                { label: 'FAQs', href: '/dashboard' },
                { label: 'Terms of Service', href: '/dashboard' },
                { label: 'Privacy Policy', href: '/dashboard' },
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Contact */}
          <motion.div variants={fadeInUp}>
            <h3 className="font-bold mb-6 text-lg relative inline-block">
              Contact
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="tel:+94771234567" className="flex items-start text-gray-400 hover:text-white transition-colors duration-200 group">
                  <div className="w-9 h-9 bg-white/5 group-hover:bg-red-600/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 border border-white/10 group-hover:border-red-500/50 transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <p className="font-medium">+94 77 123 4567</p>
                  </div>
                </a>
              </li>
              <li>
                <a href="mailto:info@aimacademy.lk" className="flex items-start text-gray-400 hover:text-white transition-colors duration-200 group">
                  <div className="w-9 h-9 bg-white/5 group-hover:bg-red-600/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 border border-white/10 group-hover:border-red-500/50 transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="font-medium">info@aimacademy.lk</p>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start text-gray-400 group">
                  <div className="w-9 h-9 bg-white/5 group-hover:bg-red-600/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 border border-white/10 group-hover:border-red-500/50 transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Location</p>
                    <p className="font-medium">Colombo, Sri Lanka</p>
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
          transition={{ delay: 0.5 }}
          className="border-t border-gray-700/50 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              &copy; {currentYear} <span className="font-semibold text-white">AIM Academy</span>. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Terms & Conditions
              </Link>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
          
          {/* Made with love badge */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              Made with
              <svg className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              in Sri Lanka
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}