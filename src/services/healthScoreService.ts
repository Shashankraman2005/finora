import type { 
  UserProfileData, 
  ExpenseTransaction, 
  StockHolding, 
  MutualFundHolding, 
  GoalItem, 
  FinancialHealthScore 
} from '../types/finora';

export class HealthScoreService {
  /**
   * Computes an explainable, 100-point Financial Health Score strictly from actual user data.
   * If critical information is missing, marks isComplete as false and identifies missing fields.
   */
  public static evaluateHealthScore(
    profile: UserProfileData,
    transactions: ExpenseTransaction[],
    stockHoldings: StockHolding[] = [],
    mfHoldings: MutualFundHolding[] = [],
    goals: GoalItem[] = [],
    previousScore?: number
  ): FinancialHealthScore {
    const missingFields: string[] = [];

    // Verify presence of core financial information
    const totalIncome = (profile.monthlyIncome || 0) + (profile.otherIncome || 0);
    if (!profile.monthlyIncome || profile.monthlyIncome <= 0) {
      missingFields.push('Monthly Income');
    }

    const debits = transactions.filter(t => t.type === 'debit');
    const totalSpending = debits.reduce((acc, t) => acc + t.amount, 0);

    // If both transactions and monthly fixed expenses are missing
    if (debits.length === 0 && (!profile.monthlyFixedExpenses || profile.monthlyFixedExpenses <= 0)) {
      missingFields.push('Monthly Spending / Fixed Expenses');
    }

    if (profile.currentSavings === undefined || profile.currentSavings === null) {
      missingFields.push('Liquid Savings');
    }

    // If important info is missing, return incomplete assessment
    if (missingFields.length > 0) {
      return {
        overallScore: 0,
        isComplete: false,
        missingFields,
        savingsScore: 0,
        debtScore: 0,
        emergencyFundScore: 0,
        spendingScore: 0,
        diversificationScore: 0,
        goalsScore: 0,
        breakdownNotes: [
          'Assessment incomplete: Required financial baseline data is missing.',
          `Please provide: ${missingFields.join(', ')}.`
        ],
        recommendations: [
          'Complete your financial profile and add your primary income and monthly spending to unlock your Finora Financial Health Score.'
        ],
        previousScore
      };
    }

    // 1. Savings Behaviour (Max 25 pts)
    // Savings Rate = (Income - Spending) / Income
    const effectiveSpend = totalSpending > 0 ? totalSpending : (profile.monthlyFixedExpenses || 0);
    const savingsAmount = Math.max(0, totalIncome - effectiveSpend);
    const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

    let savingsScore = 0;
    if (savingsRate >= 30) savingsScore = 25;
    else if (savingsRate >= 20) savingsScore = 20;
    else if (savingsRate >= 10) savingsScore = 14;
    else if (savingsRate >= 5) savingsScore = 8;
    else savingsScore = 3;

    // 2. Debt Management (Max 20 pts)
    // Debt-to-Income / Outstanding Debt check
    const totalDebt = profile.totalDebt || 0;
    let debtScore = 0;
    if (totalDebt === 0) {
      debtScore = 20;
    } else {
      const debtToAnnualIncome = totalIncome > 0 ? totalDebt / (totalIncome * 12) : 1;
      if (debtToAnnualIncome <= 0.3) debtScore = 17;
      else if (debtToAnnualIncome <= 0.6) debtScore = 13;
      else if (debtToAnnualIncome <= 1.2) debtScore = 8;
      else debtScore = 4;
    }

    // 3. Emergency Fund (Max 20 pts)
    // Liquid Reserves / Monthly Fixed Expenses
    const monthlyBurn = profile.monthlyFixedExpenses > 0 ? profile.monthlyFixedExpenses : (effectiveSpend || 1);
    const monthsRunway = (profile.currentSavings || 0) / monthlyBurn;

    let emergencyFundScore = 0;
    if (monthsRunway >= 6) emergencyFundScore = 20;
    else if (monthsRunway >= 3) emergencyFundScore = 15;
    else if (monthsRunway >= 1.5) emergencyFundScore = 10;
    else if (monthsRunway >= 0.5) emergencyFundScore = 5;
    else emergencyFundScore = 2;

    // 4. Spending Discipline (Max 15 pts)
    // Discretionary spend proportion
    let spendingScore = 0;
    if (effectiveSpend <= totalIncome * 0.6) {
      spendingScore = 15;
    } else if (effectiveSpend <= totalIncome * 0.8) {
      spendingScore = 11;
    } else if (effectiveSpend <= totalIncome) {
      spendingScore = 7;
    } else {
      spendingScore = 2; // Overspending / burning cash
    }

    // 5. Investment Diversification (Max 10 pts)
    // Check asset spread across stocks, mutual funds, gold, fixed deposits
    let diversificationScore = 0;
    const hasStocks = stockHoldings.length > 0;
    const hasMFs = mfHoldings.length > 0;
    const hasGeneralInvestments = (profile.currentInvestments || 0) > 0;

    let assetCount = 0;
    if (hasStocks) assetCount++;
    if (hasMFs) assetCount++;
    if (profile.investmentProfile?.assetClasses?.length) {
      assetCount = Math.max(assetCount, profile.investmentProfile.assetClasses.length);
    } else if (hasGeneralInvestments) {
      assetCount = Math.max(assetCount, 1);
    }

    if (assetCount >= 3) diversificationScore = 10;
    else if (assetCount === 2) diversificationScore = 7;
    else if (assetCount === 1) diversificationScore = 4;
    else diversificationScore = 1;

    // 6. Financial Goal Progress (Max 10 pts)
    let goalsScore = 0;
    if (goals.length === 0) {
      goalsScore = 2; // No goals set yet
    } else {
      const fundedGoals = goals.filter(g => g.targetAmount > 0 && (g.currentAmount / g.targetAmount) >= 0.25);
      const goalRatio = fundedGoals.length / goals.length;
      goalsScore = Math.round(goalRatio * 10);
    }

    const overallScore = Math.min(100, Math.max(0, 
      savingsScore + debtScore + emergencyFundScore + spendingScore + diversificationScore + goalsScore
    ));

    // Dynamic notes & observations
    const breakdownNotes: string[] = [
      `Savings behaviour: ${savingsScore}/25 pts (Savings rate: ${savingsRate.toFixed(1)}% of gross income).`,
      `Debt management: ${debtScore}/20 pts (Total liabilities: ₹${totalDebt.toLocaleString('en-IN')}).`,
      `Emergency reserve: ${emergencyFundScore}/20 pts (Current liquid runway: ${monthsRunway.toFixed(1)} months of expenses).`,
      `Spending discipline: ${spendingScore}/15 pts (Monthly outflow is ${(effectiveSpend / (totalIncome || 1) * 100).toFixed(0)}% of earnings).`,
      `Investment diversification: ${diversificationScore}/10 pts (${assetCount} distinct asset classes held).`,
      `Goal progress: ${goalsScore}/10 pts (${goals.length} active financial targets).`
    ];

    const recommendations: string[] = [];
    if (emergencyFundScore < 15) {
      recommendations.push(
        `Build your emergency reserve to at least 3 to 6 months of expenses (Target: ₹${(monthlyBurn * 6).toLocaleString('en-IN')}).`
      );
    }
    if (savingsScore < 18) {
      recommendations.push(
        `Aim to increase your savings rate towards 20% by auditing recurring subscriptions and non-essential dining.`
      );
    }
    if (debtScore < 15) {
      recommendations.push(
        `Accelerate high-cost credit card or personal loan repayment to lower your debt-to-income burden.`
      );
    }
    if (goals.length === 0) {
      recommendations.push(
        `Define at least one clear financial milestone (e.g. Emergency Fund or FIRE Retirement) to stay on track.`
      );
    }
    if (recommendations.length === 0) {
      recommendations.push(
        `Exceptional financial discipline! Maintain your regular monthly SIP contributions to compound wealth long-term.`
      );
    }

    let scoreChangeReason: string | undefined;
    if (previousScore !== undefined && previousScore > 0) {
      const diff = overallScore - previousScore;
      if (diff > 0) {
        scoreChangeReason = `Score increased by +${diff} points due to improved savings rate and emergency fund contributions.`;
      } else if (diff < 0) {
        scoreChangeReason = `Score decreased by ${diff} points due to higher discretionary spending or increased debt balances.`;
      } else {
        scoreChangeReason = `Score remained stable reflecting consistent monthly cashflow discipline.`;
      }
    }

    return {
      overallScore,
      isComplete: true,
      missingFields: [],
      savingsScore,
      debtScore,
      emergencyFundScore,
      spendingScore,
      diversificationScore,
      goalsScore,
      breakdownNotes,
      recommendations,
      previousScore,
      scoreChangeReason
    };
  }
}
