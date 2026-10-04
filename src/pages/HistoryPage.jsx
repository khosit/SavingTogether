import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HistoryPage() {
  const { activeUser, currentUser, getMonthRecords, getSpentAmount, EXPENSE_CATEGORIES, loadRecord } = useApp(); // currentUser used for user indicator badge

  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [expandedDate, setExpandedDate] = useState(null);
  const [loadingDate, setLoadingDate] = useState(null);
  const [loadError, setLoadError] = useState('');

  const records    = getMonthRecords(activeUser, viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  }

  async function toggleDate(date) {
    setLoadError('');
    if (expandedDate === date) {
      setExpandedDate(null);
      return;
    }
    setExpandedDate(date);
    setLoadingDate(date);
    try {
      await loadRecord(activeUser, date);
    } catch (error) {
      setLoadError(error.message || 'Unable to load expenses');
    } finally {
      setLoadingDate(null);
    }
  }

  function getCatInfo(id) {
    return EXPENSE_CATEGORIES.find(c => c.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
  }

  const totalSpent  = records.reduce((s, r) => s + getSpentAmount(r), 0);
  const totalBudget = records.reduce((s, r) => s + r.availableBudget, 0);
  const saved       = totalBudget - totalSpent;
  const daysUnder   = records.filter(r => getSpentAmount(r) <= r.availableBudget).length;

  const catBreakdown = {};
  records.forEach(r => r.expenses.forEach(e => {
    catBreakdown[e.category] = (catBreakdown[e.category] || 0) + e.amount;
  }));
  const sortedCats = Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen pb-32">
      {/* Gradient header */}
      <div
        className="px-5 pt-12 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#065F46 0%,#059669 50%,#10B981 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-44 h-44 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="relative flex items-center justify-between mb-5">
          <div className="min-w-0 flex-1 pr-2">
            <h1 className="text-white text-xl font-bold">History</h1>
            {currentUser && (
              <p className="text-xs mt-0.5" style={{ color: 'rgba(167,243,208,0.85)' }}>
                {currentUser.avatar} {currentUser.name}
              </p>
            )}
          </div>
          {/* Month picker */}
          <div
            className="flex items-center gap-1 rounded-2xl px-2 py-1 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <button onClick={prevMonth} className="p-1.5 text-white/70 hover:text-white">
              <ChevronLeft size={16} />
            </button>
            <span className="text-white text-xs font-semibold text-center" style={{ minWidth: 90 }}>{monthLabel}</span>
            <button onClick={nextMonth} className="p-1.5 text-white/70 hover:text-white">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Quick stats row */}
        {records.length > 0 && (
          <div className="flex gap-3">
            {[
              { label: 'Total Spent', value: `RM ${totalSpent.toFixed(2)}`, sub: `${records.length} days` },
              { label: saved >= 0 ? 'Saved' : 'Over', value: `RM ${Math.abs(saved).toFixed(2)}`, sub: saved >= 0 ? '👍 on track' : '⚠️ over budget', warn: saved < 0 },
            ].map((s, i) => (
              <div key={i} className="flex-1 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">{s.label}</p>
                <p className={`text-lg font-bold ${s.warn ? 'text-red-300' : 'text-white'}`}>{s.value}</p>
                <p className="text-white/50 text-[10px]">{s.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 -mt-10 space-y-4">
        {/* Summary cards */}
        {records.length > 0 && (
          <div className="grid grid-cols-2 gap-3 animate-fade-up">
            {[
              { icon: '📊', label: 'Avg Daily Spend', value: `RM ${(totalSpent / records.length).toFixed(2)}`, bg: '#ECFDF5', color: '#059669' },
              { icon: '✅', label: 'Days Under Budget', value: `${daysUnder} / ${records.length}`, bg: '#D1FAE5', color: '#065F46' },
            ].map((s, i) => (
              <div key={i} className="card p-4" style={{ animationDelay: `${i * 0.05}s` }}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-2"
                  style={{ background: s.bg }}
                >
                  {s.icon}
                </div>
                <p className="text-xs text-slate-400 font-semibold">{s.label}</p>
                <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Category breakdown */}
        {sortedCats.length > 0 && (
          <div className="card p-5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Spending by Category</p>
            <div className="space-y-3">
              {sortedCats.map(([catId, amount]) => {
                const cat = getCatInfo(catId);
                const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                return (
                  <div key={catId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm" style={{ background: cat.color + '18' }}>{cat.icon}</div>
                        <span className="text-xs font-semibold text-slate-600">{cat.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800">RM {amount.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 ml-1">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: cat.color + '20' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Daily records */}
        <div className="card overflow-hidden animate-fade-up" style={{ animationDelay: '0.18s' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #F0FDF4' }}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Records</p>
          </div>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-slate-400 text-sm font-medium">No records for this month</p>
            </div>
          ) : (
            <div>
              {[...records].reverse().map((record, idx) => {
                const spent = getSpentAmount(record);
                const over  = spent > record.availableBudget;
                const pct   = Math.min((spent / (record.availableBudget || 1)) * 100, 100);
                const dateLabel = new Date(record.date + 'T00:00:00').toLocaleDateString('en-MY', {
                  weekday: 'short', day: 'numeric', month: 'short',
                });
                return (
                  <div
                    key={record.date}
                    className="px-5 py-3.5"
                    style={{ borderBottom: idx < records.length - 1 ? '1px solid #ECFDF5' : 'none' }}
                  >
                    <button type="button" onClick={() => toggleDate(record.date)} className="w-full text-left">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-600">{dateLabel}</p>
                        <p className="text-[10px] text-slate-400">{record.expenses.length} expense{record.expenses.length !== 1 ? 's' : ''} · {expandedDate === record.date ? 'Hide details' : 'View details'}</p>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                        <p className="text-sm font-bold text-slate-800">RM {spent.toFixed(2)}</p>
                        <p className={`text-[10px] font-semibold ${over ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {over ? `⚠️ Over RM${(spent - record.availableBudget).toFixed(2)}` : `✓ RM${(record.availableBudget - spent).toFixed(2)} left`}
                        </p>
                        </div>
                        <ChevronDown size={16} className={`text-emerald-600 transition-transform ${expandedDate === record.date ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    </button>
                    <div className="w-full h-2 rounded-full" style={{ background: over ? '#FEE2E2' : '#D1FAE5' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: over
                            ? 'linear-gradient(90deg,#EF4444,#F97316)'
                            : 'linear-gradient(90deg,#059669,#10B981)',
                        }}
                      />
                    </div>
                    {expandedDate === record.date && (
                      <div className="mt-3 rounded-2xl p-3 space-y-2" style={{ background: '#F0FDF4' }}>
                        {loadingDate === record.date ? (
                          <p className="text-xs text-slate-400">Loading expense details…</p>
                        ) : loadError ? (
                          <p className="text-xs text-rose-500">{loadError}</p>
                        ) : record.expenses.length === 0 ? (
                          <p className="text-xs text-slate-400">No expenses recorded.</p>
                        ) : record.expenses.map(expense => {
                          const cat = getCatInfo(expense.category);
                          return <div key={expense.id} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span>{cat.icon}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-700 truncate">{expense.note || cat.label}</p>
                                <p className="text-[10px] text-slate-400">{cat.label}</p>
                              </div>
                            </div>
                            <p className="text-xs font-bold text-slate-700 whitespace-nowrap">RM {Number(expense.amount).toFixed(2)}</p>
                          </div>;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
