import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Check } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, updateUser, calcDailyBudget, logout } = useApp();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    monthlyIncome: currentUser?.monthlyIncome || '',
    fixedExpenses: currentUser?.fixedExpenses ?? '',
    savingsRate: currentUser?.savingsRate ?? 45,
    avatar: currentUser?.avatar || '�',
  });
  const [saved, setSaved] = useState(false);

  const avatars = ['👨', '👩', '🧑', '👦', '👧', '🐻', '🐼', '🦊'];

  const dailyPreview = form.monthlyIncome
    ? calcDailyBudget(parseFloat(form.monthlyIncome) || 0, parseFloat(form.fixedExpenses) || 0, form.savingsRate)
    : null;

  async function handleSave(e) {
    e.preventDefault();
    await updateUser({
      name: form.name,
      monthlyIncome: parseFloat(form.monthlyIncome) || 0,
      fixedExpenses: parseFloat(form.fixedExpenses) || 0,
      savingsRate: Number(form.savingsRate),
      avatar: form.avatar,
    });
    showToast('✓ Profile saved!', 'success');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle = {
    background: '#ECFDF5',
    border: '2px solid transparent',
    borderRadius: 16,
    padding: '12px 16px',
    width: '100%',
    fontSize: 14,
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 500,
    color: '#1E293B',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Gradient header */}
      <div
        className="px-5 pt-12 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#065F46 0%,#059669 50%,#10B981 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-44 h-44 rounded-full opacity-10" style={{ background: '#fff' }} />
        <h1 className="relative text-white text-xl font-bold mb-5">Settings</h1>

        <p className="relative text-xs" style={{ color: 'rgba(167,243,208,0.85)' }}>Your account profile</p>
      </div>

      <div className="px-4 -mt-10 space-y-4">
        {/* Profile picture + name preview */}
        <div className="card p-5 flex items-center gap-4 animate-fade-up">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' }}
          >
            {form.avatar}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg">{form.name || 'Your Name'}</p>
            <p className="text-xs text-slate-400">Personal account · {dailyPreview ? `RM ${dailyPreview.toFixed(2)}/day` : 'Budget not set'}</p>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="card p-5 space-y-4 animate-fade-up" style={{ animationDelay: '0.06s' }}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Edit Profile</p>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Avatar</label>
            <div className="flex gap-2 flex-wrap">
              {avatars.map(a => (
                <button
                  type="button" key={a}
                  onClick={() => setForm(f => ({ ...f, avatar: a }))}
                  className="w-11 h-11 rounded-2xl text-2xl flex items-center justify-center transition-all"
                  style={{
                    background: form.avatar === a ? 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' : '#F0FDF4',
                    border: form.avatar === a ? '2px solid #059669' : '2px solid transparent',
                    transform: form.avatar === a ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Name</label>
            <input
              required type="text" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#059669'}
              onBlur={e => e.target.style.borderColor = 'transparent'}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Monthly Income (RM)</label>
            <input
              required type="number" value={form.monthlyIncome}
              onChange={e => setForm(f => ({ ...f, monthlyIncome: e.target.value }))}
              placeholder="5000" min="0" step="0.01"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#059669'}
              onBlur={e => e.target.style.borderColor = 'transparent'}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Fixed Monthly Expenses (RM)</label>
            <input
              required type="number" value={form.fixedExpenses}
              onChange={e => setForm(f => ({ ...f, fixedExpenses: e.target.value }))}
              placeholder="1500" min="0" step="0.01"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#059669'}
              onBlur={e => e.target.style.borderColor = 'transparent'}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="settings-savings-rate" className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Savings Rate</label>
              <span className="text-sm font-bold" style={{ color: '#059669' }}>{form.savingsRate}%</span>
            </div>
            <input
              id="settings-savings-rate" type="range" min="0" max="100" step="1" value={form.savingsRate}
              onChange={e => setForm(f => ({ ...f, savingsRate: Number(e.target.value) }))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>0%</span><span>100%</span></div>
          </div>

          {dailyPreview !== null && (
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' }}
            >
              <div>
                <p className="text-xs font-semibold" style={{ color: '#059669' }}>Daily Budget</p>
                <p className="text-2xl font-bold" style={{ color: '#065F46' }}>RM {dailyPreview.toFixed(2)}</p>
              </div>
              <div className="text-right text-[11px] font-medium" style={{ color: '#34D399' }}>
                <p>Income × {100 - Number(form.savingsRate)}%</p>
                <p>− Fixed Expenses</p>
                <p>÷ 30 days</p>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            {saved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
          </button>
        </form>

        {/* Formula card */}
        <div
          className="rounded-3xl p-4 animate-fade-up"
          style={{ background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', animationDelay: '0.12s' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#065F46' }}>📐 Budget Formula</p>
          <p className="text-sm font-semibold font-mono" style={{ color: '#047857' }}>((Income × (100% − Savings Rate)) − Fixed Expenses) ÷ 30</p>
          <p className="text-xs mt-1" style={{ color: '#059669' }}>{form.savingsRate}% of your income is reserved for savings &amp; investments.</p>
        </div>

        <button type="button" onClick={logout} className="w-full text-sm font-semibold text-rose-500 py-3">
          Log out
        </button>
      </div>
    </div>
  );
}
