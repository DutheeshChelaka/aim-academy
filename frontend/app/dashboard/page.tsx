'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { gradeService, Grade } from '@/lib/services/gradeService';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, Variants } from 'framer-motion';
import { SkeletonCard } from '../components/SkeletonLoader';

// Enhanced Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
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
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

export default function DashboardPage() {
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: Allow guest browsing - no auth redirect
  useEffect(() => {
    // ✅ CHANGED: Only wait for hydration, not authentication
    if (!hasHydrated) return;

    const fetchGrades = async () => {
      setLoading(true);
      try {
        const data = await gradeService.getAll();
        setGrades(data);
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [hasHydrated]);

  // ✅ CHANGED: Only show loader while hydrating (not checking auth)
  if (!hasHydrated) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Premium Top Accent */}
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-lg"></div>

      <Header currentPage="home" />

{/* Hero Section - ULTRA PREMIUM VIDEO BACKGROUND */}
<section className="relative h-screen w-full overflow-hidden text-white">

  {/* 🎥 FULL BACKGROUND VIDEO */}
  <video
    className="absolute inset-0 w-full h-full object-cover"
    autoPlay
    muted
    loop
    playsInline
  >
    <source src="/videos/learning.mp4" type="video/mp4" />
  </video>

  {/* 🖤 DARK OVERLAY (IMPORTANT for text visibility) */}
  <div className="absolute inset-0 bg-black/60"></div>

  {/* 🔥 GRADIENT OVERLAY */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-red-900/40"></div>

  {/* ✨ Animated Glow Effects */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-20 -left-20 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
  </div>

  {/* 📦 CONTENT */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
    <div className="grid lg:grid-cols-2 gap-12 items-center w-full">

      {/* LEFT CONTENT */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={slideInLeft}
        className="text-center lg:text-left space-y-8"
      >

        {/* Badge */}
        <motion.div 
          variants={fadeIn}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600/20 backdrop-blur-md border border-red-500/40 rounded-full text-sm font-bold shadow-lg"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          {isAuthenticated ? `Welcome Back, ${user?.name || 'Student'}!` : 'Welcome to AIM Academy!'}
        </motion.div>

        {/* Title */}
        <motion.div variants={fadeInUp} className="space-y-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
            Start Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600">
              Learning Journey
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 max-w-xl">
            Learn smarter with immersive video-based education and expert guidance.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
          
          <Link
            href="/grade"
            className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold shadow-xl transition-all"
          >
            Browse Grades →
          </Link>

          <Link
            href={isAuthenticated ? "/my-courses" : "/register"}
            className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all"
          >
            {isAuthenticated ? "My Courses" : "Sign Up Free"}
          </Link>

        </motion.div>
      </motion.div>

      {/* RIGHT SIDE VIDEO CARD (KEEP PREMIUM LOOK) */}
      <motion.div 
        variants={slideInRight}
        className="hidden lg:flex justify-center"
      >
        <div className="relative w-full max-w-md">

          {/* Glow */}
          <div className="absolute -inset-6 bg-red-600/30 blur-3xl rounded-3xl"></div>

          {/* Card */}
          <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl">

            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/videos/learning.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        </div>
      </motion.div>

    </div>
  </div>
</section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        
        {/* ✅ FIXED: Stats Cards - Only show for logged-in users */}
        {isAuthenticated && (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20"
          >
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                ),
                value: '0',
                label: 'Enrolled Courses',
                color: 'red',
                gradient: 'from-red-500 to-red-600',
                bgColor: 'bg-red-100',
                textColor: 'text-red-600'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                ),
                value: '0',
                label: 'Completed Lessons',
                color: 'gray',
                gradient: 'from-gray-600 to-gray-700',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-700'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ),
                value: '0%',
                label: 'Average Progress',
                color: 'red',
                gradient: 'from-red-500 to-pink-600',
                bgColor: 'bg-red-100',
                textColor: 'text-red-600'
              },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                variants={scaleIn}
                whileHover={{ 
                  scale: 1.05, 
                  translateY: -8,
                  transition: { duration: 0.3 }
                }}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl p-8 transition-all border-2 border-gray-100 hover:border-red-200 cursor-pointer overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 group-hover:via-white/50 to-transparent transition-all duration-700 translate-x-[-200%] group-hover:translate-x-[200%]"></div>
                
                <div className="relative z-10">
                  <motion.div 
                    className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all ${stat.textColor}`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {stat.icon}
                  </motion.div>
                  <div className="text-center">
                    <div className={`text-5xl font-black text-gray-900 mb-2 group-hover:${stat.textColor} transition-colors`}>{stat.value}</div>
                    <p className="text-gray-600 font-semibold text-sm">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Teachers Section - Modern Professional Design */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12 space-y-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block px-5 py-2 bg-red-50 border border-red-200 rounded-full"
            >
              <span className="text-red-600 font-bold text-sm">Expert Educators</span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              Meet Our Expert<br />Teachers
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Learn from qualified professionals dedicated to your success with years of teaching experience
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                name: 'Dutheesh Karunarathne',
                image: '/images/dutheesh.jpeg',
                degree: 'BSc (Hons)',
                field: 'Information Technology',
                institution: 'Sri Lanka Institute of Information Technology (SLIIT)',
                subjects: ['ICT', 'Mathematics']
              },
              {
                name: 'Chathurangi Hashani',
                image: '/images/hashani.jpg',
                qualifications: [
                  { degree: 'Diploma', field: 'Teaching - English', institution: 'Pasdunrata National College of Education' },
                  { degree: "Bachelor's Degree", institution: 'Luxway Campus, Sri Lanka' }
                ],
                subjects: ['English']
              },
              {
                name: 'Dilshan Perera',
                image: '/images/dilshan.png',
                degree: 'BSc (Hons)',
                field: 'Software Engineering',
                institution: 'Sabaragamuwa University of Sri Lanka (SUSL)',
                subjects: ['Science']
              }
            ].map((teacher, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ 
                  y: -12,
                  transition: { duration: 0.3 }
                }}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-red-300 transition-all overflow-hidden"
              >
                {/* Photo Section */}
                <div className="relative h-80 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src={teacher.image}
                    alt={teacher.name}
                    width={400}
                    height={400}
                    className={`w-full h-full ${
                      teacher.image === '/images/hashani.jpg' 
                        ? 'object-cover object-top' 
                        : 'object-cover object-center'
                    } group-hover:scale-110 transition-transform duration-700`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Floating subjects on hover */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    {teacher.subjects.map((subject, idx) => (
                      <span key={idx} className="px-4 py-2 bg-white/95 backdrop-blur-sm text-red-600 text-xs font-bold rounded-full shadow-lg">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6 relative">
                  <div className="absolute top-0 left-6 w-16 h-1.5 bg-gradient-to-r from-red-600 to-red-700 rounded-full"></div>
                  
                  <h3 className="text-2xl font-black text-gray-900 mt-4 mb-4 group-hover:text-red-600 transition-colors">
                    {teacher.name}
                  </h3>
                  
                  <div className="space-y-3">
                    {teacher.qualifications ? (
                      teacher.qualifications.map((qual, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                <span className="font-bold">{qual.degree}</span>
                                {qual.field && ` in ${qual.field}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{qual.institution}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            <span className="font-bold">{teacher.degree}</span> in {teacher.field}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{teacher.institution}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Grades Section - Premium Design */}
        <section id="courses" className="scroll-mt-20 mb-20">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-12 space-y-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block px-5 py-2 bg-red-50 border border-red-200 rounded-full"
            >
              <span className="text-red-600 font-bold text-sm">Academic Levels</span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              Select Your Grade
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Choose your grade level to explore subjects and embark on your learning adventure
            </p>
          </motion.div>

          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
            >
              {[...Array(12)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </motion.div>
          ) : grades.length === 0 ? (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-center py-20 bg-white rounded-3xl shadow-md border-2 border-gray-200"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Grades Available</h3>
              <p className="text-gray-600">Grades will be added soon</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {grades.map((grade, index) => (
                <motion.div
                  key={grade.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.1, 
                    translateY: -12,
                    transition: { duration: 0.3, type: 'spring', stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={`/grade/${grade.id}`}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200 hover:border-red-400 transition-all overflow-hidden block"
                  >
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Multiple shine effects */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 group-hover:via-white/60 to-transparent transition-all duration-500 -translate-x-full group-hover:translate-x-full"></div>
                    
                    <div className="p-8 text-center relative z-10">
                      <motion.div 
                        className="text-7xl font-black text-gray-900 group-hover:text-red-600 mb-3 transition-all duration-300"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        {grade.number}
                      </motion.div>
                      <p className="text-sm font-bold text-gray-700 mb-1 group-hover:text-red-600 transition-colors">
                        Grade {grade.number}
                      </p>
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        <span>{grade._count.subjects} {grade._count.subjects === 1 ? 'Subject' : 'Subjects'}</span>
                      </div>
                    </div>
                    
                    {/* Enhanced arrow icon */}
                    <motion.div 
                      className="absolute top-3 right-3 w-9 h-9 bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-red-600 group-hover:to-red-700 rounded-full flex items-center justify-center transition-all shadow-md group-hover:shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.4 }}
                    >
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* About Section - Professional Design */}
        <motion.section 
          id="about" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="scroll-mt-20 mb-20"
        >
          <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl shadow-2xl overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative grid lg:grid-cols-2 items-center gap-12">
              {/* Left Content */}
              <motion.div variants={slideInLeft} className="p-12 lg:p-16 text-white space-y-8">
                <div className="space-y-6">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600/20 border border-red-500/40 rounded-full text-sm font-bold backdrop-blur-sm"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    About AIM Academy
                  </motion.div>
                  <h2 className="text-4xl sm:text-5xl font-black leading-tight">
                    Excellence in
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                      Online Education
                    </span>
                  </h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Sri Lanka's premier online learning platform, providing quality education from Grade 1 to 11. Our expert teachers deliver comprehensive lessons designed to help you excel in your academic journey.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { 
                      title: 'Expert Teachers', 
                      desc: 'Qualified educators with years of experience',
                      icon: (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                        </svg>
                      )
                    },
                    { 
                      title: 'HD Quality', 
                      desc: 'Crystal clear video content',
                      icon: (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      )
                    },
                    { 
                      title: 'Flexible Learning', 
                      desc: 'Study at your own pace',
                      icon: (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )
                    },
                    { 
                      title: 'Affordable', 
                      desc: 'Premium quality at great value',
                      icon: (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      )
                    },
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      variants={scaleIn}
                      whileHover={{ scale: 1.05, x: 5 }}
                      className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
                    >
                      <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600/30 transition-colors">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-bold text-white mb-1 group-hover:text-red-400 transition-colors">{item.title}</p>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="#courses"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all group"
                  >
                    <span>Browse Courses</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Image */}
              <motion.div variants={slideInRight} className="p-12 lg:p-16 flex justify-center items-center">
                <motion.div 
                  className="relative w-full max-w-md"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-500/30 to-red-600/30 rounded-3xl blur-2xl"></div>
                  <Image
                    src="/images/childwrite.jpg"
                    alt="Learning at AIM Academy"
                    width={500}
                    height={500}
                    className="relative w-full h-auto rounded-3xl shadow-2xl border-4 border-white/20"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Stats Banner - Professional Design */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mb-20"
        >
          <div className="relative bg-gradient-to-r from-red-600 via-red-600 to-red-700 rounded-3xl shadow-2xl p-12 sm:p-16 text-white overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <motion.div variants={fadeInUp} className="text-center mb-12 space-y-4">
                <h2 className="text-4xl sm:text-5xl font-black">
                  Join Thousands of Students
                </h2>
                <p className="text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
                  Start your learning journey with AIM Academy today and unlock your full potential
                </p>
              </motion.div>
              
              <motion.div 
                variants={staggerContainer}
                className="grid grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {[
                  { 
                    value: '1K+', 
                    label: 'Active Students',
                    icon: (
                      <svg className="w-8 h-8 text-white mb-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    )
                  },
                  { 
                    value: '500+', 
                    label: 'Video Lessons',
                    icon: (
                      <svg className="w-8 h-8 text-white mb-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    )
                  },
                  { 
                    value: '50+', 
                    label: 'Expert Teachers',
                    icon: (
                      <svg className="w-8 h-8 text-white mb-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                      </svg>
                    )
                  },
                  { 
                    value: '11', 
                    label: 'Grade Levels',
                    icon: (
                      <svg className="w-8 h-8 text-white mb-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    )
                  },
                ].map((stat, index) => (
                  <motion.div 
                    key={index} 
                    variants={scaleIn}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="text-center group cursor-pointer"
                  >
                    <div className="flex justify-center">{stat.icon}</div>
                    <div className="text-5xl sm:text-6xl font-black mb-2 group-hover:scale-110 transition-transform">{stat.value}</div>
                    <p className="text-red-100 font-semibold">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}