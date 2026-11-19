export type FinoraMode = 'manual' | 'ai';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Shopping'
  | 'Transportation'
  | 'Groceries'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Rent'
  | 'Utilities'
  | 'Travel'
  | 'Investments'
  | 'EMIs & Loans'
  | 'Other Expenses';

export const OFFICIAL_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Groceries',
  'Entertainment',
  'Healthcare',
  'Education',
  'Rent',
  'Utilities',
  'Travel',
  'Investments',
  'EMIs & Loans',
  'Other Expenses'
];

export type ExpenseSubcategory =
  | 'Cafes' | 'Restaurants' | 'Food Delivery' | 'Fast Food'
  | 'Clothing' | 'Electronics' | 'Online Shopping' | 'Personal Care'
  | 'Fuel' | 'Taxi' | 'Uber' | 'Public Transport' | 'Vehicle Maintenance'
  | 'Supermarket' | 'Local Kirana' | 'Vegetables & Fruits'
  | 'Movies' | 'Theatre' | 'Streaming' | 'Events' | 'Gaming'
  | 'Medicine' | 'Doctor Consultation' | 'Hospital' | 'Fitness & Gym' | 'Health Insurance'
  | 'School & College Tuition' | 'Courses & Certifications' | 'Books & Materials'
  | 'Apartment Rent' | 'House Rent' | 'Maintenance Charges'
  | 'Electricity' | 'Water' | 'Gas Cylinder' | 'Internet & Broadband' | 'Mobile Recharge'
  | 'Flights' | 'Hotels' | 'Holiday Packages' | 'Sightseeing'
  | 'Direct Stocks' | 'Mutual Funds' | 'SIP' | 'Gold & SGB' | 'Fixed Deposit' | 'Crypto'
  | 'Home Loan EMI' | 'Car Loan EMI' | 'Personal Loan EMI' | 'Credit Card Minimum Due'
  | 'General Expenses' | 'Charity & Gifts' | 'Miscellaneous';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'applicant' | 'developer';
  createdAt: string;
}

export interface UserPersonalProfile {
  fullName: string;
  email: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  city?: string;
  country?: string;
  employmentStatus: 'Salaried' | 'Self-Employed' | 'Business Owner' | 'Freelancer' | 'Student' | 'Unemployed' | 'Retired';
  occupation?: string;
  companyName?: string;
  monthlyIncome: number;
  incomeFrequency: 'Monthly' | 'Bi-Weekly' | 'Weekly' | 'Annual';
  preferredCurrency: 'INR' | 'USD' | 'EUR' | 'GBP';
}

export interface UserFinancialProfile {
  primaryIncome: number;
  additionalIncome: number;
  monthlyHouseholdExpenses: number;
  monthlyRentOrEmi: number;
  existingLoans: number;
  creditCardOutstanding: number;
  existingSavings: number;
  emergencyFund: number;
  financialDependants: number;
  connectedBankAccountsCount?: number;
}

export interface UserInvestmentProfile {
  currentlyInvests: boolean;
  assetClasses: Array<'Stocks' | 'Mutual Funds' | 'ETFs' | 'Fixed Deposits' | 'Gold' | 'Bonds' | 'Cryptocurrency' | 'Other'>;
  investmentExperience: 'Beginner' | 'Intermediate' | 'Experienced' | 'Advanced';
  investmentHorizon: 'Short-term (< 1 yr)' | 'Medium-term (1-5 yrs)' | 'Long-term (5-10 yrs)' | 'Very Long-term (10+ yrs)';
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  primaryObjective: 'Wealth Creation' | 'Capital Preservation' | 'Regular Income' | 'Retirement FIRE' | 'Tax Saving';
  monthlyInvestmentBudget: number;
}

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  age: number;
  employmentType: 'Salaried' | 'Self-Employed' | 'Freelancer' | 'Business Owner' | 'Student';
  employmentType: 'Salaried' | 'Self-Employed' | 'Freelancer' | 'Business Owner' | 'Student' | 'Retired';
  monthlyIncome: number;
  otherIncome: number;
  monthlyFixedExpenses: number;
  currentSavings: number;
  currentInvestments: number;
  totalDebt: number;
  riskPreference: 'Conservative' | 'Moderate' | 'Aggressive';
  financialPriorities: string[];
  mode: FinoraMode;
  isOnboarded: boolean;
  personalProfile?: UserPersonalProfile;
  financialProfile?: UserFinancialProfile;
  investmentProfile?: UserInvestmentProfile;
}

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Entertainment'
  | 'Shopping'
  | 'Travel'
  | 'Transport'
  | 'Bills'
  | 'Education'
  | 'Healthcare'
  | 'Other';

export type ExpenseSubcategory =
  | 'Cafes' | 'Restaurants' | 'Food Delivery' | 'Groceries' | 'Fast Food'
  | 'Movies' | 'Theatre' | 'Events' | 'Games' | 'Streaming'
  | 'Clothing' | 'Electronics' | 'Online Shopping' | 'Personal Care'
  | 'Flights' | 'Hotels' | 'Trips'
  | 'Fuel' | 'Taxi' | 'Uber' | 'Public Transport' | 'Vehicle Maintenance'
  | 'Electricity' | 'Internet' | 'Mobile' | 'Rent' | 'Utilities'
  | 'Courses' | 'Books' | 'College' | 'Training'
  | 'Medicine' | 'Doctor' | 'Hospital' | 'Fitness'
  | 'General';

export interface ExpenseTransaction {
  id: string;
  userId: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  subcategory: ExpenseSubcategory;
  amount: number;
  type: 'debit' | 'credit';
  merchant: string;
  isSubscription?: boolean;
  frequency?: 'Monthly' | 'Annual';
  isEssential?: boolean;
  source?: 'manual' | 'statement' | 'ai';
  notes?: string;
}

export interface CategoryBudget {
  id: string;
  userId: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  month: string; // YYYY-MM
}

export interface StockHolding {
  id: string;
  userId: string;
  name: string;
  symbol: string;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE';
  quantity: number;
  avgPurchasePrice: number;
  purchaseDate: string;
  currentPrice: number;
  dayChange?: number;
  dayChangePct?: number;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
  volume?: number;
  marketStatus?: 'Open' | 'Closed' | 'Delayed' | 'EOD';
  lastUpdated?: string;
  investedAmount: number;
  currentValue: number;
  returnsPct: number;
  unrealizedPnL: number;
  allocationPct: number;
  provider?: string;
}

export interface MutualFundHolding {
  id: string;
  userId: string;
  schemeCode: string;
  schemeName: string;
  fundHouse?: string;
  schemeCategory?: string;
  units: number;
  purchaseNav: number;
  currentNav: number;
  navDate: string;
  investedAmount: number;
  currentValue: number;
  returnsPct: number;
  unrealizedPnL: number;
  sipActive: boolean;
  sipAmount?: number;
  sipFrequency?: 'Monthly' | 'Quarterly';
  allocationPct: number;
  purchaseDate?: string;
}

export interface InvestmentItem {
  id: string;
  name: string;
  symbol?: string;
  type: 'Stocks' | 'Mutual Funds' | 'Gold' | 'ETFs' | 'Fixed Deposit' | 'Other';
  quantity: number;
  avgCostBasis: number;
  currentPrice: number;
  investedAmount: number;
  currentValue: number;
  returnsPct: number;
  allocationPct: number;
  provider: 'Zerodha' | 'Groww' | 'Upstox' | 'Manual' | 'Excel Import';
  riskLevel: 'Low' | 'Medium' | 'High';
  sector?: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE';
  currentPrice: number;
  priceChange: number;
  percentageChange: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  volume: number;
  marketStatus: 'Open' | 'Closed' | 'Delayed' | 'EOD';
  lastUpdated: string;
  priceAlertHigh?: number;
  priceAlertLow?: number;
}

export interface GoalItem {
  id: string;
  userId: string;
  name: string;
  category: 'Travel' | 'Education' | 'Emergency Fund' | 'Car' | 'House' | 'Retirement' | 'Wedding' | 'Custom';
  category: 'Emergency Fund' | 'Car' | 'House' | 'Higher Education' | 'International Travel' | 'Retirement' | 'Wealth Creation' | 'Debt Repayment' | 'Custom';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  estimatedCompletionMonths: number;
}

export interface SubscriptionItem {
  id: string;
  merchant: string;
  amount: number;
  frequency: 'Monthly' | 'Annual';
  category: string;
  lastPaymentDate: string;
  status: 'Active' | 'Ignored';
}

export interface FinancialHealthScore {
  overallScore: number;
  spendingScore: number;
  savingsScore: number;
  investmentsScore: number;
  goalsScore: number;
  emergencyFundScore: number;
  isComplete: boolean;
  missingFields: string[];
  savingsScore: number;       // max 25
  debtScore: number;          // max 20
  emergencyFundScore: number; // max 20
  spendingScore: number;      // max 15
  diversificationScore: number; // max 10
  goalsScore: number;         // max 10
  breakdownNotes: string[];
  recommendations: string[];
  previousScore?: number;
  scoreChangeReason?: string;
}

export interface UploadedStatementRecord {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'PDF' | 'CSV' | 'Excel';
  fileSizeKb: number;
  uploadDate: string;
  transactionsCount: number;
  totalDebits: number;
  totalCredits: number;
  status: 'Parsed' | 'Imported' | 'Discarded';
}

export interface UserCategoryLearning {
  merchantOrKeyword: string;
  assignedCategory: ExpenseCategory;
  assignedSubcategory?: ExpenseSubcategory;
  updatedAt: string;
}
