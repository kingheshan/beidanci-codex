"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CTA, Card, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import { createFetchApiClient, type ApiClient } from "@/lib/api-client";
import { validateChineseMobile } from "@/lib/auth";
import { useAuthConfig } from "@/lib/use-remote-config";
import { requestWechatLoginCode, type WechatJsApi } from "@/lib/wechat-client";
import { useAppStore } from "@/store/app-store";

type LoginScreenProps = {
  apiClient?: Pick<ApiClient, "requestPhoneCode" | "loginWithPhone" | "loginWithWechat" | "getAuthSession">;
  wechatCodeProvider?: WechatJsApi;
};

function nextAfterLogin(completed: boolean) {
  return completed ? "/home" : "/onboarding";
}

export function LoginScreen({ apiClient, wechatCodeProvider }: LoginScreenProps = {}) {
  const router = useRouter();
  const auth = useAppStore((state) => state.auth);
  const completed = useAppStore((state) => state.onboarding.completed);
  const setAuthSession = useAppStore((state) => state.setAuthSession);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const { config: authConfig } = useAuthConfig();
  const copy = authConfig.login;
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSending, setCodeSending] = useState(false);
  const [loading, setLoading] = useState<"phone" | "wechat" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (auth) {
      router.replace(nextAfterLogin(completed));
      return;
    }

    let active = true;
    client
      .getAuthSession()
      .then((session) => {
        if (!active) return;
        setAuthSession(session);
        router.replace(nextAfterLogin(completed));
      })
      .catch(() => {
        // Staying on the login form is the expected unauthenticated state.
      });

    return () => {
      active = false;
    };
  }, [auth, client, completed, router, setAuthSession]);

  const requestCode = async () => {
    setError(null);
    setNotice(null);

    if (!validateChineseMobile(phone)) {
      setError(copy.validation.invalidPhone);
      return;
    }

    setCodeSending(true);
    try {
      const result = await client.requestPhoneCode({ phone });
      if (result.devCode) {
        setCode(result.devCode);
        setNotice(copy.notices.devCodeSent);
      } else {
        setNotice(copy.notices.codeSent);
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : copy.errors.codeSendFailed);
    } finally {
      setCodeSending(false);
    }
  };

  const submitPhone = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!validateChineseMobile(phone)) {
      setError(copy.validation.invalidPhone);
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError(copy.validation.invalidCode);
      return;
    }

    setLoading("phone");
    try {
      const session = await client.loginWithPhone({ phone, code });
      setAuthSession(session);
      router.push(nextAfterLogin(completed));
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : copy.errors.phoneLoginFailed);
    } finally {
      setLoading(null);
    }
  };

  const submitWechat = async () => {
    setError(null);
    setNotice(null);
    setLoading("wechat");
    try {
      const code = await requestWechatLoginCode({ wxApi: wechatCodeProvider, fallbackCode: process.env.NEXT_PUBLIC_WECHAT_LOGIN_DEMO_CODE });
      const session = await client.loginWithWechat({ code });
      setAuthSession(session);
      router.push(nextAfterLogin(completed));
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : copy.errors.wechatLoginFailed);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--c-bg)] px-4 py-8 text-[var(--c-ink)]">
      <Card className="w-full max-w-[430px] overflow-hidden p-0 shadow-pop">
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--c-primary),var(--c-pink))] px-6 pb-8 pt-10 text-white">
          <div className="absolute -right-10 -top-8 opacity-30">
            <Wordy form="star" glow={false} mood="cheer" pose="celebrate" size={170} />
          </div>
          <Tag bg="rgba(255,255,255,.2)" color="#fff">{copy.heroTag}</Tag>
          <h1 className="aibd-display mt-4 text-[34px] leading-none">{copy.heroTitle}</h1>
          <p className="mt-2 max-w-[260px] text-sm font-semibold leading-6 text-white/78">{copy.heroSubtitle}</p>
        </section>

        <form className="space-y-4 p-5" onSubmit={submitPhone}>
          <label className="block">
            <span className="mb-1.5 block text-xs font-black text-[var(--c-ink-soft)]">{copy.phoneLabel}</span>
            <input
              aria-label={copy.phoneAria}
              className="h-12 w-full rounded-[16px] border border-[var(--c-line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--c-primary)] focus:ring-4 focus:ring-[rgba(108,92,231,.14)]"
              inputMode="tel"
              placeholder={copy.phonePlaceholder}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-black text-[var(--c-ink-soft)]">{copy.codeLabel}</span>
            <div className="flex gap-2">
              <input
                aria-label={copy.codeAria}
                className="h-12 min-w-0 flex-1 rounded-[16px] border border-[var(--c-line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--c-primary)] focus:ring-4 focus:ring-[rgba(108,92,231,.14)]"
                inputMode="numeric"
                maxLength={6}
                placeholder={copy.codePlaceholder}
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
              <button
                type="button"
                disabled={loading !== null || codeSending}
                onClick={requestCode}
                className="h-12 rounded-[16px] bg-[var(--c-primary-soft)] px-4 text-xs font-black text-[var(--c-primary)] transition active:translate-y-0.5 disabled:opacity-60"
              >
                {codeSending ? copy.requestCodeLoadingCta : copy.requestCodeCta}
              </button>
            </div>
          </label>

          {error ? <div className="rounded-[14px] bg-[#FFE1E6] px-3 py-2 text-sm font-bold text-[var(--c-danger)]">{error}</div> : null}
          {notice ? <div className="rounded-[14px] bg-[#E8FBF2] px-3 py-2 text-sm font-bold text-[#14835B]">{notice}</div> : null}

          <CTA type="submit" disabled={loading !== null}>
            {loading === "phone" ? copy.phoneLoginLoadingCta : copy.phoneLoginCta}
          </CTA>
          <button
            type="button"
            disabled={loading !== null}
            onClick={submitWechat}
            className="h-12 w-full rounded-[16px] border border-[var(--c-line)] bg-white text-sm font-black text-[var(--c-ink)] shadow-card transition active:translate-y-0.5 disabled:opacity-60"
          >
            {loading === "wechat" ? copy.wechatLoginLoadingCta : copy.wechatLoginCta}
          </button>
          <p className="text-center text-[11px] font-semibold leading-5 text-[var(--c-ink-muted)]">{copy.termsCopy}</p>
        </form>
      </Card>
    </main>
  );
}
