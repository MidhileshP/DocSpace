import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Edit3 } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const Register = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await register(userName, email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-primary-200 dark:from-secondary-900 dark:to-secondary-950 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-primary-200 dark:border-secondary-700 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2 focus:outline-none group">
              <Edit3 className="h-7 w-7 text-primary-700 dark:text-primary-300" />
              <span className="text-xl font-bold tracking-tight text-primary-900 dark:text-white">Doc Space</span>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md space-y-8 py-12">
          <div className="text-center mb-2">
            <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-1">Create account</h2>
            <p className="text-primary-700 dark:text-primary-200">Sign up to get started</p>
          </div>
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-primary-200 dark:border-secondary-700 px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">UserName</label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-primary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-primary-900 dark:text-white"
                  placeholder="UserName"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-primary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-primary-900 dark:text-white"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-primary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-primary-900 dark:text-white pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-400 dark:text-primary-300"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 012.035 12.4M22.511 12.413a9.967 9.967 0 01-4.887 6.798" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 14.09A6 6 0 015.43 9.29M9.56 16.02a6.06 6.06 0 007.14-6.63M12 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.02 2A9.98 9.98 0 010 12c2.457 4.243 7.07 7.107 12 7.107 4.93 0 9.543-2.864 12-7.107M15 12a9.958 9.958 0 012.72-6.973M18.364 9.637A9.993 9.993 0 0024 11.998c-2.456-4.241-7.07-7.104-12-7.104C7.073 4.894 2.458 7.759 0 12c2.458 4.241 7.073 7.104 12 7.104a9.966 9.966 0 009.022-5.186" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-primary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-700 text-primary-900 dark:text-white"
                  placeholder="Confirm your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-700 dark:bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-800 dark:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-primary-600 dark:text-primary-200">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-primary-100 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
