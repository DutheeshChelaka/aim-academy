'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { twoFactorService } from '@/lib/services/twoFactorService';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '@/app/components/PageLoader';
import { motion } from 'framer-motion';

export default function SecurityPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    check2FAStatus();
  }, [hasHydrated, isAuthenticated, user, router]);

  const check2FAStatus = async () => {
    try {
      const status = await twoFactorService.get2FAStatus();
      setIs2FAEnabled(status.enabled);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      toast.error('Failed to check 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setProcessing(true);
    try {
      const result = await twoFactorService.setup2FA();
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setShowSetup(true);
      toast.success('Scan QR code with Google Authenticator');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to setup 2FA');
    } finally {
      setProcessing(false);
    }
  };

  const handleEnable2FA = async () => {
    if (verifyCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setProcessing(true);
    try {
      await twoFactorService.enable2FA(verifyCode);
      toast.success('2FA enabled successfully! 🎉');
      setIs2FAEnabled(true);
      setShowSetup(false);
      setQrCode('');
      setSecret('');
      setVerifyCode('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid code');
    } finally {
      setProcessing(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return <PageLoader />;
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Accent Line */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/admin" className="flex items-center space-x-3">
              <Image
                src="/images/logo-light.png"
                alt="AIM Academy"
                width={130}
                height={52}
                priority
              />
              <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                ADMIN
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-red-600 font-medium transition"
              >
                ← Back to Dashboard
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-black text-gray-900 mb-2">Security Settings</h1>
          <p className="text-gray-600 mb-8">Manage your admin account security</p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">🔐</span>
            Two-Factor Authentication
          </h2>
          
          {is2FAEnabled ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2FA is Enabled</h3>
              <p className="text-gray-600 mb-6">Your account is protected with two-factor authentication</p>
              <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Extra Layer of Security Active
              </div>
            </div>
          ) : showSetup ? (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Scan this QR Code</h3>
                {qrCode && (
                  <div className="inline-block p-4 bg-white border-4 border-gray-200 rounded-lg">
                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-4">
                  Use <strong>Google Authenticator</strong> or <strong>Authy</strong>
                </p>
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Manual entry code:</p>
                  <p className="font-mono text-sm text-gray-700 break-all">{secret}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Enter 6-digit code to verify
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-center text-2xl tracking-widest focus:ring-2 focus:ring-red-500 focus:border-red-500 transition outline-none"
                  />
                </div>

                <button
                  onClick={handleEnable2FA}
                  disabled={processing || verifyCode.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:to-red-800 transition"
                >
                  {processing ? 'Verifying...' : 'Enable 2FA'}
                </button>

                <button
                  onClick={() => {
                    setShowSetup(false);
                    setQrCode('');
                    setSecret('');
                    setVerifyCode('');
                  }}
                  className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2FA is Not Enabled</h3>
              <p className="text-gray-600 mb-6">Add an extra layer of security to your admin account</p>
              <button
                onClick={handleSetup2FA}
                disabled={processing}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition disabled:opacity-50"
              >
                {processing ? 'Setting up...' : 'Setup 2FA'}
              </button>
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl"
        >
          <h4 className="font-bold text-blue-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            What is Two-Factor Authentication?
          </h4>
          <p className="text-sm text-blue-800">
            2FA adds an extra layer of security by requiring a code from your phone in addition to your password. 
            Even if someone knows your password, they won't be able to access your account without the code from your authenticator app.
          </p>
        </motion.div>
      </main>
    </div>
  );
}