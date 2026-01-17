'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { gradeService, Grade } from '@/lib/services/gradeService';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, Variants } from 'framer-motion';
import { SkeletonCard } from '../components/SkeletonLoader';

// Animation Variants - Properly Typed
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.8 }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6 }
  }
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6 }
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Auth Protection with Hydration Check
  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, router]);

  // ✅ Fetch Grades After Hydration
  useEffect(() => {
    if (!hasHydrated) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchGrades = async () => {
      setLoading(true);
      try {
        const data = await gradeService.getAll();
        console.log('✅ Grades fetched:', data);
        setGrades(data);
      } catch (error) {
        console.error('❌ Error fetching grades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [hasHydrated, isAuthenticated]);

  // ✅ Show Loader While Checking Auth
  if (!hasHydrated || !isAuthenticated) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Accent Line */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>

      {/* ✅ Shared Header Component */}
      <Header currentPage="home" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={slideInLeft}
              className="text-center lg:text-left"
            >
              <motion.div 
                variants={fadeIn}
                className="inline-block px-4 py-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full text-sm font-bold mb-6"
              >
                Welcome Back, {user?.name || 'Student'}!
              </motion.div>
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight"
              >
                Start Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
                  Learning Journey
                </span>
              </motion.h1>
              <motion.p 
                variants={fadeInUp}
                className="text-lg sm:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0"
              >
                Access expert-led courses and master new skills at your own pace.
              </motion.p>
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  href="/grade"
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
                >
                  Browse Grades
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/my-courses"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold rounded-lg transition-all flex items-center justify-center"
                >
                  My Courses
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={slideInRight}
              className="flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-md lg:max-w-lg">
                <div className="relative">
                  {/* Glow Effect Behind Image */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-3xl blur-2xl"></div>
                  
                  {/* Image */}
                  <div className="relative">
                    <Image
                      src="/images/childwrite.jpg"
                      alt="Student Learning"
                      width={600}
                      height={600}
                      className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/10"
                      priority
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Stats Cards with 3D Effects */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
        >
          {[
            {
              icon: <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />,
              value: '0',
              label: 'Enrolled Courses',
              color: 'red'
            },
            {
              icon: <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />,
              value: '0',
              label: 'Completed Lessons',
              color: 'gray'
            },
            {
              icon: <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />,
              value: '0%',
              label: 'Average Progress',
              color: 'red'
            },
          ].map((stat, index) => (
            <motion.div 
              key={index}
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                translateY: -12,
                rotateX: 5,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              className={`bg-white rounded-2xl shadow-sm hover:shadow-2xl p-8 text-center transition-all border border-gray-200 cursor-pointer relative overflow-hidden`}
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 hover:via-white/10 to-transparent transition-all duration-500"></div>
              
              <div className={`w-16 h-16 ${stat.color === 'red' ? 'bg-red-100' : 'bg-gray-100'} rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10 shadow-sm`}>
                <svg className={`w-8 h-8 ${stat.color === 'red' ? 'text-red-600' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                  {stat.icon}
                </svg>
              </div>
              <div className="text-5xl font-black text-gray-900 mb-2 relative z-10">{stat.value}</div>
              <p className="text-gray-600 font-semibold relative z-10">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Meet Our Teachers Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Meet Our Expert Teachers
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Learn from qualified professionals dedicated to your success
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Teacher 1 - Dutheesh */}
            <motion.div
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                translateY: -12,
                transition: { duration: 0.3 }
              }}
              className="bg-white rounded-3xl shadow-md hover:shadow-2xl border-2 border-gray-200 hover:border-red-500 transition-all overflow-hidden group"
            >
              {/* Photo Section */}
              <div className="relative h-100 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                  src="/images/dutheesh.jpeg"
                  alt="Dutheesh Karunarathne"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Info Section */}
              <div className="p-6 relative">
                {/* Decorative accent */}
                <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-red-600 to-red-700"></div>
                
                <h3 className="text-2xl font-black text-gray-900 mt-3 mb-2 group-hover:text-red-600 transition-colors">
                  Dutheesh Karunarathne
                </h3>
                
                {/* Qualifications */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                    </svg>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-bold">BSc (Hons)</span> in Information Technology
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Sri Lanka Institute of Information Technology (SLIIT)
                  </p>
                </div>

                {/* Subjects */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-sm">
                    ICT
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-sm">
                    Mathematics
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Teacher 2 - Chathurangi */}
            <motion.div
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                translateY: -12,
                transition: { duration: 0.3 }
              }}
              className="bg-white rounded-3xl shadow-md hover:shadow-2xl border-2 border-gray-200 hover:border-red-500 transition-all overflow-hidden group"
            >
              {/* Photo Section */}
              <div className="relative h-100 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                  src="/images/hashani.png"
                  alt="Chathurangi Hashani"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Info Section */}
              <div className="p-6 relative">
                <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-red-600 to-red-700"></div>
                
                <h3 className="text-2xl font-black text-gray-900 mt-3 mb-2 group-hover:text-red-600 transition-colors">
                  Chathurangi Hashani
                </h3>
                
                {/* Qualifications */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                    </svg>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-bold">Diploma</span> in Teaching - English
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Pasdunrata National College of Education
                  </p>
                  
                  <div className="flex items-start gap-2 mt-2">
                    <svg className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                    </svg>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-bold">Bachelor's Degree</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Luxway Campus, Sri Lanka
                  </p>
                </div>

                {/* Subjects */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-sm">
                    English
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Teacher 3 - Dilshan */}
            <motion.div
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                translateY: -12,
                transition: { duration: 0.3 }
              }}
              className="bg-white rounded-3xl shadow-md hover:shadow-2xl border-2 border-gray-200 hover:border-red-500 transition-all overflow-hidden group"
            >
              {/* Photo Section */}
              <div className="relative h-100 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                  src="/images/dilshan.png"
                  alt="Dilshan Perera"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Info Section */}
              <div className="p-6 relative">
                <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-red-600 to-red-700"></div>
                
                <h3 className="text-2xl font-black text-gray-900 mt-3 mb-2 group-hover:text-red-600 transition-colors">
                  Dilshan Perera
                </h3>
                
                {/* Qualifications */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                    </svg>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-bold">BSc (Hons)</span> in Software Engineering
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Sabaragamuwa University of Sri Lanka (SUSL)
                  </p>
                </div>

                {/* Subjects */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-sm">
                    Science
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>
        {/* Grades Section with AMAZING 3D Effects */}
        <section id="courses" className="scroll-mt-20 mb-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Select Your Grade
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose your grade to explore subjects and start learning
            </p>
          </motion.div>

          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5"
            >
              {[...Array(12)].map((_, index) => (
                <div key={index}>
                  <SkeletonCard />
                </div>
              ))}
            </motion.div>
          ) : grades.length === 0 ? (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200"
            >
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Grades Available</h3>
              <p className="text-gray-600">Grades will be added soon</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {grades.map((grade, index) => (
                <motion.div
                  key={grade.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.15, 
                    translateY: -15,
                    rotateX: 10,
                    rotateY: index % 2 === 0 ? 8 : -8,
                    transition: { duration: 0.4, type: 'spring', stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                >
                  <Link
                    href={`/grade/${grade.id}`}
                    className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl border-2 border-gray-200 hover:border-red-500 transition-all overflow-hidden block"
                  >
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 group-hover:via-white/40 to-transparent transition-all duration-700 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                    
                    <div className="p-6 sm:p-8 text-center relative z-10">
                      <div className="text-6xl sm:text-7xl font-black text-gray-900 group-hover:text-red-600 mb-3 transition-all duration-300 group-hover:scale-110">
                        {grade.number}
                      </div>
                      <p className="text-sm font-bold text-gray-700 mb-1">
                        {grade.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {grade._count.subjects} {grade._count.subjects === 1 ? 'Subject' : 'Subjects'}
                      </p>
                    </div>
                    
                    {/* Arrow Icon with bounce */}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-gray-100 group-hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-sm group-hover:shadow-md">
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-white transition-all group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* About Section */}
        <motion.section 
          id="about" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="scroll-mt-20 mb-16"
        >
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 items-center">
              {/* Left Content */}
              <motion.div variants={slideInLeft} className="p-8 sm:p-12 lg:p-16 text-white">
                <div className="inline-block px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-full text-sm font-bold mb-6">
                  About AIM Academy
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-6">
                  Excellence in
                  <br />
                  Online Education
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Sri Lanka's premier online learning platform, providing quality education from Grade 1 to 11. Our expert teachers deliver comprehensive lessons designed to help you excel.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { title: 'Expert Teachers', desc: 'Qualified educators' },
                    { title: 'HD Quality', desc: 'Crystal clear videos' },
                    { title: 'Flexible Learning', desc: 'Study at your pace' },
                    { title: 'Affordable', desc: 'Great value pricing' },
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      variants={fadeInUp}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-white">{item.title}</p>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Link
                  href="#courses"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all group"
                >
                  Browse Courses
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>

              {/* Right Image */}
              <motion.div variants={slideInRight} className="p-8 sm:p-12 lg:p-16 flex justify-center items-center">
                <div className="w-full max-w-md">
                  <div className="relative">
                    <Image
                      src="/images/childwrite.jpg"
                      alt="Learning at AIM Academy"
                      width={500}
                      height={500}
                      className="w-full h-auto rounded-3xl shadow-2xl"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Stats Banner */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl shadow-2xl p-12 sm:p-16 text-white text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Join Thousands of Students
            </h2>
            <p className="text-xl text-red-100 mb-12 max-w-2xl mx-auto">
              Start your learning journey with AIM Academy today
            </p>
            
            <motion.div 
              variants={staggerContainer}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[
                { value: '1K+', label: 'Active Students' },
                { value: '500+', label: 'Video Lessons' },
                { value: '50+', label: 'Expert Teachers' },
                { value: '11', label: 'Grade Levels' },
              ].map((stat, index) => (
                <motion.div key={index} variants={scaleIn} whileHover={{ scale: 1.1 }}>
                  <div className="text-5xl sm:text-6xl font-black mb-2">{stat.value}</div>
                  <p className="text-red-100">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* ✅ Shared Footer Component */}
      <Footer />
    </div>
  );
}