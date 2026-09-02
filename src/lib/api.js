const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://superkong.bsite.net';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.detail || body?.title || `Request failed (${response.status})`);
  }
  return body;
}

export const api = {
  getCategories: () => request('/api/Categories'),
  getUser: userKey => request(`/api/Users/${encodeURIComponent(userKey)}`),
  saveUser: (userKey, profile) => request(`/api/Users/${encodeURIComponent(userKey)}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: profile.name,
      monthlyIncome: Number(profile.monthlyIncome) || 0,
      fixedExpenses: Number(profile.fixedExpenses) || 0,
      savingAmount: Number(profile.savingAmount) || 0,
      avatar: profile.avatar || '👤',
    }),
  }),
  getToday: userKey => request(`/api/users/${encodeURIComponent(userKey)}/records/today`),
  getRecords: userKey => request(`/api/users/${encodeURIComponent(userKey)}/records`),
  addExpense: (userKey, expense) => request(`/api/users/${encodeURIComponent(userKey)}/expenses`, {
    method: 'POST',
    body: JSON.stringify(expense),
  }),
  deleteExpense: (userKey, expenseId) => request(`/api/users/${encodeURIComponent(userKey)}/expenses/${expenseId}`, { method: 'DELETE' }),
  getStreak: userKey => request(`/api/users/${encodeURIComponent(userKey)}/stats/streak`),
  getCouple: userKey => request(`/api/Couple/${encodeURIComponent(userKey)}`),
  linkCouple: (coupleCode, userKey = 'A') => request('/api/Couple/link', {
    method: 'POST',
    body: JSON.stringify({ coupleCode, userKey }),
  }),
  unlinkCouple: userKey => request(`/api/Couple/unlink/${encodeURIComponent(userKey)}`, { method: 'DELETE' }),
  getCoupleDashboard: userKey => request(`/api/Couple/dashboard/${encodeURIComponent(userKey)}`),
};

export { API_BASE_URL };
