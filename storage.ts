import {
  UserAccount,
  SubAdmin,
  SimulatedEmail,
  AdminSession,
  CurrencyCode,
  BankTransaction,
} from './types';

export const USERS_DB_KEY = 'union_peak_users_db';
export const SUB_ADMINS_DB_KEY = 'union_peak_sub_admins_db';
export const ACTIVE_USER_ID_KEY = 'union_peak_active_user_id';
export const ADMIN_SESSION_KEY = 'union_peak_admin_session';
export const SIMULATED_EMAILS_KEY = 'union_peak_simulated_emails';
export const DEVICE_ID_KEY = 'union_peak_device_id';
export const THEME_KEY = 'union_peak_theme';
export const EXCHANGE_RATES_KEY = 'union_peak_exchange_rates';

export const SUPER_ADMIN = {
  username: 'adminblessed',
  password: 'Blessed321$',
};

// Approximate rates relative to USD
export const DEFAULT_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  NGN: 1600,
};

export const BTC_USD = 91400;

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function generateSixDigitCode(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'device_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function notifyChange() {
  window.dispatchEvent(new CustomEvent('union_peak_db_changed'));
}

// ---------- Users ----------
export function getUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  notifyChange();
}

export function getUserById(id: string): UserAccount | undefined {
  return getUsers().find((u) => u.id === id);
}

export function updateUser(id: string, patch: Partial<UserAccount>) {
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  saveUsers(users);
}

export function createUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmationPin: string;
  transactionPin: string;
}): UserAccount {
  const user: UserAccount = {
    id: generateId('usr'),
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
    confirmationPin: data.confirmationPin,
    transactionPin: data.transactionPin,
    checkingBalance: 18450.75,
    savingsBalance: 64800.0,
    bitcoinBalance: 0.6425,
    checkingLast4: '7291',
    savingsLast4: '1042',
    bitcoinAddress: 'bc1qxy2kdyzj6v0xvr0s9z7f2p813m5n7q9r2t',
    cards: [
      {
        id: generateId('card'),
        type: 'debit',
        last4: '4561',
        expiry: '09/28',
        status: 'active',
        spendingLimit: 5000,
        pin: '1234',
      },
    ],
    transactions: [
      {
        id: generateId('tx'),
        merchant: 'Starbucks Coffee',
        category: 'Dining',
        amount: -6.45,
        type: 'debit',
        status: 'Completed',
        date: new Date().toISOString(),
      },
      {
        id: generateId('tx'),
        merchant: 'Whole Foods Market',
        category: 'Groceries',
        amount: -142.18,
        type: 'debit',
        status: 'Completed',
        date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: generateId('tx'),
        merchant: 'Uber Black Ride',
        category: 'Transport',
        amount: -48.5,
        type: 'debit',
        status: 'Completed',
        date: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: generateId('tx'),
        merchant: 'Apex Group Payroll',
        category: 'Income',
        amount: 4850.0,
        type: 'credit',
        status: 'Completed',
        date: new Date(Date.now() - 259200000).toISOString(),
      },
    ],
    beneficiaries: [],
    checkDeposits: [],
    currency: 'USD',
    isFrozen: false,
    allowBeneficiaryRequest: false,
    features: {
      checkDeposit: true,
      statements: true,
      linkedAccounts: true,
      scheduled: true,
      jointAccounts: true,
      overdraft: true,
      creditScore: true,
      accountNumbers: true,
      alerts: true,
      cardControls: true,
    },
    creditScore: 742,
    overdraftEnabled: false,
    overdraftLimit: 500,
    createdAt: new Date().toISOString(),
    devices: [getDeviceId()],
  };

  const users = getUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

// ---------- Theme ----------
export function getTheme(): 'dark' | 'light' {
  return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark';
}

export function setTheme(theme: 'dark' | 'light') {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
  notifyChange();
}

// ---------- Active User ----------
export function getActiveUserId(): string | null {
  return localStorage.getItem(ACTIVE_USER_ID_KEY);
}

export function setActiveUserId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_USER_ID_KEY, id);
  else localStorage.removeItem(ACTIVE_USER_ID_KEY);
  notifyChange();
}

// ---------- Simulated Emails ----------
export function getSimulatedEmails(): SimulatedEmail[] {
  try {
    const raw = localStorage.getItem(SIMULATED_EMAILS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSimulatedEmail(email: Omit<SimulatedEmail, 'id' | 'date' | 'read'>) {
  const list = getSimulatedEmails();
  list.unshift({
    ...email,
    id: generateId('email'),
    date: new Date().toISOString(),
    read: false,
  });
  localStorage.setItem(SIMULATED_EMAILS_KEY, JSON.stringify(list));
  notifyChange();
}

// ---------- Admin ----------
export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(session: AdminSession | null) {
  if (session) localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(ADMIN_SESSION_KEY);
  notifyChange();
}

export function getSubAdmins(): SubAdmin[] {
  try {
    const raw = localStorage.getItem(SUB_ADMINS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSubAdmins(list: SubAdmin[]) {
  localStorage.setItem(SUB_ADMINS_DB_KEY, JSON.stringify(list));
  notifyChange();
}

// ---------- Currency helpers ----------
export function convertAmount(amountUSD: number, currency: CurrencyCode): number {
  const rate = DEFAULT_RATES[currency] || 1;
  return amountUSD * rate;
}

export function formatMoney(amount: number, currency: CurrencyCode = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatBTC(btc: number): string {
  return btc.toFixed(4) + ' BTC';
}
