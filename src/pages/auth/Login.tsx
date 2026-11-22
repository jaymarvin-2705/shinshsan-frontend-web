import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      await login(email.trim().toLowerCase(), password);

      toast.success('Login successful.');

      navigate('/dashboard');
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error
          ? (
              error as {
                response?: { data?: { message?: string } };
              }
            ).response?.data?.message
          : error instanceof Error
            ? error.message
            : undefined;
      setErrorMessage(
        message || 'Unable to sign in. Check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <div className="auth-brand-lockup">
            <div className="auth-brand-icon"><Wifi size={24} /></div>
            <span>SHINSHAN <strong>ISP</strong></span>
          </div>
          <div className="auth-brand-copy">
            <span className="auth-kicker">ADMINISTRATION PORTAL</span>
            <h1>Reliable connections.<br />Smarter service.</h1>
            <p>
              Manage clients, service requests, and your network from one
              secure workspace.
            </p>
          </div>
          <div className="auth-brand-footer">
            <LockKeyhole size={16} />
            <span>Secure access for authorized administrators</span>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-heading">
            <span className="auth-form-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your administrator credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
                <button
                  type="button"
                  className="auth-inline-link"
                  onClick={() => navigate('/forgot-password')}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-visibility-button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-help">
            Need access? Contact your system administrator.
          </p>
          {errorMessage && (
            <p className="auth-error" role="alert">
              {errorMessage}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}