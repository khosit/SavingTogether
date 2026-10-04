import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { ChevronLeft, Check } from 'lucide-react';

export default function AddExpensePage() {
  const navigate = useNavigate();
  const { addExpense, EXPENSE_CATEGORIES, currentUser, getTodayRecord, getSpentAmount } = useApp();
  const { showToast } = useToast();

  const [amountDigits, setAmountDigits] = useState('');
  const [category, setCategory]   = useState('food');
  const [note, setNote]           = useState('');
  const [submitted, setSubmitted] = useState(false);

  const record      = getTodayRecord();
  const spent       = record ? getSpentAmount(record) : 0;
  const budget      = record ? record.availableBudget : (currentUser?.dailyBudget || 0);
  const remaining   = budget - spent;
  const amount      = amountDigits ? (Number(amountDigits) / 100).toFixed(2) : '';
  const willOver    = amount && parseFloat(amount) > remaining;
  const selectedCat = EXPENSE_CATEGORIES.find(c => c.id === category) || EXPENSE_CATEGORIES[0];

  function handleAmountKeyDown(e) {
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      setAmountDigits(current => `${current}${e.key}`.replace(/^0+(?=\d)/, '').slice(-9));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      setAmountDigits(current => current.slice(0, -1));
    } else if (!['Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
    }
  }

  function handleAmountChange(e) {
    const enteredDigits = e.target.value.replace(/\D/g, '');
    const displayedDigits = amountDigits.padStart(3, '0');

    if (enteredDigits.length > displayedDigits.length) {
      setAmountDigits(current => `${current}${enteredDigits.slice(-1)}`.slice(-9));
    } else if (enteredDigits.length < displayedDigits.length) {
      setAmountDigits(current => current.slice(0, -1));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    await addExpense(val, category, note);
    showToast(`${selectedCat.icon} RM ${val.toFixed(2)} added!`, 'success');
    setSubmitted(true);
    setTimeout(() => navigate('/'), 700);
  }

  const quickAmounts = [5, 10, 15, 20, 30, 50];

  return (
    <div className="min-h-screen pb-32">
      {/* Gradient header */}
      <div
        className="px-5 pt-12 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#065F46 0%,#059669 50%,#10B981 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="relative flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">Add Expense</h1>
        </div>

        {/* Remaining budget pill */}
        <div
          className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
        >
          <div>
            <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Remaining Today</p>
            <p className={`text-lg font-bold ${remaining < 0 ? 'text-red-300' : 'text-white'}`}>
              RM {remaining.toFixed(2)}
            </p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Budget</p>
            <p className="text-white text-sm font-semibold">RM {budget.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-12 space-y-4">
        {/* Amount card */}
        <div className="card p-5 animate-fade-up">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Amount</p>
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-2 mb-3"
            style={{ background: '#ECFDF5', border: '2px solid transparent' }}
          >
            <span className="text-xl font-bold" style={{ color: '#10B981' }}>RM</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              onKeyDown={handleAmountKeyDown}
              placeholder="0.00"
              required
              className="flex-1 min-w-0 bg-transparent text-3xl font-bold text-slate-800 focus:outline-none placeholder-slate-300"
            />
          </div>

          {willOver && (
            <div className="rounded-2xl p-3 mb-3 flex items-center gap-2" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <span>⚠️</span>
              <p className="text-xs font-semibold text-amber-700">
                Over by RM {(parseFloat(amount) - remaining).toFixed(2)} — this will exceed today's budget!
              </p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {quickAmounts.map(q => (
              <button
                key={q} type="button"
                onClick={() => setAmountDigits(String(q * 100))}
                className="px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: Number(amount) === q
                    ? 'linear-gradient(135deg,#059669,#047857)'
                    : '#ECFDF5',
                  color: Number(amount) === q ? '#fff' : '#059669',
                  boxShadow: Number(amount) === q ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
                }}
              >
                RM {q}
              </button>
            ))}
          </div>
        </div>

        {/* Category card — horizontal scroll */}
        <div className="card p-5 animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Category</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
            {EXPENSE_CATEGORIES.map(cat => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id} type="button"
                  onClick={() => setCategory(cat.id)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all flex-shrink-0"
                  style={{
                    width: 72,
                    background: active ? cat.color + '18' : '#F8F7FF',
                    border: active ? `2px solid ${cat.color}50` : '2px solid transparent',
                    transform: active ? 'scale(1.06)' : 'scale(1)',
                    boxShadow: active ? `0 4px 12px ${cat.color}30` : 'none',
                  }}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: active ? cat.color : '#94A3B8' }}>
                    {cat.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note card */}
        <div className="card p-5 animate-fade-up" style={{ animationDelay: '0.14s' }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Note <span className="text-slate-300 normal-case font-normal">(optional)</span></p>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={`e.g. Lunch at mamak · ${selectedCat.icon}`}
            maxLength={60}
            className="w-full rounded-2xl px-4 py-3 text-slate-700 font-medium focus:outline-none transition-all text-sm"
            style={{ background: '#ECFDF5', border: '2px solid transparent' }}
            onFocus={e => e.target.style.borderColor = '#059669'}
            onBlur={e => e.target.style.borderColor = 'transparent'}
          />
        </div>

        {/* Submit — btn-primary now green via index.css */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitted || !amount || parseFloat(amount) <= 0}
          className="btn-primary w-full flex items-center justify-center gap-2 animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          {submitted ? (
            <><Check size={18} /> Saved!</>
          ) : (
            <>Save {selectedCat.icon} {amount ? `RM ${parseFloat(amount || 0).toFixed(2)}` : 'Expense'}</>
          )}
        </button>
      </div>
    </div>
  );
}
