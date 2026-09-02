import { useState } from 'react';
import { useApp } from '../context/AppContext';
import SetupPage from './SetupPage';

export default function LoginPage() {
  const { login, apiError } = useApp();
  const [userKey, setUserKey] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  if (showSetup) return <SetupPage />;

  async function handleSubmit(event) {
    event.preventDefault();
    const key = userKey.trim();
    if (!key) return;
    setSubmitting(true);
    setError('');
    try {
      await login(key);
    } catch (loginError) {
      setError(loginError.message || 'User key was not found.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(160deg,#065F46 0%,#059669 45%,#10B981 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">💕</div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">SaveTogether</h1>
          <p className="text-sm" style={{ color: 'rgba(167,243,208,0.85)' }}>Sign in with your UserKey</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label htmlFor="user-key" className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">UserKey</label>
            <input
              id="user-key"
              autoFocus
              required
              value={userKey}
              onChange={event => setUserKey(event.target.value)}
              placeholder="e.g. ALEX001"
              className="w-full rounded-2xl px-4 py-3 text-slate-700 font-medium focus:outline-none"
              style={{ background: '#ECFDF5', border: '2px solid transparent' }}
            />
          </div>
          {(error || apiError) && <p className="text-xs text-rose-600">{error || apiError}</p>}
          <button disabled={submitting || !userKey.trim()} className="btn-primary w-full">
            {submitting ? 'Checking…' : 'Log in →'}
          </button>
          <p className="text-center text-xs text-slate-400">No password required.</p>
        </form>

        <button
          type="button"
          onClick={() => setShowSetup(true)}
          className="w-full mt-4 text-sm font-semibold text-white"
        >
          Don’t have an account? Set up user
        </button>
      </div>
    </div>
  );
}
