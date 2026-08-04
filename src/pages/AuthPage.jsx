import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button, Field, Input } from '../components/ui';

function PipelineCanvas() {
  return (
    <div className="relative hidden h-full w-full overflow-hidden bg-[#101318] lg:block">
      <div className="absolute inset-0 opacity-[0.14]" style={{ background: 'radial-gradient(60% 60% at 70% 30%, #00C2A8 0%, transparent 60%)' }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 900" fill="none" preserveAspectRatio="xMidYMid slice">
        <motion.path
          d="M 40 40 C 240 120, 160 320, 400 360 C 620 396, 700 560, 640 760"
          stroke="#00C2A8"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1] }}
          transition={{ duration: 5, repeat: Infinity, repeatDelay: 1.4 }}
        />
        <motion.path
          d="M 760 120 C 560 220, 640 440, 420 500 C 240 550, 220 700, 360 820"
          stroke="#7C6AE8"
          strokeWidth="1.2"
          opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1] }}
          transition={{ duration: 6.5, repeat: Infinity, repeatDelay: 2.2 }}
        />
        {[
          { cx: 400, cy: 360, r: 5, delay: 1 },
          { cx: 640, cy: 760, r: 6, delay: 2 },
          { cx: 420, cy: 500, r: 4, delay: 3 },
        ].map((n, i) => (
          <motion.circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            fill="#00C2A8"
            animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: n.delay, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 0 8px #00C2A8)' }}
          />
        ))}
      </svg>
      <div className="absolute bottom-10 left-10 max-w-sm">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal">DEV-001 · pipeline active</p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white">Every issue has a path.</h2>
        <p className="mt-2 text-sm text-white/60">Workspace isolation. Commit tracking. Real-time project flow.</p>
      </div>
    </div>
  );
}

export function AuthPage({ mode = 'login' }) {
  const signIn = useAppStore((s) => s.signIn);
  const toast = useAppStore((s) => s.toast);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Tell us your name.');
      return;
    }
    setError('');
    signIn(email);
    toast('success', isLogin ? `Welcome back — signed in.` : `Workspace created for ${name.trim().split(' ')[0]} — welcome to DevFlow.`);
    navigate('/app', { replace: true });
  };

  const sso = (provider) => {
    signIn(email || 'ada@acmelabs.dev');
    toast('success', `Signed in with ${provider}`);
    navigate('/app', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: form */}
      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-14 lg:w-[46%]">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="focus-ring inline-flex items-center gap-2 rounded-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-card">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h5l2.5-6 3 12 2.5-6H21" />
              </svg>
            </span>
            <span className="font-display text-lg font-bold text-ink">DevFlow</span>
          </Link>

          <h1 className="mt-8 font-display text-2xl font-bold text-ink">
            {isLogin ? 'Welcome back' : 'Start your pipeline'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isLogin ? 'Sign in to your workspaces.' : 'Create an account — workspaces and projects come next.'}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {!isLogin && (
              <Field label="Full name">
                <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
              </Field>
            )}
            <Field label="Email">
              <Input
                autoFocus={isLogin}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.dev"
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="focus-ring absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-ink"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            {error && <p className="text-xs font-medium text-coral">{error}</p>}

            <Button type="submit" size="lg" iconRight={ArrowRight} className="w-full">
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-muted">
            <span className="h-px flex-1 bg-line" /> or continue with <span className="h-px flex-1 bg-line" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" icon={Github} onClick={() => sso('GitHub')}>GitHub</Button>
            <Button variant="secondary" onClick={() => sso('Google')}>
              <G /> Google
            </Button>
          </div>

          <p className="mt-7 text-center text-sm text-muted">
            {isLogin ? (
              <>New to DevFlow? <Link to="/register" className="font-medium text-teal hover:underline">Create an account</Link></>
            ) : (
              <>Already have an account? <Link to="/login" className="font-medium text-teal hover:underline">Sign in</Link></>
            )}
          </p>
          <p className="mt-2 text-center font-mono text-[10px] text-muted">demo: any email/password works · signs in as Ada</p>
        </div>
      </div>

      {/* Right: ambient canvas */}
      <div className="flex-1">
        <PipelineCanvas />
      </div>
    </div>
  );
}

function G() {
  return (
    <span className="font-semibold">G</span>
  );
}
