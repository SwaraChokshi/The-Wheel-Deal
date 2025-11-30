import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthModal = ({ mode, onClose }) => {
  const { login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(mode === 'register' ? 'register' : 'user');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = '';
      let payload = {};

      if (type === 'register') {
        endpoint = `${API}/auth/register`;
        payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password
        };
      } else if (type === 'login') {
        endpoint = `${API}/auth/login`;
        payload = {
          email: formData.email,
          password: formData.password
        };
      }

      const response = await axios.post(endpoint, payload);
      login(response.data.user, response.data.token);
      toast.success('Welcome back!');
      onClose();
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      const validationErrors = error.response?.data?.errors;

      // If login failed because user doesn't exist / invalid credentials, suggest signup
      if (type === 'login' && status === 401) {
        toast.error('No account found or invalid credentials. Redirecting to sign up...');
        setActiveTab('register');
      } else if (type === 'register' && status === 400 && Array.isArray(validationErrors)) {
        // Build a friendly message from validation errors
        const msgs = validationErrors.map(e => `${e.param}: ${e.msg}`);
        toast.error(msgs.join(' | '));
      } else {
        toast.error(detail || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="auth-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to The Wheel Deal</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user" data-testid="user-tab">User</TabsTrigger>
            <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4" data-testid="user-login-form">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="user-email-input"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="user-password-input"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500" 
                disabled={loading}
                data-testid="user-login-submit-btn"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={(e) => handleSubmit(e, 'register')} className="space-y-4" data-testid="register-form">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  data-testid="register-username-input"
                />
              </div>
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="register-email-input"
                />
              </div>
              <div>
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="register-password-input"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500" 
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>

          {/* admin tab removed — use /admin pages for admin actions */}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;