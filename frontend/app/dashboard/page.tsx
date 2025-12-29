'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { gradeService, Grade } from '@/lib/services/gradeService';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await gradeService.getAll();
        setGrades(data);
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchGrades();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <PageLoader />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const gradeColors = [
    { color: 'from-rose-500 to-pink-600', shadow: 'shadow-pink-500/50', textColor: 'text-pink-600' },
    { color: 'from-orange-500 to-red-600', shadow: 'shadow-orange-500/50', textColor: 'text-orange-600' },
    { color: 'from-amber-500 to-yellow-600', shadow: 'shadow-amber-500/50', textColor: 'text-amber-600' },
    { color: 'from-lime-500 to-green-600', shadow: 'shadow-lime-500/50', textColor: 'text-green-600' },
    { color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/50', textColor: 'text-emerald-600' },
    { color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/50', textColor: 'text-cyan-600' },
    { color: 'from-sky-500 to-indigo-600', shadow: 'shadow-sky-500/50', textColor: 'text-sky-600' },
    { color: 'from-blue-500 to-violet-600', shadow: 'shadow-blue-500/50', textColor: 'text-blue-600' },
    { color: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/50', textColor: 'text-indigo-600' },
    { color: 'from-violet-500 to-fuchsia-600', shadow: 'shadow-violet-500/50', textColor: 'text-violet-600' },
    { color: 'from-fuchsia-500 to-pink-600', shadow: 'shadow-fuchsia-500/50', textColor: 'text-fuchsia-600' },
  ];

  const getGradeColor = (gradeNumber: number) => {
    return gradeColors[gradeNumber - 1] || gradeColors[0];
  };

  const slides = [
    {
      title: 'Master Every Subject',
      description: 'Comprehensive lessons from Grade 1 to 11 with expert teachers',
      gradient: 'from-purple-600 via-pink-600 to-red-600',
    },
    {
      title: 'Learn at Your Pace',
      description: 'Access courses anytime, anywhere with flexible learning',
      gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    },
    {
      title: 'Achieve Excellence',
      description: 'Join thousands of students excelling in their studies',
      gradient: 'from-orange-600 via-red-600 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Accent Border */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500"></div>

      {/* Top Info Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs sm:text-sm">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <span className="hidden sm:flex items-center hover:text-gray-300 transition">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              +94 77 123 4567
            </span>
            <span className="flex items-center hover:text-gray-300 transition">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              info@aimacademy.lk
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="#" className="hover:text-gray-300 transition">Help</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/images/logo-light.png"
                alt="AIM Academy"
                width={130}
                height={52}
                className="object-contain sm:w-[150px]"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-lg shadow-md hover:shadow-lg transition">
                Home
              </Link>
              <Link href="#courses" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                Courses
              </Link>
              <Link href="#about" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                About
              </Link>
              <Link href="#" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                My Courses
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2.5 w-56 lg:w-64 focus-within:ring-2 focus-within:ring-red-500 transition">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              {/* User Info - Desktop */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
                </div>
                <div className="w-11 h-11 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white cursor-pointer hover:scale-110 transition-transform">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              </div>

              {/* Mobile User Avatar */}
              <div className="sm:hidden w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>

              {/* Logout - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden sm:block px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Logout
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-gray-200 mt-2 pt-4">
              <div className="flex flex-col space-y-2">
                <Link href="/dashboard" className="px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-lg">
                  Home
                </Link>
                <Link href="#courses" className="px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>
                  Courses
                </Link>
                <Link href="#about" className="px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>
                  About
                </Link>
                <Link href="#" className="px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition">
                  My Courses
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-lg text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Slideshow */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          loop={true}
          className="h-[350px] sm:h-[450px] lg:h-[550px]"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className={`relative h-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-black/30"></div>
                
                {/* Animated Circles */}
                <div className="absolute top-10 left-10 w-40 h-40 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-56 h-56 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-5xl">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 drop-shadow-2xl leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-10 drop-shadow-lg text-white/95">
                    {slide.description}
                  </p>
                  <Link
                    href="#courses"
                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-red-600 font-bold rounded-full shadow-2xl hover:scale-105 hover:shadow-3xl transition-all text-sm sm:text-base lg:text-lg"
                  >
                    Start Learning Now
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 -mt-16 sm:-mt-20 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center border-l-4 border-red-500 hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">0</div>
            <p className="text-gray-700 font-bold text-sm sm:text-base">Enrolled Courses</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center border-l-4 border-blue-500 hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">0</div>
            <p className="text-gray-700 font-bold text-sm sm:text-base">Completed Lessons</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center border-l-4 border-green-500 hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">0%</div>
            <p className="text-gray-700 font-bold text-sm sm:text-base">Average Progress</p>
          </div>
        </div>

        {/* About Section */}
        <section id="about" className="mb-16 scroll-mt-20">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 sm:p-12 lg:p-16 text-white">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6">About AIM Academy</h2>
                <p className="text-base sm:text-lg mb-4 text-white/90 leading-relaxed">
                  Sri Lanka's premier online learning platform, dedicated to providing quality education to students from Grade 1 to 11.
                </p>
                <p className="text-base sm:text-lg mb-8 text-white/90 leading-relaxed">
                  Our expert teachers deliver engaging video lessons in Sinhala, English, and Tamil mediums.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { icon: '✓', text: 'Expert Teachers' },
                    { icon: '✓', text: 'HD Video Lessons' },
                    { icon: '✓', text: 'Multi-language' },
                    { icon: '✓', text: 'Learn Anywhere' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">{item.icon}</div>
                      <span className="font-bold text-sm sm:text-base">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-64 sm:h-80 md:h-full min-h-[300px] bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="text-8xl sm:text-9xl font-black mb-4 drop-shadow-2xl animate-pulse">{grades.length || 11}</div>
                  <div className="text-xl sm:text-2xl font-bold">Grades Available</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grades Section */}
        <section id="courses" className="scroll-mt-20">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Select Your Grade
              </span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
              Choose your grade to explore subjects and start your learning journey
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading grades...</p>
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Grades Available</h3>
              <p className="text-gray-600">Grades will be added soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
              {grades.map((grade) => {
                const colorScheme = getGradeColor(grade.number);
                return (
                  <Link
                    key={grade.id}
                    href={`/grade/${grade.id}`}
                    className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-transparent transition-all duration-300 overflow-hidden transform hover:-translate-y-3 hover:scale-105 active:scale-95"
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10 p-6 sm:p-8 text-center">
                      <div className={`text-7xl sm:text-8xl font-black mb-3 transition-all duration-300 ${colorScheme.textColor} group-hover:text-white group-hover:scale-110`}>
                        {grade.number}
                      </div>
                      <p className="text-sm sm:text-base font-bold text-gray-700 group-hover:text-white transition-colors">
                        {grade.name}
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-white/80 transition-colors mt-2">
                        {grade._count.subjects} {grade._count.subjects === 1 ? 'Subject' : 'Subjects'}
                      </p>
                      <div className={`mt-4 h-1.5 w-16 ${colorScheme.color.split(' ')[0].replace('from-', 'bg-')} group-hover:bg-white rounded-full mx-auto transition-all`}></div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-gray-100 group-hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-16 sm:mt-24">
        <div className="h-1 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
            <div className="col-span-2 md:col-span-1">
              <Image
                src="/images/logo-dark.png"
                alt="AIM Academy"
                width={130}
                height={52}
                className="object-contain mb-4"
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                Aiming for excellence in education
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-base sm:text-lg">Quick Links</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="#about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="#courses" className="hover:text-white transition">Courses</Link></li>
                <li><Link href="#" className="hover:text-white transition">Teachers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-base sm:text-lg">Support</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-base sm:text-lg">Contact</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li>+94 77 123 4567</li>
                <li>info@aimacademy.lk</li>
                <li>Colombo, Sri Lanka</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-10 pt-8 text-center">
            <p className="text-sm text-gray-400">&copy; 2025 AIM Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
          display: none !important;
        }
        
        @media (min-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            display: flex !important;
          }
        }
        
        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.6 !important;
          width: 10px !important;
          height: 10px !important;
        }
        .swiper-pagination-bullet-active {
          opacity: 1 !important;
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
}