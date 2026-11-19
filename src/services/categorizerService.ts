import type { ExpenseCategory, ExpenseSubcategory, ExpenseTransaction, UserCategoryLearning } from '../types/finora';

interface CategorizationResult {
  category: ExpenseCategory;
  subcategory: ExpenseSubcategory;
  merchant: string;
  isSubscription?: boolean;
  frequency?: 'Monthly' | 'Annual';
  isEssential?: boolean;
  confidence: number;
}

export class CategorizerService {
  /**
   * Built-in rule dictionary for auto-categorizing Indian & International merchants
   */
  private static rules: Array<{
    keywords: string[];
    category: ExpenseCategory;
    subcategory: ExpenseSubcategory;
    merchant: string;
    isEssential?: boolean;
    isSubscription?: boolean;
    frequency?: 'Monthly' | 'Annual';
  }> = [
    // 1. Food and dining
    { keywords: ['starbucks', 'third wave', 'blue tokai', 'costa coffee', 'cafe coffee day', 'ccd', 'barista', 'chaayos', 'chai point'], category: 'Food & Dining', subcategory: 'Cafes', merchant: 'Coffee Shop', isEssential: false },
    { keywords: ['swiggy', 'zomato', 'eatsure', 'magicpin'], category: 'Food & Dining', subcategory: 'Food Delivery', merchant: 'Food Delivery', isEssential: false },
    { keywords: ['mcdonalds', 'kfc', 'burger king', 'dominos', 'pizza hut', 'subway', 'wendys', 'taco bell'], category: 'Food & Dining', subcategory: 'Fast Food', merchant: 'QSR Restaurant', isEssential: false },
    { keywords: ['restaurant', 'bistro', 'diner', 'dhaba', 'barbeque nation', 'mainland china', 'haldiram', 'saravana bhavan'], category: 'Food & Dining', subcategory: 'Restaurants', merchant: 'Dining Restaurant', isEssential: false },

    // 2. Groceries
    { keywords: ['blinkit', 'zepto', 'bigbasket', 'instamart', 'dmart', 'reliance fresh', 'spencer', 'nature basket', 'supermarket', 'kirana', 'grocer', 'vegetable', 'fruit'], category: 'Groceries', subcategory: 'Supermarket', merchant: 'Grocery Store', isEssential: true },

    // 3. Shopping
    { keywords: ['amazon', 'flipkart', 'myntra', 'nykaa', 'ajio', 'tata cliq', 'meesho'], category: 'Shopping', subcategory: 'Online Shopping', merchant: 'Online Retailer', isEssential: false },
    { keywords: ['zara', 'h&m', 'uniqlo', 'marks & spencer', 'westside', 'pantaloons', 'lifestyle', 'clothing', 'apparel'], category: 'Shopping', subcategory: 'Clothing', merchant: 'Fashion Retailer', isEssential: false },
    { keywords: ['croma', 'reliance digital', 'apple store', 'samsung store', 'vijay sales', 'electronics'], category: 'Shopping', subcategory: 'Electronics', merchant: 'Electronics Store', isEssential: false },

    // 4. Transportation
    { keywords: ['uber', 'ola', 'rapido', 'blusmart', 'auto rickshaw', 'autorickshaw', 'auto ride', 'taxi', 'cab'], category: 'Transportation', subcategory: 'Uber', merchant: 'Ride Hailing', isEssential: true },
    { keywords: ['indian oil', 'iocl', 'bharat petroleum', 'bpcl', 'hindustan petroleum', 'hpcl', 'shell', 'petrol', 'diesel', 'fuel', 'cng'], category: 'Transportation', subcategory: 'Fuel', merchant: 'Fuel Station', isEssential: true },
    { keywords: ['metro', 'dmrc', 'bmrc', 'irctc local', 'bus pass', 'toll', 'fastag'], category: 'Transportation', subcategory: 'Public Transport', merchant: 'Transit / Toll', isEssential: true },

    // 5. Entertainment
    { keywords: ['pvr', 'inox', 'cinepolis', 'bookmyshow', 'cinema', 'theatre', 'movie'], category: 'Entertainment', subcategory: 'Movies', merchant: 'Cinema', isEssential: false },
    { keywords: ['netflix', 'spotify', 'hotstar', 'disney+', 'prime video', 'youtube premium', 'apple music', 'sony liv', 'zee5'], category: 'Entertainment', subcategory: 'Streaming', merchant: 'Streaming Media', isEssential: false, isSubscription: true, frequency: 'Monthly' },
    { keywords: ['playstation', 'steam', 'xbox', 'nintendo', 'game'], category: 'Entertainment', subcategory: 'Gaming', merchant: 'Gaming Service', isEssential: false },

    // 6. Healthcare
    { keywords: ['apollo', 'pharmeasy', '1mg', 'medplus', 'netmeds', 'pharmacy', 'chemist', 'drug'], category: 'Healthcare', subcategory: 'Medicine', merchant: 'Pharmacy', isEssential: true },
    { keywords: ['practo', 'clinic', 'hospital', 'doctor', 'dental', 'max health', 'fortis', 'manipal'], category: 'Healthcare', subcategory: 'Doctor Consultation', merchant: 'Healthcare Provider', isEssential: true },
    { keywords: ['cult.fit', 'gym', 'fitness', 'gold gym', 'anytime fitness', 'crossfit'], category: 'Healthcare', subcategory: 'Fitness & Gym', merchant: 'Fitness Center', isEssential: true, isSubscription: true, frequency: 'Monthly' },

    // 7. Education
    { keywords: ['coursera', 'udemy', 'edx', 'linkedin learning', 'skillshare', 'pluralsight'], category: 'Education', subcategory: 'Courses & Certifications', merchant: 'Online Learning', isEssential: false },
    { keywords: ['school', 'college', 'university', 'tuition', 'coaching', 'allen', 'aakash', 'byjus'], category: 'Education', subcategory: 'School & College Tuition', merchant: 'Educational Institution', isEssential: true },
    { keywords: ['kindle', 'books', 'crossword', 'bookstore', 'oxford'], category: 'Education', subcategory: 'Books & Materials', merchant: 'Bookstore', isEssential: false },

    // 8. Rent
    { keywords: ['rent', 'monthly rent', 'rental', 'house rent', 'apartment rent', 'pg rent', 'landlord', 'nobroker rent', 'society maintenance', 'rwa'], category: 'Rent', subcategory: 'Apartment Rent', merchant: 'Landlord / Society', isEssential: true },

    // 9. Utilities
    { keywords: ['airtel', 'jio', 'vi', 'vodafone', 'broadband', 'act fibernet', 'hathway', 'tata play', 'dth'], category: 'Utilities', subcategory: 'Internet & Broadband', merchant: 'Telecom / ISP', isEssential: true, isSubscription: true, frequency: 'Monthly' },
    { keywords: ['bescom', 'tata power', 'adani electricity', 'bses', 'electricity bill', 'power bill'], category: 'Utilities', subcategory: 'Electricity', merchant: 'Electricity Board', isEssential: true },
    { keywords: ['water supply', 'water bill', 'bwssb', 'piped gas', 'indane', 'hp gas', 'bharat gas', 'cylinder'], category: 'Utilities', subcategory: 'Gas Cylinder', merchant: 'Utility Provider', isEssential: true },

    // 10. Travel
    { keywords: ['makemytrip', 'mmt', 'cleartrip', 'goibibo', 'easemytrip', 'booking.com', 'agoda', 'airbnb', 'hotel', 'flight', 'indigo', 'air india', 'vistara', 'spicejet', 'irctc'], category: 'Travel', subcategory: 'Flights', merchant: 'Travel Booking', isEssential: false },

    // 11. Investments
    { keywords: ['zerodha', 'groww', 'upstox', 'angel one', 'kuvera', 'coin', 'kite', 'icicidirect', 'h carnage', 'motilal oswal', 'sharekhan', 'sip debit', 'mutual fund', 'amc', 'ppfas', 'uti mf', 'hdfc mf', 'sbi mf', 'axis mf'], category: 'Investments', subcategory: 'Direct Stocks', merchant: 'Investment Platform', isEssential: true },

    // 12. EMIs and loans
    { keywords: ['emi', 'loan', 'hdfc bank emi', 'sbi loan', 'icici emi', 'bajaj finance', 'home loan', 'car loan', 'personal loan', 'cred payment', 'credit card payment', 'axis bank card'], category: 'EMIs & Loans', subcategory: 'Personal Loan EMI', merchant: 'Bank / Lender', isEssential: true }
  ];

  /**
   * Categorizes a transaction description using learned user rules first, then built-in rules
   */
  public static categorize(
    description: string,
    userLearnings: UserCategoryLearning[] = []
  ): CategorizationResult {
    const raw = description.toLowerCase().trim();

    // 1. Check user-learned category corrections first (AI learning from feedback)
    for (const learning of userLearnings) {
      if (raw.includes(learning.merchantOrKeyword.toLowerCase().trim())) {
        return {
          category: learning.assignedCategory,
          subcategory: learning.assignedSubcategory || 'General Expenses',
          merchant: learning.merchantOrKeyword,
          confidence: 0.99
        };
      }
    }

    // 2. Built-in pattern matching
    for (const rule of this.rules) {
      for (const kw of rule.keywords) {
        if (raw.includes(kw)) {
          // Extract reasonable clean merchant name
          const matchedMerchant = rule.merchant || description.split(/[-–—,;/]/)[0].trim();
          return {
            category: rule.category,
            subcategory: rule.subcategory,
            merchant: matchedMerchant,
            isEssential: rule.isEssential,
            isSubscription: rule.isSubscription,
            frequency: rule.frequency,
            confidence: 0.92
          };
        }
      }
    }

    // 3. Fallback
    return {
      category: 'Other Expenses',
      subcategory: 'General Expenses',
      merchant: description.slice(0, 30).trim() || 'Uncategorized Merchant',
      isEssential: false,
      confidence: 0.40
    };
  }

  /**
   * Detect recurring payments and subscriptions
   */
  public static detectRecurringSubscriptions(transactions: ExpenseTransaction[]): Array<{
    merchant: string;
    amount: number;
    category: ExpenseCategory;
    frequency: 'Monthly' | 'Annual';
    occurrences: number;
    lastPaymentDate: string;
  }> {
    const debits = transactions.filter(t => t.type === 'debit');
    const merchantGroups: Record<string, ExpenseTransaction[]> = {};

    debits.forEach(t => {
      const key = t.merchant.toLowerCase().trim();
      if (!merchantGroups[key]) merchantGroups[key] = [];
      merchantGroups[key].push(t);
    });

    const recurring: Array<{
      merchant: string;
      amount: number;
      category: ExpenseCategory;
      frequency: 'Monthly' | 'Annual';
      occurrences: number;
      lastPaymentDate: string;
    }> = [];

    Object.entries(merchantGroups).forEach(([_, group]) => {
      if (group.length >= 2) {
        // Sort by date descending
        const sorted = [...group].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latest = sorted[0];
        const amounts = sorted.map(t => t.amount);
        
        // Check if amounts are very similar (within 10%)
        const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const allSimilar = amounts.every(a => Math.abs(a - avg) / (avg || 1) < 0.15);

        if (allSimilar || latest.isSubscription) {
          recurring.push({
            merchant: latest.merchant,
            amount: Math.round(avg),
            category: latest.category,
            frequency: latest.frequency || 'Monthly',
            occurrences: group.length,
            lastPaymentDate: latest.date
          });
        }
      } else if (group.length === 1 && group[0].isSubscription) {
        recurring.push({
          merchant: group[0].merchant,
          amount: group[0].amount,
          category: group[0].category,
          frequency: group[0].frequency || 'Monthly',
          occurrences: 1,
          lastPaymentDate: group[0].date
        });
      }
    });

    return recurring;
  }

  /**
   * Detect unusual spending (outliers > 2.5x mean in category)
   */
  public static detectUnusualSpending(transactions: ExpenseTransaction[]): ExpenseTransaction[] {
    const debits = transactions.filter(t => t.type === 'debit' && t.category !== 'Investments' && t.category !== 'EMIs & Loans');
    if (debits.length < 5) return [];

    const categoryAmounts: Record<string, number[]> = {};
    debits.forEach(t => {
      if (!categoryAmounts[t.category]) categoryAmounts[t.category] = [];
      categoryAmounts[t.category].push(t.amount);
    });

    const outliers: ExpenseTransaction[] = [];

    debits.forEach(t => {
      const list = categoryAmounts[t.category];
      if (list && list.length >= 3) {
        const mean = list.reduce((a, b) => a + b, 0) / list.length;
        if (t.amount > mean * 2.5 && t.amount > 2000) {
          outliers.push(t);
        }
      }
    });

    return outliers;
  }

  /**
   * Spending pattern intelligence
   */
  public static analyzeSpendingPatterns(transactions: ExpenseTransaction[]): string[] {
    const insights: string[] = [];
    const debits = transactions.filter(t => t.type === 'debit');
    if (debits.length === 0) {
      return ['No spending records found. Add transactions or import your statement to generate spending intelligence.'];
    }

    const totalSpend = debits.reduce((acc, t) => acc + t.amount, 0);

    // Category distribution
    const catMap: Record<string, number> = {};
    debits.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const topCategories = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    if (topCategories.length > 0) {
      const [topCat, topAmt] = topCategories[0];
      const pct = Math.round((topAmt / (totalSpend || 1)) * 100);
      insights.push(`Your highest spending category is **${topCat}**, accounting for ₹${topAmt.toLocaleString('en-IN')} (${pct}% of total spending).`);
    }

    // Weekend vs Weekday analysis
    let weekendSpend = 0;
    let weekdaySpend = 0;
    debits.forEach(t => {
      const day = new Date(t.date).getDay();
      if (day === 0 || day === 6) weekendSpend += t.amount;
      else weekdaySpend += t.amount;
    });

    if (weekendSpend > 0 && totalSpend > 0) {
      const weekendPct = Math.round((weekendSpend / totalSpend) * 100);
      if (weekendPct > 40) {
        insights.push(`Weekend discretionary spending is elevated: **${weekendPct}%** of your total monthly outflow occurs on Saturdays and Sundays.`);
      }
    }

    // Subscriptions check
    const subs = this.detectRecurringSubscriptions(transactions);
    if (subs.length > 0) {
      const totalSubs = subs.reduce((a, b) => a + b.amount, 0);
      insights.push(`You have **${subs.length} active recurring subscriptions** costing approximately ₹${totalSubs.toLocaleString('en-IN')}/month.`);
    }

    return insights;
  }
}
