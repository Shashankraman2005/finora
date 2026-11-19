export interface ApplicantRecord {
  id: string;
  name: string;
  email: string;
  age: number;
  city: string;
  occupation: string;
  monthlyIncome: number;
  totalSpending: number;
  totalInvestments: number;
  totalSavings: number;
  totalDebt: number;
  netWorth: number;
  healthScore: number;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  status: 'Verified' | 'Active Applicant' | 'Under Review' | 'High Net Worth';
  submittedAt: string;
  topAssetClass: string;
}

const INDIAN_CITIES = ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh'];
const OCCUPATIONS = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'Financial Analyst', 
  'UX Designer', 'Marketing Lead', 'Management Consultant', 'DevOps Specialist', 
  'Operations Manager', 'Architect', 'Doctor', 'Chartered Accountant', 'Entrepreneur'
];
const ASSET_CLASSES = ['Mutual Funds & Equity', 'Direct Stocks', 'US Tech Equity', 'Gold & Debt Funds', 'Real Estate & Liquid Cash'];

const FIRST_NAMES = [
  'Arjun', 'Priya', 'Varsha', 'Sumit', 'Rahul', 'Ananya', 'Vikram', 'Deepa', 'Sneha', 'Rajesh',
  'Kavita', 'Rohan', 'Neha', 'Aditya', 'Meera', 'Siddharth', 'Tanvi', 'Karan', 'Pooja', 'Amit',
  'Ishita', 'Gaurav', 'Riya', 'Nikhil', 'Divya', 'Aakash', 'Swati', 'Manish', 'Shreya', 'Abhishek',
  'Radhika', 'Vishal', 'Tarun', 'Anushka', 'Vivek', 'Shruti', 'Harsh', 'Preeti', 'Yash', 'Bhavna',
  'Sanjay', 'Komal', 'Deepak', 'Nisha', 'Alok', 'Sonam', 'Pankaj', 'Sonal', 'Varun', 'Ritu'
];

const LAST_NAMES = [
  'Patel', 'Sharma', 'Nair', 'Mehta', 'Verma', 'Kulkarni', 'Gupta', 'Sen', 'Joshi', 'Roy',
  'Iyer', 'Reddy', 'Deshmukh', 'Chawla', 'Agarwal', 'Bhat', 'Malhotra', 'Sinha', 'Kapoor', 'Rao',
  'Mukherjee', 'Trivedi', 'Narang', 'Pillai', 'Shetty', 'Bhasin', 'Saxena', 'Choudhury', 'Dutta', 'Pandey'
];

// Helper to deterministically construct 50 rich fake applicants
export const generate50Applicants = (): ApplicantRecord[] => {
  const list: ApplicantRecord[] = [];

  for (let i = 0; i < 50; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[i % LAST_NAMES.length];
    const name = `${fn} ${ln}`;
    const cleanFn = fn.toLowerCase();
    const cleanLn = ln.toLowerCase();
    const email = `${cleanFn}.${cleanLn}${i + 1}@gmail.com`;

    const age = 23 + ((i * 3) % 27);
    const city = INDIAN_CITIES[i % INDIAN_CITIES.length];
    const occupation = OCCUPATIONS[i % OCCUPATIONS.length];
    
    // Vary monthly income between ₹45,000 and ₹320,000
    const monthlyIncome = Math.round((45000 + ((i * 12345) % 275000)) / 1000) * 1000;
    const spendingPct = 0.25 + ((i % 5) * 0.08); // 25% to 57%
    const totalSpending = Math.round(monthlyIncome * spendingPct);
    
    const investmentMultiplier = 2 + (i % 12);
    const totalInvestments = Math.round(monthlyIncome * investmentMultiplier * 3.5);
    const totalSavings = Math.round(monthlyIncome * (1.5 + (i % 6) * 0.8));
    const totalDebt = (i % 3 === 0) ? Math.round(monthlyIncome * (2 + (i % 8))) : 0;
    
    const netWorth = (totalSavings + totalInvestments) - totalDebt;
    
    let healthScore = Math.min(98, Math.max(42, Math.round(55 + (netWorth / 500000) * 5 + (100 - (totalSpending / monthlyIncome) * 100) * 0.3)));

    const riskProfiles: ('Conservative' | 'Moderate' | 'Aggressive')[] = ['Moderate', 'Aggressive', 'Conservative'];
    const riskProfile = riskProfiles[i % 3];

    const statuses: ('Verified' | 'Active Applicant' | 'Under Review' | 'High Net Worth')[] = [
      'Verified', 'Active Applicant', 'Under Review', 'High Net Worth'
    ];
    const status = netWorth > 1500000 ? 'High Net Worth' : statuses[i % 4];

    const submittedDaysAgo = (i % 30) + 1;
    const date = new Date(Date.now() - submittedDaysAgo * 86400000);
    const submittedAt = date.toISOString().split('T')[0];

    const topAssetClass = ASSET_CLASSES[i % ASSET_CLASSES.length];

    list.push({
      id: `app_50_${i + 1001}`,
      name,
      email,
      age,
      city,
      occupation,
      monthlyIncome,
      totalSpending,
      totalInvestments,
      totalSavings,
      totalDebt,
      netWorth,
      healthScore,
      riskProfile,
      status,
      submittedAt,
      topAssetClass
    });
  }

  return list;
};

export const MOCK_50_APPLICANTS = generate50Applicants();
