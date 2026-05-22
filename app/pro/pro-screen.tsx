"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, SparkleIcon } from "@/components/icons";
import { CTA, GemPill, StreakChip, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import type { ApiClient } from "@/lib/api-client";
import { createFetchApiClient } from "@/lib/fetch-api-client";
import { formatExperienceTemplate, type ExperienceConfig } from "@/lib/experience-config";
import { findProPlan, PRO_FEATURES, PRO_PLANS, type ProPlan, type ProPlanId } from "@/lib/pro-data";
import { useExperienceConfig } from "@/lib/use-remote-config";
import { useAppStore } from "@/store/app-store";

type ProScreenProps = {
  apiClient?: Pick<ApiClient, "createProCheckout">;
};

function SparkleField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 34 }).map((_, index) => (
        <span
          key={index}
          className="absolute rounded-full animate-drift"
          style={{
            left: `${(index * 29) % 100}%`,
            top: `${(index * 17) % 100}%`,
            width: 3 + (index % 3),
            height: 3 + (index % 3),
            background: ["var(--c-accent)", "#fff", "var(--c-pink)", "var(--c-mint)"][index % 4],
            opacity: 0.36 + (index % 3) * 0.16,
            animationDuration: `${3 + (index % 5) * 0.5}s`,
            animationDelay: `${index * 0.08}s`
          }}
        />
      ))}
    </div>
  );
}

function FeatureComparison({ config }: { config: ExperienceConfig["pro"] }) {
  return (
    <section className="rounded-[18px] border border-white/15 bg-white/[.08] p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,.18)] backdrop-blur-xl xl:rounded-[24px] xl:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-black tracking-[0.08em] text-[var(--c-accent)]">{config.comparisonEyebrow}</div>
          <h2 className="aibd-display mt-1 text-lg leading-tight xl:text-[26px]">{config.comparisonTitle}</h2>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[10px] font-black">
          <span className="rounded-pill bg-white/10 px-2 py-1 text-white/55">{config.freeLabel}</span>
          <span className="rounded-pill bg-[var(--c-accent)] px-2 py-1 text-[var(--c-ink)]">{config.proLabel}</span>
        </div>
      </div>

      <div className="space-y-1">
        {PRO_FEATURES.map((feature) => (
          <div key={feature.title} data-testid="pro-feature" className="grid min-h-[56px] grid-cols-[1fr_44px_48px] items-center gap-2 border-t border-white/10 py-2 first:border-t-0 xl:grid-cols-[minmax(0,1fr)_82px_92px] xl:gap-4 xl:py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-white/10 text-[17px] xl:h-10 xl:w-10 xl:text-[20px]">{feature.icon}</span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-extrabold xl:text-[15px]">{feature.title}</span>
                <span className="mt-0.5 block truncate text-[10px] font-semibold text-white/58 xl:text-[11px]">{feature.subtitle}</span>
              </span>
            </div>
            <div className="text-center text-[10px] font-bold text-white/52 xl:text-[12px]">{feature.free}</div>
            <div className="text-center text-[10px] font-black text-[var(--c-accent)] xl:text-[12px]">{feature.pro}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SocialProof({ config }: { config: ExperienceConfig["pro"] }) {
  return (
    <section className="rounded-[16px] border border-[rgba(255,214,10,.32)] bg-[rgba(255,214,10,.12)] p-3.5 text-white xl:p-4">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm">★★★★★</span>
        <span className="text-[11px] font-extrabold">{config.socialRating}</span>
      </div>
      <p className="text-[11px] font-semibold leading-relaxed text-white/78">
        {config.socialProof}
      </p>
    </section>
  );
}

function ProofMetric({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-[18px] border border-white/12 bg-white/[.08] p-4 text-left shadow-[0_16px_42px_rgba(0,0,0,.16)] backdrop-blur-xl">
      <div className="aibd-display text-[20px] leading-tight text-[var(--c-accent)]">{title}</div>
      <div className="mt-1 text-[11px] font-semibold leading-5 text-white/66">{subtitle}</div>
    </div>
  );
}

function PlanButton({ plan, picked, onPick }: { plan: ProPlan; picked: boolean; onPick: () => void }) {
  const detail = plan.perMonth ? `¥${plan.perMonth}/月${plan.save ? ` · 省 ¥${plan.save}` : ""}` : "一次买断";

  return (
    <button
      type="button"
      aria-pressed={picked}
      onClick={onPick}
      className="relative min-h-[74px] flex-1 rounded-[14px] border-2 px-2.5 py-3 text-left transition xl:min-h-[108px] xl:flex-none xl:px-4 xl:py-4"
      style={{
        background: picked ? "#fff" : "rgba(255,255,255,.10)",
        borderColor: picked ? "var(--c-accent)" : "rgba(255,255,255,.18)",
        color: picked ? "var(--c-primary-deep)" : "#fff",
        boxShadow: picked ? "0 4px 0 var(--c-accent)" : "none"
      }}
    >
      {plan.tag ? (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-accent)] px-2 py-0.5 text-[9px] font-black text-[var(--c-ink)]">
          {plan.tag}
        </span>
      ) : null}
      <span className="block text-[11px] font-extrabold opacity-70 xl:text-[13px]">{plan.name}</span>
      <span className="aibd-display-en mt-0.5 block text-xl font-black xl:text-[34px]">¥{plan.price}</span>
      <span className="mt-0.5 block text-[9px] font-bold opacity-60 xl:text-[11px]">{detail}</span>
    </button>
  );
}

function PlanPanel({
  picked,
  selectedPlan,
  config,
  loading,
  onPick,
  onPurchase
}: {
  picked: ProPlanId;
  selectedPlan: ProPlan;
  config: ExperienceConfig["pro"];
  loading: boolean;
  onPick: (planId: ProPlanId) => void;
  onPurchase: () => void;
}) {
  const purchaseCta = formatExperienceTemplate(config.purchaseCtaTemplate, { price: selectedPlan.price });

  return (
    <footer className="absolute bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-white/10 bg-[#151129] px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_40px_rgba(0,0,0,.22)] xl:sticky xl:top-7 xl:left-auto xl:bottom-auto xl:max-w-none xl:translate-x-0 xl:rounded-[24px] xl:border xl:border-white/15 xl:bg-white/[.10] xl:p-5 xl:backdrop-blur-xl">
      <div className="mb-4 hidden xl:block">
        <Tag color="var(--c-ink)" bg="var(--c-accent)" size="xs">
          {config.discountTag}
        </Tag>
        <h2 className="aibd-display mt-2 text-[26px] leading-tight text-white">{config.planTitle}</h2>
        <p className="mt-1 text-[12px] font-semibold leading-5 text-white/65">{config.planBody}</p>
      </div>
      <div className="mb-3 flex gap-1.5 xl:flex-col xl:gap-3">
        {PRO_PLANS.map((plan) => (
          <PlanButton key={plan.id} plan={plan} picked={picked === plan.id} onPick={() => onPick(plan.id)} />
        ))}
      </div>
      <CTA color="var(--c-accent)" textColor="var(--c-ink)" size="lg" disabled={loading} onClick={onPurchase}>
        {loading ? "支付确认中..." : purchaseCta}
      </CTA>
      <div className="mt-2 text-center text-[9px] font-semibold text-white/45 xl:text-[11px]">{config.paymentNote}</div>
      <div className="mt-4 hidden grid-cols-3 gap-2 text-center xl:grid">
        {config.trustLabels.map((label) => (
          <div key={label} className="rounded-[14px] bg-white/[.08] px-2 py-3 text-[11px] font-black text-white/78">
            <span className="mb-1 block text-[var(--c-accent)]">✓</span>
            {label}
          </div>
        ))}
      </div>
    </footer>
  );
}

export function ProScreen({ apiClient }: ProScreenProps = {}) {
  const router = useRouter();
  const activatePro = useAppStore((state) => state.activatePro);
  const subscription = useAppStore((state) => state.subscription);
  const learning = useAppStore((state) => state.learning);
  const [hydrated, setHydrated] = useState(false);
  const [picked, setPicked] = useState<ProPlanId>(subscription.planId ?? "yearly");
  const [toast, setToast] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const routeTimer = useRef<number | null>(null);
  const selectedPlan = useMemo(() => findProPlan(picked), [picked]);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const { config: experienceConfig } = useExperienceConfig();
  const config = experienceConfig.pro;

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    return () => {
      if (routeTimer.current) window.clearTimeout(routeTimer.current);
    };
  }, []);

  const completePurchase = async () => {
    if (purchasing) return;
    setPurchasing(true);

    try {
      const checkout = await client.createProCheckout({ planId: selectedPlan.id, channel: "wechat" });
      if (!checkout.subscription.isPro || !checkout.subscription.planId) {
        setToast(checkout.payment.message);
        return;
      }

      activatePro(checkout.subscription.planId, checkout.subscription.startedAt, checkout.subscription.sourceOrderId);
      setToast(formatExperienceTemplate(config.successToastTemplate, { planName: selectedPlan.name }));
      routeTimer.current = window.setTimeout(() => {
        router.push("/me");
      }, 1200);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "支付创建失败，请稍后重试");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-[linear-gradient(180deg,#151129_0%,#24304F_56%,#111827_100%)] text-white"
      data-hydrated={hydrated ? "true" : "false"}
      data-testid="pro-ready"
    >
      <SparkleField />
      <div className="relative z-10 mx-auto flex h-dvh w-full max-w-[430px] flex-col xl:h-auto xl:min-h-dvh xl:max-w-[1180px] xl:px-8 xl:py-7">
        <header className="flex items-start justify-between gap-4 px-4 pt-[max(46px,env(safe-area-inset-top))] xl:px-0 xl:pt-0">
          <button type="button" aria-label="关闭 PRO 付费墙" onClick={() => router.push("/me")} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur-xl">
            <ChevronLeftIcon size={20} />
          </button>
          <div className="hidden min-w-0 flex-1 xl:block">
            <div className="text-[11px] font-bold text-white/50">2026 · 5 · 19 · 周二</div>
            <h2 className="aibd-display mt-1 text-[30px] leading-tight">PRO 升级工作台</h2>
          </div>
          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <StreakChip days={learning.streak} size="sm" />
            <GemPill count={learning.gems} size="sm" />
            <button type="button" onClick={() => router.push("/dashboard")} className="h-10 rounded-pill bg-[var(--c-accent)] px-4 text-[12px] font-black text-[var(--c-ink)]" aria-label={config.dashboardBackLabel}>
              {config.dashboardBackLabel}
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start xl:gap-6 xl:pt-6">
          <div className="min-w-0 xl:space-y-5">
            <section className="px-4 text-center xl:rounded-[28px] xl:border xl:border-white/15 xl:bg-white/[.08] xl:p-7 xl:text-left xl:shadow-[0_24px_80px_rgba(0,0,0,.22)] xl:backdrop-blur-xl">
              <div className="xl:flex xl:items-center xl:gap-7">
                <motion.div className="xl:shrink-0" initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}>
                  <Wordy size={104} pose="celebrate" mood="cheer" form="rocket" />
                </motion.div>
                <div className="min-w-0 xl:flex-1">
                  <Tag color="var(--c-ink)" bg="var(--c-accent)" size="xs">
                    <SparkleIcon size={10} fillColor="var(--c-ink)" />
                    {config.heroRefundTag}
                  </Tag>
                  <h1 className="aibd-display mt-2 text-[27px] leading-none xl:text-[48px] xl:leading-tight">
                    <span className="bg-[linear-gradient(90deg,var(--c-accent),var(--c-pink))] bg-clip-text text-transparent">{config.heroTitle}</span>
                  </h1>
                  <p className="mt-1 text-[13px] font-semibold text-white/78 xl:max-w-[540px] xl:text-[15px] xl:leading-7">{config.heroSubtitle}</p>
                  <div className="mt-5 hidden grid-cols-3 gap-3 xl:grid">
                    {config.proofMetrics.map((metric) => (
                      <ProofMetric key={metric.title} title={metric.title} subtitle={metric.subtitle} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="aibd-scroll flex-1 overflow-auto px-4 pb-[196px] pt-4 xl:overflow-visible xl:px-0 xl:pb-0 xl:pt-0">
              <FeatureComparison config={config} />
              <div className="mt-3">
                <SocialProof config={config} />
              </div>
            </section>
          </div>

          <PlanPanel picked={picked} selectedPlan={selectedPlan} config={config} loading={purchasing} onPick={setPicked} onPurchase={completePurchase} />
        </div>
      </div>

      {toast ? <div className="absolute left-1/2 top-16 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-white px-4 py-2 text-xs font-bold text-[var(--c-primary-deep)] shadow-pop">{toast}</div> : null}
    </main>
  );
}
