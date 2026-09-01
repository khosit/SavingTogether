import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AppContext = createContext(null);

const TODAY = () => new Date().toISOString().split('T')[0];

function calcDailyBudget(monthlyIncome, fixedExpenses) {
  return Math.max(0, ((monthlyIncome * 0.55) - fixedExpenses) / 30);
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
  const [activeUser, setActiveUser] = useState(() => getStorage('sc_activeUser', 'A'));
  const [users, setUsers] = useState(() =>
    getStorage('sc_users', {
      A: null,
      B: null,
    })
  );
  const [dailyRecords, setDailyRecords] = useState(() => getStorage('sc_dailyRecords', {}));
  const [coupleLinked, setCoupleLinked] = useState(() => getStorage('sc_coupleLinked', false));
  const [coupleCode, setCoupleCode] = useState(() => getStorage('sc_coupleCode', ''));

  useEffect(() => { setStorage('sc_activeUser', activeUser); }, [activeUser]);
  useEffect(() => { setStorage('sc_users', users); }, [users]);
  useEffect(() => { setStorage('sc_dailyRecords', dailyRecords); }, [dailyRecords]);
  useEffect(() => { setStorage('sc_coupleLinked', coupleLinked); }, [coupleLinked]);
  useEffect(() => { setStorage('sc_coupleCode', coupleCode); }, [coupleCode]);

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

    const baseBudget = calcDailyBudget(user.monthlyIncome, user.fixedExpenses);

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

  function saveDayRecord(record) {
    const key = getUserRecordKey(record.userKey, record.date);
    setDailyRecords(prev => ({ ...prev, [key]: record }));
  }

  function addExpense(amount, category, note) {
    const today = TODAY();
    const record = getTodayRecord() || getOrCreateDayRecord(activeUser, today);
    const updated = {
      ...record,
      expenses: [
        ...record.expenses,
        {
          id: Date.now(),
          amount,
          category,
          note,
          time: new Date().toISOString(),
        },
      ],
    };
    saveDayRecord(updated);
  }

  function deleteExpense(expenseId) {
    const today = TODAY();
    const record = getTodayRecord();
    if (!record) return;
    const updated = {
      ...record,
      expenses: record.expenses.filter(e => e.id !== expenseId),
    };
    saveDayRecord(updated);
  }

  function setupUser(userKey, profile) {
    const daily = calcDailyBudget(profile.monthlyIncome, profile.fixedExpenses);
    setUsers(prev => ({
      ...prev,
      [userKey]: { ...profile, dailyBudget: daily },
    }));
  }

  function updateUser(profile) {
    const daily = calcDailyBudget(profile.monthlyIncome, profile.fixedExpenses);
    setUsers(prev => ({
      ...prev,
      [activeUser]: { ...profile, dailyBudget: daily },
    }));
  }

  function switchUser(key) {
    setActiveUser(key);
  }

  function linkCouple(code) {
    setCoupleCode(code);
    setCoupleLinked(true);
  }

  function unlinkCouple() {
    setCoupleLinked(false);
    setCoupleCode('');
  }

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
        users,
        currentUser,
        partner,
        partnerKey,
        coupleLinked,
        coupleCode,
        EXPENSE_CATEGORIES,
        addExpense,
        deleteExpense,
        setupUser,
        updateUser,
        switchUser,
        linkCouple,
        unlinkCouple,
        getTodayRecord,
        getOrCreateDayRecord,
        getMonthRecords,
        getSpentAmount,
        getStreakCount,
        calcDailyBudget,
        getAllDayRecords,
        TODAY,
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
