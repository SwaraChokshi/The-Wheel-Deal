import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import AdminDashboard from './AdminDashboard';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPage = () => {
  const { user, login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in and admin, redirect/stay on dashboard
    if (user && user.role === 'admin') {
      // nothing, AdminDashboard will render
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/admin-login`, {
        email: form.email,
        password: form.password
      });

      // Save token + user via context
      login(res.data.user, res.data.token);
      toast.success('Admin logged in');
      // navigate to keep URL same; AdminDashboard will show because user is admin
      navigate('/admin');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  // If logged in as admin, show dashboard
  if (user && user.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </Button>
        </form>
        <p className="text-sm text-gray-500 mt-4">If you don't have an admin account, <button type="button" onClick={() => navigate('/admin/register')} className="text-blue-600 underline">create one here</button> or ask the site owner to create it.</p>
      </div>
    </div>
  );
};

export default AdminPage;
