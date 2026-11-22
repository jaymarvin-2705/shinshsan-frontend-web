import { useState, type FormEvent } from 'react';
import { ArrowLeft, Mail, ShieldCheck, Wifi } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

import { requestPasswordReset } from '../../services/authService';

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error('Enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await requestPasswordReset(normalizedEmail);
      toast.success(
        response.message || 'If the email is registered, a recovery code has been sent.'
      );
      navigate(`/reset-password?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (error: unknown) {
      const message = isAxiosError<ApiErrorBody>(error)
        ? error.response?.data?.errors?.email?.[0] ??
          error.response?.data?.message
        : undefined;
      toast.error(message || 'Unable to request a password reset. Try again.');
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
            <span className="auth-kicker">ACCOUNT RECOVERY</span>
            <h1>Let’s get you<br />back in.</h1>
            <p>
              We’ll send a one-time recovery code to the email address
              associated with your account.
            </p>
          </div>
          <div className="auth-brand-footer">
            <ShieldCheck size={16} />
            <span>Recovery codes expire after 10 minutes</span>
          </div>
        </section>

        <section className="auth-form-panel">
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
          <div className="auth-form-heading">
            <span className="auth-form-eyebrow">PASSWORD HELP</span>
            <h2>Forgot password?</h2>
            <p>
              Enter your account email. If it is registered, we’ll send a
              6-digit recovery code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="recovery-email">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="recovery-email"
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
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Sending code...' : 'Send Recovery Code'}
            </button>
          </form>

          <p className="auth-help">
            Remembered your password? <Link to="/login">Sign in</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
