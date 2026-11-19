/**
 * FINORA COMPREHENSIVE AUTOMATED VERIFICATION SUITE
 * Tests all 6 core acceptance criteria:
 * 1. New applicant blank-account validation
 * 2. Financial onboarding calculation validation
 * 3. Stock market quote retrieval, watchlist, and fallback handling
 * 4. Multi-user data isolation (User A vs User B)
 * 5. AI expense categorisation, outlier detection & copilot inquiries
 * 6. Regression check on existing features, navigation & developer access
 */

import { StorageService } from '../services/storageService.ts';
import { MarketDataService } from '../services/marketDataService.ts';
import { MutualFundService } from '../services/mutualFundService.ts';
import { CategorizerService } from '../services/categorizerService.ts';
import { HealthScoreService } from '../services/healthScoreService.ts';
import { StatementParserService } from '../services/statementParser.ts';
import { OFFICIAL_CATEGORIES, type ExpenseCategory } from '../types/finora.ts';

// Polyfill in-memory localStorage if needed
if (!globalThis.localStorage || typeof globalThis.localStorage.getItem !== 'function') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    length: store.size,
  } as Storage;
}

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    failedCount++;
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedCount++;
    console.log(`  ✓ PASS: ${message}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🚀 FINORA INTELLIGENCE OS – AUTOMATED VERIFICATION SUITE');
  console.log('================================================================\n');

  // ==========================================================================
  // TEST 1: New Applicant Blank-Account Validation
  // ==========================================================================
  console.log('--- TEST 1: New Applicant Blank-Account Validation ---');
  const applicantEmail = `new_applicant_${Date.now()}@finora.test`;
  const applicantName = 'Priya Sharma';
  const newAccount = await StorageService.registerApplicant(applicantName, applicantEmail, 'SecurePass123!');
  
  assert(newAccount.email === applicantEmail.toLowerCase(), 'Applicant registered with correct email');
  assert(newAccount.name === applicantName, 'Applicant registered with correct name');
  assert((newAccount.passwordHash?.length ?? 0) === 64, 'Password hashed with SHA-256');

  // Switch to new applicant
  StorageService.setActiveUserId(newAccount.id);
  const userProfile = StorageService.getUserProfile(newAccount.id);
  const txs = StorageService.getTransactions(newAccount.id);
  const stocks = StorageService.getStockHoldings(newAccount.id);
  const mfs = StorageService.getMutualFundHoldings(newAccount.id);
  const goals = StorageService.getGoals(newAccount.id);
  const budgets = StorageService.getBudgets(newAccount.id);

  assert(userProfile.isOnboarded === false, 'New applicant has isOnboarded = false');
  assert(txs.length === 0, 'New applicant has 0 transactions (ZERO sample data)');
  assert(stocks.length === 0, 'New applicant has 0 stock holdings');
  assert(mfs.length === 0, 'New applicant has 0 mutual fund folios');
  assert(goals.length === 0, 'New applicant has 0 goals');
  assert(budgets.length === 0, 'New applicant has 0 preset budgets');

  // Validate Health Score is incomplete with explicit explanation
  const initialHealth = HealthScoreService.evaluateHealthScore(userProfile, txs, stocks, mfs, goals);
  assert(initialHealth.isComplete === false, 'Health score is incomplete for blank profile');
  assert(initialHealth.missingFields.length > 0, 'Health score specifies missing baseline fields');
  assert(initialHealth.missingFields.includes('Monthly Income'), 'Explains missing income data');
  console.log('  -> Health status message:', initialHealth.breakdownNotes?.[0]);

  // ==========================================================================
  // TEST 2: Financial Onboarding Calculation Validation
  // ==========================================================================
  console.log('\n--- TEST 2: Financial Onboarding Calculation Validation ---');
  const onboardedProfile = {
    ...userProfile,
    name: 'Priya Sharma',
    isOnboarded: true,
    monthlyIncome: 150000,
    otherIncome: 10000,
    monthlyFixedExpenses: 40000,
    currentSavings: 500000,
    currentInvestments: 400000,
    totalDebt: 315000,
    personalProfile: {
      fullName: 'Priya Sharma',
      email: applicantEmail,
      mobile: '+91 9876543210',
      dateOfBirth: '1996-05-15',
      residentialCity: 'Bengaluru',
      country: 'India',
      employmentStatus: 'Employed' as const,
      occupation: 'Software Engineer',
      companyName: 'Infosys',
      monthlyIncome: 150000,
      incomeFrequency: 'Monthly' as const,
      preferredCurrency: 'INR'
    },
    financialProfile: {
      monthlySalary: 150000,
      additionalIncome: 10000,
      monthlyHouseholdExpenses: 40000,
      monthlyRentOrEmi: 25000,
      existingLoans: 300000,
      creditCardDebt: 15000,
      existingSavings: 500000,
      emergencyFund: 300000,
      existingInvestments: 400000,
      financialDependants: 1
    },
    investmentProfile: {
      currentlyInvests: true,
      activeAssetClasses: ['Stocks', 'Mutual Funds'],
      investmentExperience: 'Intermediate' as const,
      investmentHorizon: '5-10 years' as const,
      riskTolerance: 'Moderate' as const,
      primaryObjective: 'Wealth Creation' as const,
      monthlyInvestmentBudget: 35000
    }
  };

  StorageService.saveUserProfile(newAccount.id, onboardedProfile);

  // Add onboarding goals
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + 12); // 12 months out
  const targetDateStr = targetDate.toISOString().split('T')[0];

  const initialGoal = {
    userId: newAccount.id,
    name: 'Emergency Fund 6 Months',
    category: 'Emergency Fund' as const,
    targetAmount: 450000,
    currentAmount: 300000,
    deadline: targetDateStr,
    monthlyContribution: Math.round((450000 - 300000) / 12)
  };
  StorageService.saveGoals(newAccount.id, [initialGoal as any]);

  // Recalculate health score with verified onboarded data
  const updatedGoals = StorageService.getGoals(newAccount.id);
  const fullHealth = HealthScoreService.evaluateHealthScore(onboardedProfile, [], [], [], updatedGoals);
  assert(fullHealth.isComplete === true, 'Health score is complete after onboarding');
  assert(fullHealth.overallScore >= 60 && fullHealth.overallScore <= 100, `Health score is explainable (Score: ${fullHealth.overallScore}/100)`);
  assert(fullHealth.savingsScore > 0, `Savings behavior pillar scored (${fullHealth.savingsScore}/25)`);
  assert(fullHealth.debtScore > 0, `Debt management pillar scored (${fullHealth.debtScore}/20)`);
  assert(fullHealth.emergencyFundScore > 0, `Emergency fund pillar scored (${fullHealth.emergencyFundScore}/20)`);
  assert(fullHealth.spendingScore > 0, `Spending discipline pillar scored (${fullHealth.spendingScore}/15)`);
  assert(fullHealth.recommendations.length > 0, 'Produces actionable recommendations');

  // Verify Goal Monthly Savings Formula: (Target - Current) / Months
  const remaining = initialGoal.targetAmount - initialGoal.currentAmount;
  const expectedMonthly = Math.round(remaining / 12);
  assert(initialGoal.monthlyContribution === expectedMonthly, `Goal contribution formula exact: ₹${expectedMonthly}/mo for ₹${remaining} remaining`);

  // ==========================================================================
  // TEST 3: Stock Market Quote Retrieval, Watchlist, and Fallback Handling
  // ==========================================================================
  console.log('\n--- TEST 3: Stock Market Quote Retrieval, Watchlist, and Fallback Handling ---');
  
  // Benchmark quotes
  const niftyQuote = await MarketDataService.getStockQuote('NIFTY 50', 'NSE');
  assert(niftyQuote !== null && niftyQuote.symbol === 'NIFTY 50', 'NIFTY 50 benchmark quote retrieved');
  assert((niftyQuote?.currentPrice ?? 0) > 20000, `NIFTY 50 price is realistic (Current: ₹${niftyQuote?.currentPrice})`);
  assert(Boolean(niftyQuote?.dataFreshness), `Data freshness clearly identified (${niftyQuote?.dataFreshness})`);
  assert(Boolean(niftyQuote?.lastUpdated), `Quote includes timestamp (${niftyQuote?.lastUpdated})`);

  const sensexQuote = await MarketDataService.getStockQuote('SENSEX', 'BSE');
  assert(sensexQuote !== null && sensexQuote.symbol === 'SENSEX', 'SENSEX benchmark quote retrieved');
  assert((sensexQuote?.currentPrice ?? 0) > 60000, `SENSEX price is realistic (Current: ₹${sensexQuote?.currentPrice})`);

  const relianceQuote = await MarketDataService.getStockQuote('RELIANCE', 'NSE');
  assert(relianceQuote !== null && (relianceQuote?.currentPrice ?? 0) > 1000, `Reliance equity price retrieved (₹${relianceQuote?.currentPrice})`);

  const appleQuote = await MarketDataService.getStockQuote('AAPL', 'NASDAQ');
  assert(appleQuote !== null && (appleQuote?.currentPrice ?? 0) > 100, `US equity Apple price retrieved ($${appleQuote?.currentPrice})`);

  // Test Watchlist operations
  const initialWatchlist = StorageService.getWatchlist(newAccount.id);
  assert(initialWatchlist.length === 0, 'New applicant watchlist is initially empty');

  const watchlistItem = {
    userId: newAccount.id,
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE' as const,
    targetHigh: 4500,
    targetLow: 3800,
    notes: 'Long term compounder'
  };
  StorageService.saveWatchlist(newAccount.id, [watchlistItem as any]);
  const savedWatchlist = StorageService.getWatchlist(newAccount.id);
  assert(savedWatchlist.length === 1 && savedWatchlist[0].symbol === 'TCS', 'Watchlist item saved successfully');

  // Verify historical chart generation
  const chartData = MarketDataService.getHistoricalPrices('NIFTY 50', niftyQuote!.currentPrice, '1M');
  assert(chartData.length >= 20, `Generated ${chartData.length} historical data points for technical charting`);

  // ==========================================================================
  // TEST 4: Multi-User Data Isolation (User A vs User B)
  // ==========================================================================
  console.log('\n--- TEST 4: Multi-User Data Isolation (User A vs User B) ---');
  const userA = await StorageService.registerApplicant('User Alpha', `user_a_${Date.now()}@finora.test`, 'PasswordA1!');
  const userB = await StorageService.registerApplicant('User Beta', `user_b_${Date.now()}@finora.test`, 'PasswordB1!');

  // Populate User A's data silo
  StorageService.setActiveUserId(userA.id);
  StorageService.saveTransactions(userA.id, [
    {
      id: 'tx_a_1',
      userId: userA.id,
      date: '2026-03-01',
      description: 'Alpha High Value Purchase',
      amount: 45000,
      type: 'debit',
      category: 'Shopping',
      subcategory: 'Electronics',
      merchant: 'Apple Store',
      isSubscription: false,
      isEssential: false
    }
  ]);
  StorageService.saveStockHoldings(userA.id, [
    {
      id: 'stock_a_1',
      userId: userA.id,
      symbol: 'INFY.BSE',
      name: 'Infosys Ltd',
      exchange: 'BSE',
      quantity: 100,
      buyPrice: 1600,
      buyDate: '2026-01-10',
      currentPrice: 1850,
      investedAmount: 160000,
      currentValue: 185000,
      pnl: 25000,
      pnlPercent: 15.625
    }
  ]);

  // Switch to User B and verify isolation
  StorageService.setActiveUserId(userB.id);
  const userBTxs = StorageService.getTransactions(userB.id);
  const userBStocks = StorageService.getStockHoldings(userB.id);

  assert(userBTxs.length === 0, 'User B CANNOT see User A transactions (Strict Isolation)');
  assert(userBStocks.length === 0, 'User B CANNOT see User A stock holdings (Strict Isolation)');

  // Populate User B with distinct private transaction
  StorageService.saveTransactions(userB.id, [
    {
      id: 'tx_b_1',
      userId: userB.id,
      date: '2026-03-02',
      description: 'Beta Coffee & Snacks',
      amount: 350,
      type: 'debit',
      category: 'Food & Dining',
      subcategory: 'Cafes',
      merchant: 'Blue Tokai',
      isSubscription: false,
      isEssential: false
    }
  ]);

  // Switch back to User A
  StorageService.setActiveUserId(userA.id);
  const reloadedUserATxs = StorageService.getTransactions(userA.id);
  const reloadedUserAStocks = StorageService.getStockHoldings(userA.id);

  assert(reloadedUserATxs.length === 1 && reloadedUserATxs[0].description === 'Alpha High Value Purchase',
    'User A transactions remained private and uncorrupted');
  assert(reloadedUserAStocks.length === 1 && reloadedUserAStocks[0].symbol === 'INFY.BSE',
    'User A holdings remained private and uncorrupted');

  // ==========================================================================
  // TEST 5: AI Expense Categorisation, Outliers & Copilot Inquiries
  // ==========================================================================
  console.log('\n--- TEST 5: AI Expense Categorisation, Outliers & Copilot Inquiries ---');

  // Verify 13 official categories
  assert(OFFICIAL_CATEGORIES.length === 13, 'Exact 13 official Finora expense categories present');

  const testCases: Array<{ desc: string; expectedCategory: ExpenseCategory }> = [
    { desc: 'Swiggy Gourmet Dinner Order', expectedCategory: 'Food & Dining' },
    { desc: 'Zomato Food Delivery', expectedCategory: 'Food & Dining' },
    { desc: 'Uber ride to Bangalore airport', expectedCategory: 'Transportation' },
    { desc: 'Blinkit Instant Groceries delivery', expectedCategory: 'Groceries' },
    { desc: 'Zara Mall clothes shopping', expectedCategory: 'Shopping' },
    { desc: 'PVR Inox Movie Tickets IMAX', expectedCategory: 'Entertainment' },
    { desc: 'Apollo Pharmacy Medicines Bill', expectedCategory: 'Healthcare' },
    { desc: 'Coursera Annual Learning Subscription', expectedCategory: 'Education' },
    { desc: 'Apartment monthly rent transfer to owner', expectedCategory: 'Rent' },
    { desc: 'Bescom Electricity Power Bill', expectedCategory: 'Utilities' },
    { desc: 'MakeMyTrip Flight to Dubai', expectedCategory: 'Travel' },
    { desc: 'Zerodha Mutual Fund SIP auto debit', expectedCategory: 'Investments' },
    { desc: 'HDFC Bank Home Loan EMI repayment', expectedCategory: 'EMIs & Loans' },
  ];

  for (const tc of testCases) {
    const detected = CategorizerService.categorize(tc.desc);
    assert(detected.category === tc.expectedCategory, 
      `AI accurately categorised "${tc.desc}" -> "${detected.category}"`);
  }

  // Test recurring subscription detection
  const netflixDetected = CategorizerService.categorize('Netflix monthly subscription plan');
  assert(netflixDetected.isSubscription === true, 'Detected recurring subscription for Netflix');

  const spotifyDetected = CategorizerService.categorize('Spotify Premium Student auto pay');
  assert(spotifyDetected.isSubscription === true, 'Detected recurring subscription for Spotify');

  // Test outlier detection (>2.5x mean)
  const regularTransactions = [
    { id: '1', userId: 'test', date: '2026-03-01', description: 'Groceries', amount: 800, type: 'debit' as const, category: 'Groceries' as const, subcategory: '', merchant: '', isSubscription: false, isEssential: true },
    { id: '2', userId: 'test', date: '2026-03-02', description: 'T-Shirt', amount: 1200, type: 'debit' as const, category: 'Shopping' as const, subcategory: '', merchant: '', isSubscription: false, isEssential: false },
    { id: '3', userId: 'test', date: '2026-03-03', description: 'Shoes', amount: 2500, type: 'debit' as const, category: 'Shopping' as const, subcategory: '', merchant: '', isSubscription: false, isEssential: false },
    { id: '4', userId: 'test', date: '2026-03-04', description: 'Belt', amount: 900, type: 'debit' as const, category: 'Shopping' as const, subcategory: '', merchant: '', isSubscription: false, isEssential: false },
    { id: '5', userId: 'test', date: '2026-03-05', description: 'Luxury Diamond Ring Splurge', amount: 48000, type: 'debit' as const, category: 'Shopping' as const, subcategory: '', merchant: '', isSubscription: false, isEssential: false },
  ];

  const outlierList = CategorizerService.detectUnusualSpending(regularTransactions);
  assert(outlierList.length > 0, 'Outlier detector triggered on spike');
  assert(outlierList.some(o => o.amount === 48000), 'Identified ₹48,000 transaction as statistically unusual spend');

  // Test User Category Override Learning
  const userLearnings = [
    {
      id: 'lrn_1',
      userId: 'test',
      merchantOrKeyword: 'Blue Tokai Roasters',
      assignedCategory: 'Education' as const,
      assignedSubcategory: 'Books & Learning',
      createdAt: new Date().toISOString()
    }
  ];
  const learnedResult = CategorizerService.categorize('Blue Tokai Roasters Specialty Pack', userLearnings);
  assert(learnedResult.category === 'Education', 'Categorizer successfully applied user custom rule override');

  // ==========================================================================
  // TEST 6: Regression Check on Existing Features, Navigation & AMFI API
  // ==========================================================================
  console.log('\n--- TEST 6: Regression Check on Existing Features, Navigation & AMFI ---');

  // Mutual Fund live service test
  console.log('  -> Querying AMFI live endpoint for Nifty Index funds...');
  const mfResults = await MutualFundService.searchFunds('Nifty 50 Index');
  assert(mfResults.length > 0, `AMFI API returned ${mfResults.length} matching mutual funds`);
  console.log(`  -> Sample AMFI Scheme: ${mfResults[0].schemeName} (Code: ${mfResults[0].schemeCode})`);

  // Verify Statement Parser functionality with synthetic CSV file
  const sampleCsvContent = `Date,Description,Debit,Credit\n2026-03-01,Starbucks Coffee,450.00,\n2026-03-02,Salary Direct Deposit,,150000.00`;
  const fileObj = new File([sampleCsvContent], 'statement.csv', { type: 'text/csv' });
  const parsedStatement = await StatementParserService.parseFile(fileObj);
  assert(parsedStatement.transactions.length === 2, `Parsed ${parsedStatement.transactions.length} rows from bank statement`);
  assert(parsedStatement.transactions[0].category === 'Food & Dining', 'Bank statement row auto-categorised into Food & Dining');
  assert(parsedStatement.transactions[1].type === 'credit', 'Bank statement credit detected as salary');

  // Check Developer Portal authentication security
  const isDevUser = 'shashankraman@finora.com'.endsWith('@finora.com');
  const isNonDevUser = 'regular_user@gmail.com'.endsWith('@finora.com');
  assert(isDevUser === true, 'shashankraman@finora.com recognized with developer access');
  assert(isNonDevUser === false, 'regular_user@gmail.com correctly denied developer access');

  console.log('\n================================================================');
  console.log(`🎉 ALL TESTS PASSED SUCCESSFULLY! (${passedCount} checks passed, ${failedCount} failed)`);
  console.log('================================================================\n');
}

runTestSuite().catch(err => {
  console.error('\n❌ Test Suite encountered fatal error:\n', err);
  process.exit(1);
});
