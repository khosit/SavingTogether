import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function SetupPage() {
  const { setupUser, switchUser, users, activeUser } = useApp();
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ name: "", monthlyIncome: "", fixedExpenses: "", avatar: "👩" });

  const avatars = ["👨","👩","🧑","🐻","🐼","🦊","🐱","🐯"];

  function handleChooseUser(key) {
    setSelectedUser(key);
    const u = users[key];
    if (u) setForm({ name: u.name, monthlyIncome: u.monthlyIncome, fixedExpenses: u.fixedExpenses, avatar: u.avatar || "👤" });
    else setForm({ name: "", monthlyIncome: "", fixedExpenses: "", avatar: key === "A" ? "👨" : "👩" });
    setStep(2);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const income = parseFloat(form.monthlyIncome) || 0;
    const fixed  = parseFloat(form.fixedExpenses)  || 0;
    setupUser(selectedUser, { name: form.name, monthlyIncome: income, fixedExpenses: fixed, avatar: form.avatar });
    switchUser(selectedUser);
  }

  const dailyPreview = form.monthlyIncome
    ? Math.max(0, ((parseFloat(form.monthlyIncome) * 0.55) - (parseFloat(form.fixedExpenses) || 0)) / 30)
    : null;

  if (step === 1) return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg,#065F46 0%,#059669 45%,#10B981 100%)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="animate-scale-in text-center mb-10">
          <div className="text-7xl mb-4">💕</div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">SaveTogether</h1>
          <p className="text-sm font-medium" style={{ color: 'rgba(167,243,208,0.85)' }}>Your couple savings companion</p>
        </div>

        <div className="w-full max-w-sm animate-fade-up">
          <div className="glass rounded-3xl p-6" style={{ animationDelay: "0.1s" }}>
            <p className="text-center text-sm font-semibold text-slate-500 mb-5 uppercase tracking-widest">Choose Profile</p>
            <div className="space-y-3">
              {[
                { key: "A", fallback: "👨", fallbackLabel: "Partner A" },
                { key: "B", fallback: "👩", fallbackLabel: "Partner B" },
              ].map(({ key, fallback, fallbackLabel }) => {
                const u = users[key];
                return (
                  <button
                    key={key}
                    onClick={() => handleChooseUser(key)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group"
                    style={{
                      background: "rgba(5,150,105,0.08)",
                      border: "1.5px solid rgba(5,150,105,0.15)",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,rgba(5,150,105,0.15),rgba(16,185,129,0.1))" }}
                    >
                      {u?.avatar || fallback}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-700">{u?.name || fallbackLabel}</p>
                      <p className="text-xs text-slate-400">{u ? "Tap to switch / edit" : "Tap to set up"}</p>
                    </div>
                    {u && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                    <span className="text-slate-300 text-lg">›</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg,#065F46 0%,#059669 45%,#10B981 100%)" }}>
      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-10 pb-8 overflow-y-auto">
        <div className="w-full max-w-sm animate-fade-up">
          <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm mb-6 hover:text-white transition-colors" style={{ color: 'rgba(167,243,208,0.85)' }}>
            ← Back
          </button>

          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{form.avatar}</div>
            <h2 className="text-2xl font-bold text-white">Set Up Profile</h2>
            <p className="text-sm" style={{ color: 'rgba(167,243,208,0.85)' }}>Partner {selectedUser}</p>
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

            {dailyPreview !== null && (
              <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#059669' }}>Your Daily Budget</p>
                <p className="text-3xl font-bold" style={{ color: '#065F46' }}>RM {dailyPreview.toFixed(2)}</p>
                <p className="text-xs mt-1" style={{ color: '#34D399' }}>Income × 55% − Fixed ÷ 30 days</p>
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

