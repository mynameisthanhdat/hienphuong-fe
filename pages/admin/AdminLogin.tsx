import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isAdminAuthenticated, loginAdmin } from '../../services/adminAuth';

const AdminLogin: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isAdminAuthenticated()) {
    return <Navigate to="/private/hp/admin/room" replace />;
  }

  const redirectedFromProtectedRoute = Boolean((location.state as { from?: string } | null)?.from);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await loginAdmin({ username, password });
      navigate('/private/hp/admin/room', { replace: true });
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'INVALID_ADMIN_CREDENTIALS'
          ? t('admin.auth.errorInvalid')
          : t('admin.auth.errorGeneric');
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#231710_0%,_#4b321e_50%,_#d3aa62_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-white/10 bg-white/8 p-8 backdrop-blur-xl lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7c29a]/30 bg-[#d7c29a]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#f2deba]">
              <ShieldCheck size={14} />
              {t('admin.auth.eyebrow')}
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-serif font-bold leading-tight text-white sm:text-5xl">
              {t('admin.auth.title')}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/78">
              {t('admin.auth.subtitle')}
            </p>
          </section>

          <section className="rounded-[32px] bg-[#fff8ee] p-7 text-[#2f241c] shadow-[0_30px_80px_rgba(0,0,0,0.18)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f241c] text-[#d3aa62]">
                <LockKeyhole size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7d58]">
                  {t('admin.auth.formEyebrow')}
                </p>
                <h2 className="mt-1 text-2xl font-serif font-bold text-[#2f241c]">
                  {t('admin.auth.formTitle')}
                </h2>
              </div>
            </div>

            {redirectedFromProtectedRoute && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {t('admin.auth.redirectHint')}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#7d6550]">
                  {t('admin.auth.usernameLabel')}
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-[52px] w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                  placeholder={t('admin.auth.usernamePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#7d6550]">
                  {t('admin.auth.passwordLabel')}
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-[52px] w-full rounded-2xl border border-[#e3d6c5] bg-white px-4 text-[#2f241c] outline-none transition focus:border-[#c59f58] focus:ring-4 focus:ring-[#c59f58]/15"
                  placeholder={t('admin.auth.passwordPlaceholder')}
                  required
                />
              </div>

              {submitError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#2f241c] px-5 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#1f1712] disabled:cursor-not-allowed disabled:bg-[#2f241c]/60"
              >
                {isSubmitting ? t('admin.auth.signingIn') : t('admin.auth.signIn')}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
