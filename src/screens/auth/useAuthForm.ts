import { useState } from 'react';
import { authErrorKey } from '../../firebase/auth';
import { SOCIAL_UNAVAILABLE, type SocialKind } from '../../firebase/social';
import type { LegalDocId } from '../../i18n/legal';
import { useApp } from '../../context/AppContext';
import { EMAIL_RE } from '../../utils/text';

export type AuthMode = 'login' | 'signup';
type Field = 'email' | 'pw' | 'first' | 'last' | 'terms' | null;

/** Giriş / kayıt formunun durumu ve doğrulaması. */
export function useAuthForm() {
  const { t, login, loginSocial, register, sendReset, showToast } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Kullanım koşulları ve gizlilik politikası ayrı ayrı okunup kabul edilir; ikisi de kabul edilince kutu işaretlenir.
  const [accepted, setAccepted] = useState<Record<LegalDocId, boolean>>({ terms: false, privacy: false });
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null);
  const terms = accepted.terms && accepted.privacy;
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
    terms, accepted, legalDoc,
    openLegal: (d: LegalDocId) => { setLegalDoc(d); clear(); },
    closeLegal: () => setLegalDoc(null),
    acceptLegal: () => {
      if (legalDoc) setAccepted((a) => ({ ...a, [legalDoc]: true }));
      setLegalDoc(null);
      clear();
    },
    /** Kutuya dokunma: işaretliyse ikisini de geri alır; değilse henüz kabul edilmemiş ilk metni açar. */
    toggleTerms: () => {
      clear();
      if (terms) setAccepted({ terms: false, privacy: false });
      else setLegalDoc(accepted.terms ? 'privacy' : 'terms');
    },
    error, errField, loading,
    submitLogin, submitSignup, forgot,
    social: async (kind: SocialKind) => {
      if (loading) return;
      clear();
      setLoading(true);
      try {
        if (!(await loginSocial(kind))) setLoading(false); // iptal
      } catch (e) {
        setLoading(false);
        if ((e as { code?: string })?.code === SOCIAL_UNAVAILABLE) showToast(t('auth.socialSoon'));
        else fail(t(authErrorKey(e)), null);
      }
    },
  };
}

export type AuthForm = ReturnType<typeof useAuthForm>;
