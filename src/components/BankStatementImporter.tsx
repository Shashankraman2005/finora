import React, { useState, useRef } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  AlertTriangle,
  FileText,
  Trash2,
  Edit2,
  ShieldCheck
} from 'lucide-react';
import type { ExpenseCategory } from '../types/finora';
import { OFFICIAL_CATEGORIES } from '../types/finora';
import { StatementParserService, type ParsedTransactionPreview, type ParseStatementResult } from '../services/statementParser';

interface BankStatementImporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BankStatementImporter: React.FC<BankStatementImporterProps> = ({ isOpen, onClose }) => {
  const { transactions, addTransaction, recordStatementUpload, categoryLearnings, learnCategoryOverride } = useFinora();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseStatementResult | null>(null);
  const [rows, setRows] = useState<ParsedTransactionPreview[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const result = await StatementParserService.parseFile(file, transactions, categoryLearnings);
      setParseResult(result);
      setRows(result.transactions);
    } catch (err: any) {
      console.error('File parsing error', err);
      setErrorMessage(err.message || 'Failed to parse statement. Please ensure it is a valid CSV, Excel, or PDF document.');
    } finally {
      setIsProcessing(false);
      // Secure cleanup: clear input value
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCategoryChange = (tempId: string, newCategory: ExpenseCategory) => {
    setRows(prev => prev.map(r => {
      if (r.tempId === tempId) {
        // Learn the category override for this merchant/description
        learnCategoryOverride(r.description, newCategory);
        return { ...r, category: newCategory };
      }
      return r;
    }));
  };

  const handleRemoveRow = (tempId: string) => {
    setRows(prev => prev.filter(r => r.tempId !== tempId));
  };

  const handleConfirmImport = () => {
    if (!parseResult || rows.length === 0) return;

    let importedCount = 0;
    rows.forEach(row => {
      addTransaction({
        date: row.date,
        description: row.description,
        amount: row.amount,
        type: row.type,
        category: row.category,
        subcategory: row.subcategory,
        merchant: row.merchant,
        isEssential: row.category === 'Rent' || row.category === 'Utilities' || row.category === 'Groceries' || row.category === 'Healthcare' || row.category === 'Transportation' || row.category === 'EMIs & Loans',
        source: 'statement'
      });
      importedCount++;
    });

    recordStatementUpload({
      fileName: parseResult.fileName,
      fileType: parseResult.fileType,
      fileSizeKb: parseResult.fileSizeKb,
      uploadDate: new Date().toISOString().split('T')[0],
      transactionsCount: importedCount,
      totalDebits: rows.filter(r => r.type === 'debit').reduce((acc, r) => acc + r.amount, 0),
      totalCredits: rows.filter(r => r.type === 'credit').reduce((acc, r) => acc + r.amount, 0),
      status: 'Imported'
    });

    setSuccessMessage(`Successfully imported ${importedCount} transactions into your financial ledger!`);
    setTimeout(() => {
      setSuccessMessage('');
      setParseResult(null);
      setRows([]);
      onClose();
    }, 1200);
  };

  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white border border-[#E2E5E1] rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-[#101A15] max-h-[90vh] flex flex-col">
        
        {/* TOP HEADER & CLOSE */}
        <div className="flex justify-between items-start flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#E4F0E9] text-[#1F7A52]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0E2A1E]">Bank Statement Importer</h2>
              <p className="text-xs text-[#5D6D66]">
                Upload PDF, CSV or Excel files. Finora auto-extracts dates, amounts, debits/credits, and categorizes transactions.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ALERTS */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-[#E4F0E9] border border-[#1F7A52]/30 text-[#1F7A52] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          
          {/* UPLOAD ZONE */}
          {!parseResult && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E2E5E1] hover:border-[#1F7A52] bg-[#F6F6F2] hover:bg-[#E4F0E9]/30 rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#E2E5E1] text-[#1F7A52] flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0E2A1E]">Click to select bank statement file</h3>
                  <p className="text-xs text-[#5D6D66] mt-1">
                    Supports <strong>PDF</strong>, <strong>CSV</strong>, and <strong>Excel (.xlsx, .xls)</strong> statements from HDFC, SBI, ICICI, Axis, and international banks.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-semibold text-slate-500">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E5E1]">📄 PDF Bank Statements</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E5E1]">📊 CSV Spreadsheets</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E5E1]">📑 Excel Workbooks</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .pdf, .txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] text-xs text-[#5D6D66] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1F7A52] flex-shrink-0" />
                <span>
                  <strong>Data Privacy Guaranteed:</strong> Files are parsed securely in local memory. Finora never uploads or retains raw statement documents on external servers.
                </span>
              </div>
            </div>
          )}

          {/* PARSED PREVIEW TABLE */}
          {parseResult && (
            <div className="space-y-4">
              
              {/* Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F6F6F2] p-4 rounded-2xl border border-[#E2E5E1] text-xs">
                <div>
                  <span className="text-[#5D6D66] block font-medium">File Name</span>
                  <strong className="text-[#0E2A1E] font-bold truncate block">{parseResult.fileName}</strong>
                </div>
                <div>
                  <span className="text-[#5D6D66] block font-medium">Extracted Records</span>
                  <strong className="text-[#1F7A52] font-black">{rows.length} transactions</strong>
                </div>
                <div>
                  <span className="text-[#5D6D66] block font-medium">Total Debits</span>
                  <strong className="text-rose-600 font-bold">{inr(parseResult.totalDebits)}</strong>
                </div>
                <div>
                  <span className="text-[#5D6D66] block font-medium">Duplicates Flagged</span>
                  <strong className={parseResult.duplicateCount > 0 ? "text-amber-600 font-bold" : "text-[#1F7A52] font-bold"}>
                    {parseResult.duplicateCount} detected
                  </strong>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="border border-[#E2E5E1] rounded-2xl overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F6F2] border-b border-[#E2E5E1] text-[#5D6D66] font-bold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Category (Review / Edit)</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E5E1]">
                      {rows.map(row => (
                        <tr key={row.tempId} className={`hover:bg-[#F6F6F2]/50 transition-all ${row.isDuplicate ? 'bg-amber-50/50' : ''}`}>
                          <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                            {row.date}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#0E2A1E]">
                            <div>{row.description}</div>
                            {row.isDuplicate && (
                              <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Potential duplicate
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                            <span className={row.type === 'credit' ? 'text-[#1F7A52]' : 'text-rose-600'}>
                              {row.type === 'credit' ? '+' : '-'}{inr(row.amount)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              row.type === 'credit' ? 'bg-[#E4F0E9] text-[#1F7A52]' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {row.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={row.category}
                              onChange={e => handleCategoryChange(row.tempId, e.target.value as ExpenseCategory)}
                              className="bg-white border border-[#E2E5E1] rounded-lg px-2 py-1 text-xs font-semibold text-[#0E2A1E] focus:outline-none focus:border-[#1F7A52]"
                            >
                              {OFFICIAL_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.tempId)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                              title="Discard row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => { setParseResult(null); setRows([]); }}
                  className="px-4 py-2 rounded-xl border border-[#E2E5E1] text-[#5D6D66] hover:text-[#101A15] font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel &amp; Upload Another File
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={rows.length === 0}
                  className="px-6 py-2.5 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] disabled:opacity-50 text-white font-black text-xs shadow-md shadow-[#0E2A1E]/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                  <span>Confirm &amp; Import {rows.length} Transactions</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
