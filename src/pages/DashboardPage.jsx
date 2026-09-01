import { useState } from 'react';
import { Trash2, TrendingUp, Flame, Wallet, ArrowRight, Plus, Heart, PiggyBank, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';

function ProgressRing({ percent, size = 96, strokeWidth = 9, isOver }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={isOver ? '#FCA5A5' : 'rgba(255,255,255,0.95)'}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  );
}

const QUICK_PRESETS = [
  { label: 'Coffee', icon: '☕', amount: 5, category: 'food' },
  { label: 'Lunch', icon: '🍱', amount: 15, category: 'food' },
  { label: 'Transport', icon: '🚗', amount: 20, category: 'transport' },
  { label: 'Groceries', icon: '🛒', amount: 35, category: 'shopping' },
];

export default function DashboardPage() {
  const {
    currentUser, activeUser, users, coupleLinked, getTodayRecord, deleteExpense,
    addExpense, getSpentAmount, getStreakCount, EXPENSE_CATEGORIES, getMonthRecords,
  } = useApp();
  const { showToast } = useToast();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const record = getTodayRecord(activeUser);
  const spent = record ? getSpentAmount(record) : 0;
  const budget = record ? record.availableBudget : (currentUser?.dailyBudget || 0);
  const remaining = budget - spent;
  const isOver = remaining < 0;
  const percent = budget > 0 ? (spent / budget) * 100 : 0;
  const streak = getStreakCount(activeUser);
  const tomorrowBudget = currentUser ? Math.max(0, currentUser.dailyBudget + remaining) : 0;

  // Partner data for snapshot
  const partnerKey = activeUser === 'A' ? 'B' : 'A';
  const partnerUser = users[partnerKey];
  const partnerRecord = partnerUser ? getTodayRecord(partnerKey) : null;
  const partnerSpent = partnerRecord ? getSpentAmount(partnerRecord) : 0;
  const partnerBudget = partnerRecord ? partnerRecord.availableBudget : (partnerUser?.dailyBudget || 0);

  // Month-to-date calculation
  const now = new Date();
  const monthRecords = getMonthRecords(activeUser, now.getFullYear(), now.getMonth() + 1);
  const monthSpent = monthRecords.reduce((sum, r) => sum + getSpentAmount(r), 0);
  const monthTargetSavings = currentUser ? Math.round(currentUser.monthlyIncome * 0.45) : 0;

  const todayDate = now.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' });

  function getCatInfo(id) {
    return EXPENSE_CATEGORIES.find(c => c.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
  }

  function handleQuickAdd(preset) {
    addExpense(preset.amount, preset.category, preset.label);
    showToast(`Added ${preset.icon} ${preset.label} (RM ${preset.amount.toFixed(2)})`, 'success');
  }

  function handleDeleteClick(id) {
    if (pendingDeleteId === id) {
      deleteExpense(id);
      showToast('Expense deleted', 'info');
      setPendingDeleteId(null);
    } else {
      setPendingDeleteId(id);
      setTimeout(() => {
        setPendingDeleteId(prev => (prev === id ? null : prev));
      }, 3000);
    }
  }

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="animate-scale-in">
        <div className="text-6xl mb-5">💕</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to SaveTogether</h2>
        <p className="text-slate-500 text-sm mb-8">Set up your profile to start tracking your daily expenses.</p>
        <Link to="/settings" className="btn-primary inline-block">Set Up Profile →</Link>
      </div>
    </div>
  );

  return (
    <div className="pb-32">
      {/* Hero gradient header */}
      <div
        className="px-5 pt-8 pb-16 relative overflow-hidden"
        style={{
          background: isOver
            ? 'linear-gradient(145deg, #B91C1C 0%, #DC2626 50%, #EA580C 100%)'
            : 'linear-gradient(145deg, #064E3B 0%, #059669 50%, #10B981 100%)'
        }}
      >
        {/* Decorative ambient blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-25 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-12 w-52 h-52 rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />

        {/* Top bar: Date, greeting, streak */}
        <div className="relative flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
              {currentUser.avatar || '👤'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium tracking-wide uppercase" style={{ color: 'rgba(209,250,229,0.9)' }}>{todayDate}</p>
              <h1 className="text-white text-lg font-bold leading-tight truncate">
                Hey, {currentUser.name}!
              </h1>
            </div>
          </div>
          {streak > 0 && (
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full flex-shrink-0 border border-white/25 shadow-sm"
              style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}
            >
              <Flame size={13} className="text-amber-300 fill-amber-300" />
              <span className="text-white text-xs font-bold whitespace-nowrap">{streak}d streak</span>
            </div>
          )}
        </div>

        {/* Main Budget Display */}
        <div className="relative flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-inner">
          <div className="relative flex-shrink-0">
            <ProgressRing percent={percent} size={92} strokeWidth={9} isOver={isOver} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-white text-base font-bold leading-none">{Math.min(Math.round(percent), 999)}%</span>
              <span className="text-white/70 text-[9px] font-medium mt-0.5">used</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white/75 text-xs font-medium">Available Today</p>
            <p className="text-white text-2xl font-extrabold leading-tight truncate tracking-tight">
              RM {Math.abs(budget).toFixed(2)}
            </p>
            {record?.carryOver !== 0 && record?.carryOver != null ? (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/20 text-white truncate max-w-full">
                {record.carryOver > 0 ? `+RM${record.carryOver.toFixed(2)} rollover` : `−RM${Math.abs(record.carryOver).toFixed(2)} overspent`}
              </span>
            ) : (
              <span className="inline-block mt-1 text-[10px] text-white/70">
                Daily limit: RM {currentUser.dailyBudget.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Dual stats mini pills inside hero */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <div className="bg-black/15 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-white/75 font-medium">Spent</span>
            <span className="text-xs font-bold text-white truncate">RM {spent.toFixed(2)}</span>
          </div>
          <div className="bg-black/15 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-white/75 font-medium">{isOver ? 'Over' : 'Remaining'}</span>
            <span className={`text-xs font-bold truncate ${isOver ? 'text-rose-300' : 'text-emerald-300'}`}>
              {isOver ? '−' : '+'}RM {Math.abs(remaining).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Floating cards section */}
      <div className="px-4 -mt-8 space-y-4">
        {/* Tomorrow + Save Target cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-3.5 animate-fade-up flex flex-col justify-between" style={{ animationDelay: '0.05s' }}>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' }}>
                  <Wallet size={13} style={{ color: '#059669' }} />
                </div>
                <span className="text-xs font-semibold text-slate-500">Tomorrow</span>
              </div>
              <p
                className="font-bold text-base leading-tight truncate mt-0.5"
                style={{ color: tomorrowBudget < currentUser.dailyBudget ? '#EF4444' : '#1E293B' }}
              >
                RM {tomorrowBudget.toFixed(2)}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {remaining >= 0 ? `+RM${remaining.toFixed(2)} rollover` : `−RM${Math.abs(remaining).toFixed(2)}`}
            </p>
          </div>

          <div className="card p-3.5 animate-fade-up flex flex-col justify-between" style={{ animationDelay: '0.1s' }}>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' }}>
                  <TrendingUp size={13} style={{ color: '#059669' }} />
                </div>
                <span className="text-xs font-semibold text-slate-500">Save Target</span>
              </div>
              <p className="text-slate-800 font-bold text-base leading-tight truncate mt-0.5">
                RM {monthTargetSavings.toLocaleString()}
                <span className="text-[10px] text-slate-400 font-normal">/mo</span>
              </p>
            </div>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold truncate">
              45% of income
            </p>
          </div>
        </div>

        {/* 1-Tap Quick Presets */}
        <div className="card p-3.5 animate-fade-up" style={{ animationDelay: '0.12s' }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-slate-700">Quick Log</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">1-tap add</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleQuickAdd(preset)}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-100 hover:border-emerald-300 active:scale-95 transition-all"
                style={{ background: '#F8FAFC' }}
              >
                <span className="text-lg leading-none mb-1">{preset.icon}</span>
                <span className="text-[11px] font-semibold text-slate-700 leading-tight truncate w-full text-center">{preset.label}</span>
                <span className="text-[10px] font-bold text-emerald-600 mt-0.5">RM {preset.amount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Expenses list card */}
        <div className="card overflow-hidden animate-fade-up" style={{ animationDelay: '0.16s' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-800 text-sm leading-tight">Today's Expenses</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {record?.expenses?.length || 0} recorded
              </p>
            </div>
            <Link
              to="/add"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-transform active:scale-95 shadow-sm"
              style={{ background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', color: '#065F46' }}
            >
              <Plus size={13} strokeWidth={2.5} /> Add
            </Link>
          </div>

          {(!record || record.expenses.length === 0) ? (
            <div className="text-center py-7 px-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-2xl mb-2.5">
                🎉
              </div>
              <p className="text-slate-700 text-sm font-semibold">No expenses yet today!</p>
              <p className="text-slate-400 text-xs mt-0.5">Use 1-tap quick log above or tap + Add</p>
            </div>
          ) : (
            <div>
              {[...record.expenses].reverse().map((expense, idx) => {
                const cat = getCatInfo(expense.category);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: idx < record.expenses.length - 1 ? '1px solid #F1F5F9' : 'none' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-xs"
                      style={{ background: cat.color + '18' }}
                    >
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{expense.note || cat.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(expense.time).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })} · {cat.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="font-bold text-sm text-slate-800">RM {expense.amount.toFixed(2)}</p>
                      <button
                        onClick={() => handleDeleteClick(expense.id)}
                        className="flex items-center justify-center rounded-lg transition-all"
                        style={{
                          background: pendingDeleteId === expense.id ? '#DC2626' : '#FEE2E2',
                          minWidth: pendingDeleteId === expense.id ? 56 : 26,
                          height: 26,
                          padding: pendingDeleteId === expense.id ? '0 6px' : 0,
                        }}
                        title={pendingDeleteId === expense.id ? 'Tap again to confirm' : 'Delete'}
                      >
                        {pendingDeleteId === expense.id ? (
                          <span className="text-[9px] font-bold text-white whitespace-nowrap">Confirm?</span>
                        ) : (
                          <Trash2 size={12} style={{ color: '#EF4444' }} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Total today</span>
                <span className="text-sm font-bold text-slate-800">RM {spent.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Couple snapshot widget (if partner exists or linked) */}
        {(partnerUser || coupleLinked) && (
          <Link
            to="/couple"
            className="card p-3.5 flex items-center justify-between gap-3 animate-fade-up block hover:shadow-md transition-all border border-emerald-100"
            style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)', animationDelay: '0.2s' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-pink-100 shrink-0">
                <Heart size={18} className="text-pink-500 fill-pink-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-800 truncate">Couple Challenge</p>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-pink-100 text-pink-700">Active</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {partnerUser ? `${partnerUser.name}: RM ${partnerSpent.toFixed(2)} spent today` : 'Tap to view challenge'}
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-emerald-600 shrink-0" />
          </Link>
        )}

        {/* Monthly Savings Insight Widget */}
        <div className="card p-3.5 animate-fade-up" style={{ animationDelay: '0.24s' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <PiggyBank size={15} className="text-emerald-600" />
              <span className="text-xs font-bold text-slate-700">This Month's Spending</span>
            </div>
            <Link to="/history" className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
              History <ArrowRight size={10} />
            </Link>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-lg font-bold text-slate-800">RM {monthSpent.toFixed(2)}</span>
            <span className="text-[11px] text-slate-400">{monthRecords.length} day{monthRecords.length === 1 ? '' : 's'} recorded</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((monthSpent / (currentUser.monthlyIncome * 0.55 || 1)) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #059669, #10B981)',
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            Target savings: <span className="font-semibold text-emerald-600">RM {monthTargetSavings.toLocaleString()}</span> (45% of income)
          </p>
        </div>
      </div>
    </div>
  );
}


