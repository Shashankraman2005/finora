import type { 
  UserProfileData, 
  ExpenseTransaction, 
  InvestmentItem, 
  GoalItem, 
  SubscriptionItem, 
  FinancialHealthScore 
} from '../types/finora';

export const INITIAL_USER_PROFILE: UserProfileData = {
  id: 'usr_arjun_01',
  name: 'Arjun Patel',
  email: 'arjun@finora.ai',
  age: 32,
  employmentType: 'Salaried',
  monthlyIncome: 85000, // ₹85,000 / mo
  otherIncome: 5000,
  monthlyFixedExpenses: 28000,
  currentSavings: 185000,
  currentInvestments: 450000,
  totalDebt: 320000,
  riskPreference: 'Moderate',
  financialPriorities: ['Emergency Reserve', 'FIRE Retirement', 'Home Downpayment'],
  mode: 'manual',
  isOnboarded: true,
};

export const INITIAL_TRANSACTIONS: ExpenseTransaction[] = [
  { id: 'tx_1', date: '2026-10-06', description: 'Starbucks Coffee & Bagel', category: 'Food & Dining', subcategory: 'Cafes', amount: 480, type: 'debit', merchant: 'Starbucks', isEssential: false },
  { id: 'tx_2', date: '2026-10-05', description: 'PVR Cinemas Ticket & Popcorn', category: 'Entertainment', subcategory: 'Movies', amount: 850, type: 'debit', merchant: 'PVR Cinemas', isEssential: false },
  { id: 'tx_3', date: '2026-10-04', description: 'Amazon Shopping - Noise Headphones', category: 'Shopping', subcategory: 'Electronics', amount: 2490, type: 'debit', merchant: 'Amazon', isEssential: false },
  { id: 'tx_4', date: '2026-10-03', description: 'Swiggy Dinner Order', category: 'Food & Dining', subcategory: 'Food Delivery', amount: 720, type: 'debit', merchant: 'Swiggy', isEssential: false },
  { id: 'tx_5', date: '2026-10-02', description: 'Uber Trip to Office', category: 'Transport', subcategory: 'Taxi', amount: 340, type: 'debit', merchant: 'Uber', isEssential: true },
  { id: 'tx_6', date: '2026-10-01', description: 'Airtel Broadband Internet Bill', category: 'Bills', subcategory: 'Internet', amount: 1199, type: 'debit', merchant: 'Airtel', isSubscription: true, frequency: 'Monthly', isEssential: true },
  { id: 'tx_7', date: '2026-09-30', description: 'Netflix Premium Subscription', category: 'Entertainment', subcategory: 'Streaming', amount: 649, type: 'debit', merchant: 'Netflix', isSubscription: true, frequency: 'Monthly', isEssential: false },
  { id: 'tx_8', date: '2026-09-28', description: 'Spotify Individual Premium', category: 'Entertainment', subcategory: 'Streaming', amount: 119, type: 'debit', merchant: 'Spotify', isSubscription: true, frequency: 'Monthly', isEssential: false },
  { id: 'tx_9', date: '2026-09-27', description: 'Cult.fit Fitness Gym Pass', category: 'Healthcare', subcategory: 'Fitness', amount: 1800, type: 'debit', merchant: 'Cult.fit', isSubscription: true, frequency: 'Monthly', isEssential: true },
  { id: 'tx_10', date: '2026-09-25', description: 'Monthly Salary Credit', category: 'Bills', subcategory: 'General', amount: 85000, type: 'credit', merchant: 'Employer Corp', isEssential: true },
  { id: 'tx_11', date: '2026-09-24', description: 'Zomato Lunch Order', category: 'Food & Dining', subcategory: 'Food Delivery', amount: 430, type: 'debit', merchant: 'Zomato', isEssential: false },
  { id: 'tx_12', date: '2026-09-22', description: 'Third Wave Coffee Roast', category: 'Food & Dining', subcategory: 'Cafes', amount: 560, type: 'debit', merchant: 'Third Wave Coffee', isEssential: false },
];

export const INITIAL_INVESTMENTS: InvestmentItem[] = [
  { id: 'inv_1', name: 'Nifty 50 Index Fund', symbol: 'NIFTY50', type: 'Mutual Funds', quantity: 450, avgCostBasis: 180, currentPrice: 220, investedAmount: 81000, currentValue: 99000, returnsPct: 22.2, allocationPct: 35, provider: 'Groww', riskLevel: 'Medium', sector: 'Broad Market' },
  { id: 'inv_2', name: 'Parag Parikh Flexi Cap Fund', symbol: 'PPFCAP', type: 'Mutual Funds', quantity: 280, avgCostBasis: 250, currentPrice: 310, investedAmount: 70000, currentValue: 86800, returnsPct: 24.0, allocationPct: 30, provider: 'Groww', riskLevel: 'Medium', sector: 'Diversified Multi-Cap' },
  { id: 'inv_3', name: 'Reliance Industries Ltd', symbol: 'RELIANCE', type: 'Stocks', quantity: 40, avgCostBasis: 2400, currentPrice: 2950, investedAmount: 96000, currentValue: 118000, returnsPct: 22.9, allocationPct: 20, provider: 'Zerodha', riskLevel: 'High', sector: 'Energy & Retail' },
  { id: 'inv_4', name: 'Sovereign Gold Bond (SGB 2024)', symbol: 'SGB', type: 'Gold', quantity: 15, avgCostBasis: 5200, currentPrice: 7200, investedAmount: 78000, currentValue: 108000, returnsPct: 38.4, allocationPct: 15, provider: 'Upstox', riskLevel: 'Low', sector: 'Commodities' },
];

export const INITIAL_GOALS: GoalItem[] = [
  { id: 'g_1', name: '6-Month Emergency Fund', category: 'Emergency Fund', targetAmount: 250000, currentAmount: 185000, targetDate: '2027-03-01', monthlyContribution: 12000, estimatedCompletionMonths: 6 },
  { id: 'g_2', name: 'FIRE Early Retirement', category: 'Retirement', targetAmount: 20000000, currentAmount: 450000, targetDate: '2042-01-01', monthlyContribution: 25000, estimatedCompletionMonths: 180 },
  { id: 'g_3', name: 'Eurotrip Vacation 2027', category: 'Travel', targetAmount: 300000, currentAmount: 120000, targetDate: '2027-06-01', monthlyContribution: 10000, estimatedCompletionMonths: 18 },
];

export const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  { id: 'sub_1', merchant: 'Netflix Premium', amount: 649, frequency: 'Monthly', category: 'Streaming', lastPaymentDate: '2026-09-30', status: 'Active' },
  { id: 'sub_2', merchant: 'Spotify Premium', amount: 119, frequency: 'Monthly', category: 'Music', lastPaymentDate: '2026-09-28', status: 'Active' },
  { id: 'sub_3', merchant: 'Cult.fit Gym Pass', amount: 1800, frequency: 'Monthly', category: 'Fitness', lastPaymentDate: '2026-09-27', status: 'Active' },
  { id: 'sub_4', merchant: 'Amazon Prime', amount: 1499, frequency: 'Annual', category: 'Shopping', lastPaymentDate: '2026-01-15', status: 'Active' },
];

export function computeFinancialHealthScore(
  profile: UserProfileData,
  transactions: ExpenseTransaction[],
  investments: InvestmentItem[],
  goals: GoalItem[]
): FinancialHealthScore {
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);
  const income = profile.monthlyIncome + profile.otherIncome;
  
  const savingsRate = Math.max(0, Math.min(100, ((income - totalDebits) / income) * 100));
  const spendingScore = Math.round(Math.max(40, 100 - (totalDebits / income) * 60));
  const savingsScore = Math.round(Math.min(100, savingsRate * 2.5));
  const totalInvested = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const investmentsScore = Math.round(Math.min(100, (totalInvested / (income * 6)) * 100));
  
  const emergencyGoal = goals.find(g => g.category === 'Emergency Fund');
  const emergencyFundScore = emergencyGoal ? Math.round((emergencyGoal.currentAmount / emergencyGoal.targetAmount) * 100) : 70;
  
  const overallScore = Math.round(
    spendingScore * 0.25 + 
    savingsScore * 0.25 + 
    investmentsScore * 0.25 + 
    emergencyFundScore * 0.25
  );

  return {
    overallScore: Math.min(100, Math.max(20, overallScore)),
    spendingScore: Math.min(100, Math.max(30, spendingScore)),
    savingsScore: Math.min(100, Math.max(20, savingsScore)),
    investmentsScore: Math.min(100, Math.max(20, investmentsScore)),
    goalsScore: 80,
    emergencyFundScore: Math.min(100, Math.max(20, emergencyFundScore)),
    breakdownNotes: [
      `Savings rate is ${savingsRate.toFixed(1)}% of total monthly gross income.`,
      `Liquid emergency reserves cover ${(profile.currentSavings / Math.max(1, profile.monthlyFixedExpenses)).toFixed(1)} months of fixed expenses.`,
      `Investment growth CAGR is tracking at +${(investments.reduce((acc, i) => acc + i.returnsPct, 0) / (investments.length || 1)).toFixed(1)}%.`
    ]
  };
}
