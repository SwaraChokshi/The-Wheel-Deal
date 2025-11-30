import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminRegister = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create admin
      const res = await axios.post(`${API}/admin/register`, {
        username: form.username,
        email: form.email,
        password: form.password
      });

      toast.success('Admin account created');

      // Auto-login after creating admin
      try {
        const loginRes = await axios.post(`${API}/auth/admin-login`, {
          email: form.email,
          password: form.password
        });
        login(loginRes.data.user, loginRes.data.token);
        toast.success('Logged in as admin');
        navigate('/admin');
      } catch (loginErr) {
        // If login fails, still navigate to admin page (user will need to login manually)
        console.error('Auto-login failed', loginErr);
        navigate('/admin');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Create Admin Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
