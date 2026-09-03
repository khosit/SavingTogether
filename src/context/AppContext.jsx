import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AppContext = createContext(null);

const TODAY = () => new Date().toISOString().split('T')[0];

function calcDailyBudget(monthlyIncome, fixedExpenses = 0, savingsRate = 45) {
  const rate = Math.min(100, Math.max(0, Number(savingsRate) || 0));
  const spendableIncome = (Number(monthlyIncome) || 0) * ((100 - rate) / 100);
  return Math.max(0, (spendableIncome - (Number(fixedExpenses) || 0)) / 30);
}

function getStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Drinks', icon: '🍜', color: '#f97316' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#3b82f6' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎮', color: '#8b5cf6' },
  { id: 'health', label: 'Health', icon: '💊', color: '#10b981' },
  { id: 'bills', label: 'Bills', icon: '📋', color: '#6b7280' },
  { id: 'other', label: 'Other', icon: '💸', color: '#f59e0b' },
];

export function AppProvider({ children }) {
  // A local account owns one profile. Keep the B slot as a reserved partner
  // projection so a future server-backed couple connection can populate it.
  const [accountUserKey, setAccountUserKey] = useState(() => getStorage('sc_accountUserKey', ''));
  const [activeUser] = useState('A');
  const [users, setUsers] = useState(() => {
    const stored = getStorage('sc_users', { A: null, B: null });
    const ownProfile = stored?.A || stored?.B || null;
    return { A: ownProfile, B: null };
  });
  const [dailyRecords, setDailyRecords] = useState(() => getStorage('sc_dailyRecords', {}));
  const [coupleLinked, setCoupleLinked] = useState(() => getStorage('sc_coupleLinked', false));
  const [coupleCode, setCoupleCode] = useState(() => getStorage('sc_coupleCode', ''));
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [coupleDashboard, setCoupleDashboard] = useState(null);
  const [coupleInfo, setCoupleInfo] = useState(null);
  const [partnerToday, setPartnerToday] = useState(null);
  const [expenseCategories, setExpenseCategories] = useState(EXPENSE_CATEGORIES);

  useEffect(() => { setStorage('sc_activeUser', activeUser); }, [activeUser]);
  useEffect(() => { setStorage('sc_users', users); }, [users]);
  useEffect(() => { setStorage('sc_dailyRecords', dailyRecords); }, [dailyRecords]);
  useEffect(() => { setStorage('sc_coupleLinked', coupleLinked); }, [coupleLinked]);
  useEffect(() => { setStorage('sc_coupleCode', coupleCode); }, [coupleCode]);
  useEffect(() => { setStorage('sc_accountUserKey', accountUserKey); }, [accountUserKey]);

  useEffect(() => {
    let cancelled = false;
    async function loadBackendData() {
      if (!accountUserKey) {
        setIsLoading(false);
        return;
      }
      try {
        const [user, categories, records, couple, dashboard] = await Promise.all([
          api.getUser(accountUserKey), api.getCategories(), api.getRecords(accountUserKey), api.getCouple(accountUserKey).catch(() => null),
          api.getCoupleDashboard(accountUserKey).catch(() => null),
        ]);
        if (cancelled) return;
        const loadedSavingsRate = user.monthlyIncome > 0
          ? Math.round((Number(user.savingAmount) / Number(user.monthlyIncome)) * 100)
          : 45;
        setUsers({ A: { ...user, savingsRate: loadedSavingsRate }, B: null });
        setDailyRecords(Object.fromEntries((records || []).map(record => [`A_${record.date}`, record])));
        if (categories?.length) setExpenseCategories(categories);
        setCoupleLinked(Boolean(couple?.isLinked || couple?.coupleCode));
        setCoupleCode(couple?.coupleCode || '');
        setCoupleInfo(couple);
        setCoupleDashboard(dashboard);
        const partnerKey = couple && (couple.userKeyA === accountUserKey ? couple.userKeyB : couple.userKeyA);
        setPartnerToday(partnerKey ? await api.getToday(partnerKey).catch(() => null) : null);
      } catch (error) {
        if (!cancelled) setApiError(error.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadBackendData();
    return () => { cancelled = true; };
  }, [accountUserKey]);

  const currentUser = users[activeUser];
  const partnerKey = activeUser === 'A' ? 'B' : 'A';
  const partner = users[partnerKey];

  function getUserRecordKey(userKey, date) {
    return `${userKey}_${date}`;
  }

  function getOrCreateDayRecord(userKey, date) {
    const key = getUserRecordKey(userKey, date);
    if (dailyRecords[key]) return dailyRecords[key];

    const user = users[userKey];
    if (!user) return null;

    const baseBudget = user.dailyBudget ?? calcDailyBudget(user.monthlyIncome, user.fixedExpenses, user.savingsRate ?? 45);

    // calculate carryOver from yesterday
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const ydStr = yesterday.toISOString().split('T')[0];
    const ydKey = getUserRecordKey(userKey, ydStr);
    const ydRecord = dailyRecords[ydKey];

    let carryOver = 0;
    if (ydRecord) {
      const ydSpent = ydRecord.expenses.reduce((s, e) => s + e.amount, 0);
      carryOver = ydRecord.availableBudget - ydSpent;
    }

    const availableBudget = baseBudget + carryOver;
    return {
      date,
      userKey,
      baseBudget,
      carryOver,
      availableBudget,
      expenses: [],
    };
  }

  function getTodayRecord(userKey = activeUser) {
    return getOrCreateDayRecord(userKey, TODAY());
  }

  async function addExpense(amount, category, note) {
    await api.addExpense(accountUserKey, { amount: Number(amount), category, note });
    const record = await api.getToday(accountUserKey);
    if (record) setDailyRecords(prev => ({ ...prev, [`A_${record.date}`]: record }));
  }

  async function deleteExpense(expenseId) {
    await api.deleteExpense(accountUserKey, expenseId);
    const record = await api.getToday(accountUserKey);
    if (record) setDailyRecords(prev => ({ ...prev, [`A_${record.date}`]: record }));
  }

  async function setupUser(userKey, profile) {
    const savingAmount = (Number(profile.monthlyIncome) || 0) * ((Number(profile.savingsRate) || 0) / 100);
    const user = await api.createUser(userKey, { ...profile, savingAmount });
    setAccountUserKey(userKey);
    const actualRate = user.monthlyIncome > 0
      ? Math.round((Number(user.savingAmount) / Number(user.monthlyIncome)) * 100)
      : (profile.savingsRate ?? 45);
    setUsers({ A: { ...user, savingsRate: actualRate }, B: null });
  }

  async function updateUser(profile) {
    const savingAmount = (Number(profile.monthlyIncome) || 0) * ((Number(profile.savingsRate) || 0) / 100);
    const user = await api.updateUser(accountUserKey, { ...profile, savingAmount });
    const actualRate = user.monthlyIncome > 0
      ? Math.round((Number(user.savingAmount) / Number(user.monthlyIncome)) * 100)
      : (profile.savingsRate ?? 45);
    setUsers(prev => ({ ...prev, A: { ...user, savingsRate: actualRate } }));
  }

  async function login(userKey) {
    const user = await api.getUser(userKey);
    setApiError('');
    const loginSavingsRate = user.monthlyIncome > 0
      ? Math.round((Number(user.savingAmount) / Number(user.monthlyIncome)) * 100)
      : 45;
    setUsers({ A: { ...user, savingsRate: loginSavingsRate }, B: null });
    setAccountUserKey(userKey);
    setIsLoading(true);
  }

  function logout() {
    setAccountUserKey('');
    setUsers({ A: null, B: null });
    setDailyRecords({});
    setCoupleLinked(false);
    setCoupleCode('');
    setCoupleInfo(null);
    setCoupleDashboard(null);
  }

  async function linkCouple(code) {
    const couple = await api.linkCouple(code, accountUserKey);
    setCoupleCode(code);
    // A couple code is usable while waiting for the second member; the
    // backend may reserve it before isLinked becomes true.
    setCoupleLinked(Boolean(couple?.isLinked || couple?.coupleCode || code));
    setCoupleInfo(couple);
    setCoupleDashboard(await api.getCoupleDashboard(accountUserKey).catch(() => null));
    const partnerKey = couple?.userKeyA === accountUserKey ? couple?.userKeyB : couple?.userKeyA;
    setPartnerToday(partnerKey ? await api.getToday(partnerKey).catch(() => null) : null);
  }

  async function unlinkCouple() {
    await api.unlinkCouple(accountUserKey);
    setCoupleLinked(false);
    setCoupleCode('');
    setCoupleInfo(null);
    setCoupleDashboard(null);
    setPartnerToday(null);
  }

  const refreshCoupleData = useCallback(async () => {
    if (!accountUserKey) return;
    try {
      const [couple, dashboard, ownRecord] = await Promise.all([
        api.getCouple(accountUserKey).catch(() => null),
        api.getCoupleDashboard(accountUserKey).catch(() => null),
        api.getToday(accountUserKey).catch(() => null),
      ]);
      // Refresh the logged-in user's own today record so expenses are up to date
      if (ownRecord) setDailyRecords(prev => ({ ...prev, [`A_${ownRecord.date}`]: ownRecord }));
      setCoupleLinked(Boolean(couple?.isLinked || couple?.coupleCode));
      setCoupleCode(couple?.coupleCode || '');
      setCoupleInfo(couple);
      setCoupleDashboard(dashboard);
      const partnerKey = couple && (couple.userKeyA === accountUserKey ? couple.userKeyB : couple.userKeyA);
      setPartnerToday(partnerKey ? await api.getToday(partnerKey).catch(() => null) : null);
    } catch (error) {
      console.error('Failed to refresh couple data:', error);
    }
  }, [accountUserKey]);

  function getMonthRecords(userKey, year, month) {
    const prefix = `${userKey}_${year}-${String(month).padStart(2, '0')}`;
    const records = [];
    for (const key of Object.keys(dailyRecords)) {
      if (key.startsWith(prefix)) {
        records.push(dailyRecords[key]);
      }
    }
    return records.sort((a, b) => a.date.localeCompare(b.date));
  }

  function getSpentAmount(record) {
    if (!record) return 0;
    return record.expenses.reduce((s, e) => s + e.amount, 0);
  }

  function getStreakCount(userKey) {
    let streak = 0;
    const d = new Date();
    while (true) {
      const dateStr = d.toISOString().split('T')[0];
      const key = getUserRecordKey(userKey, dateStr);
      const rec = dailyRecords[key];
      if (!rec) break;
      const spent = getSpentAmount(rec);
      if (spent <= rec.availableBudget) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  const getAllDayRecords = useCallback((userKey) => {
    const prefix = `${userKey}_`;
    const records = [];
    for (const key of Object.keys(dailyRecords)) {
      if (key.startsWith(prefix)) {
        records.push(dailyRecords[key]);
      }
    }
    return records.sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyRecords]);

  return (
    <AppContext.Provider
      value={{
        activeUser,
        accountUserKey,
        users,
        currentUser,
        partner,
        partnerKey,
        coupleLinked,
        coupleCode,
        coupleInfo,
        EXPENSE_CATEGORIES: expenseCategories,
        addExpense,
        deleteExpense,
        setupUser,
        updateUser,
        login,
        logout,
        linkCouple,
        unlinkCouple,
        refreshCoupleData,
        getTodayRecord,
        getOrCreateDayRecord,
        getMonthRecords,
        getSpentAmount,
        getStreakCount,
        calcDailyBudget,
        getAllDayRecords,
        TODAY,
        isLoading,
        apiError,
        coupleDashboard,
        partnerToday,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
