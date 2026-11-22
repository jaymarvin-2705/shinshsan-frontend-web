import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

import { changePassword } from '../../services/authService';

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      toast.error('Your new password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirmation) {
      toast.error('Your new passwords do not match.');
      return;
    }
    if (currentPassword === password) {
      toast.error('Choose a password different from your current one.');
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword(
        currentPassword,
        password,
        passwordConfirmation
      );
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
      toast.success(response.message || 'Password changed successfully.');
      navigate('/dashboard');
    } catch (error: unknown) {
      const message = isAxiosError<ApiErrorBody>(error)
        ? error.response?.data?.errors?.current_password?.[0] ??
          error.response?.data?.errors?.password?.[0] ??
          error.response?.data?.message
        : undefined;
      toast.error(message || 'Unable to change your password. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page auth-page-dashboard">
      <div className="auth-shell auth-shell-compact">
        <section className="auth-brand-panel">
          <div className="auth-brand-lockup">
            <div className="auth-brand-icon"><ShieldCheck size={24} /></div>
            <span>SHINSHAN <strong>ISP</strong></span>
          </div>
          <div className="auth-brand-copy">
            <span className="auth-kicker">ACCOUNT SECURITY</span>
            <h1>Protect your<br />administrator access.</h1>
            <p>
              Choose a strong, unique password to keep your Shinshan ISP
              management account secure.
            </p>
          </div>
          <div className="auth-brand-footer">
            <LockKeyhole size={16} />
            <span>Your password is never shown or shared</span>
          </div>
        </section>

        <section className="auth-form-panel">
          <Link to="/dashboard" className="auth-back-link">
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
          <div className="auth-form-heading">
            <span className="auth-form-eyebrow">ACCOUNT SECURITY</span>
            <h2>Change password</h2>
            <p>Confirm your current password, then enter a new one.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="current-password">Current password</label>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="current-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
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
              <label htmlFor="new-password">New password</label>
              <div className="auth-input-wrap">
                <KeyRound size={18} aria-hidden="true" />
                <input
                  id="new-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-new-password">Confirm new password</label>
              <div className="auth-input-wrap">
                <KeyRound size={18} aria-hidden="true" />
                <input
                  id="confirm-new-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>

          <p className="auth-help">
            Forgot your current password?{' '}
            <Link to="/forgot-password">Recover account</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
