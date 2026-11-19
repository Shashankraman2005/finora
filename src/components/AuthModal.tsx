import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Code2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useFinora } from '../data/FinoraContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup' | 'developer';
  onLoginSuccess: (userName: string, isDev?: boolean, needsOnboarding?: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onLoginSuccess,
}) => {
  const { loginDeveloper, registerUser, loginUser, loadDemoAccount, allUsers } = useFinora();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'developer'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMessage('');
      setSuccessMessage('');
      if (initialTab === 'developer' && !email) {
        setEmail('shashankraman@finora.com');
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (activeTab === 'developer') {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail.endsWith('@finora.com')) {
          setErrorMessage('Access Denied: Developer section is strictly restricted to authorized @finora.com accounts.');
          setIsSubmitting(false);
          return;
        }

        const isOk = loginDeveloper(cleanEmail);
        if (isOk) {
          setSuccessMessage(`Developer authentication granted for ${cleanEmail}! Redirecting...`);
          setTimeout(() => {
            onLoginSuccess(cleanEmail.split('@')[0], true, false);
            onClose();
          }, 800);
        } else {
          setErrorMessage('Invalid Developer Credentials. Only @finora.com domain emails are allowed.');
        }
      } else if (activeTab === 'signup') {
        // Register brand-new applicant with 100% BLANK account
        if (!fullName.trim() || !email.trim()) {
          setErrorMessage('Please provide your full legal name and email address.');
          setIsSubmitting(false);
          return;
        }

        const newAccount = await registerUser(fullName.trim(), email.trim(), password);
        setSuccessMessage(`Account created for ${newAccount.name}! Starting your financial onboarding...`);
        setTimeout(() => {
          onLoginSuccess(newAccount.name, false, true); // needsOnboarding = true
          onClose();
        }, 800);
      } else {
        // Applicant Login
        const success = loginUser(email.trim(), password);
        if (success) {
          const user = allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
          const name = user?.name || email.split('@')[0];
          setSuccessMessage(`Welcome back, ${name}!`);
          setTimeout(() => {
            onLoginSuccess(name, false, false);
            onClose();
          }, 800);
        } else {
          // If not found, suggest registering
          setErrorMessage(`No account found for ${email}. Please check your credentials or click "New Applicant" to register.`);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDevLogin = (devEmail: string) => {
    setEmail(devEmail);
    setErrorMessage('');
    setSuccessMessage(`Logging into Developer Section as ${devEmail}...`);
    loginDeveloper(devEmail);
    setTimeout(() => {
      onLoginSuccess('Shashank Raman (Dev)', true, false);
      onClose();
    }, 800);
  };

  const handleExploreDemoAccount = () => {
    loadDemoAccount();
    setSuccessMessage('Loaded Arjun Patel (Demo Account)...');
    setTimeout(() => {
      onLoginSuccess('Arjun Patel', false, false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-[#E2E5E1] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-[#101A15]">
        
        {/* Top Header & Close */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0E2A1E] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#0E2A1E]/20">
              F
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0E2A1E] tracking-tight">Finora Access Portal</h2>
              <p className="text-xs text-[#5D6D66] font-medium">Select Applicant or Developer Login</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold animate-shake">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#E4F0E9] border border-[#1F7A52]/30 text-[#1F7A52] text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 3-WAY TAB SWITCHER */}
        <div className="flex bg-[#F6F6F2] p-1.5 rounded-2xl border border-[#E2E5E1] text-xs font-extrabold">
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'login' 
                ? 'bg-[#0E2A1E] text-white shadow-sm' 
                : 'text-[#5D6D66] hover:text-[#101A15]'
            }`}
          >
            Applicant Login
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'signup' 
                ? 'bg-[#0E2A1E] text-white shadow-sm' 
                : 'text-[#5D6D66] hover:text-[#101A15]'
            }`}
          >
            New Applicant
          </button>
          <button
            onClick={() => { 
              setActiveTab('developer'); 
              setErrorMessage(''); 
              if (!email) setEmail('shashankraman@finora.com');
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'developer' 
                ? 'bg-purple-900 text-white shadow-sm font-black' 
                : 'text-purple-700 hover:bg-purple-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" /> Dev Section
          </button>
        </div>

        {/* DEVELOPER SECTION BANNER */}
        {activeTab === 'developer' && (
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 text-xs font-medium space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-purple-900">
              <Code2 className="w-4 h-4 text-purple-700" />
              <span>Developer Section Restriction Rule:</span>
            </div>
            <p className="text-[11px] text-purple-800">
              Only employees and developers with an authorized <strong className="underline text-purple-950">@finora.com</strong> email address can log into the Developer Section.
            </p>
          </div>
        )}

        {/* NEW APPLICANT NOTICE */}
        {activeTab === 'signup' && (
          <div className="p-3.5 rounded-2xl bg-[#E4F0E9] border border-[#1F7A52]/30 text-[#1F7A52] text-xs font-semibold">
            ✨ <strong>Blank Account Guarantee:</strong> Newly registered applicants start with zero transactions, zero fake holdings, and zero fabricated scores.
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'signup' && (
            <div>
              <label className="text-xs font-bold text-[#5D6D66] block mb-1.5">Applicant Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Varsha Mishra, Sumit Sinha"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#5D6D66] block mb-1.5">
              {activeTab === 'developer' ? 'Developer Email Address (@finora.com only)' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder={activeTab === 'developer' ? "shashankraman@finora.com" : "applicant@gmail.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-[#F6F6F2] border rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none transition-all ${
                  activeTab === 'developer' ? 'border-purple-300 focus:border-purple-600 focus:bg-purple-50/40' : 'border-[#E2E5E1] focus:border-[#1F7A52] focus:bg-white'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[#5D6D66]">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-2xl text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'developer'
                ? 'bg-purple-900 hover:bg-purple-950 shadow-purple-900/30'
                : 'bg-[#0E2A1E] hover:bg-[#14372A] shadow-[#0E2A1E]/20'
            }`}
          >
            <span>
              {activeTab === 'developer' 
                ? 'Verify & Enter Developer Section' 
                : activeTab === 'login' 
                  ? 'Log In to Applicant Portal' 
                  : 'Register Blank Applicant Account'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* DEMO FAST ACCESS */}
        <div className="pt-3 border-t border-[#E2E5E1] space-y-2">
          {activeTab === 'developer' ? (
            <button
              type="button"
              onClick={() => handleQuickDevLogin('shashankraman@finora.com')}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-[11px] font-black shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-purple-300" /> Log in as Dev: shashankraman@finora.com
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#5D6D66]">
                ⚡ Quick Demo Mode:
              </div>
              <button
                type="button"
                onClick={handleExploreDemoAccount}
                className="w-full py-2 px-3 rounded-xl bg-[#F6F6F2] hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-[#E2E5E1] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1F7A52]" />
                <span>Explore Demo Account (Arjun Patel)</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5D6D66] font-medium pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A52]" />
          <span>256-bit Encrypted Finora Security &amp; RBAC Portal</span>
        </div>
      </div>
    </div>
  );
};
