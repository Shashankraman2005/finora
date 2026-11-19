export type PipelineStepId =
  | 'user_question'
  | 'intent_detection'
  | 'identify_required_data'
  | 'query_database'
  | 'calculate_metrics'
  | 'create_structured_context'
  | 'llm_reasoning'
  | 'financial_explanation';

export interface PipelineStepState {
  id: PipelineStepId;
  title: string;
  subtitle: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  durationMs?: number;
  outputSummary?: string;
  details?: any;
}

export interface FinancialIntent {
  intentCode:
  | 'RETIREMENT_FIRE'
  | 'DEBT_PAYOFF_STRATEGY'
  | 'PORTFOLIO_RISK_SHARPE'
  | 'EMERGENCY_RUNWAY'
  | 'TAX_HARVESTING'
  | 'EXPENSE_BURN_ANALYSIS'
  | 'GENERAL_FINANCIAL_HEALTH';
  category: string;
  confidence: number;
  extractedEntities: {
    targetAge?: number;
    targetAmount?: number;
    timeframeYears?: number;
    tickers?: string[];
    riskTolerance?: 'Conservative' | 'Moderate' | 'Aggressive';
    monthlySavings?: number;
    monthlyDebtPay?: number;
    includeMarketCrashScenario?: boolean;
  };
  reasoning: string;
}

export interface DBQueryResult {
  tablesQueried: string[];
  sqlQuery: string;
  rowCount: number;
  executionTimeMs: number;
  data: {
    userProfile: any;
    accounts: any[];
    holdings: any[];
    transactions: any[];
    liabilities: any[];
    marketBenchmarks: any[];
  };
}

export interface CalculatedFinancialMetrics {
  netWorth: number;
  liquidSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNetCashFlow: number;
  burnRateMonths: number;
  debtToIncomeRatio: number;
  portfolioSharpeRatio: number;
  portfolioCAGR3Yr: number;
  portfolioVolatility: number;
  totalDebt: number;
  weightedAvgDebtInterest: number;
  fireTargetAmount: number;
  fireCurrentProgressPct: number;
  projectedRetirementAge: number;
  maxDrawdownScenario: {
    marketCrashPct: number;
    portfolioLossUSD: number;
    remainingPortfolioUSD: number;
  };
  projectionData: Array<{
    year: number;
    age: number;
    conservativeValue: number;
    expectedValue: number;
    aggressiveValue: number;
    debtRemaining: number;
  }>;
}

export interface StructuredContext {
  meta: {
    generatedAt: string;
    pipelineVersion: string;
    userSanitizedId: string;
  };
  userConstraintProfile: {
    age: number;
    targetRetirementAge: number;
    riskTolerance: string;
    annualIncome: number;
  };
  intent: FinancialIntent;
  queriedDatabaseSummary: {
    totalAccounts: number;
    holdingCount: number;
    debtCount: number;
  };
  computedMetrics: CalculatedFinancialMetrics;
  systemPromptInstructions: string;
}

export interface LLMResponsePayload {
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTimeMs: number;
  rawResponse: string;
}

export interface FinancialExplanation {
  headlineSummary: string;
  healthGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D';
  keyTakeaways: string[];
  metricsBreakdown: Array<{
    name: string;
    value: string;
    benchmark: string;
    status: 'good' | 'warning' | 'critical' | 'neutral';
    insight: string;
  }>;
  actionablePlan: Array<{
    step: number;
    title: string;
    impact: string;
    timeframe: string;
    description: string;
  }>;
  scenarioAnalysis: string;
  riskWarnings: string[];
  disclaimer: string;
}

export interface FullPipelineExecution {
  id: string;
  timestamp: string;
  question: string;
  steps: Record<PipelineStepId, PipelineStepState>;
  intent?: FinancialIntent;
  dbResult?: DBQueryResult;
  metrics?: CalculatedFinancialMetrics;
  structuredContext?: StructuredContext;
  llmResponse?: LLMResponsePayload;
  explanation?: FinancialExplanation;
  isExecuting: boolean;
  activeStepId: PipelineStepId | null;
}
