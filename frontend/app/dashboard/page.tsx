'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <PageLoader />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const gradeColors = [
    'from-red-500 to-pink-500',
    'from-orange-500 to-amber-500',
    'from-yellow-500 to-lime-500',
    'from-green-500 to-emerald-500',
    'from-teal-500 to-cyan-500',
    'from-blue-500 to-indigo-500',
    'from-violet-500 to-purple-500',
    'from-fuchsia-500 to-pink-500',
    'from-rose-500 to-red-500',
    'from-indigo-600 to-blue-600',
    'from-purple-600 to-pink-600',
  ];

  const slides = [
    {
      title: 'Master Every Subject',
      description: 'Comprehensive lessons from Grade 1 to 11 with expert teachers',
      image: '/images/slide1.jpg',
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Learn at Your Pace',
      description: 'Access courses anytime, anywhere with our flexible learning platform',
      image: '/images/slide2.jpg',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'Achieve Excellence',
      description: 'Join thousands of students excelling in their studies',
      image: '/images/slide3.jpg',
      gradient: 'from-red-600 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              +94 77 123 4567
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              info@aimacademy.lk
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="#" className="hover:text-white/80 transition">Help Center</Link>
            <span>|</span>
            <Link href="#" className="hover:text-white/80 transition">FAQ</Link>
          </div>
        </div>
      </nav>

      {/* Main Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/images/logo-light.png"
                alt="AIM Academy"
                width={160}
                height={64}
                className="object-contain"
              />
            </div>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg"
              >
                Home
              </Link>
              <Link
                href="#courses"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition"
              >
                Courses
              </Link>
              <Link
                href="#about"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition"
              >
                About Us
              </Link>
              <Link
                href="#"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition"
              >
                My Courses
              </Link>
              <Link
                href="#"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition"
              >
                Contact
              </Link>
            </nav>

            {/* Search & User */}
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-64">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-2 bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-gray-900">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden lg:block px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Slideshow */}
        <section className="relative">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={true}
            loop={true}
            className="h-[500px]"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <div className={`relative h-full bg-gradient-to-r ${slide.gradient} flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10 text-center text-white px-4 max-w-4xl">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
                      {slide.description}
                    </p>
                    <Link
                      href="#courses"
                      className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-full shadow-2xl hover:scale-105 transition-transform text-lg"
                    >
                      Start Learning Now
                    </Link>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 -mt-20 relative z-10">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500 hover:shadow-2xl transition-shadow">
              <div className="text-5xl font-black text-red-600 mb-2">0</div>
              <p className="text-gray-600 font-semibold">Enrolled Courses</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-blue-500 hover:shadow-2xl transition-shadow">
              <div className="text-5xl font-black text-blue-600 mb-2">0</div>
              <p className="text-gray-600 font-semibold">Completed Lessons</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-green-500 hover:shadow-2xl transition-shadow">
              <div className="text-5xl font-black text-green-600 mb-2">0%</div>
              <p className="text-gray-600 font-semibold">Average Progress</p>
            </div>
          </div>

          {/* About Section */}
          <section id="about" className="mb-16 scroll-mt-20">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="p-12 text-white">
                  <h2 className="text-4xl font-black mb-6">About AIM Academy</h2>
                  <p className="text-lg mb-4 text-white/90">
                    AIM Academy is Sri Lanka's premier online learning platform, dedicated to providing quality education to students from Grade 1 to 11.
                  </p>
                  <p className="text-lg mb-6 text-white/90">
                    Our expert teachers deliver engaging video lessons in Sinhala, English, and Tamil mediums, ensuring every student can learn in their preferred language.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Expert Teachers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">HD Video Lessons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Multi-language Support</span>
                    </div>
                  </div>
                </div>
                <div className="relative h-96 md:h-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-8xl font-black mb-4">11</div>
                      <div className="text-2xl font-bold">Grades Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Courses Section */}
          <section id="courses" className="scroll-mt-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-gray-900 mb-4">Select Your Grade</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Choose your grade to explore subjects and start your learning journey
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((grade, index) => (
                <Link
                  key={grade}
                  href={`/grade/${grade}`}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-transparent transition-all duration-300 p-8 text-center overflow-hidden transform hover:-translate-y-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradeColors[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    <div className="text-6xl font-black text-gray-200 group-hover:text-white/30 transition-colors mb-3">
                      {grade}
                    </div>
                    <p className="text-sm font-bold text-gray-700 group-hover:text-white transition-colors">
                      Grade {grade}
                    </p>
                    <div className="mt-4 w-12 h-1 bg-gray-200 group-hover:bg-white/50 rounded-full mx-auto transition-colors"></div>
                  </div>

                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/0 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                    <svg className="w-4 h-4 text-transparent group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/images/logo-dark.png"
                alt="AIM Academy"
                width={140}
                height={56}
                className="object-contain mb-4"
              />
              <p className="text-gray-400 text-sm">
                Aiming for excellence in education
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition">Courses</Link></li>
                <li><Link href="#" className="hover:text-white transition">Teachers</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>+94 77 123 4567</li>
                <li>info@aimacademy.lk</li>
                <li>Colombo, Sri Lanka</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 AIM Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
        }
        .swiper-pagination-bullet {
          background: white !important;
        }
        .swiper-pagination-bullet-active {
          background: white !important;
        }
      `}</style>
    </div>
  );
}