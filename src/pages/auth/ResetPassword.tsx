import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Wifi,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

import { resetPassword } from '../../services/authService';

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      toast.error('Enter the 6-digit recovery code.');
      return;
    }
    if (password.length < 8) {
      toast.error('Your password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirmation) {
      toast.error('Your passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(
        normalizedEmail,
        normalizedOtp,
        password,
        passwordConfirmation
      );
      toast.success(response.message || 'Password reset successfully. Sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (error: unknown) {
      const message = isAxiosError<ApiErrorBody>(error)
        ? error.response?.data?.errors?.otp?.[0] ??
          error.response?.data?.errors?.password?.[0] ??
          error.response?.data?.message
        : undefined;
      toast.error(message || 'Unable to reset your password. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell auth-shell-compact">
        <section className="auth-brand-panel">
          <div className="auth-brand-lockup">
            <div className="auth-brand-icon"><Wifi size={24} /></div>
            <span>SHINSHAN <strong>ISP</strong></span>
          </div>
          <div className="auth-brand-copy">
            <span className="auth-kicker">SECURE RESET</span>
            <h1>A fresh start<br />for your account.</h1>
            <p>
              Use the recovery code sent to your email, then create a strong
              password you haven’t used before.
            </p>
          </div>
          <div className="auth-brand-footer">
            <KeyRound size={16} />
            <span>Recovery code is valid for 10 minutes</span>
          </div>
        </section>

        <section className="auth-form-panel">
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
          <div className="auth-form-heading">
            <span className="auth-form-eyebrow">ACCOUNT RECOVERY</span>
            <h2>Reset password</h2>
            <p>Enter your recovery code and choose a new password.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="reset-email">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="reset-otp">6-digit recovery code</label>
              <div className="auth-input-wrap">
                <KeyRound size={18} aria-hidden="true" />
                <input
                  id="reset-otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="000000"
                  autoComplete="one-time-code"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="reset-password">New password</label>
              <div className="auth-input-wrap">
                <KeyRound size={18} aria-hidden="true" />
                <input
                  id="reset-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-visibility-button"
                  aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                  onClick={() => setShowPasswords((value) => !value)}
                >
                  {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="reset-confirm">Confirm new password</label>
              <div className="auth-input-wrap">
                <KeyRound size={18} aria-hidden="true" />
                <input
                  id="reset-confirm"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>

          <p className="auth-help">
            Need another code? <Link to="/forgot-password">Request a new one</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
