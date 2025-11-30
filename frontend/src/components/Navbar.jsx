import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Car, User, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout, openAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              The Wheel Deal
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link 
              to="/cars" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              data-testid="cars-link"
            >
              Browse Cars
            </Link>

            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" data-testid="admin-dashboard-btn">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" data-testid="user-dashboard-btn">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      My Bookings
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600" data-testid="user-name">{user.username}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    data-testid="logout-btn"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => openAuth('login')}
                  data-testid="login-btn"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => openAuth('register')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  data-testid="signup-btn"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;