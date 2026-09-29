import { useState } from 'react';
import { authErrorKey } from '../../firebase/auth';
import { useApp } from '../../context/AppContext';

export type AuthMode = 'login' | 'signup';
type Field = 'email' | 'pw' | 'first' | 'last' | 'terms' | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Giriş / kayıt formunun durumu ve doğrulaması. */
export function useAuthForm() {
  const { t, login, register, sendReset, showToast } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [errField, setErrField] = useState<Field>(null);
  const [loading, setLoading] = useState(false);

  const fail = (msg: string, field: Field) => {
    setError(msg);
    setErrField(field);
  };
  const clear = () => {
    setError('');
    setErrField(null);
  };

  const run = async (fn: () => Promise<void>) => {
    clear();
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      fail(t(authErrorKey(e)), null);
      setLoading(false);
    }
  };

  const submitLogin = () => {
    if (loading) return;
    if (!EMAIL_RE.test(email.trim())) return fail(t('auth.errEmail'), 'email');
    if (password.length < 6) return fail(t('auth.errPassword'), 'pw');
    run(() => login(email.trim(), password));
  };

  const submitSignup = () => {
    if (loading) return;
    if (firstName.trim().length < 2) return fail(t('auth.errName'), 'first');
    if (lastName.trim().length < 2) return fail(t('auth.errName'), 'last');
    if (!EMAIL_RE.test(email.trim())) return fail(t('auth.errEmail'), 'email');
    if (password.length < 6) return fail(t('auth.errPassword'), 'pw');
    if (!terms) return fail(t('auth.errTerms'), 'terms');
    run(() => register(firstName, lastName, email.trim(), password));
  };

  const forgot = async () => {
    if (!EMAIL_RE.test(email.trim())) return fail(t('auth.resetNeedEmail'), 'email');
    try {
      await sendReset(email.trim());
      showToast(t('auth.resetSent'));
    } catch (e) {
      fail(t(authErrorKey(e)), null);
    }
  };

  return {
    mode, switchMode: (m: AuthMode) => { setMode(m); clear(); },
    firstName, setFirstName: (v: string) => { setFirstName(v); clear(); },
    lastName, setLastName: (v: string) => { setLastName(v); clear(); },
    email, setEmail: (v: string) => { setEmail(v); clear(); },
    password, setPassword: (v: string) => { setPassword(v); clear(); },
    terms, toggleTerms: () => { setTerms((v) => !v); clear(); },
    error, errField, loading,
    submitLogin, submitSignup, forgot,
    social: () => showToast(t('auth.socialSoon')),
  };
}

export type AuthForm = ReturnType<typeof useAuthForm>;
