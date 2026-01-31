import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIM Academy - Online Learning Platform | Sri Lanka',
  description: 'AIM Academy provides high-quality online video lessons for students in Sri Lanka. Access 500+ lessons, track your progress, and learn from expert teachers.',
  keywords: 'AIM Academy, online learning, Sri Lanka education, video lessons, e-learning, study online, exam preparation',
  authors: [{ name: 'AIM Academy' }],
  creator: 'AIM Academy',
  publisher: 'AIM Academy',
  
  metadataBase: new URL('https://aimacademy.lk'),
  
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    url: 'https://aimacademy.lk',
    title: 'AIM Academy - Online Learning Platform',
    description: 'High-quality online education for Sri Lankan students',
    siteName: 'AIM Academy',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AIM Academy - Online Learning',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'AIM Academy - Online Learning Platform',
    description: 'High-quality online education for Sri Lankan students',
    images: ['/og-image.jpg'],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  verification: {
    google: 'u2esIELaqdRwA7uagGM26AAFZiwIYXsAqwi3i',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}