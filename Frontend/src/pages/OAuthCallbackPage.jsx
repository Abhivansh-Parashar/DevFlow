import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { tokenStore } from '../lib/api/client';
import { authService, userService } from '../lib/api/services';

export function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = params.get('code');
    if (!code) {
      setError('Google sign-in did not return an authorization code.');
      return;
    }

    authService.exchangeOAuth(code)
      .then(async (response) => {
        tokenStore.set(response);
        const user = response.user || await userService.me();
        if (user) {
          useAppStore.setState((state) => ({
            users: state.users.some((item) => String(item.id) === String(user.id))
              ? state.users.map((item) => String(item.id) === String(user.id) ? { ...item, ...user, id: String(user.id) } : item)
              : [...state.users, { ...user, id: String(user.id) }],
            signedIn: true,
            currentUserId: String(user.id),
          }));
        }
        navigate('/app', { replace: true });
      })
      .catch((err) => setError(err.message || 'Google sign-in failed. Please try again.'));
  }, [navigate, params]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <div className="card-surface max-w-md rounded-2xl p-6 text-center shadow-pop">
          <h1 className="font-display text-xl font-bold text-ink">Google sign-in failed</h1>
          <p className="mt-2 text-sm text-coral">{error}</p>
          <button className="mt-5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-card" onClick={() => navigate('/login', { replace: true })}>
            Back to sign in
          </button>
        </div>
      </main>
    );
  }

  return <main className="grid min-h-screen place-items-center text-sm text-muted">Completing Google sign-in…</main>;
}
