export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'NGN';

export interface BankCard {
  id: string;
  type: 'debit' | 'credit';
  last4: string;
  expiry: string;
  status: 'active' | 'frozen';
  spendingLimit: number;
  pin: string;
}

export interface BankTransaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'Submitted' | 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Rejected';
  date: string;
  icon?: string;
}

export interface Beneficiary {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: 'Submitted' | 'Pending' | 'Completed' | 'Rejected';
}

export interface CheckDeposit {
  id: string;
  amount: number;
  frontImage?: string;
  backImage?: string;
  status: 'Submitted' | 'Pending' | 'Completed' | 'Rejected';
  date: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmationPin: string; // 6-digit
  transactionPin: string;  // 4-digit
  photo?: string;
  checkingBalance: number;
  savingsBalance: number;
  bitcoinBalance: number; // in BTC
  checkingLast4: string;
  savingsLast4: string;
  bitcoinAddress: string;
  cards: BankCard[];
  transactions: BankTransaction[];
  beneficiaries: Beneficiary[];
  checkDeposits: CheckDeposit[];
  currency: CurrencyCode;
  isFrozen: boolean;
  freezeMessage?: string;
  allowBeneficiaryRequest: boolean;
  features: {
    checkDeposit: boolean;
    statements: boolean;
    linkedAccounts: boolean;
    scheduled: boolean;
    jointAccounts: boolean;
    overdraft: boolean;
    creditScore: boolean;
    accountNumbers: boolean;
    alerts: boolean;
    cardControls: boolean;
  };
  creditScore: number;
  overdraftEnabled: boolean;
  overdraftLimit: number;
  createdAt: string;
  lastLogin?: string;
  devices: string[];
}

export interface SubAdmin {
  id: string;
  username: string;
  password: string;
  assignedUserId: string;
  active: boolean;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  code?: string;
  date: string;
  read: boolean;
}

export interface AdminSession {
  type: 'super' | 'sub';
  username: string;
  assignedUserId?: string;
}
