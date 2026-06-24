import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export default function ResetPassword() {
  const [form, setForm] = useState({ token: '', password: '' });
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    const { data } = await api.post('/auth/reset-password', form);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/pos', { replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h1 className="text-2xl font-black">Reset Password</h1>
        <input className="input mt-6" placeholder="Reset token" value={form.token} onChange={(event) => setForm({ ...form, token: event.target.value })} required />
        <input className="input mt-4" type="password" placeholder="New password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        <button className="btn-primary mt-6 w-full">Reset Password</button>
        <Link className="mt-4 block text-center text-sm text-brand-600" to="/login">Back to login</Link>
      </form>
    </div>
  );
}
