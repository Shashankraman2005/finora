# Finora – AI-Powered Personal Finance & Investment Intelligence Platform

> **Finora** is an intelligent personal financial assistant and investment management platform. Built with React 19, TypeScript, Tailwind CSS, and Vite.

---

## 🌟 Key Features

### 1. 🛡️ Clean Onboarding & Blank-State Guarantee
- **Zero Dummy Data for New Applicants:** Every new applicant starts with an empty account. No demo transactions, synthetic holdings, or fake goals are ever injected into real applicant profiles.
- **5-Step Onboarding Flow:** Progressively collects Personal Profile, Financial Baseline, Investment Preferences, and Financial Goals.

### 2. 📊 Financial Command Center
- **8 Core Real-Time Metrics:** Total Income, Expenses, Liquid Savings, Savings Rate, Investments, Liabilities, Net Worth, and Monthly Cash Flow.
- **Interactive Visualizations:** Income vs Expense comparisons, 13-category spend allocation donut charts, net worth progression, and date range filtering.

### 3. 🧠 13-Category AI Transaction Engine
- **Universal Expense Taxonomy:** Food & Dining, Shopping, Transportation, Groceries, Entertainment, Healthcare, Education, Rent, Utilities, Travel, Investments, EMIs & Loans, Other Expenses.
- **Outlier Spend Detection:** Identifies anomalous transactions (>2.5x category mean).
- **Recurring Subscription Auditing:** Automatically flags monthly subscriptions (Netflix, Spotify, Amazon Prime, broadband, etc.).
- **Feedback Learning:** Remembers manual category overrides and applies them to future transactions.

### 4. 📈 Real-Time Stock Market Intelligence
- **NSE & BSE Market Tracking:** Live benchmarks for NIFTY 50, SENSEX, BANKNIFTY, Indian equities, and global stocks (AAPL, NVDA, MSFT).
- **Provider Integrations:** Connects with Twelve Data, Finnhub, and Alpha Vantage.
- **Freshness Transparency:** Clear badges indicating `[Real-Time]`, `[Delayed 15m]`, or `[End-of-Day]`.
- **Watchlists & Alerts:** Custom watchlists with high/low price alerts and technical charts.

### 5. 📑 Indian Mutual Funds Tracker (AMFI Integration)
- **40,000+ Schemes via AMFI Open API:** Real-time search across HDFC, SBI, ICICI Prudential, Parag Parikh, UTI, and more.
- **Folio & SIP Management:** Tracks units, NAV dates, live valuations, absolute returns, and provides an interactive SIP compounding calculator.

### 6. 💯 Explainable 100-Point Financial Health Score
- **6-Pillar Model:**
  - Savings Behavior: 25 points
  - Debt Management: 20 points
  - Emergency Fund: 20 points
  - Spending Discipline: 15 points
  - Investment Diversification: 10 points
  - Goal Progress: 10 points
- **Incomplete Assessment Protection:** Clearly indicates when information is missing rather than fabricating metrics.

### 7. 🎯 Smart Financial Goals
- Automated monthly savings formulas based on remaining target amounts and deadlines.

### 8. 📥 Bank Statement Importer
- Import PDF, CSV, and Excel (`.xlsx`, `.xls`) statements with automated column mapping, duplicate detection, and pre-import preview editing.

### 9. 🤖 AI Financial Copilot
- Context-aware conversational assistant answering natural language questions based on the active user's financial ledger.

### 10. 📑 Comprehensive Financial Reports & Export Studio
- Download monthly/yearly financial summaries in Excel (`.xlsx`), CSV, and PDF print formatting.

### 11. 🔒 Security & Multi-User Data Isolation
- Client-side SHA-256 password hashing.
- Independent database silos (`finora_db_v3_user_${userId}_*`).
- Role-based Developer Portal restricted to authorized `@finora.com` accounts.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (Node 25 recommended)
- npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/Shashankraman2005/finora.git
cd finora

# Install dependencies
npm install

# Run automated verification test suite (60 assertions across 6 suites)
npm run test:verify

# Start development server
npm run dev
```

### Environment Configuration (Optional)
Copy `.env.example` to `.env`:

```ini
# Optional API Keys for Live Stock Pricing
VITE_TWELVE_DATA_API_KEY=
VITE_FINNHUB_API_KEY=
VITE_ALPHA_VANTAGE_API_KEY=
```
*(AMFI Mutual Fund data works out-of-the-box with zero API key requirement).*

---

## 🧪 Testing & Verification

Run the built-in verification suite:
```bash
npm run test:verify
```
Checks:
- [x] Blank applicant account invariant & onboarding calculations
- [x] Market quote retrieval & fallback badges
- [x] Multi-user data isolation (User A vs User B)
- [x] 13-category transaction classification & outlier detection
- [x] AMFI live search & bank statement parsing

---

## 📄 License
MIT License. Built with ❤️ by Shashank Raman.
