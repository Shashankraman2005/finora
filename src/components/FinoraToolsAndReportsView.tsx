import React, { useState } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  Sliders, 
  Calendar, 
  Download, 
  Table,
  Printer,
  FileSpreadsheet,
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const FinoraToolsAndReportsView: React.FC<{ initialTab?: 'simulator' | 'calendar' | 'reports' }> = ({ initialTab = 'reports' }) => {
  const { 
    currentUser, 
    profile, 
    transactions, 
    stockHoldings, 
    mfHoldings, 
    goals, 
    budgets, 
    healthScore 
  } = useFinora();

  const [activeTab, setActiveTab] = useState<'reports' | 'simulator' | 'calendar'>(initialTab);
  const [reportPeriod, setReportPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Simulator Sliders State
  const [simInvestment, setSimInvestment] = useState<number>(20000);
  const [simYears, setSimYears] = useState<number>(10);

  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const debits = transactions.filter(t => t.type === 'debit');
  const totalSpending = debits.reduce((acc, t) => acc + t.amount, 0) || profile.monthlyFixedExpenses || 0;
  const totalIncome = (profile.monthlyIncome || 0) + (profile.otherIncome || 0);
  const totalInvested = stockHoldings.reduce((acc, s) => acc + s.currentValue, 0) + mfHoldings.reduce((acc, m) => acc + m.currentValue, 0) || profile.currentInvestments || 0;
  const totalSaved = profile.currentSavings || 0;
  const netWorth = totalSaved + totalInvested - (profile.totalDebt || 0);

  // Category Breakdown Map
  const categoryMap: Record<string, number> = {};
  debits.forEach(t => { categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount; });

  // Simulator math calculation
  const calculateScenario = (monthlyContrib: number, years: number, cagr = 12) => {
    const r = cagr / 100 / 12;
    const n = years * 12;
    let val = (profile.currentInvestments || 0) * Math.pow(1 + cagr / 100, years);
    for (let i = 0; i < n; i++) {
      val = (val + monthlyContrib) * (1 + r);
    }
    return val;
  };

  const currentPlanVal = calculateScenario(simInvestment, simYears, 12);
  const boostedPlanVal = calculateScenario(simInvestment + 5000, simYears, 12);

  // Genuine Excel / CSV Export
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Executive Summary
    const summaryData = [
      ['Finora Financial Intelligence Report', `Generated: ${new Date().toLocaleDateString()}`],
      ['User Name', profile.name || currentUser?.name || 'Applicant'],
      ['Email', profile.email || currentUser?.email || ''],
      ['Report Type', reportPeriod === 'monthly' ? 'Monthly Financial Statement' : 'Annual Comprehensive Review'],
      [],
      ['Core Financial Metric', 'Value (INR)'],
      ['Total Monthly Income', totalIncome],
      ['Total Monthly Spending', totalSpending],
      ['Net Monthly Cashflow', totalIncome - totalSpending],
      ['Liquid Savings', totalSaved],
      ['Total Investments (Stocks & MFs)', totalInvested],
      ['Total Liabilities (Debt)', profile.totalDebt || 0],
      ['Calculated Net Worth', netWorth],
      ['Financial Health Score', healthScore.isComplete ? `${healthScore.overallScore}/100` : 'Incomplete']
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Sheet 2: Transactions Ledger
    const txData = [
      ['Date', 'Description', 'Amount', 'Type', 'Category', 'Merchant'],
      ...transactions.map(t => [t.date, t.description, t.amount, t.type, t.category, t.merchant])
    ];
    const wsTx = XLSX.utils.aoa_to_sheet(txData);
    XLSX.utils.book_append_sheet(wb, wsTx, 'Transactions');

    // Sheet 3: Stock Holdings
    const stockData = [
      ['Symbol', 'Stock Name', 'Exchange', 'Quantity', 'Purchase Price', 'Current Price', 'Invested', 'Current Value', 'P&L (%)'],
      ...stockHoldings.map(s => [s.symbol, s.name, s.exchange, s.quantity, s.avgPurchasePrice, s.currentPrice, s.investedAmount, s.currentValue, s.returnsPct])
    ];
    const wsStocks = XLSX.utils.aoa_to_sheet(stockData);
    XLSX.utils.book_append_sheet(wb, wsStocks, 'Stock Holdings');

    // Sheet 4: Mutual Fund Holdings
    const mfData = [
      ['Scheme Code', 'Scheme Name', 'Units', 'Purchase NAV', 'Current NAV', 'Invested', 'Current Value', 'SIP Active'],
      ...mfHoldings.map(m => [m.schemeCode, m.schemeName, m.units, m.purchaseNav, m.currentNav, m.investedAmount, m.currentValue, m.sipActive ? 'Yes' : 'No'])
    ];
    const wsMf = XLSX.utils.aoa_to_sheet(mfData);
    XLSX.utils.book_append_sheet(wb, wsMf, 'Mutual Funds');

    // Sheet 5: Goals
    const goalData = [
      ['Goal Name', 'Category', 'Target Amount', 'Current Savings', 'Target Date', 'Monthly Contribution'],
      ...goals.map(g => [g.name, g.category, g.targetAmount, g.currentAmount, g.targetDate, g.monthlyContribution])
    ];
    const wsGoals = XLSX.utils.aoa_to_sheet(goalData);
    XLSX.utils.book_append_sheet(wb, wsGoals, 'Goals');

    XLSX.writeFile(wb, `Finora_${reportPeriod}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Name', profile.name || currentUser?.name || 'Applicant'],
      ['Monthly Income', totalIncome],
      ['Monthly Expenses', totalSpending],
      ['Net Savings', totalSaved],
      ['Total Investments', totalInvested],
      ['Total Debt', profile.totalDebt || 0],
      ['Net Worth', netWorth],
      ['Health Score', healthScore.isComplete ? `${healthScore.overallScore}/100` : 'Incomplete']
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finora_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* HEADER */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-black flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Financial Intelligence Reporting Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">PDF &amp; Excel Exports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Financial Reports &amp; Statements
          </h1>
          <p className="text-sm text-[#5D6D66] mt-1">
            Download comprehensive monthly and annual financial audits, net worth statements, and health score assessments.
          </p>
        </div>

        <div className="flex bg-[#F6F6F2] p-1 rounded-2xl border border-[#E2E5E1]">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'reports' ? 'bg-[#0E2A1E] text-white shadow-sm' : 'text-[#5D6D66] hover:text-[#101A15]'
            }`}
          >
            Financial Reports
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'simulator' ? 'bg-[#0E2A1E] text-white shadow-sm' : 'text-[#5D6D66] hover:text-[#101A15]'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'calendar' ? 'bg-[#0E2A1E] text-white shadow-sm' : 'text-[#5D6D66] hover:text-[#101A15]'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          
          {/* EXPORT ACTION CONTROLS */}
          <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#5D6D66]">Report Horizon:</span>
              <div className="flex bg-[#F6F6F2] p-1 rounded-xl border border-[#E2E5E1] text-xs font-bold">
                <button
                  onClick={() => setReportPeriod('monthly')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reportPeriod === 'monthly' ? 'bg-[#0E2A1E] text-white' : 'text-[#5D6D66]'
                  }`}
                >
                  Monthly Report
                </button>
                <button
                  onClick={() => setReportPeriod('yearly')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reportPeriod === 'yearly' ? 'bg-[#0E2A1E] text-white' : 'text-[#5D6D66]'
                  }`}
                >
                  Yearly Comprehensive
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="px-4 py-2.5 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#34D399]" />
                <span>Download Excel (.xlsx)</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-2xl border border-[#E2E5E1] hover:bg-[#F6F6F2] text-[#0E2A1E] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#1F7A52]" />
                <span>Download CSV</span>
              </button>

              <button
                onClick={handlePrintPDF}
                className="px-4 py-2.5 rounded-2xl border border-[#E2E5E1] hover:bg-[#F6F6F2] text-[#0E2A1E] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* REPORT PREVIEW DOCUMENT */}
          <div className="bg-white border border-[#E2E5E1] rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 printable-report">
            
            {/* Report Header */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-[#0E2A1E]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0E2A1E] text-white flex items-center justify-center font-black text-sm">F</div>
                  <h2 className="text-xl font-black text-[#0E2A1E]">Finora Financial Statement</h2>
                </div>
                <p className="text-xs text-[#5D6D66] mt-1">Official Personal Financial Review &amp; Health Audit</p>
              </div>

              <div className="text-right text-xs">
                <strong className="text-[#0E2A1E] block font-extrabold">{profile.name || currentUser?.name || 'Applicant'}</strong>
                <span className="text-slate-500">{profile.email || currentUser?.email}</span>
                <span className="text-slate-400 block text-[10px]">Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* 1. Income & Expenses Summary */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#0E2A1E] uppercase tracking-wider">1. Cashflow Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                  <span className="text-[#5D6D66] block">Monthly Income</span>
                  <strong className="text-base font-black text-[#0E2A1E]">{inr(totalIncome)}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                  <span className="text-[#5D6D66] block">Monthly Expenses</span>
                  <strong className="text-base font-black text-rose-600">{inr(totalSpending)}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                  <span className="text-[#5D6D66] block">Net Surplus Saved</span>
                  <strong className="text-base font-black text-[#1F7A52]">{inr(Math.max(0, totalIncome - totalSpending))}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                  <span className="text-[#5D6D66] block">Savings Rate</span>
                  <strong className="text-base font-black text-[#0E2A1E]">
                    {totalIncome > 0 ? Math.round(((totalIncome - totalSpending) / totalIncome) * 100) : 0}%
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. Expense Category Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#0E2A1E] uppercase tracking-wider">2. Category Spending Breakdown</h3>
              <div className="border border-[#E2E5E1] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F6F6F2] border-b border-[#E2E5E1] text-[#5D6D66] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Amount (₹)</th>
                      <th className="py-2.5 px-3">% of Outflow</th>
                      <th className="py-2.5 px-3">Transactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E5E1]">
                    {Object.entries(categoryMap).map(([cat, amt]) => (
                      <tr key={cat}>
                        <td className="py-2 px-3 font-semibold text-[#0E2A1E]">{cat}</td>
                        <td className="py-2 px-3 font-bold">{inr(amt)}</td>
                        <td className="py-2 px-3 text-[#5D6D66]">
                          {totalSpending > 0 ? ((amt / totalSpending) * 100).toFixed(1) : '0.0'}%
                        </td>
                        <td className="py-2 px-3 text-slate-500">
                          {debits.filter(t => t.category === cat).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Assets, Liabilities & Net Worth */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#0E2A1E] uppercase tracking-wider">3. Net Worth &amp; Balance Sheet</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#E4F0E9] border border-[#1F7A52]/30 space-y-1">
                  <span className="text-[#1F7A52] font-extrabold uppercase">Total Assets</span>
                  <div className="text-xl font-black text-[#0E2A1E]">{inr(totalSaved + totalInvested)}</div>
                  <span className="text-[#5D6D66]">Savings ({inr(totalSaved)}) + Portfolio ({inr(totalInvested)})</span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                  <span className="text-rose-800 font-extrabold uppercase">Total Liabilities</span>
                  <div className="text-xl font-black text-rose-700">{inr(profile.totalDebt || 0)}</div>
                  <span className="text-rose-900">Loans &amp; credit balances</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0E2A1E] text-white space-y-1">
                  <span className="text-[#34D399] font-extrabold uppercase">Calculated Net Worth</span>
                  <div className="text-xl font-black text-white">{inr(netWorth)}</div>
                  <span className="text-slate-300">Equity balance</span>
                </div>
              </div>
            </div>

            {/* 4. Financial Health Assessment */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#0E2A1E] uppercase tracking-wider">4. Health Assessment &amp; AI Observations</h3>
              <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#E2E5E1]">
                  <span className="font-bold text-[#0E2A1E]">Finora Financial Health Score:</span>
                  <strong className="text-base font-black text-[#1F7A52]">
                    {healthScore.isComplete ? `${healthScore.overallScore}/100` : 'Incomplete Profile'}
                  </strong>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-[#0E2A1E] block">AI Observations:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {healthScore.breakdownNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                    {healthScore.recommendations.map((rec, idx) => (
                      <li key={`rec_${idx}`} className="font-semibold text-[#1F7A52]">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Sign-off footer */}
            <div className="pt-6 border-t border-[#E2E5E1] flex justify-between items-center text-[11px] text-slate-400">
              <span>Generated securely by Finora Financial Intelligence OS</span>
              <span>Confidential Personal Record</span>
            </div>

          </div>
        </div>
      )}

      {/* SIMULATOR TAB */}
      {activeTab === 'simulator' && (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#E2E5E1]">
            <div>
              <h2 className="text-xl font-black text-[#0E2A1E]">Financial Decision Simulator</h2>
              <p className="text-xs text-[#5D6D66]">Test compounding outcomes before committing capital.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F6F6F2] p-6 rounded-2xl border border-[#E2E5E1]">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#5D6D66]">Monthly Investment</span>
                  <span className="text-[#0E2A1E]">{inr(simInvestment)}/mo</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={simInvestment}
                  onChange={(e) => setSimInvestment(Number(e.target.value))}
                  className="w-full accent-[#1F7A52] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#5D6D66]">Investment Horizon</span>
                  <span className="text-[#0E2A1E]">{simYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  value={simYears}
                  onChange={(e) => setSimYears(Number(e.target.value))}
                  className="w-full accent-[#1F7A52] cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white border border-[#E2E5E1]">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Projected Value at 12% CAGR</span>
                <strong className="text-xl font-black text-[#0E2A1E]">{inr(currentPlanVal)}</strong>
              </div>

              <div className="p-4 rounded-xl bg-[#E4F0E9] border border-[#1F7A52]/30">
                <span className="text-[10px] font-bold text-[#1F7A52] uppercase block">Boosted Plan (+₹5,000/mo)</span>
                <strong className="text-xl font-black text-[#1F7A52]">{inr(boostedPlanVal)}</strong>
                <span className="text-[11px] text-[#1F7A52] font-bold block mt-0.5">Gain extra +{inr(boostedPlanVal - currentPlanVal)}!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#E2E5E1]">
            <div>
              <h2 className="text-xl font-black text-[#0E2A1E]">Financial Event Calendar</h2>
              <p className="text-xs text-[#5D6D66]">Track upcoming salary credits, bill payments, SIP auto-debits, and EMIs.</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { date: '1st of Month', event: `Salary Credit (+${inr(totalIncome)})`, type: 'Income', color: 'bg-emerald-100 text-emerald-800' },
              { date: '5th of Month', event: 'Mutual Fund SIP Auto-Debits', type: 'Investment', color: 'bg-blue-100 text-blue-800' },
              { date: '10th of Month', event: 'Broadband & Utility Bills', type: 'Utility', color: 'bg-amber-100 text-amber-800' },
              { date: '15th of Month', event: 'Active Recurring Subscriptions', type: 'Subscription', color: 'bg-purple-100 text-purple-800' },
            ].map((ev, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#1F7A52]" />
                  <div>
                    <strong className="text-[#0E2A1E] block">{ev.event}</strong>
                    <span className="text-[10px] text-slate-500 font-semibold">{ev.date}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${ev.color}`}>{ev.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
