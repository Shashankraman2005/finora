import React, { useState } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  User, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  Settings, 
  Sparkles, 
  Globe, 
  ArrowRight,
  Lock,
  RefreshCw
} from 'lucide-react';
import { MarketDataService } from '../services/marketDataService';

export const ProfileSettingsView: React.FC = () => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    profile, 
    setProfile 
  } = useFinora();

  // Profile Form state
  const [name, setName] = useState(profile.name || currentUser?.name || '');
  const [email, setEmail] = useState(profile.email || currentUser?.email || '');
  const [currency, setCurrency] = useState<'INR' | 'USD'>(
    profile.personalProfile?.preferredCurrency === 'USD' ? 'USD' : 'INR'
  );

  // API Keys state
  const [twelveDataKey, setTwelveDataKey] = useState('');
  const [finnhubKey, setFinnhubKey] = useState('');
  const [alphaVantageKey, setAlphaVantageKey] = useState('');
  const [apiSaveMsg, setApiSaveMsg] = useState('');
  const [profileSaveMsg, setProfileSaveMsg] = useState('');

  const keyStatus = MarketDataService.getApiKeysStatus();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name,
      email,
      personalProfile: {
        ...(prev.personalProfile as any),
        fullName: name,
        email,
        preferredCurrency: currency
      }
    }));
    setProfileSaveMsg('Profile preferences updated successfully!');
    setTimeout(() => setProfileSaveMsg(''), 1500);
  };

  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (twelveDataKey) MarketDataService.setApiKey('twelvedata', twelveDataKey);
    if (finnhubKey) MarketDataService.setApiKey('finnhub', finnhubKey);
    if (alphaVantageKey) MarketDataService.setApiKey('alphavantage', alphaVantageKey);

    setApiSaveMsg('Market data API keys updated in active session!');
    setTimeout(() => setApiSaveMsg(''), 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15] max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-black flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" /> Account &amp; System Configuration
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Active User: <strong className="text-[#0E2A1E]">{profile.name || currentUser?.name || 'Applicant'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Profile &amp; Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D66] mt-0.5">
            Manage your personal information, currency preferences, genuine market API keys, and multi-user accounts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. PERSONAL PROFILE CONFIGURATION */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E5E1]">
            <User className="w-4 h-4 text-[#1F7A52]" />
            <h2 className="text-base font-extrabold text-[#0E2A1E]">Personal Profile Details</h2>
          </div>

          {profileSaveMsg && (
            <div className="p-3 rounded-xl bg-[#E4F0E9] text-[#1F7A52] text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {profileSaveMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#5D6D66] block mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#5D6D66] block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#5D6D66] block mb-1">Preferred Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as any)}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold"
              >
                <option value="INR">₹ Indian Rupee (INR)</option>
                <option value="USD">$ US Dollar (USD)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-[#F6F6F2] text-[11px] text-[#5D6D66]">
              Your user records are strictly partitioned under unique ID: <code className="font-mono text-[#0E2A1E] font-bold">{currentUser?.id || profile.id}</code>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              Save Profile Preferences
            </button>
          </form>
        </div>

        {/* 2. REAL-TIME MARKET API KEYS CONFIGURATION */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E5E1]">
            <Key className="w-4 h-4 text-[#1F7A52]" />
            <h2 className="text-base font-extrabold text-[#0E2A1E]">Genuine Financial Market API Keys</h2>
          </div>

          <p className="text-xs text-[#5D6D66]">
            Finora connects to Twelve Data, Finnhub, and Alpha Vantage. By default, verified end-of-day quotes and AMFI mutual fund APIs are active. Enter your keys below for real-time live exchange ticks.
          </p>

          {apiSaveMsg && (
            <div className="p-3 rounded-xl bg-[#E4F0E9] text-[#1F7A52] text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {apiSaveMsg}
            </div>
          )}

          <form onSubmit={handleSaveApiKeys} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#5D6D66]">Twelve Data API Key (NSE / BSE / Global)</label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${keyStatus.twelveDataConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {keyStatus.twelveDataConfigured ? 'Configured' : 'Using EOD Feed'}
                </span>
              </div>
              <input
                type="password"
                placeholder="Enter VITE_TWELVE_DATA_API_KEY..."
                value={twelveDataKey}
                onChange={e => setTwelveDataKey(e.target.value)}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#5D6D66]">Finnhub API Key (US Real-Time Equities)</label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${keyStatus.finnhubConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {keyStatus.finnhubConfigured ? 'Configured' : 'Using EOD Feed'}
                </span>
              </div>
              <input
                type="password"
                placeholder="Enter VITE_FINNHUB_API_KEY..."
                value={finnhubKey}
                onChange={e => setFinnhubKey(e.target.value)}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#5D6D66]">Alpha Vantage API Key</label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${keyStatus.alphaVantageConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {keyStatus.alphaVantageConfigured ? 'Configured' : 'Optional'}
                </span>
              </div>
              <input
                type="password"
                placeholder="Enter VITE_ALPHA_VANTAGE_API_KEY..."
                value={alphaVantageKey}
                onChange={e => setAlphaVantageKey(e.target.value)}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              Update API Keys
            </button>
          </form>
        </div>

      </div>

      {/* 3. MULTI-USER DATA ISOLATION SWITCHER (TEST 4 REQUIREMENT) */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E1]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1F7A52]" />
            <div>
              <h2 className="text-base font-extrabold text-[#0E2A1E]">Multi-User Accounts &amp; Data Isolation Switcher</h2>
              <p className="text-xs text-[#5D6D66]">
                Verify complete cross-user data isolation. Switching users switches to that user's isolated database silo.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-bold">
            {allUsers.length} Registered Accounts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {allUsers.map(user => {
            const isActive = user.id === (currentUser?.id || profile.id);
            return (
              <div 
                key={user.id}
                onClick={() => switchUser(user.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive 
                    ? 'bg-[#E4F0E9] border-[#1F7A52] ring-2 ring-[#1F7A52]/20' 
                    : 'bg-[#F6F6F2] hover:bg-slate-200 border-[#E2E5E1]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <strong className="text-xs font-bold text-[#0E2A1E]">{user.name}</strong>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded bg-[#1F7A52] text-white text-[9px] font-black uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#5D6D66] block truncate mt-0.5">{user.email}</span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">ID: {user.id.slice(0, 16)}...</span>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E2E5E1]/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 capitalize">{user.role}</span>
                  <span className="text-[#1F7A52] font-bold flex items-center gap-1">
                    {isActive ? 'Currently Logged In' : 'Switch to this User'}
                    {!isActive && <ArrowRight className="w-3 h-3" />}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
