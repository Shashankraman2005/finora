import React, { useState } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  User, 
  Wallet, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  DollarSign
} from 'lucide-react';
import type { 
  UserPersonalProfile, 
  UserFinancialProfile, 
  UserInvestmentProfile, 
  GoalItem,
  FinoraMode 
} from '../types/finora';

interface FinoraOnboardingProps {
  onComplete: () => void;
}

export const FinoraOnboarding: React.FC<FinoraOnboardingProps> = ({ onComplete }) => {
  const { currentUser, profile, completeOnboarding } = useFinora();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Personal Information
  const [fullName, setFullName] = useState(profile.name || currentUser?.name || '');
  const [email, setEmail] = useState(profile.email || currentUser?.email || '');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [country, setCountry] = useState('India');
  const [employmentStatus, setEmploymentStatus] = useState<UserPersonalProfile['employmentStatus']>('Salaried');
  const [occupation, setOccupation] = useState('Software Professional');
  const [companyName, setCompanyName] = useState('');
  const [personalMonthlyIncome, setPersonalMonthlyIncome] = useState<number | ''>('');
  const [incomeFrequency, setIncomeFrequency] = useState<UserPersonalProfile['incomeFrequency']>('Monthly');
  const [preferredCurrency, setPreferredCurrency] = useState<UserPersonalProfile['preferredCurrency']>('INR');

  // STEP 2: Financial Information
  const [primarySalary, setPrimarySalary] = useState<number | ''>('');
  const [additionalIncome, setAdditionalIncome] = useState<number | ''>('');
  const [monthlyHouseholdExpenses, setMonthlyHouseholdExpenses] = useState<number | ''>('');
  const [monthlyRentOrEmi, setMonthlyRentOrEmi] = useState<number | ''>('');
  const [existingLoans, setExistingLoans] = useState<number | ''>('');
  const [creditCardOutstanding, setCreditCardOutstanding] = useState<number | ''>('');
  const [existingSavings, setExistingSavings] = useState<number | ''>('');
  const [emergencyFund, setEmergencyFund] = useState<number | ''>('');
  const [financialDependants, setFinancialDependants] = useState<number>(0);
  const [connectBankAccounts, setConnectBankAccounts] = useState(false);

  // STEP 3: Investment Profile
  const [currentlyInvests, setCurrentlyInvests] = useState<boolean>(true);
  const [selectedAssetClasses, setSelectedAssetClasses] = useState<string[]>([
    'Stocks', 'Mutual Funds', 'Fixed Deposits', 'Gold'
  ]);
  const [investmentExperience, setInvestmentExperience] = useState<UserInvestmentProfile['investmentExperience']>('Intermediate');
  const [investmentHorizon, setInvestmentHorizon] = useState<UserInvestmentProfile['investmentHorizon']>('Long-term (5-10 yrs)');
  const [riskTolerance, setRiskTolerance] = useState<UserInvestmentProfile['riskTolerance']>('Moderate');
  const [primaryObjective, setPrimaryObjective] = useState<UserInvestmentProfile['primaryObjective']>('Wealth Creation');
  const [monthlyInvestmentBudget, setMonthlyInvestmentBudget] = useState<number | ''>('');

  // STEP 4: Financial Goals
  const [onboardingGoals, setOnboardingGoals] = useState<Array<{
    name: string;
    category: GoalItem['category'];
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
  }>>([
    {
      name: 'Emergency Reserve Fund',
      category: 'Emergency Fund',
      targetAmount: 300000,
      currentAmount: 50000,
      targetDate: '2027-03-31'
    }
  ]);

  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<GoalItem['category']>('Retirement');
  const [newGoalTarget, setNewGoalTarget] = useState<number>(1000000);
  const [newGoalCurrent, setNewGoalCurrent] = useState<number>(0);
  const [newGoalDate, setNewGoalDate] = useState('2032-12-31');

  // STEP 5: Mode selection
  const [selectedMode, setSelectedMode] = useState<FinoraMode>('manual');

  const inr = (n: number) => preferredCurrency === 'INR' ? '₹' + Math.round(n).toLocaleString('en-IN') : '$' + Math.round(n).toLocaleString('en-US');

  const toggleAssetClass = (item: string) => {
    setSelectedAssetClasses(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleAddGoal = () => {
    if (!newGoalName.trim()) return;
    setOnboardingGoals(prev => [
      ...prev,
      {
        name: newGoalName.trim(),
        category: newGoalCategory,
        targetAmount: Number(newGoalTarget),
        currentAmount: Number(newGoalCurrent),
        targetDate: newGoalDate
      }
    ]);
    setNewGoalName('');
  };

  const handleRemoveGoal = (index: number) => {
    setOnboardingGoals(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteRegistrationAndGenerate = () => {
    const personal: UserPersonalProfile = {
      fullName: fullName || 'New Applicant',
      email: email || currentUser?.email || '',
      mobileNumber: mobileNumber || undefined,
      dateOfBirth: dateOfBirth || undefined,
      city,
      country,
      employmentStatus,
      occupation,
      companyName: companyName || undefined,
      monthlyIncome: Number(personalMonthlyIncome) || Number(primarySalary) || 0,
      incomeFrequency,
      preferredCurrency
    };

    const financial: UserFinancialProfile = {
      primaryIncome: Number(primarySalary) || Number(personalMonthlyIncome) || 0,
      additionalIncome: Number(additionalIncome) || 0,
      monthlyHouseholdExpenses: Number(monthlyHouseholdExpenses) || 0,
      monthlyRentOrEmi: Number(monthlyRentOrEmi) || 0,
      existingLoans: Number(existingLoans) || 0,
      creditCardOutstanding: Number(creditCardOutstanding) || 0,
      existingSavings: Number(existingSavings) || 0,
      emergencyFund: Number(emergencyFund) || 0,
      financialDependants: Number(financialDependants) || 0,
      connectedBankAccountsCount: connectBankAccounts ? 1 : 0
    };

    const investment: UserInvestmentProfile = {
      currentlyInvests,
      assetClasses: selectedAssetClasses as any,
      investmentExperience,
      investmentHorizon,
      riskTolerance,
      primaryObjective,
      monthlyInvestmentBudget: Number(monthlyInvestmentBudget) || 0
    };

    const formattedGoals = onboardingGoals.map(g => {
      const now = new Date();
      const target = new Date(g.targetDate);
      const diffMonths = Math.max(1, Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4)));
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      const monthlyContribution = Math.round(remaining / diffMonths);

      return {
        name: g.name,
        category: g.category,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        targetDate: g.targetDate,
        monthlyContribution,
        estimatedCompletionMonths: diffMonths
      };
    });

    completeOnboarding({
      personalProfile: personal,
      financialProfile: financial,
      investmentProfile: investment,
      goals: formattedGoals,
      mode: selectedMode
    });

    onComplete();
  };

  return (
    <div className="min-h-[85vh] bg-[#F6F6F2] text-[#101A15] flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="max-w-3xl w-full bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 relative overflow-hidden">
        
        {/* HEADER & PROGRESS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E5E1] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0E2A1E] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#0E2A1E]/20">
              F
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0E2A1E]">Finora Financial Onboarding</h2>
              <span className="text-xs text-[#5D6D66] font-medium">Step {currentStep} of 5: {
                currentStep === 1 ? 'Personal Information' :
                currentStep === 2 ? 'Financial Baseline' :
                currentStep === 3 ? 'Investment Profile' :
                currentStep === 4 ? 'Financial Goals' : 'Dashboard Generation'
              }</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(step => (
              <div 
                key={step} 
                className={`h-2 rounded-full transition-all ${
                  step === currentStep ? 'w-8 bg-[#1F7A52]' :
                  step < currentStep ? 'w-5 bg-[#34D399]' : 'w-3 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: PERSONAL INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A52] flex items-center gap-1 mb-1">
                  <User className="w-3.5 h-3.5" /> Step 1: Personal Profile
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#0E2A1E]">Tell us about yourself</h3>
                <p className="text-xs text-[#5D6D66] mt-0.5">Your personal identity helps Finora customize tax brackets and regional cost-of-living baselines.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="priya@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Date of Birth (Optional)</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Residential City</label>
                <input
                  type="text"
                  placeholder="Mumbai, Bengaluru, Delhi..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Country</label>
                <input
                  type="text"
                  placeholder="India"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Employment Status</label>
                <select
                  value={employmentStatus}
                  onChange={e => setEmploymentStatus(e.target.value as any)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                >
                  <option value="Salaried">Salaried (Corporate / Govt)</option>
                  <option value="Self-Employed">Self-Employed Professional</option>
                  <option value="Business Owner">Business Owner / Founder</option>
                  <option value="Freelancer">Freelancer / Consultant</option>
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Doctor..."
                  value={occupation}
                  onChange={e => setOccupation(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Company Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Employer / Organization"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Preferred Currency</label>
                <select
                  value={preferredCurrency}
                  onChange={e => setPreferredCurrency(e.target.value as any)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                >
                  <option value="INR">₹ Indian Rupee (INR)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="GBP">£ British Pound (GBP)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#E2E5E1]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-extrabold text-xs shadow-md shadow-[#0E2A1E]/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to Financial Information</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FINANCIAL INFORMATION */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A52] flex items-center gap-1 mb-1">
                  <Wallet className="w-3.5 h-3.5" /> Step 2: Financial Baseline
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#0E2A1E]">Provide your financial numbers</h3>
                <p className="text-xs text-[#5D6D66] mt-0.5">
                  Finora uses actual user numbers. You may skip fields you prefer not to disclose right now.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Monthly Salary / Primary Income</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-xs text-[#1F7A52]">
                    {preferredCurrency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 85000"
                    value={primarySalary}
                    onChange={e => setPrimarySalary(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Additional Income Sources</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-xs text-[#1F7A52]">
                    {preferredCurrency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    placeholder="Rental, Dividends, Freelance..."
                    value={additionalIncome}
                    onChange={e => setAdditionalIncome(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Monthly Household Expenses</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-xs text-rose-600">
                    {preferredCurrency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    placeholder="Groceries, Dining, Utilities..."
                    value={monthlyHouseholdExpenses}
                    onChange={e => setMonthlyHouseholdExpenses(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Monthly Rent or Home Loan EMI</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-xs text-rose-600">
                    {preferredCurrency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={monthlyRentOrEmi}
                    onChange={e => setMonthlyRentOrEmi(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Existing Outstanding Loans</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-xs text-slate-500">
                    {preferredCurrency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    placeholder="Total principal remaining"
                    value={existingLoans}
                    onChange={e => setExistingLoans(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Credit Card Balance Due</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-xs text-slate-500">
                    {preferredCurrency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    placeholder="Total credit card dues"
                    value={creditCardOutstanding}
                    onChange={e => setCreditCardOutstanding(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Existing Bank Savings / FDs</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-xs text-[#1F7A52]">
                    {preferredCurrency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    placeholder="Savings balance across accounts"
                    value={existingSavings}
                    onChange={e => setExistingSavings(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Dedicated Emergency Fund</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-xs text-[#1F7A52]">
                    {preferredCurrency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    placeholder="Liquid reserve for emergencies"
                    value={emergencyFund}
                    onChange={e => setEmergencyFund(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Financial Dependants</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={financialDependants}
                  onChange={e => setFinancialDependants(Number(e.target.value))}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="bank_conn"
                  checked={connectBankAccounts}
                  onChange={e => setConnectBankAccounts(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1F7A52] focus:ring-[#1F7A52]"
                />
                <label htmlFor="bank_conn" className="text-xs font-semibold text-[#101A15] cursor-pointer">
                  Connect bank accounts via Statement Import later
                </label>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Skipped fields will be displayed as "Complete profile to unlock insight" on your dashboard. Never invented.</span>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E2E5E1]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-2xl border border-[#E2E5E1] text-[#5D6D66] hover:text-[#101A15] font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-extrabold text-xs shadow-md shadow-[#0E2A1E]/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to Investment Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INVESTMENT PROFILE */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A52] flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Step 3: Investment Profile
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#0E2A1E]">Your investment preferences</h3>
                <p className="text-xs text-[#5D6D66] mt-0.5">Customize your asset classes, risk tolerance, and monthly deployment budget.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                <input
                  type="checkbox"
                  id="invest_chk"
                  checked={currentlyInvests}
                  onChange={e => setCurrentlyInvests(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1F7A52]"
                />
                <label htmlFor="invest_chk" className="text-xs font-bold text-[#0E2A1E] cursor-pointer">
                  Do you currently invest in financial markets?
                </label>
              </div>

              {currentlyInvests && (
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-2">Select Active Asset Classes</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Stocks', 'Mutual Funds', 'ETFs', 'Fixed Deposits', 'Gold', 'Bonds', 'Cryptocurrency', 'Other'].map(asset => (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => toggleAssetClass(asset)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                          selectedAssetClasses.includes(asset)
                            ? 'bg-[#E4F0E9] border-[#1F7A52] text-[#1F7A52]'
                            : 'bg-[#F6F6F2] border-[#E2E5E1] text-[#5D6D66] hover:border-slate-300'
                        }`}
                      >
                        <span>{asset}</span>
                        {selectedAssetClasses.includes(asset) && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Investment Experience</label>
                  <select
                    value={investmentExperience}
                    onChange={e => setInvestmentExperience(e.target.value as any)}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  >
                    <option value="Beginner">Beginner (&lt; 1 year)</option>
                    <option value="Intermediate">Intermediate (1-3 years)</option>
                    <option value="Experienced">Experienced (3-7 years)</option>
                    <option value="Advanced">Advanced (7+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Investment Horizon</label>
                  <select
                    value={investmentHorizon}
                    onChange={e => setInvestmentHorizon(e.target.value as any)}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  >
                    <option value="Short-term (< 1 yr)">Short-term (&lt; 1 yr)</option>
                    <option value="Medium-term (1-5 yrs)">Medium-term (1-5 yrs)</option>
                    <option value="Long-term (5-10 yrs)">Long-term (5-10 yrs)</option>
                    <option value="Very Long-term (10+ yrs)">Very Long-term (10+ yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Risk Tolerance</label>
                  <select
                    value={riskTolerance}
                    onChange={e => setRiskTolerance(e.target.value as any)}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  >
                    <option value="Conservative">Conservative (Capital Safety Focus)</option>
                    <option value="Moderate">Moderate (Balanced Index &amp; Growth)</option>
                    <option value="Aggressive">Aggressive (Maximum Equity Compounding)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Primary Objective</label>
                  <select
                    value={primaryObjective}
                    onChange={e => setPrimaryObjective(e.target.value as any)}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                  >
                    <option value="Wealth Creation">Long-Term Wealth Creation</option>
                    <option value="Retirement FIRE">FIRE Early Retirement</option>
                    <option value="Capital Preservation">Capital Preservation</option>
                    <option value="Tax Saving">Tax Saving (ELSS / 80C)</option>
                    <option value="Regular Income">Regular Cash Flow / Dividend</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Monthly Investment Budget (SIP)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-xs text-[#1F7A52]">
                      {preferredCurrency === 'INR' ? '₹' : '$'}
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={monthlyInvestmentBudget}
                      onChange={e => setMonthlyInvestmentBudget(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E2E5E1]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-2xl border border-[#E2E5E1] text-[#5D6D66] hover:text-[#101A15] font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-extrabold text-xs shadow-md shadow-[#0E2A1E]/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to Financial Goals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FINANCIAL GOALS */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A52] flex items-center gap-1 mb-1">
                  <Target className="w-3.5 h-3.5" /> Step 4: Financial Goals
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#0E2A1E]">Set your life targets</h3>
                <p className="text-xs text-[#5D6D66] mt-0.5">Finora calculates the required monthly savings for each target amount and deadline.</p>
              </div>
            </div>

            {/* Existing Goal Cards */}
            <div className="space-y-2.5">
              {onboardingGoals.map((goal, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-[#0E2A1E]">{goal.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-[10px] font-bold">
                        {goal.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5D6D66] mt-0.5">
                      Target: <strong>{inr(goal.targetAmount)}</strong> • Current: <strong>{inr(goal.currentAmount)}</strong> • Due: {goal.targetDate}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                    title="Remove Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Goal Mini-Form */}
            <div className="p-4 rounded-2xl border border-dashed border-[#1F7A52]/40 bg-[#E4F0E9]/20 space-y-3">
              <span className="text-xs font-bold text-[#0E2A1E] flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-[#1F7A52]" /> Add Another Financial Goal
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Goal name (e.g. Buying a Car, Europe Trip)"
                  value={newGoalName}
                  onChange={e => setNewGoalName(e.target.value)}
                  className="bg-white border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />

                <select
                  value={newGoalCategory}
                  onChange={e => setNewGoalCategory(e.target.value as any)}
                  className="bg-white border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                >
                  <option value="Emergency Fund">Emergency Fund</option>
                  <option value="Car">Buying a Car</option>
                  <option value="House">Buying a House</option>
                  <option value="Higher Education">Higher Education</option>
                  <option value="International Travel">International Travel</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Wealth Creation">Wealth Creation</option>
                  <option value="Debt Repayment">Debt Repayment</option>
                </select>

                <input
                  type="number"
                  placeholder="Target Amount"
                  value={newGoalTarget}
                  onChange={e => setNewGoalTarget(Number(e.target.value))}
                  className="bg-white border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />

                <input
                  type="date"
                  value={newGoalDate}
                  onChange={e => setNewGoalDate(e.target.value)}
                  className="bg-white border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddGoal}
                disabled={!newGoalName.trim()}
                className="px-4 py-2 rounded-xl bg-[#1F7A52] hover:bg-[#14372A] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Save Goal
              </button>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E2E5E1]">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-2xl border border-[#E2E5E1] text-[#5D6D66] hover:text-[#101A15] font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-6 py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-extrabold text-xs shadow-md shadow-[#0E2A1E]/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to Dashboard Generation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: DASHBOARD GENERATION */}
        {currentStep === 5 && (
          <div className="space-y-6 text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#E4F0E9] text-[#1F7A52] flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0E2A1E]">Ready to generate your financial dashboard</h2>
              <p className="text-xs sm:text-sm text-[#5D6D66] max-w-lg mx-auto">
                Finora will now build your financial overview strictly using your provided figures. No dummy data will ever be inserted.
              </p>
            </div>

            {/* Operating Mode Selector */}
            <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-left">
              <div 
                onClick={() => setSelectedMode('manual')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedMode === 'manual' 
                    ? 'bg-[#E4F0E9] border-[#1F7A52] ring-2 ring-[#1F7A52]/20' 
                    : 'bg-[#F6F6F2] border-[#E2E5E1]'
                }`}
              >
                <span className="text-xs font-black text-[#0E2A1E] block mb-1">Manual Mode</span>
                <p className="text-[11px] text-[#5D6D66]">
                  Enter spending, stocks, and SIPs manually with full custom control.
                </p>
              </div>

              <div 
                onClick={() => setSelectedMode('ai')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedMode === 'ai' 
                    ? 'bg-[#E4F0E9] border-[#1F7A52] ring-2 ring-[#1F7A52]/20' 
                    : 'bg-[#F6F6F2] border-[#E2E5E1]'
                }`}
              >
                <span className="text-xs font-black text-[#1F7A52] block mb-1">AI Mode</span>
                <p className="text-[11px] text-[#5D6D66]">
                  Upload bank statements and let Finora auto-categorize expenses.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#E2E5E1]">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-2xl border border-[#E2E5E1] text-[#5D6D66] hover:text-[#101A15] font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleCompleteRegistrationAndGenerate}
                className="px-8 py-4 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-black text-sm shadow-xl shadow-[#0E2A1E]/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                <span>Generate My Finora Dashboard</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
