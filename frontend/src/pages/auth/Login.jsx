import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/pos', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in');
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fed7aa,transparent_35%),linear-gradient(135deg,#0f172a,#7c2d12)] p-4 text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl place-items-center">
        <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-white/30 bg-white/15 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-white/20"><ChefHat size={34} /></div>
            <p className="text-sm uppercase tracking-[0.35em] text-orange-100">Restaurant POS</p>
            <h1 className="mt-2 text-3xl font-black">Welcome Back</h1>
            <p className="mt-2 text-sm text-orange-100">Sign in to manage billing, KOT, tables, reports and staff.</p>
          </div>
          {error && <div className="mb-4 rounded-2xl bg-red-500/20 p-3 text-sm">{error}</div>}
          <div className="space-y-4">
            <input className="input bg-white/90 text-slate-900" type="email" placeholder="Email address" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            <input className="input bg-white/90 text-slate-900" type="password" placeholder="Password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </div>
          <button className="mt-6 w-full rounded-2xl bg-white px-4 py-3 font-black text-brand-700 transition hover:bg-orange-50" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
          <div className="mt-4 flex justify-between text-sm text-orange-100">
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/reset-password">Reset password</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
