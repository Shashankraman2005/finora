import type { 
  PipelineStepId, 
  PipelineStepState, 
  FinancialIntent, 
  DBQueryResult, 
  CalculatedFinancialMetrics, 
  StructuredContext, 
  LLMResponsePayload, 
  FinancialExplanation 
} from '../types/pipeline';
import { MOCK_FINANCIAL_DATABASE } from '../data/mockDatabase';

export const INITIAL_STEP_STATES: Record<PipelineStepId, PipelineStepState> = {
  user_question: {
    id: 'user_question',
    title: '1. User Question',
    subtitle: 'Capturing user financial inquiry & parameters',
    status: 'idle',
  },
  intent_detection: {
    id: 'intent_detection',
    title: '2. Intent Detection',
    subtitle: 'Parsing query intent & extracting financial entities',
    status: 'idle',
  },
  identify_required_data: {
    id: 'identify_required_data',
    title: '3. Identify Required Data',
    subtitle: 'Mapping intent to DB tables & data schemas',
    status: 'idle',
  },
  query_database: {
    id: 'query_database',
    title: '4. Query Database',
    subtitle: 'Executing SQL/NoSQL query on financial data store',
    status: 'idle',
  },
  calculate_metrics: {
    id: 'calculate_metrics',
    title: '5. Calculate Required Metrics',
    subtitle: 'Computing Sharpe ratio, FIRE runway, DTI & CAGR',
    status: 'idle',
  },
  create_structured_context: {
    id: 'create_structured_context',
    title: '6. Create Structured Context',
    subtitle: 'Synthesizing prompt context & constraint payload',
    status: 'idle',
  },
  llm_reasoning: {
    id: 'llm_reasoning',
    title: '7. LLM Reasoning',
    subtitle: 'Deep generative reasoning & risk evaluation',
    status: 'idle',
  },
  financial_explanation: {
    id: 'financial_explanation',
    title: '8. Financial Explanation',
    subtitle: 'Generating structured actionable guidance & dashboard',
    status: 'idle',
  },
};

// Step 2: Intent Detection Parser
export function detectIntent(question: string): FinancialIntent {
  const lower = question.toLowerCase();
  
  if (lower.includes('retire') || lower.includes('fire') || lower.includes('55') || lower.includes('60') || lower.includes('freedom')) {
    return {
      intentCode: 'RETIREMENT_FIRE',
      category: 'Retirement & Independence Planning',
      confidence: 0.97,
      extractedEntities: {
        targetAge: lower.includes('55') ? 55 : lower.includes('60') ? 60 : 58,
        timeframeYears: 21,
        riskTolerance: 'Aggressive',
        monthlySavings: 3500,
        targetAmount: 2040000,
      },
      reasoning: 'High keyword affinity detected for early retirement calculation, savings runway, and compound growth trajectory.'
    };
  } else if (lower.includes('debt') || lower.includes('payoff') || lower.includes('mortgage') || lower.includes('car loan') || lower.includes('dti')) {
    return {
      intentCode: 'DEBT_PAYOFF_STRATEGY',
      category: 'Liabilities & Debt Optimization',
      confidence: 0.95,
      extractedEntities: {
        monthlyDebtPay: 2990,
        includeMarketCrashScenario: false,
        riskTolerance: 'Moderate',
      },
      reasoning: 'Query centers on liability repayment versus opportunity cost of equity market investment returns.'
    };
  } else if (lower.includes('sharpe') || lower.includes('risk') || lower.includes('volatility') || lower.includes('crash') || lower.includes('downturn')) {
    return {
      intentCode: 'PORTFOLIO_RISK_SHARPE',
      category: 'Portfolio Risk & Stress Testing',
      confidence: 0.98,
      extractedEntities: {
        tickers: ['VTI', 'VXUS', 'NVDA', 'AAPL', 'BND', 'VNQ'],
        includeMarketCrashScenario: true,
        riskTolerance: 'Aggressive',
      },
      reasoning: 'High intent match for asset allocation stress testing, drawdown calculations, and Sharpe ratio assessment.'
    };
  } else if (lower.includes('runway') || lower.includes('emergency') || lower.includes('burn') || lower.includes('cash flow')) {
    return {
      intentCode: 'EMERGENCY_RUNWAY',
      category: 'Liquidity & Emergency Reserves',
      confidence: 0.94,
      extractedEntities: {
        timeframeYears: 1,
        monthlySavings: 7700,
      },
      reasoning: 'Inquiry evaluates cash reserves runway and monthly expenditure burn rate.'
    };
  }

  // Default fallback
  return {
    intentCode: 'GENERAL_FINANCIAL_HEALTH',
    category: 'Holistic Net Worth & Wealth Review',
    confidence: 0.91,
    extractedEntities: {
      targetAge: 55,
      timeframeYears: 20,
      riskTolerance: 'Aggressive',
      monthlySavings: 3500,
    },
    reasoning: 'Comprehensive financial health assessment across asset allocation, debt, and retirement readiness.'
  };
}

// Step 3 & 4: Data Identification & Database Execution
export function executeDatabaseQuery(intent: FinancialIntent, dbState = MOCK_FINANCIAL_DATABASE): DBQueryResult {
  const tables: string[] = ['user_profiles', 'accounts', 'holdings', 'liabilities', 'transactions', 'market_benchmarks'];
  
  let sql = `SELECT u.age, u.monthly_gross_income, u.monthly_expenses, 
       a.account_type, SUM(a.balance) as account_total,
       h.ticker, h.market_value, h.asset_class,
       l.name as debt_name, l.principal_remaining, l.interest_rate_pct
FROM user_profiles u
JOIN accounts a ON u.id = a.user_id
LEFT JOIN holdings h ON a.id = h.account_id
LEFT JOIN liabilities l ON u.id = l.user_id
WHERE u.id = '${dbState.userProfile.id}'
GROUP BY a.id, h.id, l.id;`;

  if (intent.intentCode === 'DEBT_PAYOFF_STRATEGY') {
    sql = `SELECT name, category, principal_remaining, interest_rate_pct, minimum_monthly_payment 
FROM liabilities 
WHERE user_id = '${dbState.userProfile.id}' 
ORDER BY interest_rate_pct DESC;`;
  } else if (intent.intentCode === 'PORTFOLIO_RISK_SHARPE') {
    sql = `SELECT h.ticker, h.name, h.market_value, h.asset_class, h.unrealized_gain_loss, b.volatility_pct 
FROM holdings h
JOIN market_benchmarks b ON h.asset_class = b.symbol
WHERE user_id = '${dbState.userProfile.id}';`;
  }

  return {
    tablesQueried: tables,
    sqlQuery: sql,
    rowCount: dbState.accounts.length + dbState.holdings.length + dbState.liabilities.length,
    executionTimeMs: 14,
    data: {
      userProfile: dbState.userProfile,
      accounts: dbState.accounts,
      holdings: dbState.holdings,
      transactions: dbState.transactions,
      liabilities: dbState.liabilities,
      marketBenchmarks: dbState.marketBenchmarks,
    }
  };
}

// Step 5: Financial Metrics Calculation Engine
export function calculateFinancialMetrics(_intent: FinancialIntent, dbData: DBQueryResult['data']): CalculatedFinancialMetrics {
  const { userProfile, accounts, holdings, liabilities } = dbData;

  const liquidSavings = accounts
    .filter(a => a.type === 'Checking' || a.type === 'Savings')
    .reduce((sum, a) => sum + a.balance, 0);

  const investmentPortfolio = holdings.reduce((sum, h) => sum + h.marketValue, 0) +
    accounts.filter(a => a.type === '401(k)' || a.type === 'Roth IRA').reduce((sum, a) => sum + a.balance, 0);

  const totalDebt = liabilities.reduce((sum, l) => sum + l.principalRemaining, 0);
  const totalAssets = liquidSavings + investmentPortfolio;
  const netWorth = totalAssets - totalDebt;

  const monthlyIncome = userProfile.monthlyGrossIncome;
  const monthlyExpenses = userProfile.monthlyExpenses;
  const monthlyDebtPayments = liabilities.reduce((sum, l) => sum + l.minimumMonthlyPayment, 0);
  const monthlyNetCashFlow = monthlyIncome - monthlyExpenses - monthlyDebtPayments;

  // Emergency Fund Runway (Months)
  const burnRateMonths = Number((liquidSavings / (monthlyExpenses + monthlyDebtPayments)).toFixed(1));

  // Debt to Income Ratio %
  const debtToIncomeRatio = Number(((monthlyDebtPayments / monthlyIncome) * 100).toFixed(1));

  // Weighted Average Debt Interest Rate %
  const weightedAvgDebtInterest = Number(
    (liabilities.reduce((sum, l) => sum + l.principalRemaining * l.interestRatePct, 0) / (totalDebt || 1)).toFixed(2)
  );

  // Portfolio Risk Metrics
  const expectedReturnPct = 10.5;
  const riskFreeRatePct = 4.2;
  const portfolioVolatilityPct = 14.8;
  const portfolioSharpeRatio = Number(((expectedReturnPct - riskFreeRatePct) / portfolioVolatilityPct).toFixed(2));
  const portfolioCAGR3Yr = 11.2;

  // FIRE Calculation
  const annualExpenses = (monthlyExpenses + monthlyDebtPayments) * 12;
  const fireTargetAmount = annualExpenses * 25;
  const fireCurrentProgressPct = Number(((netWorth / fireTargetAmount) * 100).toFixed(1));

  // Stress Test: 20% Market Crash
  const equityPortfolioVal = holdings
    .filter(h => h.assetClass === 'US Equity' || h.assetClass === 'Tech Equity' || h.assetClass === 'Intl Equity')
    .reduce((sum, h) => sum + h.marketValue, 0);
  const marketCrashPct = 20;
  const portfolioLossUSD = Math.round(equityPortfolioVal * (marketCrashPct / 100));

  // Projection Data over 20 years
  const projectionData = [];
  let curVal = netWorth;
  let debtVal = totalDebt;
  const monthlyContribution = Math.max(2500, monthlyNetCashFlow * 0.6);

  for (let i = 0; i <= 20; i++) {
    const age = userProfile.age + i;
    const year = 2026 + i;
    
    const conservative = Math.round(curVal * Math.pow(1 + 0.055, i) + (monthlyContribution * 12 * i * 1.03));
    const expected = Math.round(curVal * Math.pow(1 + 0.085, i) + (monthlyContribution * 12 * i * 1.05));
    const aggressive = Math.round(curVal * Math.pow(1 + 0.115, i) + (monthlyContribution * 12 * i * 1.07));

    debtVal = Math.max(0, Math.round(totalDebt - (monthlyDebtPayments * 12 * i * 0.7)));

    projectionData.push({
      year,
      age,
      conservativeValue: conservative,
      expectedValue: expected,
      aggressiveValue: aggressive,
      debtRemaining: debtVal,
    });
  }

  const retirementYearIndex = projectionData.findIndex(p => p.expectedValue >= fireTargetAmount);
  const projectedRetirementAge = retirementYearIndex !== -1 ? userProfile.age + retirementYearIndex : 52;

  return {
    netWorth,
    liquidSavings,
    monthlyIncome,
    monthlyExpenses,
    monthlyNetCashFlow,
    burnRateMonths,
    debtToIncomeRatio,
    portfolioSharpeRatio,
    portfolioCAGR3Yr,
    portfolioVolatility: portfolioVolatilityPct,
    totalDebt,
    weightedAvgDebtInterest,
    fireTargetAmount,
    fireCurrentProgressPct,
    projectedRetirementAge,
    maxDrawdownScenario: {
      marketCrashPct,
      portfolioLossUSD,
      remainingPortfolioUSD: netWorth - portfolioLossUSD,
    },
    projectionData,
  };
}

// Step 6: Create Structured Context
export function createStructuredContext(
  intent: FinancialIntent,
  dbResult: DBQueryResult,
  metrics: CalculatedFinancialMetrics
): StructuredContext {
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      pipelineVersion: 'Finora-v2.4-HybridEngine',
      userSanitizedId: dbResult.data.userProfile.id,
    },
    userConstraintProfile: {
      age: dbResult.data.userProfile.age,
      targetRetirementAge: dbResult.data.userProfile.targetRetirementAge,
      riskTolerance: dbResult.data.userProfile.riskTolerance,
      annualIncome: dbResult.data.userProfile.monthlyGrossIncome * 12,
    },
    intent,
    queriedDatabaseSummary: {
      totalAccounts: dbResult.data.accounts.length,
      holdingCount: dbResult.data.holdings.length,
      debtCount: dbResult.data.liabilities.length,
    },
    computedMetrics: metrics,
    systemPromptInstructions: `You are Finora, a CFA-level AI Financial Analyst. You must provide clear, rigorous financial advice supported by the computed mathematical metrics below. Maintain absolute accuracy on net worth, Sharpe ratios, DTI percentages, and FIRE runway calculations. Never state assumptions without linking to the provided quantitative metrics.`
  };
}

// Step 7: LLM Reasoning Simulation
export async function runLLMReasoning(context: StructuredContext): Promise<LLMResponsePayload> {
  const start = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 800));

  const jsonContextStr = JSON.stringify(context, null, 2);
  const promptTokens = Math.round(jsonContextStr.length / 4) + 250;
  const completionTokens = 680;

  return {
    modelUsed: 'gemini-3.6-flash-high',
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    reasoningTimeMs: Date.now() - start,
    rawResponse: `Synthesized financial evaluation complete. Evaluated ${context.computedMetrics.netWorth.toLocaleString()} USD net worth with ${context.computedMetrics.burnRateMonths} months liquidity runway. Sharpe ratio stands at ${context.computedMetrics.portfolioSharpeRatio}. FIRE target set to $${context.computedMetrics.fireTargetAmount.toLocaleString()}.`
  };
}

// Step 8: Generate Structured Financial Explanation & Action Plan
export function generateFinancialExplanation(
  intent: FinancialIntent,
  metrics: CalculatedFinancialMetrics
): FinancialExplanation {
  const formattedNetWorth = `$${metrics.netWorth.toLocaleString()}`;
  const formattedFIRE = `$${metrics.fireTargetAmount.toLocaleString()}`;

  if (intent.intentCode === 'RETIREMENT_FIRE') {
    return {
      headlineSummary: `You are ahead of schedule for early financial independence! At your current savings velocity, you are projected to hit your $${(metrics.fireTargetAmount / 1e6).toFixed(2)}M FIRE target by age ${metrics.projectedRetirementAge}, 3 years earlier than your target age of 55.`,
      healthGrade: 'A',
      keyTakeaways: [
        `Current Net Worth of ${formattedNetWorth} covers ${metrics.fireCurrentProgressPct}% of your total FIRE target (${formattedFIRE}).`,
        `Liquid emergency buffer provides ${metrics.burnRateMonths} months of expense runway (ideal benchmark: 6 months).`,
        `Portfolio Sharpe Ratio of ${metrics.portfolioSharpeRatio} indicates superior risk-adjusted equity returns versus S&P 500 baseline (0.75).`,
        `Tax-advantaged accounts (401k + Roth IRA) make up 43.6% of your investment stack, providing solid tax-sheltered compound growth.`
      ],
      metricsBreakdown: [
        { name: 'Projected FIRE Age', value: `${metrics.projectedRetirementAge} Yrs`, benchmark: 'Target: 55 Yrs', status: 'good', insight: 'Achievable 3 years ahead of schedule with $3.5k/mo contribution.' },
        { name: 'Emergency Runway', value: `${metrics.burnRateMonths} Months`, benchmark: 'Min 6 Months', status: 'good', insight: 'High-yield cash reserve ($57.5k) protects against market volatility.' },
        { name: 'Debt-to-Income (DTI)', value: `${metrics.debtToIncomeRatio}%`, benchmark: '< 36%', status: 'good', insight: 'Healthy liability load; principal is mostly mortgage equity.' },
        { name: 'Portfolio Sharpe Ratio', value: `${metrics.portfolioSharpeRatio}`, benchmark: '> 0.70', status: 'good', insight: 'Strong risk-adjusted efficiency with low bond drag.' },
      ],
      actionablePlan: [
        {
          step: 1,
          title: 'Maximize Backdoor Roth & Tech 401(k) Catch-Ups',
          impact: '+$142,000 in Tax Savings over 10 Years',
          timeframe: 'Immediate',
          description: 'Fully max out your annual 401(k) limit ($23,000) and execute the backdoor Roth IRA ($7,000) at the start of each tax year to maximize tax-free compounding.'
        },
        {
          step: 2,
          title: 'Accelerate Tesla Auto Loan Payoff (5.90% Rate)',
          impact: 'Save $1,840 in Interest Charges',
          timeframe: 'Next 6 Months',
          description: 'Your auto loan interest rate (5.90%) exceeds your high-yield savings yield (4.85%). Reallocate $800/mo of excess monthly cash flow toward the Tesla loan balance ($24.5k).'
        },
        {
          step: 3,
          title: 'Trim Single-Stock Concentration in Tech (AAPL & NVDA)',
          impact: 'Reduce Max Drawdown by 6.4%',
          timeframe: 'Next 12 Months',
          description: 'Single-stock tech holdings (NVDA + AAPL) represent 27.7% of total holdings ($111.2k). Tax-efficiently rebalance dividends into broad index funds (VTI / VXUS).'
        }
      ],
      scenarioAnalysis: `Under a simulated 20% tech market downturn, your equity holdings would incur a temporary unrealized drawdown of $${metrics.maxDrawdownScenario.portfolioLossUSD.toLocaleString()}, leaving your total net worth at $${metrics.maxDrawdownScenario.remainingPortfolioUSD.toLocaleString()}. Your 8.5-month cash buffer eliminates any need to liquidate equities during market drops.`,
      riskWarnings: [
        'Single-stock tech concentration (NVDA & AAPL) increases portfolio standard deviation to 14.8%.',
        'Federal tax bracket shifts upon high annual capital gains harvesting.'
      ],
      disclaimer: 'Finora AI provides financial education and mathematical scenario modeling. Past performance does not guarantee future market returns. Consult a licensed CFP for binding fiduciary advice.'
    };
  } else if (intent.intentCode === 'DEBT_PAYOFF_STRATEGY') {
    return {
      headlineSummary: `Your Debt-to-Income (DTI) ratio is a healthy ${metrics.debtToIncomeRatio}%. Utilizing the Avalanche Method, paying off your Tesla Auto Loan (5.90%) first yields an immediate guaranteed return of 5.90%.`,
      healthGrade: 'A-',
      keyTakeaways: [
        `Total Debt outstanding: $${metrics.totalDebt.toLocaleString()} with a weighted average interest rate of ${metrics.weightedAvgDebtInterest}%.`,
        `Monthly debt service of $${(metrics.monthlyIncome * (metrics.debtToIncomeRatio / 100)).toFixed(0)} is comfortably below the 36% financial threshold.`,
        `Low-interest Mortgage (4.25%) and Student Loan (3.80%) should remain on schedule while market investment returns average ~8.5%.`
      ],
      metricsBreakdown: [
        { name: 'Debt-to-Income (DTI)', value: `${metrics.debtToIncomeRatio}%`, benchmark: '< 36%', status: 'good', insight: 'Well within safe lending guidelines.' },
        { name: 'Weighted Interest Rate', value: `${metrics.weightedAvgDebtInterest}%`, benchmark: '< 6.0%', status: 'good', insight: 'Mortgage anchors the low weighted average.' },
        { name: 'Highest Rate Debt', value: '5.90% (Tesla)', benchmark: 'Payoff Target', status: 'warning', insight: 'Priority candidate for accelerated payoff.' },
        { name: 'Monthly Cash Flow Surplus', value: `$${metrics.monthlyNetCashFlow.toLocaleString()}`, benchmark: '> $1,000', status: 'good', insight: 'Ample headroom to fund both debt payoff and investing.' },
      ],
      actionablePlan: [
        {
          step: 1,
          title: 'Execute Debt Avalanche on Tesla Auto Loan',
          impact: 'Free up $580/mo Cash Flow in 18 Months',
          timeframe: 'Immediate',
          description: 'Direct an extra $750/mo from your monthly net cash surplus ($4,710) specifically to principal on the 5.90% Tesla loan.'
        },
        {
          step: 2,
          title: 'Maintain Minimum Payments on Student Loan (3.80%)',
          impact: 'Arbitrage 4.70% Expected Spread in Brokerage',
          timeframe: 'Ongoing',
          description: 'Do not rush to pay off the 3.80% student loan ($18.2k). Investing surplus capital into VTI (historical ~8.5% return) builds higher net worth over time.'
        }
      ],
      scenarioAnalysis: `Paying off the Tesla loan early frees up $580/mo in cash flow, lowering your DTI to 16.6% and increasing your emergency fund accumulation rate by 18%.`,
      riskWarnings: [
        'Prepayment penalties on early auto loan discharge (check Chase Auto terms).',
        'Rising variable rate risks if refinancing mortgage.'
      ],
      disclaimer: 'Finora AI financial modeling tool. Consult your tax advisor and loan servicer before making major debt restructuring decisions.'
    };
  }

  return {
    headlineSummary: `Your overall financial health rating is A+. Portfolio net worth stands at ${formattedNetWorth} with strong liquidity (${metrics.burnRateMonths} months runway) and optimized risk metrics.`,
    healthGrade: 'A+',
    keyTakeaways: [
      `Net Worth of ${formattedNetWorth} backed by $57.5k liquid cash and $401k invested assets.`,
      `Solid Sharpe ratio of ${metrics.portfolioSharpeRatio} reflecting disciplined index-based asset allocation.`,
      `Cash surplus of $${metrics.monthlyNetCashFlow.toLocaleString()}/month provides significant investment leverage.`
    ],
    metricsBreakdown: [
      { name: 'Net Worth', value: formattedNetWorth, benchmark: 'Top 10% for age 34', status: 'good', insight: 'Robust asset accumulation across equity and cash.' },
      { name: 'Portfolio Sharpe Ratio', value: `${metrics.portfolioSharpeRatio}`, benchmark: '> 0.70', status: 'good', insight: 'Efficient risk-adjusted market exposure.' },
      { name: 'Emergency Runway', value: `${metrics.burnRateMonths} Mo`, benchmark: '6 Mo', status: 'good', insight: 'Provides psychological and financial safety net.' },
      { name: 'DTI Ratio', value: `${metrics.debtToIncomeRatio}%`, benchmark: '< 36%', status: 'good', insight: 'Low fixed obligation burden.' },
    ],
    actionablePlan: [
      {
        step: 1,
        title: 'Maintain Automated Index Dollar-Cost Averaging',
        impact: 'Compound to $1.2M in 7 Years',
        timeframe: 'Monthly',
        description: 'Keep monthly auto-investments of $3,500 split 70% VTI, 20% VXUS, 10% BND.'
      },
      {
        step: 2,
        title: 'Annual Rebalancing & Tax Loss Harvesting',
        impact: 'Reduce Tax Drag by ~0.4% annually',
        timeframe: 'Q4 Each Year',
        description: 'Review asset weights each December to harvest tax losses and keep equities aligned with risk target.'
      }
    ],
    scenarioAnalysis: `Your diversified asset allocation buffers against market turbulence. A 20% equity correction reduces temporary valuation by $${metrics.maxDrawdownScenario.portfolioLossUSD.toLocaleString()} without threatening cash obligations.`,
    riskWarnings: [
      'Tech sector concentration (AAPL/NVDA) increases short-term volatility.',
      'Inflation risk on uninvested cash above 6-month emergency buffer.'
    ],
    disclaimer: 'Finora AI intelligence engine output for informational purposes.'
  };
}
