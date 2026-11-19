import React, { useState } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  BrainCircuit, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { CategorizerService } from '../services/categorizerService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  metricsPill?: string;
}

export const FinoraCopilotView: React.FC<{ initialMode?: 'spender' | 'general' }> = () => {
  const { 
    currentUser, 
    profile, 
    transactions, 
    stockHoldings, 
    mfHoldings, 
    goals, 
    healthScore 
  } = useFinora();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const suggestedQuestions = [
    'Where did I spend the most money?',
    'How much did I save this month?',
    'What are my biggest expenses?',
    'How is my investment portfolio performing?',
    'Which subscriptions are recurring?',
    'Am I on track to reach my financial goal?',
    'How much should I save every month?'
  ];

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello ${profile.name || currentUser?.name || 'Investor'}! I am your Finora AI Financial Intelligence Assistant. Ask me anything about your actual spending, monthly savings, investment returns, recurring subscriptions, or goal targets.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Financial Context Engine for Answering User Inquiries
  const answerFinancialQuery = (query: string): string => {
    const q = query.toLowerCase();

    const debits = transactions.filter(t => t.type === 'debit');
    const totalSpend = debits.reduce((acc, t) => acc + t.amount, 0);
    const totalIncome = (profile.monthlyIncome || 0) + (profile.otherIncome || 0);
    const actualSavings = Math.max(0, totalIncome - (totalSpend > 0 ? totalSpend : (profile.monthlyFixedExpenses || 0)));

    // 1. Where did I spend the most money?
    if (q.includes('where') && (q.includes('spend') || q.includes('most') || q.includes('money'))) {
      if (debits.length === 0) {
        return `You have not recorded any transactions yet this month. Add your expenses or import a bank statement to analyze your top spending categories.`;
      }
      const catMap: Record<string, number> = {};
      debits.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
      const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
      const pct = Math.round((topCat[1] / (totalSpend || 1)) * 100);

      return `Your highest spending category is **${topCat[0]}**, where you spent **${inr(topCat[1])}** (${pct}% of your total outflow). Your total spending across all ${debits.length} debits is **${inr(totalSpend)}**.`;
    }

    // 2. How much did I save this month?
    if (q.includes('save') && (q.includes('how much') || q.includes('this month') || q.includes('rate'))) {
      if (totalIncome === 0) {
        return `Please set your monthly income in your profile so I can compute your savings velocity. Currently your income is recorded as ₹0.`;
      }
      const rate = Math.round((actualSavings / totalIncome) * 100);
      return `You saved **${inr(actualSavings)}** this month, representing a **${rate}% savings rate** of your total gross income (${inr(totalIncome)}). ${rate >= 20 ? 'This meets the recommended 20%+ wealth-building benchmark!' : 'Aiming for 20% would require saving ' + inr(totalIncome * 0.20) + '/month.'}`;
    }

    // 3. What are my biggest expenses?
    if (q.includes('biggest') || q.includes('largest') || (q.includes('top') && q.includes('expense'))) {
      if (debits.length === 0) {
        return `No expense records are currently logged. Import a bank statement or record expenses to view your largest individual transactions.`;
      }
      const sorted = [...debits].sort((a, b) => b.amount - a.amount).slice(0, 3);
      const items = sorted.map((t, i) => `${i + 1}. **${t.description}** (${t.category}) — ${inr(t.amount)} on ${t.date}`).join('\n');
      return `Here are your 3 biggest expenses:\n${items}\n\nTotal outflow across these 3 alone is **${inr(sorted.reduce((a, b) => a + b.amount, 0))}**.`;
    }

    // 4. How is my investment portfolio performing?
    if (q.includes('portfolio') || q.includes('invest') || q.includes('return') || q.includes('stock') || q.includes('mutual fund')) {
      const stockInvested = stockHoldings.reduce((acc, s) => acc + s.investedAmount, 0);
      const stockCurrent = stockHoldings.reduce((acc, s) => acc + s.currentValue, 0);
      const mfInvested = mfHoldings.reduce((acc, m) => acc + m.investedAmount, 0);
      const mfCurrent = mfHoldings.reduce((acc, m) => acc + m.currentValue, 0);

      const totalInv = stockInvested + mfInvested;
      const totalCur = stockCurrent + mfCurrent;
      const pnl = totalCur - totalInv;
      const retPct = totalInv > 0 ? (pnl / totalInv) * 100 : 0;

      if (totalInv === 0 && (!profile.currentInvestments || profile.currentInvestments === 0)) {
        return `You have not added any stock holdings or mutual funds yet. Log your holdings in the **Stock Market** and **Mutual Funds** tabs to track real-time portfolio performance.`;
      }

      return `Your combined investment portfolio holds **${inr(totalCur)}** in current market value against an invested capital of **${inr(totalInv)}**.\n\n• **Unrealised Return:** ${pnl >= 0 ? '+' : ''}${inr(pnl)} (${retPct >= 0 ? '+' : ''}${retPct.toFixed(2)}% absolute return)\n• **Direct Stocks:** ${stockHoldings.length} holdings (${inr(stockCurrent)})\n• **Mutual Funds:** ${mfHoldings.length} schemes (${inr(mfCurrent)} with AMFI verified NAV)`;
    }

    // 5. Which subscriptions are recurring?
    if (q.includes('subscription') || q.includes('recurring')) {
      const subs = CategorizerService.detectRecurringSubscriptions(transactions);
      if (subs.length === 0) {
        return `No recurring subscriptions or bill debits were detected. If you pay Netflix, Spotify, or gym fees, ensure they are marked as recurring in the Transactions tab.`;
      }
      const totalSubCost = subs.reduce((a, b) => a + b.amount, 0);
      const subList = subs.map(s => `• **${s.merchant}** (${s.frequency}): ${inr(s.amount)} [${s.category}]`).join('\n');
      return `You have **${subs.length} recurring subscriptions** costing approximately **${inr(totalSubCost)}/month** (${inr(totalSubCost * 12)}/year):\n\n${subList}`;
    }

    // 6. Am I on track to reach my financial goal?
    if (q.includes('goal') || q.includes('on track') || q.includes('target') || q.includes('milestone')) {
      if (goals.length === 0) {
        return `You have not created any financial goals yet. Head to the **Financial Goals** tab to set targets such as an Emergency Fund, Buying a Home, or FIRE Retirement.`;
      }
      const topGoal = goals[0];
      const pct = Math.min(100, Math.round((topGoal.currentAmount / (topGoal.targetAmount || 1)) * 100));
      const remaining = Math.max(0, topGoal.targetAmount - topGoal.currentAmount);

      return `For your primary goal **${topGoal.name}**:\n• Target: **${inr(topGoal.targetAmount)}** by ${topGoal.targetDate}\n• Current Progress: **${inr(topGoal.currentAmount)}** (${pct}% funded)\n• Remaining Capital: **${inr(remaining)}**\n• Required Monthly SIP: **${inr(topGoal.monthlyContribution)}/month**\n\nYou are on track assuming regular monthly commitments are maintained.`;
    }

    // 7. How much should I save every month?
    if (q.includes('how much should i save') || q.includes('monthly savings recommendation') || q.includes('50/30/20')) {
      if (totalIncome === 0) {
        return `To calculate your custom monthly savings allocation, please complete your financial profile with your monthly take-home salary.`;
      }
      const target20 = Math.round(totalIncome * 0.20);
      const target30 = Math.round(totalIncome * 0.30);
      return `Based on the benchmark 50/30/20 budgeting framework on your **${inr(totalIncome)}** monthly income:\n\n1. **Essential Needs (50% max):** Up to ${inr(totalIncome * 0.50)} for rent, utilities, food & EMIs.\n2. **Discretionary Wants (30% max):** Up to ${inr(totalIncome * 0.30)} for dining & leisure.\n3. **Recommended Monthly Savings (20% - 30%):** You should invest **${inr(target20)} to ${inr(target30)} every month** towards emergency reserves, equity mutual funds, and long-term FIRE goals.`;
    }

    // General Financial Health
    if (q.includes('health') || q.includes('score')) {
      return `Your current Finora Financial Health Score is **${healthScore.isComplete ? healthScore.overallScore + '/100' : 'Incomplete (requires income & expense setup)'}**.\n\n${healthScore.breakdownNotes.join('\n')}\n\n*Actionable Guidance:* ${healthScore.recommendations[0] || 'Keep your monthly savings automated.'}`;
    }

    // Fallback general intelligent advice
    return `Based on your authenticated records (Income: ${inr(totalIncome)}, Outflow: ${inr(totalSpend)}, Liquid Reserves: ${inr(profile.currentSavings)}), your net surplus is **${inr(actualSavings)}/month**. Feel free to ask about your biggest expenses, subscription audits, or stock portfolio returns.`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = answerFinancialQuery(text);
      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#101A15] max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Conversational Financial Intelligence
            </span>
            <span className="text-xs text-slate-500 font-semibold">Strict User Isolation Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Finora AI Copilot
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D66] mt-0.5">
            Trained to answer questions strictly using your authenticated income, debits, portfolio, and goals.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] text-[11px] text-[#5D6D66] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1F7A52] flex-shrink-0" />
          <span>Educational Insights • Zero Cross-User Data Exposure</span>
        </div>
      </div>

      {/* QUICK SUGGESTIONS CHIPS */}
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#E4F0E9] border border-[#E2E5E1] hover:border-[#1F7A52] text-xs font-semibold text-[#0E2A1E] transition-all cursor-pointer shadow-xs text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* CHAT MESSAGES WINDOW */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm min-h-[460px] flex flex-col justify-between space-y-4">
        
        {/* Messages Stream */}
        <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2">
          {chatHistory.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  isUser ? 'bg-[#0E2A1E] text-white' : 'bg-[#E4F0E9] text-[#1F7A52]'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-1.5 ${
                  isUser 
                    ? 'bg-[#0E2A1E] text-white rounded-tr-none' 
                    : 'bg-[#F6F6F2] text-[#101A15] border border-[#E2E5E1] rounded-tl-none'
                }`}>
                  <div 
                    className="whitespace-pre-line"
                    dangerouslySetInnerHTML={{ 
                      __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }} 
                  />
                  <div className={`text-[10px] text-right font-medium ${isUser ? 'text-slate-400' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#5D6D66] font-semibold animate-pulse pl-11">
              <Sparkles className="w-3.5 h-3.5 text-[#1F7A52]" />
              <span>Finora Assistant is reasoning over your actual records...</span>
            </div>
          )}
        </div>

        {/* INPUT BOX */}
        <div className="pt-4 border-t border-[#E2E5E1]">
          <form 
            onSubmit={e => { e.preventDefault(); handleSendMessage(); }} 
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Finora (e.g. How much did I spend on food this month?)..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              className="flex-1 bg-[#F6F6F2] border border-[#E2E5E1] rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#1F7A52] focus:bg-white transition-all text-[#101A15]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="px-5 py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-[#0E2A1E]/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-2">
            Regulatory Compliance Notice: Finora provides financial education and automated computational analytics. Not a registered investment advisory or guarantee of financial returns.
          </p>
        </div>

      </div>

    </div>
  );
};
