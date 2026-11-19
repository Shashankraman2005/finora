import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  UserProfileData, 
  ExpenseTransaction, 
  InvestmentItem, 
  StockHolding,
  MutualFundHolding,
  GoalItem, 
  SubscriptionItem, 
  FinancialHealthScore,
  CategoryBudget,
  WatchlistItem,
  UploadedStatementRecord,
  UserCategoryLearning,
  UserAccount,
  FinoraMode,
  ExpenseCategory,
  UserPersonalProfile,
  UserFinancialProfile,
  UserInvestmentProfile
} from '../types/finora';
import { StorageService, DEMO_USER_ID, DEMO_USER_PROFILE } from '../services/storageService';
import { HealthScoreService } from '../services/healthScoreService';
import { CategorizerService } from '../services/categorizerService';
import { MOCK_50_APPLICANTS, type ApplicantRecord } from './mockApplicants';

export interface FinoraContextType {
  // Authentication & Multi-user isolation
  currentUser: UserAccount | null;
  activeUserId: string;
  allUsers: UserAccount[];
  switchUser: (userId: string) => void;
  registerUser: (name: string, email: string, password?: string) => Promise<UserAccount>;
  loginUser: (email: string, password?: string) => boolean;
  logoutUser: () => void;
  loadDemoAccount: () => void;

  // Active User Financial State
  profile: UserProfileData;
  setProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
  transactions: ExpenseTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<ExpenseTransaction[]>>;
  stockHoldings: StockHolding[];
  setStockHoldings: React.Dispatch<React.SetStateAction<StockHolding[]>>;
  mfHoldings: MutualFundHolding[];
  setMfHoldings: React.Dispatch<React.SetStateAction<MutualFundHolding[]>>;
  investments: InvestmentItem[];
  setInvestments: React.Dispatch<React.SetStateAction<InvestmentItem[]>>;
  goals: GoalItem[];
  setGoals: React.Dispatch<React.SetStateAction<GoalItem[]>>;
  budgets: CategoryBudget[];
  watchlist: WatchlistItem[];
  subscriptions: SubscriptionItem[];
  setSubscriptions: React.Dispatch<React.SetStateAction<SubscriptionItem[]>>;
  statements: UploadedStatementRecord[];
  categoryLearnings: UserCategoryLearning[];
  healthScore: FinancialHealthScore;

  // Developer Section & Applicants
  applicants: ApplicantRecord[];
  setApplicants: React.Dispatch<React.SetStateAction<ApplicantRecord[]>>;
  isDeveloper: boolean;
  developerEmail: string | null;
  loginDeveloper: (email: string) => boolean;
  logoutDeveloper: () => void;
  addApplicant: (applicant: Omit<ApplicantRecord, 'id' | 'submittedAt'>) => void;

  // Transaction Operations
  addTransaction: (tx: Omit<ExpenseTransaction, 'id' | 'userId'>) => void;
  updateTransaction: (id: string, updates: Partial<ExpenseTransaction>) => void;
  deleteTransaction: (id: string) => void;
  learnCategoryOverride: (keyword: string, category: ExpenseCategory, subcategory?: any) => void;

  // Investment Operations
  addStockHolding: (stock: Omit<StockHolding, 'id' | 'userId'>) => void;
  deleteStockHolding: (id: string) => void;
  addMutualFundHolding: (mf: Omit<MutualFundHolding, 'id' | 'userId'>) => void;
  deleteMutualFundHolding: (id: string) => void;
  addInvestment: (inv: Omit<InvestmentItem, 'id'>) => void;

  // Watchlist Operations
  addToWatchlist: (item: Omit<WatchlistItem, 'id' | 'userId'>) => void;
  removeFromWatchlist: (symbol: string) => void;

  // Budget Operations
  setCategoryBudget: (category: ExpenseCategory, limit: number, month?: string) => void;

  // Goal Operations
  addGoal: (goal: Omit<GoalItem, 'id' | 'userId'>) => void;
  updateGoal: (id: string, updates: Partial<GoalItem>) => void;
  deleteGoal: (id: string) => void;

  // Statement History
  recordStatementUpload: (record: Omit<UploadedStatementRecord, 'id' | 'userId'>) => void;

  // Mode and Onboarding
  switchMode: (mode: FinoraMode) => void;
  completeOnboarding: (data: {
    personalProfile?: UserPersonalProfile;
    financialProfile?: UserFinancialProfile;
    investmentProfile?: UserInvestmentProfile;
    goals?: Array<Omit<GoalItem, 'id' | 'userId'>>;
    mode?: FinoraMode;
  }) => void;
}

const FinoraContext = createContext<FinoraContextType | undefined>(undefined);

export const FinoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multi-user state
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => StorageService.getUsers());
  const [activeUserId, setActiveUserId] = useState<string>(() => StorageService.getActiveUserId());
  
  // Active User data states
  const [profile, setProfile] = useState<UserProfileData>(() => StorageService.getUserProfile(activeUserId));
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>(() => StorageService.getTransactions(activeUserId));
  const [stockHoldings, setStockHoldings] = useState<StockHolding[]>(() => StorageService.getStockHoldings(activeUserId));
  const [mfHoldings, setMfHoldings] = useState<MutualFundHolding[]>(() => StorageService.getMutualFundHoldings(activeUserId));
  const [goals, setGoals] = useState<GoalItem[]>(() => StorageService.getGoals(activeUserId));
  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => StorageService.getBudgets(activeUserId));
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => StorageService.getWatchlist(activeUserId));
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(() => StorageService.getSubscriptions(activeUserId));
  const [statements, setStatements] = useState<UploadedStatementRecord[]>(() => StorageService.getStatements(activeUserId));
  const [categoryLearnings, setCategoryLearnings] = useState<UserCategoryLearning[]>(() => StorageService.getCategoryLearnings(activeUserId));

  // Legacy investments adapter for backward compatibility
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);

  // Developer Auth state & applicants
  const [applicants, setApplicants] = useState<ApplicantRecord[]>(MOCK_50_APPLICANTS);
  const [isDeveloper, setIsDeveloper] = useState<boolean>(() => {
    const user = allUsers.find(u => u.id === activeUserId);
    return user?.role === 'developer' || false;
  });
  const [developerEmail, setDeveloperEmail] = useState<string | null>(() => {
    const user = allUsers.find(u => u.id === activeUserId && u.role === 'developer');
    return user ? user.email : null;
  });

  const currentUser = allUsers.find(u => u.id === activeUserId) || null;

  // Re-load isolated data whenever activeUserId changes
  useEffect(() => {
    setProfile(StorageService.getUserProfile(activeUserId));
    setTransactions(StorageService.getTransactions(activeUserId));
    setStockHoldings(StorageService.getStockHoldings(activeUserId));
    setMfHoldings(StorageService.getMutualFundHoldings(activeUserId));
    setGoals(StorageService.getGoals(activeUserId));
    setBudgets(StorageService.getBudgets(activeUserId));
    setWatchlist(StorageService.getWatchlist(activeUserId));
    setSubscriptions(StorageService.getSubscriptions(activeUserId));
    setStatements(StorageService.getStatements(activeUserId));
    setCategoryLearnings(StorageService.getCategoryLearnings(activeUserId));
  }, [activeUserId]);

  // Keep investments array synchronized with stockHoldings and mfHoldings
  useEffect(() => {
    const mappedStocks: InvestmentItem[] = stockHoldings.map(s => ({
      id: s.id,
      name: s.name,
      symbol: s.symbol,
      type: 'Stocks',
      quantity: s.quantity,
      avgCostBasis: s.avgPurchasePrice,
      currentPrice: s.currentPrice,
      investedAmount: s.investedAmount,
      currentValue: s.currentValue,
      returnsPct: s.returnsPct,
      allocationPct: s.allocationPct,
      provider: (s.provider as any) || 'Zerodha',
      riskLevel: 'High',
      sector: s.exchange
    }));

    const mappedMfs: InvestmentItem[] = mfHoldings.map(m => ({
      id: m.id,
      name: m.schemeName,
      symbol: m.schemeCode,
      type: 'Mutual Funds',
      quantity: m.units,
      avgCostBasis: m.purchaseNav,
      currentPrice: m.currentNav,
      investedAmount: m.investedAmount,
      currentValue: m.currentValue,
      returnsPct: m.returnsPct,
      allocationPct: m.allocationPct,
      provider: 'Groww',
      riskLevel: 'Medium',
      sector: m.schemeCategory
    }));

    setInvestments([...mappedStocks, ...mappedMfs]);
  }, [stockHoldings, mfHoldings]);

  // Evaluate Financial Health Score strictly from actual user data
  const healthScore = HealthScoreService.evaluateHealthScore(
    profile,
    transactions,
    stockHoldings,
    mfHoldings,
    goals
  );

  // Sync to persistence
  useEffect(() => {
    if (activeUserId) StorageService.saveUserProfile(activeUserId, profile);
  }, [activeUserId, profile]);

  useEffect(() => {
    if (activeUserId) StorageService.saveTransactions(activeUserId, transactions);
  }, [activeUserId, transactions]);

  useEffect(() => {
    if (activeUserId) StorageService.saveStockHoldings(activeUserId, stockHoldings);
  }, [activeUserId, stockHoldings]);

  useEffect(() => {
    if (activeUserId) StorageService.saveMutualFundHoldings(activeUserId, mfHoldings);
  }, [activeUserId, mfHoldings]);

  useEffect(() => {
    if (activeUserId) StorageService.saveGoals(activeUserId, goals);
  }, [activeUserId, goals]);

  useEffect(() => {
    if (activeUserId) StorageService.saveBudgets(activeUserId, budgets);
  }, [activeUserId, budgets]);

  useEffect(() => {
    if (activeUserId) StorageService.saveWatchlist(activeUserId, watchlist);
  }, [activeUserId, watchlist]);

  useEffect(() => {
    if (activeUserId) StorageService.saveSubscriptions(activeUserId, subscriptions);
  }, [activeUserId, subscriptions]);

  useEffect(() => {
    if (activeUserId) StorageService.saveStatements(activeUserId, statements);
  }, [activeUserId, statements]);

  useEffect(() => {
    if (activeUserId) StorageService.saveCategoryLearnings(activeUserId, categoryLearnings);
  }, [activeUserId, categoryLearnings]);

  // Auth Operations
  const switchUser = (userId: string) => {
    StorageService.setActiveUserId(userId);
    setActiveUserId(userId);
    const user = allUsers.find(u => u.id === userId);
    if (user?.role === 'developer') {
      setIsDeveloper(true);
      setDeveloperEmail(user.email);
    } else {
      setIsDeveloper(false);
      setDeveloperEmail(null);
    }
  };

  const registerUser = async (name: string, email: string, password?: string): Promise<UserAccount> => {
    const newAcc = await StorageService.registerApplicant(name, email, password);
    setAllUsers(StorageService.getUsers());
    setActiveUserId(newAcc.id);
    return newAcc;
  };

  const loginUser = (email: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const users = StorageService.getUsers();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      switchUser(found.id);
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    switchUser(DEMO_USER_ID);
  };

  const loadDemoAccount = () => {
    switchUser(DEMO_USER_ID);
  };

  const loginDeveloper = (email: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.endsWith('@finora.com')) {
      setIsDeveloper(true);
      setDeveloperEmail(cleanEmail);
      return true;
    }
    return false;
  };

  const logoutDeveloper = () => {
    setIsDeveloper(false);
    setDeveloperEmail(null);
  };

  const addApplicant = (app: Omit<ApplicantRecord, 'id' | 'submittedAt'>) => {
    const newRecord: ApplicantRecord = {
      ...app,
      id: `app_${Date.now()}`,
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setApplicants(prev => [newRecord, ...prev]);
  };

  // Transaction Operations
  const addTransaction = (tx: Omit<ExpenseTransaction, 'id' | 'userId'>) => {
    // Run categorizer with active user learnings
    const catResult = CategorizerService.categorize(tx.description, categoryLearnings);
    const newTx: ExpenseTransaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: activeUserId,
      category: tx.category || catResult.category,
      subcategory: tx.subcategory || catResult.subcategory,
      merchant: tx.merchant || catResult.merchant,
      isEssential: tx.isEssential !== undefined ? tx.isEssential : catResult.isEssential,
      isSubscription: tx.isSubscription !== undefined ? tx.isSubscription : catResult.isSubscription,
      frequency: tx.frequency || catResult.frequency
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<ExpenseTransaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const learnCategoryOverride = (keyword: string, category: ExpenseCategory, subcategory?: any) => {
    const kw = keyword.toLowerCase().trim();
    const newLearning: UserCategoryLearning = {
      merchantOrKeyword: kw,
      assignedCategory: category,
      assignedSubcategory: subcategory,
      updatedAt: new Date().toISOString()
    };
    setCategoryLearnings(prev => [newLearning, ...prev.filter(l => l.merchantOrKeyword !== kw)]);
  };

  // Stocks Operations
  const addStockHolding = (stock: Omit<StockHolding, 'id' | 'userId'>) => {
    const investedAmount = stock.quantity * stock.avgPurchasePrice;
    const currentValue = stock.quantity * stock.currentPrice;
    const unrealizedPnL = currentValue - investedAmount;
    const returnsPct = investedAmount > 0 ? (unrealizedPnL / investedAmount) * 100 : 0;

    const newStock: StockHolding = {
      ...stock,
      id: `stock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: activeUserId,
      investedAmount,
      currentValue,
      unrealizedPnL,
      returnsPct: Number(returnsPct.toFixed(2)),
      allocationPct: 0
    };

    setStockHoldings(prev => {
      const updated = [...prev, newStock];
      const totalVal = updated.reduce((acc, s) => acc + s.currentValue, 0);
      return updated.map(s => ({
        ...s,
        allocationPct: totalVal > 0 ? Math.round((s.currentValue / totalVal) * 100) : 0
      }));
    });
  };

  const deleteStockHolding = (id: string) => {
    setStockHoldings(prev => prev.filter(s => s.id !== id));
  };

  // Mutual Fund Operations
  const addMutualFundHolding = (mf: Omit<MutualFundHolding, 'id' | 'userId'>) => {
    const investedAmount = mf.units * mf.purchaseNav;
    const currentValue = mf.units * mf.currentNav;
    const unrealizedPnL = currentValue - investedAmount;
    const returnsPct = investedAmount > 0 ? (unrealizedPnL / investedAmount) * 100 : 0;

    const newMf: MutualFundHolding = {
      ...mf,
      id: `mf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: activeUserId,
      investedAmount,
      currentValue,
      unrealizedPnL,
      returnsPct: Number(returnsPct.toFixed(2)),
      allocationPct: 0
    };

    setMfHoldings(prev => {
      const updated = [...prev, newMf];
      const totalVal = updated.reduce((acc, m) => acc + m.currentValue, 0);
      return updated.map(m => ({
        ...m,
        allocationPct: totalVal > 0 ? Math.round((m.currentValue / totalVal) * 100) : 0
      }));
    });
  };

  const deleteMutualFundHolding = (id: string) => {
    setMfHoldings(prev => prev.filter(m => m.id !== id));
  };

  const addInvestment = (inv: Omit<InvestmentItem, 'id'>) => {
    if (inv.type === 'Stocks') {
      addStockHolding({
        name: inv.name,
        symbol: inv.symbol || 'STOCK',
        exchange: 'NSE',
        quantity: inv.quantity,
        avgPurchasePrice: inv.avgCostBasis,
        purchaseDate: new Date().toISOString().split('T')[0],
        currentPrice: inv.currentPrice,
        investedAmount: inv.investedAmount,
        currentValue: inv.currentValue,
        returnsPct: inv.returnsPct,
        unrealizedPnL: inv.currentValue - inv.investedAmount,
        allocationPct: inv.allocationPct,
        provider: inv.provider
      });
    } else {
      addMutualFundHolding({
        schemeCode: inv.symbol || '120716',
        schemeName: inv.name,
        units: inv.quantity,
        purchaseNav: inv.avgCostBasis,
        currentNav: inv.currentPrice,
        navDate: new Date().toISOString().split('T')[0],
        investedAmount: inv.investedAmount,
        currentValue: inv.currentValue,
        returnsPct: inv.returnsPct,
        unrealizedPnL: inv.currentValue - inv.investedAmount,
        sipActive: false,
        allocationPct: inv.allocationPct
      });
    }
  };

  // Watchlist Operations
  const addToWatchlist = (item: Omit<WatchlistItem, 'id' | 'userId'>) => {
    const newItem: WatchlistItem = {
      ...item,
      id: `wl_${Date.now()}`,
      userId: activeUserId
    };
    setWatchlist(prev => {
      if (prev.some(w => w.symbol.toUpperCase() === item.symbol.toUpperCase())) return prev;
      return [newItem, ...prev];
    });
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(w => w.symbol.toUpperCase() !== symbol.toUpperCase()));
  };

  // Budget Operations
  const setCategoryBudget = (category: ExpenseCategory, limit: number, month?: string) => {
    const m = month || new Date().toISOString().slice(0, 7);
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.category === category && b.month === m);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], monthlyLimit: limit };
        return copy;
      }
      return [
        ...prev,
        {
          id: `bgt_${Date.now()}_${category}`,
          userId: activeUserId,
          category,
          monthlyLimit: limit,
          month: m
        }
      ];
    });
  };

  // Goal Operations
  const addGoal = (goal: Omit<GoalItem, 'id' | 'userId'>) => {
    const newGoal: GoalItem = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: activeUserId
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<GoalItem>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Statement History
  const recordStatementUpload = (record: Omit<UploadedStatementRecord, 'id' | 'userId'>) => {
    const newRec: UploadedStatementRecord = {
      ...record,
      id: `stmt_${Date.now()}`,
      userId: activeUserId
    };
    setStatements(prev => [newRec, ...prev]);
  };

  // Mode and Onboarding
  const switchMode = (mode: FinoraMode) => {
    setProfile(prev => ({ ...prev, mode }));
  };

  const completeOnboarding = (data: {
    personalProfile?: UserPersonalProfile;
    financialProfile?: UserFinancialProfile;
    investmentProfile?: UserInvestmentProfile;
    goals?: Array<Omit<GoalItem, 'id' | 'userId'>>;
    mode?: FinoraMode;
  }) => {
    const p = data.personalProfile;
    const f = data.financialProfile;
    const inv = data.investmentProfile;

    const monthlyIncome = f?.primaryIncome || p?.monthlyIncome || 0;
    const otherIncome = f?.additionalIncome || 0;
    const monthlyFixedExpenses = (f?.monthlyHouseholdExpenses || 0) + (f?.monthlyRentOrEmi || 0);
    const currentSavings = f?.existingSavings || 0;
    const currentInvestments = inv?.monthlyInvestmentBudget ? inv.monthlyInvestmentBudget * 12 : 0;
    const totalDebt = (f?.existingLoans || 0) + (f?.creditCardOutstanding || 0);

    setProfile(prev => ({
      ...prev,
      name: p?.fullName || prev.name,
      email: p?.email || prev.email,
      monthlyIncome,
      otherIncome,
      monthlyFixedExpenses,
      currentSavings,
      currentInvestments,
      totalDebt,
      riskPreference: inv?.riskTolerance || prev.riskPreference,
      mode: data.mode || prev.mode,
      isOnboarded: true,
      personalProfile: p,
      financialProfile: f,
      investmentProfile: inv
    }));

    if (data.goals && data.goals.length > 0) {
      data.goals.forEach(g => addGoal(g));
    }
  };

  return (
    <FinoraContext.Provider
      value={{
        currentUser,
        activeUserId,
        allUsers,
        switchUser,
        registerUser,
        loginUser,
        logoutUser,
        loadDemoAccount,

        profile,
        setProfile,
        transactions,
        setTransactions,
        stockHoldings,
        setStockHoldings,
        mfHoldings,
        setMfHoldings,
        investments,
        setInvestments,
        goals,
        setGoals,
        budgets,
        watchlist,
        subscriptions,
        setSubscriptions,
        statements,
        categoryLearnings,
        healthScore,

        applicants,
        setApplicants,
        isDeveloper,
        developerEmail,
        loginDeveloper,
        logoutDeveloper,
        addApplicant,

        addTransaction,
        updateTransaction,
        deleteTransaction,
        learnCategoryOverride,

        addStockHolding,
        deleteStockHolding,
        addMutualFundHolding,
        deleteMutualFundHolding,
        addInvestment,

        addToWatchlist,
        removeFromWatchlist,

        setCategoryBudget,

        addGoal,
        updateGoal,
        deleteGoal,

        recordStatementUpload,

        switchMode,
        completeOnboarding,
      }}
    >
      {children}
    </FinoraContext.Provider>
  );
};

export function useFinora() {
  const context = useContext(FinoraContext);
  if (!context) {
    throw new Error('useFinora must be used within a FinoraProvider');
  }
  return context;
}
