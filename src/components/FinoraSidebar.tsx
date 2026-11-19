import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  Sliders, 
  TrendingUp, 
  BarChart2, 
  Layers, 
  Target, 
  Sparkles, 
  FileText, 
  Settings,
  Code2
} from 'lucide-react';
import type { TabType } from './Navbar';
import { useFinora } from '../data/FinoraContext';

interface FinoraSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const FinoraSidebar: React.FC<FinoraSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { profile, currentUser, isDeveloper } = useFinora();

  // The 11 Core Navigation Items explicitly specified by Finora Master Spec
  const navItems = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: '2. Transactions', icon: Receipt },
    { id: 'spending', label: '3. Expenses', icon: CreditCard },
    { id: 'budget', label: '4. Budget', icon: Sliders },
    { id: 'investments', label: '5. Investments', icon: TrendingUp },
    { id: 'stock-market', label: '6. Stock Market', icon: BarChart2 },
    { id: 'mutual-funds', label: '7. Mutual Funds', icon: Layers },
    { id: 'goals', label: '8. Financial Goals', icon: Target },
    { id: 'finance-ai', label: '9. AI Assistant', icon: Sparkles },
    { id: 'reports', label: '10. Reports', icon: FileText },
    { id: 'settings', label: '11. Profile & Settings', icon: Settings }
  ];

  const handleSelect = (tab: string) => {
    setActiveTab(tab as TabType);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`
      w-64 bg-[#0E2A1E] text-white flex flex-col justify-between p-4 flex-shrink-0 transition-all z-30
      ${isOpenMobile ? 'fixed inset-y-0 left-0 shadow-2xl' : 'hidden md:flex min-h-[calc(100vh-65px)]'}
    `}>
      <div className="space-y-6">
        
        {/* User Mini Card */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1F7A52] text-white flex items-center justify-center font-black text-sm">
            {(profile.name || currentUser?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <span className="font-bold text-xs text-white block truncate">
              {profile.name || currentUser?.name || 'Applicant User'}
            </span>
            <span className="text-[10px] text-slate-300 capitalize block truncate">
              {profile.mode} Mode • {profile.personalProfile?.preferredCurrency || 'INR'}
            </span>
          </div>
        </div>

        {/* 11 SIDEBAR NAVIGATION ITEMS */}
        <nav className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block mb-2">
            Main Navigation
          </span>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#1F7A52] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#34D399]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* DEVELOPER SECTION SHORTCUT (IF AUTHORIZED @finora.com) */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        {isDeveloper && (
          <button
            onClick={() => handleSelect('developer')}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'developer'
                ? 'bg-purple-900 text-white'
                : 'text-purple-300 hover:bg-purple-950/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-purple-400" /> Dev Portal
            </span>
            <span className="text-[9px] bg-purple-800 text-purple-200 px-1.5 py-0.5 rounded font-mono">
              @finora.com
            </span>
          </button>
        )}

        <div className="text-[10px] text-slate-400 px-3">
          Finora Intelligence OS v3.2
        </div>
      </div>
    </aside>
  );
};
