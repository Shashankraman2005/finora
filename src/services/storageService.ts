import type { 
  UserProfileData, 
  ExpenseTransaction, 
  StockHolding, 
  MutualFundHolding, 
  GoalItem, 
  CategoryBudget, 
  WatchlistItem, 
  SubscriptionItem, 
  UploadedStatementRecord,
  UserCategoryLearning,
  UserAccount
} from '../types/finora';

// Default Demo User (Arjun Patel) provided only when explicitly clicking "Explore Demo Account"
export const DEMO_USER_ID = 'usr_arjun_demo';

export const DEMO_USER_PROFILE: UserProfileData = {
  id: DEMO_USER_ID,
  name: 'Arjun Patel',
  email: 'arjun@finora.ai',
  age: 32,
  employmentType: 'Salaried',
  monthlyIncome: 85000,
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

export class StorageService {
  private static prefix = 'finora_db_v3_';

  /**
   * Cryptographic SHA-256 hash for password security
   */
  public static async hashPassword(password: string): Promise<string> {
    const subtle = typeof globalThis !== 'undefined' ? globalThis.crypto?.subtle : undefined;
    if (subtle) {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback simple hash
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash) + password.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  }

  // User Accounts
  public static getUsers(): UserAccount[] {
    try {
      const raw = localStorage.getItem(`${this.prefix}users`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read users from storage', e);
    }
    return [
      {
        id: DEMO_USER_ID,
        name: 'Arjun Patel',
        email: 'arjun@finora.ai',
        role: 'applicant',
        createdAt: '2026-10-01'
      },
      {
        id: 'usr_dev_shashank',
        name: 'Shashank Raman (Developer)',
        email: 'shashankraman@finora.com',
        role: 'developer',
        createdAt: '2026-09-15'
      }
    ];
  }

  public static saveUsers(users: UserAccount[]) {
    try {
      localStorage.setItem(`${this.prefix}users`, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }

  public static getActiveUserId(): string {
    return localStorage.getItem(`${this.prefix}active_user_id`) || DEMO_USER_ID;
  }

  public static setActiveUserId(userId: string) {
    localStorage.setItem(`${this.prefix}active_user_id`, userId);
  }

  /**
   * Registers a completely new applicant.
   * GUARANTEED BLANK: No demo transactions, no sample investments, no fake income, no dummy goals.
   */
  public static async registerApplicant(name: string, email: string, password?: string): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`An account with email ${cleanEmail} already exists. Please log in.`);
    }

    const userId = `usr_app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = password ? await this.hashPassword(password) : undefined;
    const role = cleanEmail.endsWith('@finora.com') ? 'developer' : 'applicant';

    const newAccount: UserAccount = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newAccount);
    this.saveUsers(users);
    this.setActiveUserId(userId);

    // Initialize COMPLETELY BLANK profile and isolated state
    const blankProfile: UserProfileData = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      age: 0,
      employmentType: 'Salaried',
      monthlyIncome: 0,
      otherIncome: 0,
      monthlyFixedExpenses: 0,
      currentSavings: 0,
      currentInvestments: 0,
      totalDebt: 0,
      riskPreference: 'Moderate',
      financialPriorities: [],
      mode: 'manual',
      isOnboarded: false
    };

    this.saveUserProfile(userId, blankProfile);
    this.saveTransactions(userId, []);
    this.saveStockHoldings(userId, []);
    this.saveMutualFundHoldings(userId, []);
    this.saveGoals(userId, []);
    this.saveBudgets(userId, []);
    this.saveWatchlist(userId, []);
    this.saveSubscriptions(userId, []);
    this.saveStatements(userId, []);
    this.saveCategoryLearnings(userId, []);

    return newAccount;
  }

  // Profile
  public static getUserProfile(userId: string): UserProfileData {
    try {
      const raw = localStorage.getItem(`${this.prefix}user_${userId}_profile`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read profile', e);
    }
    if (userId === DEMO_USER_ID) return DEMO_USER_PROFILE;

    return {
      id: userId,
      name: 'Applicant User',
      email: '',
      age: 0,
      employmentType: 'Salaried',
      monthlyIncome: 0,
      otherIncome: 0,
      monthlyFixedExpenses: 0,
      currentSavings: 0,
      currentInvestments: 0,
      totalDebt: 0,
      riskPreference: 'Moderate',
      financialPriorities: [],
      mode: 'manual',
      isOnboarded: false
    };
  }

  public static saveUserProfile(userId: string, profile: UserProfileData) {
    try {
      localStorage.setItem(`${this.prefix}user_${userId}_profile`, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  }

  // Transactions
  public static getTransactions(userId: string): ExpenseTransaction[] {
    try {
      const raw = localStorage.getItem(`${this.prefix}user_${userId}_transactions`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read transactions', e);
    }
    return [];
  }

  public static saveTransactions(userId: string, transactions: ExpenseTransaction[]) {
    try {
      localStorage.setItem(`${this.prefix}user_${userId}_transactions`, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }

  // Stock Holdings
  public static getStockHoldings(userId: string): StockHolding[] {
    try {
      const raw = localStorage.getItem(`${this.prefix}user_${userId}_stocks`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read stocks', e);
    }
    return [];
  }

  public static saveStockHoldings(userId: string, stocks: StockHolding[]) {
    try {
      localStorage.setItem(`${this.prefix}user_${userId}_stocks`, JSON.stringify(stocks));
    } catch (e) {
      console.error('Failed to save stocks', e);
    }
  }

  // Mutual Fund Holdings
  public static getMutualFundHoldings(userId: string): MutualFundHolding[] {
    try {
      const raw = localStorage.getItem(`${this.prefix}user_${userId}_mf`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read MF holdings', e);
    }
    return [];
  }

  public static saveMutualFundHoldings(userId: string, funds: MutualFundHolding[]) {
    try {
      localStorage.setItem(`${this.prefix}user_${userId}_mf`, JSON.stringify(funds));
    } catch (e) {
      console.error('Failed to save MF holdings', e);
    }
  }

  // Goals
  public static getGoals(userId: string): GoalItem[] {
    try {
      const raw = localStorage.getItem(`${this.prefix}user_${userId}_goals`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read goals', e);
    }
    return [];
  }

  public static saveGoals(userId: string, goals: GoalItem[]) {
    try {
      localStorage.setItem(`${this.prefix}user_${userId}_goals`, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals', e);
    }
  }

  // Budgets
  public static getBudgets(userId: string): CategoryBudget[] {
    try {
      const raw = localStorage.getItem(`${this.prefix}user_${userId}_budgets`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read budgets', e);
    }
    return [];
  }

  public static saveBudgets(userId: string, budgets: CategoryBudget[]) {
    try {
      localStorage.setItem(`${this.prefix}user_${userId}_budgets`, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  }

  // Watchlist
  public static getWatchlist(userId: string): WatchlistItem[] {
    try {
      const raw = localStorage.getItem(`${this.prefix}user_${userId}_watchlist`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read watchlist', e);
    }
    return [];
  }

  public static saveWatchlist(userId: string, watchlist: WatchlistItem[]) {
    try {
      localStorage.setItem(`${this.prefix}user_${userId}_watchlist`, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist', e);
    }
  }

  // Subscriptions
  public static getSubscriptions(userId: string): SubscriptionItem[] {
    try {
      const raw = localStorage.getItem(`${this.prefix}user_${userId}_subscriptions`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read subscriptions', e);
    }
    return [];
  }

  public static saveSubscriptions(userId: string, subscriptions: SubscriptionItem[]) {
    try {
      localStorage.setItem(`${this.prefix}user_${userId}_subscriptions`, JSON.stringify(subscriptions));
    } catch (e) {
      console.error('Failed to save subscriptions', e);
    }
  }

  // Statements
  public static getStatements(userId: string): UploadedStatementRecord[] {
    try {
      const raw = localStorage.getItem(`${this.prefix}user_${userId}_statements`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read statements', e);
    }
    return [];
  }

  public static saveStatements(userId: string, statements: UploadedStatementRecord[]) {
    try {
      localStorage.setItem(`${this.prefix}user_${userId}_statements`, JSON.stringify(statements));
    } catch (e) {
      console.error('Failed to save statements', e);
    }
  }

  // User Category Learnings
  public static getCategoryLearnings(userId: string): UserCategoryLearning[] {
    try {
      const raw = localStorage.getItem(`${this.prefix}user_${userId}_learnings`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read learnings', e);
    }
    return [];
  }

  public static saveCategoryLearnings(userId: string, learnings: UserCategoryLearning[]) {
    try {
      localStorage.setItem(`${this.prefix}user_${userId}_learnings`, JSON.stringify(learnings));
    } catch (e) {
      console.error('Failed to save learnings', e);
    }
  }
}
