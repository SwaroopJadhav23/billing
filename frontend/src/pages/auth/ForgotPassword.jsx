import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    const { data } = await api.post('/auth/forgot-password', { email });
    setMessage(data.resetToken ? `Reset token: ${data.resetToken}` : data.message);
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h1 className="text-2xl font-black">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-500">Enter your email to generate a reset token.</p>
        <input className="input mt-6" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        {message && <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{message}</p>}
        <button className="btn-primary mt-6 w-full">Send Reset Link</button>
        <Link className="mt-4 block text-center text-sm text-brand-600" to="/login">Back to login</Link>
      </form>
    </div>
  );
}
