import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div>
            <Image
              src="/images/logo-dark-removebg-preview.png"
              alt="AIM Academy"
              width={130}
              height={52}
              className="object-contain mb-4"
            />
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Aiming for excellence in education across Sri Lanka.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/dashboard#about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/dashboard#courses" className="hover:text-white transition">Courses</Link></li>
              <li><Link href="/my-courses" className="hover:text-white transition">My Courses</Link></li>
              <li><Link href="/profile" className="hover:text-white transition">Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-lg">Support</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/dashboard" className="hover:text-white transition">Help Center</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-lg">Contact</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                +94 77 123 4567
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                info@aimacademy.lk
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Colombo, Sri Lanka
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-8 text-center">
          <p className="text-sm text-gray-400">&copy; 2025 AIM Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}