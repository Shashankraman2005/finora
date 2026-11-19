import * as XLSX from 'xlsx';
import type { ExpenseCategory, ExpenseSubcategory, ExpenseTransaction, UserCategoryLearning } from '../types/finora';
import { CategorizerService } from './categorizerService';

export interface ParsedTransactionPreview {
  tempId: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  amount: number;
  type: 'debit' | 'credit';
  category: ExpenseCategory;
  subcategory: ExpenseSubcategory;
  merchant: string;
  isDuplicate: boolean;
  duplicateReason?: string;
}

export interface ParseStatementResult {
  fileName: string;
  fileType: 'PDF' | 'CSV' | 'Excel';
  fileSizeKb: number;
  transactions: ParsedTransactionPreview[];
  totalDebits: number;
  totalCredits: number;
  duplicateCount: number;
}

export class StatementParserService {
  /**
   * Parse CSV, Excel or Text bank statement file buffer
   */
  public static async parseFile(
    file: File,
    existingTransactions: ExpenseTransaction[] = [],
    userLearnings: UserCategoryLearning[] = []
  ): Promise<ParseStatementResult> {
    const fileName = file.name;
    const fileType = fileName.endsWith('.csv') 
      ? 'CSV' 
      : (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) 
        ? 'Excel' 
        : 'PDF';
    const fileSizeKb = Math.round(file.size / 1024);

    let rawRows: Array<Record<string, any>> = [];

    if (fileType === 'Excel' || fileType === 'CSV') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    } else {
      // PDF or text file
      const text = await file.text();
      rawRows = this.parseTextLines(text);
    }

    const transactions: ParsedTransactionPreview[] = [];
    let totalDebits = 0;
    let totalCredits = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const parsed = this.extractRowFields(row, i, userLearnings);
      if (!parsed) continue;

      // Duplicate check against existing user transactions
      const duplicate = existingTransactions.find(t => 
        t.date === parsed.date && 
        Math.abs(t.amount - parsed.amount) < 0.01 && 
        (t.description.toLowerCase().trim() === parsed.description.toLowerCase().trim() ||
         t.merchant.toLowerCase().trim() === parsed.merchant.toLowerCase().trim())
      );

      if (duplicate) {
        parsed.isDuplicate = true;
        parsed.duplicateReason = `Matches existing record on ${duplicate.date} (₹${duplicate.amount})`;
      }

      if (parsed.type === 'debit') totalDebits += parsed.amount;
      else totalCredits += parsed.amount;

      transactions.push(parsed);
    }

    const duplicateCount = transactions.filter(t => t.isDuplicate).length;

    return {
      fileName,
      fileType,
      fileSizeKb,
      transactions,
      totalDebits,
      totalCredits,
      duplicateCount
    };
  }

  /**
   * Extract transaction fields from arbitrary bank statement headers (HDFC, SBI, ICICI, Axis, Chase, etc.)
   */
  private static extractRowFields(
    row: Record<string, any>,
    index: number,
    userLearnings: UserCategoryLearning[]
  ): ParsedTransactionPreview | null {
    const keys = Object.keys(row);
    if (keys.length === 0) return null;

    let dateVal = '';
    let descVal = '';
    let debitVal = 0;
    let creditVal = 0;

    for (const key of keys) {
      const k = key.toLowerCase().trim();
      const val = row[key];

      // Date match
      if (!dateVal && (k.includes('date') || k.includes('txn dt') || k.includes('value date') || k === 'dt')) {
        dateVal = this.normalizeDate(val);
      }
      // Description / Narration match
      else if (!descVal && (k.includes('desc') || k.includes('narration') || k.includes('particulars') || k.includes('details') || k.includes('remark'))) {
        descVal = String(val).trim();
      }
      // Debit amount match
      else if (k.includes('debit') || k.includes('withdrawal') || k.includes('dr')) {
        debitVal = this.parseAmount(val);
      }
      // Credit amount match
      else if (k.includes('credit') || k.includes('deposit') || k.includes('cr')) {
        creditVal = this.parseAmount(val);
      }
      // Generic amount match if no debit/credit column
      else if (k.includes('amount') || k === 'amt') {
        const amt = this.parseAmount(val);
        if (amt < 0) debitVal = Math.abs(amt);
        else debitVal = amt;
      }
    }

    // If description is empty, check any long string field
    if (!descVal) {
      for (const key of keys) {
        const val = String(row[key]);
        if (val.length > 5 && isNaN(Number(val))) {
          descVal = val;
          break;
        }
      }
    }

    if (!descVal && debitVal === 0 && creditVal === 0) return null;

    // Default to today if date not found
    if (!dateVal) dateVal = new Date().toISOString().split('T')[0];

    const isCredit = creditVal > 0 && debitVal === 0;
    const amount = isCredit ? creditVal : (debitVal || creditVal || 0);
    const type: 'debit' | 'credit' = isCredit ? 'credit' : 'debit';

    const catResult = CategorizerService.categorize(descVal || 'General Transaction', userLearnings);

    return {
      tempId: `stmt_row_${index}_${Date.now()}`,
      date: dateVal,
      description: descVal || 'Bank Statement Entry',
      debit: debitVal,
      credit: creditVal,
      amount,
      type,
      category: isCredit ? 'Other Expenses' : catResult.category,
      subcategory: catResult.subcategory,
      merchant: catResult.merchant,
      isDuplicate: false
    };
  }

  private static parseTextLines(text: string): Array<Record<string, any>> {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const results: Array<Record<string, any>> = [];

    for (const line of lines) {
      // Matches: 2026-10-05 or 05/10/2026 or 05-Oct-2026 followed by description and amounts
      const dateMatch = line.match(/(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{1,2}-[A-Za-z]{3}-\d{2,4})/);
      const amountMatches = line.match(/[\d,]+\.\d{2}/g);

      if (dateMatch && amountMatches && amountMatches.length > 0) {
        const date = dateMatch[0];
        const amounts = amountMatches.map(a => parseFloat(a.replace(/,/g, '')));
        const desc = line.replace(date, '').replace(amountMatches.join(' '), '').trim();

        results.push({
          Date: date,
          Description: desc || 'Statement Transaction',
          Debit: amounts[0] || 0,
          Credit: amounts[1] || 0
        });
      }
    }

    return results;
  }

  private static normalizeDate(val: any): string {
    if (val instanceof Date && !isNaN(val.getTime())) {
      return val.toISOString().split('T')[0];
    }
    const str = String(val).trim();
    if (!str) return '';

    // If already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    // Format DD/MM/YYYY
    const dmy = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmy) {
      const day = dmy[1].padStart(2, '0');
      const month = dmy[2].padStart(2, '0');
      const year = dmy[3];
      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }

    return '';
  }

  private static parseAmount(val: any): number {
    if (typeof val === 'number') return Math.abs(val);
    const s = String(val).replace(/[^\d.-]/g, '');
    const num = parseFloat(s);
    return isNaN(num) ? 0 : Math.abs(num);
  }
}
