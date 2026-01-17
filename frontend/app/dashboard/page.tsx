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
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, router]);

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
        setGrades(data);
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [hasHydrated, isAuthenticated]);

  if (!hasHydrated || !isAuthenticated) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Premium Top Accent */}
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-lg"></div>

      <Header currentPage="home" />

      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={slideInLeft}
              className="text-center lg:text-left space-y-8"
            >
              <motion.div 
                variants={fadeIn}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600/20 backdrop-blur-md border border-red-500/40 rounded-full text-sm font-bold shadow-lg"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                Welcome Back, {user?.name || 'Student'}!
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                  Start Your
                  <br />
                  <span className="relative inline-block">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 animate-gradient">
                      Learning Journey
                    </span>
                    <motion.div 
                      className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                    ></motion.div>
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Access expert-led courses, master new skills, and achieve your educational goals at your own pace.
                </p>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/grade"
                    className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2 overflow-hidden"
                  >
                    <span className="relative z-10">Browse Grades</span>
                    <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/my-courses"
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/30 hover:border-white/50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>My Courses</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Image - Enhanced */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={slideInRight}
              className="flex justify-center lg:justify-end"
            >
              <motion.div 
                className="relative w-full max-w-md lg:max-w-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Multiple Glow Layers */}
                <div className="absolute -inset-6 bg-gradient-to-r from-red-600/30 to-red-500/30 rounded-3xl blur-3xl animate-pulse"></div>
                <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-red-400/20 rounded-3xl blur-2xl"></div>
                
                <div className="relative">
                  <Image
                    src="/images/childwrite.jpg"
                    alt="Student Learning"
                    width={600}
                    height={600}
                    className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/20 backdrop-blur-sm"
                    priority
                  />
                  {/* Floating badge */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute -bottom-6 -right-6 px-6 py-4 bg-white rounded-2xl shadow-2xl border-2 border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-gray-900">4.9</p>
                        <p className="text-xs text-gray-600 font-semibold">Student Rating</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        
        {/* Stats Cards - Enhanced */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20"
        >
          {[
            {
              icon: <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />,
              value: '0',
              label: 'Enrolled Courses',
              color: 'red',
              gradient: 'from-red-500 to-red-600'
            },
            {
              icon: <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />,
              value: '0',
              label: 'Completed Lessons',
              color: 'gray',
              gradient: 'from-gray-600 to-gray-700'
            },
            {
              icon: <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />,
              value: '0%',
              label: 'Average Progress',
              color: 'red',
              gradient: 'from-red-500 to-pink-600'
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
                  className={`w-16 h-16 ${stat.color === 'red' ? 'bg-red-100' : 'bg-gray-100'} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg className={`w-8 h-8 ${stat.color === 'red' ? 'text-red-600' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                    {stat.icon}
                  </svg>
                </motion.div>
                <div className="text-center">
                  <div className="text-5xl font-black text-gray-900 mb-2 group-hover:text-red-600 transition-colors">{stat.value}</div>
                  <p className="text-gray-600 font-semibold text-sm">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Teachers Section - Enhanced */}
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
            {/* Teacher Cards - More data can be added */}
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
                image: '/images/hashani.png',
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
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Grades Section - Enhanced */}
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
                        {grade.name}
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

        {/* About Section - Enhanced */}
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
                    { icon: '🎓', title: 'Expert Teachers', desc: 'Qualified educators with years of experience' },
                    { icon: '🎥', title: 'HD Quality', desc: 'Crystal clear video content' },
                    { icon: '⏰', title: 'Flexible Learning', desc: 'Study at your own pace' },
                    { icon: '💰', title: 'Affordable', desc: 'Premium quality at great value' },
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      variants={scaleIn}
                      whileHover={{ scale: 1.05, x: 5 }}
                      className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
                    >
                      <div className="text-3xl">{item.icon}</div>
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

        {/* Stats Banner - Enhanced */}
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
                  { value: '1K+', label: 'Active Students', icon: '👥' },
                  { value: '500+', label: 'Video Lessons', icon: '🎬' },
                  { value: '50+', label: 'Expert Teachers', icon: '👨‍🏫' },
                  { value: '11', label: 'Grade Levels', icon: '📚' },
                ].map((stat, index) => (
                  <motion.div 
                    key={index} 
                    variants={scaleIn}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="text-center group cursor-pointer"
                  >
                    <div className="text-5xl mb-2 group-hover:scale-125 transition-transform">{stat.icon}</div>
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