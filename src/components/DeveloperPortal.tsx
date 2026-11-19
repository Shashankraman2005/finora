import React, { useState } from 'react';
import { useFinora } from '../data/FinoraContext';
import type { ApplicantRecord } from '../data/mockApplicants';
import { 
  Code2, 
  Users, 
  Search, 
  ShieldCheck, 
  Download, 
  UserPlus, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  X,
  Database,
  BarChart3
} from 'lucide-react';

export const DeveloperPortal: React.FC = () => {
  const { applicants, addApplicant, isDeveloper, developerEmail, logoutDeveloper } = useFinora();

  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'netWorth' | 'income' | 'score' | 'date'>('netWorth');

  // Inspected Applicant State
  const [inspectedApplicant, setInspectedApplicant] = useState<ApplicantRecord | null>(null);

  // New Applicant Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newIncome, setNewIncome] = useState(85000);
  const [newCity, setNewCity] = useState('Mumbai');
  const [newRisk, setNewRisk] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');

  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  // Filter & Sort logic
  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.occupation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'All' || app.riskProfile === riskFilter;
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'netWorth') return b.netWorth - a.netWorth;
    if (sortBy === 'income') return b.monthlyIncome - a.monthlyIncome;
    if (sortBy === 'score') return b.healthScore - a.healthScore;
    if (sortBy === 'date') return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    return 0;
  });

  // Calculate Aggregates across all applicants
  const totalApplicantsCount = applicants.length;
  const aggregateNetWorth = applicants.reduce((acc, a) => acc + a.netWorth, 0);
  const avgMonthlyIncome = Math.round(applicants.reduce((acc, a) => acc + a.monthlyIncome, 0) / (totalApplicantsCount || 1));
  const avgHealthScore = Math.round(applicants.reduce((acc, a) => acc + a.healthScore, 0) / (totalApplicantsCount || 1));

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Age', 'City', 'Occupation', 'Monthly Income', 'Total Spending', 'Total Investments', 'Total Savings', 'Net Worth', 'Health Score', 'Risk Profile', 'Status', 'Submitted At'];
    const rows = applicants.map(a => [
      a.id, `"${a.name}"`, a.email, a.age, `"${a.city}"`, `"${a.occupation}"`,
      a.monthlyIncome, a.totalSpending, a.totalInvestments, a.totalSavings, a.netWorth, a.healthScore, a.riskProfile, a.status, a.submittedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finora_50_applicants_developer_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    addApplicant({
      name: newName,
      email: newEmail,
      age: 28,
      city: newCity,
      occupation: 'Software Developer',
      monthlyIncome: newIncome,
      totalSpending: Math.round(newIncome * 0.4),
      totalInvestments: Math.round(newIncome * 3),
      totalSavings: Math.round(newIncome * 1.2),
      totalDebt: 0,
      netWorth: Math.round(newIncome * 4.2),
      healthScore: 78,
      riskProfile: newRisk,
      status: 'Verified',
      topAssetClass: 'Direct Equity & SIP',
    });

    setNewName('');
    setNewEmail('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* DEVELOPER HEADER CARD */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-[#0E2A1E] text-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-purple-800/40">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black flex items-center gap-1.5 border border-purple-500/30">
              <Code2 className="w-3.5 h-3.5" /> Developer Section &amp; Data Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Restricted Domain: @finora.com
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Developer Admin Portal &amp; Applicant Central
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Logged in as authorized developer: <strong className="text-purple-300 font-mono underline">{developerEmail || 'shashankraman@finora.com'}</strong>. Access, inspect, and manage all 50+ applicant profiles and financial submissions in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-300" /> Export 50 Applicants CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Mock Applicant
          </button>
          {isDeveloper && (
            <button
              onClick={logoutDeveloper}
              className="px-3 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all cursor-pointer"
            >
              Exit Dev Mode
            </button>
          )}
        </div>
      </div>

      {/* TOP SYSTEM AGGREGATES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Total Applicants</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-[#0E2A1E]">{totalApplicantsCount}</div>
          <span className="text-[11px] text-purple-700 font-semibold">50 Fake Profiles + Live Submissions</span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Aggregate Net Worth</span>
            <BarChart3 className="w-4 h-4 text-[#1F7A52]" />
          </div>
          <div className="text-2xl font-black text-[#1F7A52]">{inr(aggregateNetWorth)}</div>
          <span className="text-[11px] text-slate-500 font-semibold">Total capital across developer records</span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Avg Monthly Income</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#0E2A1E]">{inr(avgMonthlyIncome)}</div>
          <span className="text-[11px] text-amber-600 font-semibold">Per applicant average</span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Avg Health Score</span>
            <Database className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700">{avgHealthScore} / 100</div>
          <span className="text-[11px] text-teal-600 font-semibold">Calculated from engine math</span>
        </div>

      </div>

      {/* APPLICANT DIRECTORY SEARCH & CONTROLS */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-6">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0E2A1E]">50 Applicants Financial Directory</h2>
            <p className="text-xs text-[#5D6D66]">All applicant data submitted or stored in the developer database.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search name, email, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-bold text-[#101A15] focus:outline-none focus:border-purple-600"
            >
              <option value="All">Risk: All</option>
              <option value="Aggressive">Aggressive</option>
              <option value="Moderate">Moderate</option>
              <option value="Conservative">Conservative</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-bold text-[#101A15] focus:outline-none focus:border-purple-600"
            >
              <option value="All">Status: All</option>
              <option value="Verified">Verified</option>
              <option value="Active Applicant">Active Applicant</option>
              <option value="High Net Worth">High Net Worth</option>
              <option value="Under Review">Under Review</option>
            </select>

            {/* Sort Control */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-purple-50 border border-purple-200 text-purple-900 rounded-xl px-3 py-2 text-xs font-extrabold focus:outline-none"
            >
              <option value="netWorth">Sort: Highest Net Worth</option>
              <option value="income">Sort: Monthly Income</option>
              <option value="score">Sort: Health Score</option>
              <option value="date">Sort: Recent Submission</option>
            </select>
          </div>
        </div>

        {/* APPLICANT DIRECTORY TABLE */}
        <div className="overflow-x-auto border border-[#E2E5E1] rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E2A1E] text-white font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Applicant Name &amp; Email</th>
                <th className="p-3.5">Location &amp; Occupation</th>
                <th className="p-3.5 text-right">Monthly Income</th>
                <th className="p-3.5 text-right">Monthly Spending</th>
                <th className="p-3.5 text-right">Net Worth</th>
                <th className="p-3.5 text-center">Health Score</th>
                <th className="p-3.5 text-center">Risk Profile</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5E1] bg-white">
              {filteredApplicants.map((app) => (
                <tr key={app.id} className="hover:bg-purple-50/40 transition-all">
                  <td className="p-3.5">
                    <div className="font-bold text-[#0E2A1E]">{app.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{app.email}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{app.city} ({app.age} yrs)</div>
                    <div className="text-[11px] text-slate-500">{app.occupation}</div>
                  </td>

                  <td className="p-3.5 text-right font-black text-[#1F7A52]">
                    {inr(app.monthlyIncome)}
                  </td>

                  <td className="p-3.5 text-right font-bold text-rose-600">
                    {inr(app.totalSpending)}
                  </td>

                  <td className="p-3.5 text-right font-black text-[#0E2A1E]">
                    {inr(app.netWorth)}
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full font-black text-[11px] ${
                      app.healthScore >= 85 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : app.healthScore >= 70 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.healthScore} / 100
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {app.riskProfile}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      app.status === 'High Net Worth' 
                        ? 'bg-purple-100 text-purple-900 border border-purple-300' 
                        : app.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => setInspectedApplicant(app)}
                      className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 transition-all cursor-pointer"
                      title="Inspect Full Applicant JSON & Metrics"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* APPLICANT INSPECTION DRAWER / MODAL */}
      {inspectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-[#101A15]">
            
            <div className="flex justify-between items-start border-b border-[#E2E5E1] pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider">
                  Developer Data Inspector: {inspectedApplicant.id}
                </span>
                <h3 className="text-2xl font-black text-[#0E2A1E] mt-1">{inspectedApplicant.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{inspectedApplicant.email} • {inspectedApplicant.city}</p>
              </div>

              <button
                onClick={() => setInspectedApplicant(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Monthly Income</span>
                <div className="text-base font-black text-[#1F7A52] mt-0.5">{inr(inspectedApplicant.monthlyIncome)}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Spending</span>
                <div className="text-base font-black text-rose-600 mt-0.5">{inr(inspectedApplicant.totalSpending)}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Investments</span>
                <div className="text-base font-black text-[#0E2A1E] mt-0.5">{inr(inspectedApplicant.totalInvestments)}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Calculated Net Worth</span>
                <div className="text-base font-black text-[#0E2A1E] mt-0.5">{inr(inspectedApplicant.netWorth)}</div>
              </div>
            </div>

            {/* RAW DEVELOPER JSON RECORD */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Raw Applicant Database Schema (Developer Storage)
              </h4>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto border border-slate-800">
                {JSON.stringify(inspectedApplicant, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setInspectedApplicant(null)}
                className="px-6 py-2.5 rounded-xl bg-[#0E2A1E] text-white font-black text-xs shadow-md"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD MOCK APPLICANT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative text-[#101A15]">
            <div className="flex justify-between items-center border-b border-[#E2E5E1] pb-3">
              <h3 className="text-lg font-black text-[#0E2A1E]">Add New Mock Applicant Record</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-600 mb-1">Applicant Name</label>
                <input
                  type="text"
                  required
                  placeholder="Varsha Nair"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Applicant Email</label>
                <input
                  type="email"
                  required
                  placeholder="varsha.nair@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={newIncome}
                    onChange={(e) => setNewIncome(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Risk Profile</label>
                <select
                  value={newRisk}
                  onChange={(e) => setNewRisk(e.target.value as any)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                >
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                  <option value="Conservative">Conservative</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-black shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Applicant to Developer Database
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
