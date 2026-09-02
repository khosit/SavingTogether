import { useState } from 'react';
import { Heart, Link2, Unlink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

function UserCard({ user, spent, budget, label, isActive, streak }) {
  const remaining = budget - spent;
  const isOver    = remaining < 0;
  const percent   = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  if (!user) return (
    <div className="flex-1 rounded-3xl p-5 text-center" style={{ background: '#F0FDF4', border: '2px dashed #A7F3D0' }}>
      <div className="text-3xl mb-2">👤</div>
      <p className="text-slate-400 text-sm font-medium mb-2">{label} — Not set up</p>
      <Link to="/settings" className="text-xs font-semibold px-3 py-1.5 rounded-full inline-block" style={{ background: '#D1FAE5', color: '#059669' }}>Set up →</Link>
    </div>
  );

  return (
    <div
      className="flex-1 rounded-3xl p-4 transition-all"
      style={{
        background: isActive
          ? 'linear-gradient(135deg,rgba(5,150,105,0.08),rgba(16,185,129,0.05))'
          : '#F0FDF4',
        border: isActive ? '2px solid rgba(5,150,105,0.25)' : '2px solid transparent',
      }}
    >
      <div className="text-center mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-2"
          style={{ background: isActive ? 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' : '#ECFDF5' }}
        >
          {user.avatar}
        </div>
        <p className="text-sm font-bold text-slate-700">{user.name}</p>
        {isActive && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#059669', color: '#fff' }}>YOU</span>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Budget</span><span className="font-semibold text-slate-700">RM {budget.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Spent</span>
          <span className={`font-bold ${isOver ? 'text-rose-500' : 'text-slate-800'}`}>RM {spent.toFixed(2)}</span>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${percent}%`,
              background: isOver
                ? 'linear-gradient(90deg,#EF4444,#F97316)'
                : 'linear-gradient(90deg,#059669,#10B981)',
            }}
          />
        </div>
        <p className={`text-center text-xs font-bold ${isOver ? 'text-rose-500' : 'text-emerald-600'}`}>
          {isOver ? `⚠️ Over RM${Math.abs(remaining).toFixed(2)}` : `✓ RM${remaining.toFixed(2)} left`}
        </p>
        {streak > 0 && (
          <p className="text-center text-[10px] font-semibold" style={{ color: '#F97316' }}>🔥 {streak}-day streak</p>
        )}
      </div>
    </div>
  );
}

export default function CouplePage() {
  const {
    users, accountUserKey, coupleLinked, linkCouple, unlinkCouple, coupleCode, coupleInfo, coupleDashboard, partnerToday,
    getTodayRecord, getSpentAmount, getStreakCount,
  } = useApp();

  const [codeInput, setCodeInput] = useState('');

  const ownSide = coupleInfo?.userKeyB === accountUserKey ? coupleDashboard?.userB : coupleDashboard?.userA;
  const partnerSide = coupleInfo?.userKeyB === accountUserKey ? coupleDashboard?.userA : coupleDashboard?.userB;
  const userA = users.A;
  const userB = users.B || (partnerSide ? {
    name: partnerSide.name,
    avatar: partnerSide.avatar,
    dailyBudget: partnerSide.budget,
  } : null);

  function getRecordData(key) {
    const summary = key === 'A' ? ownSide : partnerSide;
    if (summary) return { rec: null, spent: summary.spent, budget: summary.budget };
    const rec = getTodayRecord(key);
    const spent = rec ? getSpentAmount(rec) : 0;
    const budget = rec ? rec.availableBudget : (users[key]?.dailyBudget || 0);
    return { rec, spent, budget };
  }

  const dataA = getRecordData('A');
  const dataB = getRecordData('B');
  const ownToday = getTodayRecord('A');

  const combined = dataA.spent + dataB.spent;
  const combinedBudget = dataA.budget + dataB.budget;
  const combinedRemaining = combinedBudget - combined;
  const isOver = combinedRemaining < 0;

  const streakA = ownSide?.streak ?? getStreakCount('A');
  const streakB = partnerSide?.streak ?? getStreakCount('B');

  async function handleLink() {
    if (!codeInput.trim()) return;
    await linkCouple(codeInput.trim());
  }

  // The first member can have a valid couple code while the second member is
  // still missing, so do not require both membership keys to render the page.
  if (!coupleLinked || !coupleInfo) return (
    <div className="min-h-screen pb-28">
      <div
        className="px-5 pt-12 pb-20 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#065F46 0%,#059669 50%,#10B981 100%)' }}
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
        >
          <Heart size={36} className="text-white fill-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Couple Challenge</h1>
        <p className="text-sm" style={{ color: 'rgba(167,243,208,0.85)' }}>Connect with a partner to save together</p>
      </div>

      <div className="px-4 -mt-10 space-y-4">
        <div className="card p-6 animate-fade-up">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Couple Code</p>
          <p className="text-xs text-slate-500 mb-4">Create or enter a shared code. Your partner can use the same code on their own account.</p>
          <input
            type="text"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value.toUpperCase())}
            placeholder="e.g. ALEX&SARA"
            maxLength={20}
            className="w-full rounded-2xl px-4 py-4 text-slate-800 font-bold text-center text-xl tracking-widest focus:outline-none transition-all mb-4"
            style={{ background: '#ECFDF5', border: '2px solid transparent', letterSpacing: '0.15em' }}
            onFocus={e => e.target.style.borderColor = '#059669'}
            onBlur={e => e.target.style.borderColor = 'transparent'}
          />
          <button
            onClick={handleLink}
            disabled={!codeInput.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Link2 size={17} /> Connect Couple Code
          </button>
        </div>

        <div className="rounded-3xl p-5 animate-fade-up" style={{ background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', animationDelay: '0.1s' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#065F46' }}>💡 How it works</p>
          <div className="space-y-2">
            {[
              'Your account has one personal profile',
              'Share this code with your partner',
              'Both accounts can use the same couple code',
              'Connected expenses will appear side by side',
              'Challenge each other to stay within the daily limit',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-bold text-xs mt-0.5" style={{ color: '#059669' }}>{i + 1}.</span>
                <p className="text-xs font-medium" style={{ color: '#065F46' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-32">
      {/* Gradient hero */}
      <div
        className="px-5 pt-12 pb-20 relative overflow-hidden"
        style={{
          background: isOver
            ? 'linear-gradient(135deg,#DC2626,#B91C1C,#EA580C)'
            : 'linear-gradient(135deg,#065F46 0%,#059669 50%,#10B981 100%)'
        }}
      >
        <div className="absolute -top-8 -right-8 w-44 h-44 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-pink-300 fill-pink-300" />
            <span className="text-white font-bold text-lg">Couple Challenge</span>
          </div>
          <button
            onClick={unlinkCouple}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <Unlink size={15} className="text-white/70" />
          </button>
        </div>
        <p className="text-xs mb-4" style={{ color: 'rgba(167,243,208,0.85)' }}>Code: <span className="font-mono font-bold text-white">{coupleCode}</span></p>

        {/* Combined meter */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
        >
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Combined Spending Today</p>
          <div className="flex items-end justify-between mb-2">
            <p className="text-white text-3xl font-bold">RM {combined.toFixed(2)}</p>
            <div className="text-right">
              <p className="text-white/50 text-[10px]">of RM {combinedBudget.toFixed(2)}</p>
              <p className={`font-bold text-sm ${isOver ? 'text-red-300' : 'text-emerald-300'}`}>
                {isOver ? `⚠️ Over RM${Math.abs(combinedRemaining).toFixed(2)}` : `✓ RM${combinedRemaining.toFixed(2)} left`}
              </p>
            </div>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((combined / (combinedBudget || 1)) * 100, 100)}%`,
                background: isOver ? '#FCA5A5' : 'rgba(255,255,255,0.85)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 space-y-4">
        {/* Side-by-side user cards */}
        <div className="flex gap-3 animate-fade-up">
          <UserCard user={userA} spent={dataA.spent} budget={dataA.budget} label="You" isActive={true} streak={streakA} />
          <UserCard user={userB} spent={dataB.spent} budget={dataB.budget} label="Partner" isActive={false} streak={streakB} />
        </div>

        <div className="card p-5 animate-fade-up" style={{ animationDelay: '0.04s' }}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Today's Expenses</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'You', record: ownToday },
              { label: 'Partner', record: partnerToday },
            ].map(({ label, record }) => (
              <div key={label} className="rounded-2xl p-3" style={{ background: '#F0FDF4' }}>
                <p className="text-xs font-bold text-slate-700 mb-2">{label}</p>
                {!record?.expenses?.length ? (
                  <p className="text-[11px] text-slate-400">No expenses yet</p>
                ) : (
                  <div className="space-y-2">
                    {record.expenses.map(expense => (
                      <div key={expense.id} className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-500 truncate">{expense.note || expense.category || 'Expense'}</p>
                        <p className="text-[11px] font-bold text-slate-700 whitespace-nowrap">RM {Number(expense.amount).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Winner */}
        <div className="card p-5 animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">🏆 Today's Winner</p>
          {userA && userB ? (
            <div className="text-center">
              {dataA.spent === dataB.spent ? (
                <p className="text-slate-600 font-semibold">It's a tie! 🤝</p>
              ) : dataA.spent < dataB.spent ? (
                <>
                  <div className="text-3xl mb-1">{userA.avatar}</div>
                  <p className="font-bold text-slate-800">{userA.name} saved more today!</p>
                  <p className="text-xs text-slate-400 mt-0.5">RM {(dataB.spent - dataA.spent).toFixed(2)} less than {userB.name}</p>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-1">{userB.avatar}</div>
                  <p className="font-bold text-slate-800">{userB.name} saved more today!</p>
                  <p className="text-xs text-slate-400 mt-0.5">RM {(dataA.spent - dataB.spent).toFixed(2)} less than {userA.name}</p>
                </>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center">Share your couple code to connect a partner</p>
          )}
        </div>

        {/* Achievements */}
        <div className="card p-5 animate-fade-up" style={{ animationDelay: '0.14s' }}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Achievements</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🏆', label: 'Under budget today',  achieved: !isOver && combined > 0, color: '#D1FAE5', textColor: '#065F46' },
              { icon: '🔥', label: '7-day streak',         achieved: Math.max(streakA, streakB) >= 7, color: '#FEF3C7', textColor: '#92400E' },
              { icon: '💰', label: 'Both under budget',    achieved: !!(userA && userB && dataA.spent <= dataA.budget && dataB.spent <= dataB.budget), color: '#D1FAE5', textColor: '#065F46' },
              { icon: '⚠️', label: 'Overspending alert',  achieved: isOver, color: '#FEE2E2', textColor: '#991B1B' },
            ].map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 rounded-2xl transition-all"
                style={{
                  background: a.achieved ? a.color : '#F0FDF4',
                  opacity: a.achieved ? 1 : 0.45,
                }}
              >
                <span className="text-lg">{a.icon}</span>
                <span className="text-xs font-semibold" style={{ color: a.achieved ? a.textColor : '#94A3B8' }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
