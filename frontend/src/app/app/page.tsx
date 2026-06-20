'use client';

import { useEffect, useState, useCallback } from 'react';

export default function MiniApp() {
  const [loading, setLoading] = useState(true);
  const [showConsent, setShowConsent] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  const syncUser = useCallback(async (permissions?: any, location?: any) => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      
      // If we are testing outside Telegram, allow mock data if NODE_ENV is development
      if (!initData && process.env.NODE_ENV !== 'development') {
        setError('Please open this app inside Telegram.');
        setLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const payload: any = {};
      if (permissions) payload.permissions = permissions;
      if (location) payload.location = location;
      
      // If dev without Telegram, send mock data
      if (!initData && process.env.NODE_ENV === 'development') {
        payload.telegramUser = {
          id: 123456789,
          first_name: 'Dev',
          last_name: 'User',
          username: 'dev_user'
        };
      }

      const res = await fetch(`${apiUrl}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${initData || 'mock_init_data'}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to authenticate with backend');
      }

      const data = await res.json();
      setUser(data);

      if (data.permissions && Object.keys(data.permissions).length > 0 && data.permissions.is_logging_allowed !== undefined) {
        setShowConsent(false);
      } else {
        setShowConsent(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      (window as any).Telegram?.WebApp?.ready();
      syncUser();
    }, 100);
    return () => clearTimeout(timer);
  }, [syncUser]);

  const handleConsent = (allow: boolean) => {
    setLoading(true);
    if (allow) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const loc = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              country: 'Unknown',
              city: 'Unknown'
            };
            await syncUser({ is_logging_allowed: true, is_notification_allowed: true }, loc);
          },
          async (err) => {
            console.warn('Geolocation error:', err);
            await syncUser({ is_logging_allowed: true, is_notification_allowed: true });
          }
        );
      } else {
        syncUser({ is_logging_allowed: true, is_notification_allowed: true });
      }
    } else {
      syncUser({ is_logging_allowed: false, is_notification_allowed: false });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center max-w-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto relative min-h-screen">
      {/* Consent Modal Overlay */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Enhance Your Experience</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              To provide personalized analytics and smart reminders, we request access to your location and push notifications.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleConsent(true)}
                className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
              >
                Allow Access
              </button>
              <button 
                onClick={() => handleConsent(false)}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors border border-slate-700"
              >
                Deny
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main App Content */}
      {!showConsent && user && (
        <div className="space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Hello, {user.first_name}</h1>
              <p className="text-sm text-slate-400">Let's crush some habits today.</p>
            </div>
            <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
              {user.first_name.charAt(0)}
            </div>
          </header>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -z-10"></div>
            <h3 className="text-lg font-semibold mb-1">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
                <div className="text-3xl font-black text-indigo-400">{user.stats?.total_habits || 0}</div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Habits</div>
              </div>
              <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
                <div className="text-3xl font-black text-cyan-400">{user.stats?.current_streak || 0}</div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Day Streak</div>
              </div>
            </div>
          </div>

          <button className="w-full py-4 bg-white hover:bg-slate-200 text-slate-950 font-bold rounded-2xl transition-colors shadow-xl shadow-white/5 flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Habit
          </button>
        </div>
      )}
    </div>
  );
}
