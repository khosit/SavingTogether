import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function SetupPage() {
  const { setupUser } = useApp();
  const [form, setForm] = useState({ name: "", monthlyIncome: "", fixedExpenses: "", savingsRate: 45, avatar: "👩" });

  const avatars = ["👨","👩","🧑","🐻","🐼","🦊","🐱","🐯"];

  function handleSubmit(e) {
    e.preventDefault();
    const income = parseFloat(form.monthlyIncome) || 0;
    const fixed = parseFloat(form.fixedExpenses) || 0;
    setupUser('A', { name: form.name, monthlyIncome: income, fixedExpenses: fixed, savingsRate: Number(form.savingsRate), avatar: form.avatar });
  }

  const dailyPreview = form.monthlyIncome
    ? Math.max(0, ((parseFloat(form.monthlyIncome) * ((100 - Number(form.savingsRate)) / 100)) - (parseFloat(form.fixedExpenses) || 0)) / 30)
    : null;

  return (
    <div id="setup-form" className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg,#065F46 0%,#059669 45%,#10B981 100%)" }}>
      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-10 pb-8 overflow-y-auto">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{form.avatar}</div>
            <h2 className="text-2xl font-bold text-white">Set Up Profile</h2>
            <p className="text-sm" style={{ color: 'rgba(167,243,208,0.85)' }}>Your personal profile</p>
          </div>

          <div className="card p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Avatar</label>
              <div className="flex gap-2 flex-wrap">
                {avatars.map(a => (
                  <button
                    type="button" key={a}
                    onClick={() => setForm(f => ({ ...f, avatar: a }))}
                    className="w-11 h-11 rounded-2xl text-2xl flex items-center justify-center border-2 transition-all"
                    style={{
                      borderColor: form.avatar === a ? "#059669" : "transparent",
                      background: form.avatar === a ? "rgba(5,150,105,0.1)" : "#ECFDF5",
                    }}
                  >{a}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Your Name</label>
              <input
                required type="text" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Alex"
                className="w-full rounded-2xl px-4 py-3 text-slate-700 font-medium focus:outline-none transition-all text-sm"
                style={{ background: "#ECFDF5", border: "2px solid transparent" }}
                onFocus={e => e.target.style.borderColor = "#059669"}
                onBlur={e => e.target.style.borderColor = "transparent"}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Monthly Income (RM)</label>
              <input
                required type="number" value={form.monthlyIncome}
                onChange={e => setForm(f => ({ ...f, monthlyIncome: e.target.value }))}
                placeholder="5000"
                min="0" step="0.01"
                className="w-full rounded-2xl px-4 py-3 text-slate-700 font-medium focus:outline-none transition-all text-sm"
                style={{ background: "#ECFDF5", border: "2px solid transparent" }}
                onFocus={e => e.target.style.borderColor = "#059669"}
                onBlur={e => e.target.style.borderColor = "transparent"}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Fixed Monthly Expenses (RM)</label>
              <input
                required type="number" value={form.fixedExpenses}
                onChange={e => setForm(f => ({ ...f, fixedExpenses: e.target.value }))}
                placeholder="1500 (rent, bills...)"
                min="0" step="0.01"
                className="w-full rounded-2xl px-4 py-3 text-slate-700 font-medium focus:outline-none transition-all text-sm"
                style={{ background: "#ECFDF5", border: "2px solid transparent" }}
                onFocus={e => e.target.style.borderColor = "#059669"}
                onBlur={e => e.target.style.borderColor = "transparent"}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="setup-savings-rate" className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Savings Rate</label>
                <span className="text-sm font-bold" style={{ color: '#059669' }}>{form.savingsRate}%</span>
              </div>
              <input
                id="setup-savings-rate" type="range" min="0" max="100" step="1" value={form.savingsRate}
                onChange={e => setForm(f => ({ ...f, savingsRate: Number(e.target.value) }))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>0%</span><span>100%</span></div>
            </div>

            {dailyPreview !== null && (
              <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#059669' }}>Your Daily Budget</p>
                <p className="text-3xl font-bold" style={{ color: '#065F46' }}>RM {dailyPreview.toFixed(2)}</p>
                <p className="text-xs mt-1" style={{ color: '#34D399' }}>((Income × {100 - Number(form.savingsRate)}%) − Fixed) ÷ 30 days</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!form.name || !form.monthlyIncome}
              className="btn-primary w-full"
            >
              Save & Start Tracking →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
