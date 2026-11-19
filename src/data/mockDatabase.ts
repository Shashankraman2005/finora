export interface UserProfile {
  id: string;
  name: string;
  age: number;
  targetRetirementAge: number;
  monthlyGrossIncome: number;
  monthlyExpenses: number;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  currency: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'Checking' | 'Savings' | 'Brokerage' | '401(k)' | 'Roth IRA' | 'Crypto';
  institution: string;
  balance: number;
  yieldRate?: number;
}

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  assetClass: 'US Equity' | 'Intl Equity' | 'Bonds' | 'Real Estate' | 'Tech Equity' | 'Crypto';
  quantity: number;
  avgCostBasis: number;
  currentPrice: number;
  marketValue: number;
  unrealizedGainLoss: number;
  annualDividendYield: number;
}

export interface Liability {
  id: string;
  name: string;
  category: 'Mortgage' | 'Auto Loan' | 'Student Loan' | 'Credit Card';
  principalRemaining: number;
  interestRatePct: number;
  minimumMonthlyPayment: number;
  termMonthsRemaining: number;
}

export interface Transaction {
  id: string;
  date: string;
  category: 'Income' | 'Housing' | 'Investments' | 'Debt Payoff' | 'Discretionary' | 'Utilities';
  amount: number;
  description: string;
  type: 'credit' | 'debit';
}

export interface MarketBenchmark {
  symbol: string;
  name: string;
  ytdReturnPct: number;
  threeYrCAGRPct: number;
  volatilityPct: number;
  riskFreeRatePct: number;
}

export const MOCK_FINANCIAL_DATABASE = {
  userProfile: {
    id: 'usr_84920',
    name: 'Shashank Raman',
    age: 34,
    targetRetirementAge: 55,
    monthlyGrossIncome: 14500, // $174k/yr
    monthlyExpenses: 6800,
    riskTolerance: 'Aggressive' as const,
    currency: 'USD',
  },
  accounts: [
    { id: 'acc_01', name: 'High Yield Savings', type: 'Savings', institution: 'Marcus Goldman', balance: 45000, yieldRate: 4.85 },
    { id: 'acc_02', name: 'Primary Checking', type: 'Checking', institution: 'Chase Bank', balance: 12500 },
    { id: 'acc_03', name: 'Individual Brokerage', type: 'Brokerage', institution: 'Fidelity', balance: 215000 },
    { id: 'acc_04', name: 'Tech Employer 401(k)', type: '401(k)', institution: 'Fidelity', balance: 180000 },
    { id: 'acc_05', name: 'Backdoor Roth IRA', type: 'Roth IRA', institution: 'Vanguard', balance: 65000 },
  ],
  holdings: [
    { id: 'h_01', ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', assetClass: 'US Equity', quantity: 650, avgCostBasis: 195.0, currentPrice: 275.4, marketValue: 179010, unrealizedGainLoss: 52260, annualDividendYield: 1.45 },
    { id: 'h_02', ticker: 'VXUS', name: 'Vanguard Total Intl Stock ETF', assetClass: 'Intl Equity', quantity: 800, avgCostBasis: 52.0, currentPrice: 61.2, marketValue: 48960, unrealizedGainLoss: 7360, annualDividendYield: 3.10 },
    { id: 'h_03', ticker: 'NVDA', name: 'NVIDIA Corporation', assetClass: 'Tech Equity', quantity: 350, avgCostBasis: 48.0, currentPrice: 122.5, marketValue: 42875, unrealizedGainLoss: 26075, annualDividendYield: 0.08 },
    { id: 'h_04', ticker: 'AAPL', name: 'Apple Inc.', assetClass: 'Tech Equity', quantity: 300, avgCostBasis: 140.0, currentPrice: 228.0, marketValue: 68400, unrealizedGainLoss: 26400, annualDividendYield: 0.44 },
    { id: 'h_05', ticker: 'BND', name: 'Vanguard Total Bond Market ETF', assetClass: 'Bonds', quantity: 500, avgCostBasis: 76.5, currentPrice: 72.8, marketValue: 36400, unrealizedGainLoss: -1850, annualDividendYield: 3.65 },
    { id: 'h_06', ticker: 'VNQ', name: 'Vanguard Real Estate ETF', assetClass: 'Real Estate', quantity: 300, avgCostBasis: 82.0, currentPrice: 84.8, marketValue: 25440, unrealizedGainLoss: 840, annualDividendYield: 4.20 },
  ],
  liabilities: [
    { id: 'l_01', name: 'Primary Home Mortgage', category: 'Mortgage', principalRemaining: 340000, interestRatePct: 4.25, minimumMonthlyPayment: 2150, termMonthsRemaining: 288 },
    { id: 'l_02', name: 'Tesla Auto Loan', category: 'Auto Loan', principalRemaining: 24500, interestRatePct: 5.90, minimumMonthlyPayment: 580, termMonthsRemaining: 44 },
    { id: 'l_03', name: 'Graduate Student Loan', category: 'Student Loan', principalRemaining: 18200, interestRatePct: 3.80, minimumMonthlyPayment: 260, termMonthsRemaining: 72 },
  ],
  transactions: [
    { id: 'tx_101', date: '2026-09-25', category: 'Income', amount: 7250, description: 'Bi-weekly Direct Deposit Payroll', type: 'credit' },
    { id: 'tx_102', date: '2026-09-24', category: 'Investments', amount: 2000, description: 'Auto-Transfer to Fidelity Brokerage VTI', type: 'debit' },
    { id: 'tx_103', date: '2026-09-20', category: 'Housing', amount: 2150, description: 'Mortgage Payment (Principal + Interest + Escrow)', type: 'debit' },
    { id: 'tx_104', date: '2026-09-18', category: 'Debt Payoff', amount: 580, description: 'Tesla Auto Financing Direct Debit', type: 'debit' },
    { id: 'tx_105', date: '2026-09-15', category: 'Discretionary', amount: 340, description: 'Whole Foods Organic Groceries', type: 'debit' },
    { id: 'tx_106', date: '2026-09-10', category: 'Utilities', amount: 280, description: 'City Electric & Fiber High-Speed Internet', type: 'debit' },
  ],
  marketBenchmarks: [
    { symbol: 'S&P500', name: 'S&P 500 Index (SPY)', ytdReturnPct: 14.8, threeYrCAGRPct: 11.4, volatilityPct: 15.2, riskFreeRatePct: 4.2 },
    { symbol: 'NASDAQ', name: 'Nasdaq 100 Index (QQQ)', ytdReturnPct: 18.2, threeYrCAGRPct: 14.6, volatilityPct: 19.8, riskFreeRatePct: 4.2 },
    { symbol: 'AGG', name: 'US Aggregate Bond Index', ytdReturnPct: 3.8, threeYrCAGRPct: 1.8, volatilityPct: 6.4, riskFreeRatePct: 4.2 },
  ]
};
