import React, { useState } from 'react';
import { 
  TrendingUp, 
  Home,
  LayoutDashboard,
  CreditCard,
  Target,
  Sparkles,
  ShieldCheck,
  Zap,
  Code2,
  Menu,
  X,
  User,
  Settings,
  Receipt,
  Layers,
  BarChart2
} from 'lucide-react';
import { useFinora } from '../data/FinoraContext';

export type TabType = 
  | 'landing' 
  | 'onboarding'
  | 'dashboard'
  | 'transactions'
  | 'spending'
  | 'budget'
  | 'investments'
  | 'stock-market'
  | 'mutual-funds'
  | 'goals'
  | 'finance-ai'
  | 'reports'
  | 'settings'
  | 'live-dashboard'
  | 'ai-plan'
  | 'ai-spender'
  | 'financial-mirror' 
  | 'financial-health' 
  | 'net-worth' 
  | 'simulator' 
  | 'calendar' 
  | 'tax' 
  | 'debt' 
  | 'rebalance' 
  | 'studio' 
  | 'database' 
  | 'formulas' 
  | 'architecture'
  | 'developer';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isExecuting: boolean;
  activeStepName?: string;
  onOpenAuthModal?: (tab: 'login' | 'signup' | 'developer') => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isExecuting,
  activeStepName,
  onOpenAuthModal,
  onToggleMobileSidebar,
}) => {
  const { profile, currentUser, isDeveloper } = useFinora();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* BRAND LOGO & MOBILE TOGGLE */}
        <div className="flex items-center gap-3">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#0E2A1E] text-white p-0.5 shadow-md shadow-emerald-950/20">
              <div className="w-full h-full bg-[#0E2A1E] rounded-xl flex items-center justify-center font-black text-lg">
                F
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-[#0E2A1E]">
                  Finora
                </h1>
                <span className="px-2 py-0.5 text-[9px] font-black tracking-wide uppercase rounded-full bg-[#E4F0E9] text-[#1F7A52] border border-[#1F7A52]/20">
                  AI FinTech OS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Financial Intelligence &amp; Investment Platform
              </p>
            </div>
          </div>
        </div>

        {/* PIPELINE STATUS BADGE IF RUNNING */}
        {isExecuting && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold animate-pulse">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Reasoning: {activeStepName || 'Analyzing financial ledger...'}</span>
          </div>
        )}

        {/* TOP QUICK NAVIGATION & USER ACTIONS */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={() => setActiveTab('landing')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'landing' ? 'bg-[#0E2A1E] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> Overview
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'dashboard' ? 'bg-[#1F7A52] text-white shadow-xs' : 'bg-[#E4F0E9] text-[#1F7A52] hover:bg-[#d5e7dc]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </button>

          {/* DEVELOPER SECTION TOGGLE */}
          <button
            onClick={() => {
              if (isDeveloper) {
                setActiveTab('developer');
              } else if (onOpenAuthModal) {
                onOpenAuthModal('developer');
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'developer'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-purple-700 hover:bg-purple-100 bg-purple-50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Developer Portal</span>
          </button>

          {/* USER ACCOUNT BADGE / AUTH */}
          <button
            onClick={() => {
              if (onOpenAuthModal) onOpenAuthModal('login');
            }}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#0E2A1E] text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#1F7A52]" />
            <span className="truncate max-w-[120px]">
              {profile.name || currentUser?.name || 'Sign In'}
            </span>
          </button>

          <button
            onClick={() => {
              if (onOpenAuthModal) onOpenAuthModal('signup');
            }}
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            New Applicant
          </button>

        </div>

      </div>
    </header>
  );
};
