"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookIcon, BrainIcon, ChevronLeftIcon, HomeIcon, SparkleIcon, ZapIcon } from "@/components/icons";
import { CTA, Skeleton, Tag } from "@/components/ui";
import { createFetchApiClient, type ApiClient } from "@/lib/api-client";
import { formatExperienceTemplate, type ExperienceConfig } from "@/lib/experience-config";
import { RELATION_META, type MemoryMapModel, type MemoryMapNode } from "@/lib/memory-map-data";
import { useApiQuery } from "@/lib/use-api-query";
import { useExperienceConfig } from "@/lib/use-remote-config";

type MemoryMapScreenProps = {
  wordId: string;
  apiClient?: Pick<ApiClient, "getMemoryMap">;
  initialModel?: MemoryMapModel;
};

type ViewMode = "map" | "roots" | "tips";
type MemoryMapConfig = ExperienceConfig["memoryMap"];

const railIconMap: Record<MemoryMapConfig["railStats"][number]["icon"], ReactNode> = {
  sparkle: <SparkleIcon size={17} />,
  brain: <BrainIcon size={17} />,
  zap: <ZapIcon size={17} />
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function RelationLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {(["syn", "ant", "derive"] as const).map((kind) => (
        <Tag key={kind} color={RELATION_META[kind].color} bg={RELATION_META[kind].bg} size="xs">
          {RELATION_META[kind].badge}
        </Tag>
      ))}
    </div>
  );
}

function MemoryMapStatusShell({
  title,
  message,
  loadingLabel,
  action,
  onAction
}: {
  title: string;
  message: string;
  loadingLabel: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <main className="min-h-dvh bg-[#120D2A] text-white" data-testid="memory-map-ready" data-hydrated="true">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center bg-[linear-gradient(180deg,#1A1340_0%,#2B1F6E_54%,#140F2F_100%)] px-5 xl:max-w-[760px]">
        <div className="rounded-[26px] border border-white/10 bg-white/[0.08] p-5 shadow-[0_18px_56px_rgba(0,0,0,.24)]">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-white/12 text-[var(--c-accent)]">
              <BrainIcon size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="aibd-display text-[25px] leading-tight">{title}</h1>
              <p className="mt-1 text-[12px] font-semibold leading-5 text-white/62">{message}</p>
            </div>
          </div>
          {action && onAction ? (
            <CTA className="mt-5" color="var(--c-accent)" textColor="var(--c-ink)" size="md" onClick={onAction}>
              {action}
            </CTA>
          ) : (
            <div className="mt-5 space-y-3">
              <Skeleton height={18} radius={9} label={loadingLabel} style={{ background: "rgba(255,255,255,.16)" }} />
              <Skeleton width="74%" height={18} radius={9} label={loadingLabel} style={{ background: "rgba(255,255,255,.14)" }} />
              <Skeleton height={170} radius={24} label={loadingLabel} style={{ background: "rgba(255,255,255,.12)" }} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function WorkspaceRail({
  config,
  nodeCount,
  onNavigate
}: {
  config: MemoryMapConfig;
  nodeCount: number;
  onNavigate: (href: string) => void;
}) {
  return (
    <aside className="hidden h-dvh w-[288px] shrink-0 flex-col border-r border-white/10 bg-[#0F0A25]/92 px-5 py-6 text-white xl:flex">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-white/12 text-[var(--c-accent)]">
          <BrainIcon size={24} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{config.railEyebrow}</p>
          <h2 className="aibd-display mt-1 text-[21px] leading-tight">{config.railTitle}</h2>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {config.railStats.map((item) => (
          <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/[0.08] p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-white/10" style={{ color: item.color }}>
                {railIconMap[item.icon]}
              </span>
              <span className="text-[13px] font-extrabold">{item.label}</span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-white/58">{formatExperienceTemplate(item.valueTemplate, { count: nodeCount })}</div>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-2">
        <button
          type="button"
          onClick={() => onNavigate("/dashboard")}
          className="flex min-h-11 w-full items-center gap-2 rounded-[13px] border border-white/10 bg-white/10 px-3 text-[12px] font-black text-white"
          aria-label={config.dashboardAria}
        >
          <HomeIcon size={16} /> {config.dashboardCta}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("word")}
          className="flex min-h-11 w-full items-center gap-2 rounded-[13px] border border-white/10 bg-white/10 px-3 text-[12px] font-black text-white"
          aria-label={config.wordAria}
        >
          <BookIcon size={16} /> {config.wordCta}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("/study/mc")}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] border-0 bg-[var(--c-accent)] px-3 text-[13px] font-black text-[var(--c-ink)] shadow-[0_4px_0_rgba(0,0,0,.18)]"
          aria-label={config.studyAria}
        >
          <ZapIcon size={17} /> {config.studyCta}
        </button>
      </div>
    </aside>
  );
}

function NodeButton({
  node,
  selected,
  onSelect,
  index
}: {
  node: MemoryMapNode;
  selected: boolean;
  onSelect: (node: MemoryMapNode) => void;
  index: number;
}) {
  const meta = RELATION_META[node.kind];

  return (
    <motion.button
      type="button"
      aria-label={`${node.word} ${meta.label} ${node.label}`}
      onClick={() => onSelect(node)}
      initial={{ opacity: 0, scale: 0.7, x: "-50%", y: "-50%" }}
      animate={{ opacity: 1, scale: selected ? 1.08 : 1, x: "-50%", y: "-50%" }}
      whileTap={{ scale: 0.96 }}
      transition={{ delay: 0.08 + index * 0.04, type: "spring", stiffness: 380, damping: 22 }}
      className="absolute grid h-16 w-16 place-items-center rounded-full border-0 bg-white px-1.5 text-center shadow-[0_8px_24px_rgba(0,0,0,.28)] xl:h-20 xl:w-20"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        outline: selected ? `3px solid ${meta.color}` : "1px solid rgba(255,255,255,.18)"
      }}
    >
      <span className="aibd-display-en block w-[54px] text-[9px] font-extrabold leading-[1.05] text-[var(--c-ink)] [overflow-wrap:anywhere] xl:w-[68px] xl:text-[11px]">{node.word}</span>
      <span className="mt-1 text-[8px] font-black uppercase" style={{ color: meta.color }}>
        {meta.code}
      </span>
      <span className="absolute -top-3 left-1/2 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full text-[9px] font-black text-white" style={{ background: meta.color }}>
        {meta.code}
      </span>
    </motion.button>
  );
}

function GraphPanel({
  selectedNode,
  nodes,
  onSelect,
  word,
  pos
}: {
  selectedNode: MemoryMapNode | null;
  nodes: MemoryMapNode[];
  onSelect: (node: MemoryMapNode) => void;
  word: string;
  pos: string;
}) {
  return (
    <div className="relative min-h-[300px] flex-1 xl:min-h-[560px] xl:overflow-hidden xl:rounded-[28px] xl:border xl:border-white/10 xl:bg-white/[0.04]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {nodes.map((node) => (
          <line
            key={node.id}
            x1="50"
            y1="50"
            x2={node.x}
            y2={node.y}
            stroke={RELATION_META[node.kind].color}
            strokeWidth="0.45"
            strokeDasharray="1 1.4"
            opacity={selectedNode && selectedNode.id !== node.id ? 0.28 : 0.62}
          />
        ))}
      </svg>

      <motion.div
        initial={{ scale: 0.88, opacity: 0, x: "-50%", y: "-50%" }}
        animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="absolute left-1/2 top-1/2 grid h-[94px] w-[94px] place-items-center rounded-full bg-[radial-gradient(circle_at_30%_24%,var(--c-primary),var(--c-primary-deep))] text-center text-white shadow-[0_16px_42px_rgba(108,92,231,.46),inset_0_-6px_12px_rgba(0,0,0,.18)]"
      >
        <div>
          <div className="text-[10px] font-black opacity-70">{pos}</div>
          <div className="aibd-display-en max-w-[80px] text-[16px] font-extrabold leading-none">{word}</div>
        </div>
      </motion.div>

      {nodes.map((node, index) => (
        <NodeButton key={node.id} node={node} selected={selectedNode?.id === node.id} onSelect={onSelect} index={index} />
      ))}
    </div>
  );
}

export function MemoryMapScreen({ wordId, apiClient, initialModel }: MemoryMapScreenProps) {
  const router = useRouter();
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const { config: experienceConfig } = useExperienceConfig();
  const config = experienceConfig.memoryMap;
  const loadMemoryMap = useCallback(() => client.getMemoryMap(wordId), [client, wordId]);
  const mapQuery = useApiQuery(loadMemoryMap);
  const model = mapQuery.data ?? initialModel;
  const [mode, setMode] = useState<ViewMode>("map");
  const [selectedNode, setSelectedNode] = useState<MemoryMapNode | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    setSelectedNode(null);
  }, [model?.word.id]);

  if (mapQuery.loading && !model) {
    return <MemoryMapStatusShell title={config.loadingTitle} message={config.loadingMessage} loadingLabel={config.loadingLabel} />;
  }

  if (mapQuery.error && !model) {
    return (
      <MemoryMapStatusShell
        title={config.errorTitle}
        message={mapQuery.error.message}
        loadingLabel={config.loadingLabel}
        action={config.retryLabel}
        onAction={mapQuery.reload}
      />
    );
  }

  if (!model) {
    return (
      <MemoryMapStatusShell
        title={config.emptyTitle}
        message={config.emptyMessage}
        loadingLabel={config.loadingLabel}
        action={config.emptyAction}
        onAction={() => router.push(`/word/${wordId}`)}
      />
    );
  }

  const selectedMeta = selectedNode ? RELATION_META[selectedNode.kind] : null;

  const navigate = (href: string) => {
    router.push(href === "word" ? `/word/${model.word.id}` : href);
  };

  return (
    <main
      className="min-h-dvh bg-[#120D2A] text-white"
      data-testid="memory-map-ready"
      data-hydrated={hydrated ? "true" : "false"}
    >
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[linear-gradient(180deg,#1A1340_0%,#2B1F6E_54%,#140F2F_100%)] xl:max-w-[1440px] xl:flex-row xl:bg-[#120D2A]">
        <WorkspaceRail config={config} nodeCount={model.nodes.length} onNavigate={navigate} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,#1A1340_0%,#2B1F6E_54%,#140F2F_100%)] xl:bg-[radial-gradient(circle_at_50%_20%,rgba(108,92,231,.36),transparent_38%),linear-gradient(135deg,#140F2F,#211650_60%,#0F0A25)]">
          <header className="relative z-20 flex items-center justify-between px-4 pb-3 pt-[max(44px,env(safe-area-inset-top))] xl:px-8 xl:pb-0 xl:pt-6">
            <button
              type="button"
              aria-label={config.backAria}
              onClick={() => router.back()}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white shadow-[0_8px_24px_rgba(0,0,0,.18)] backdrop-blur xl:hidden"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <Tag color="#fff" bg="rgba(255,255,255,.16)" size="xs">
              <SparkleIcon size={10} /> {config.tag}
            </Tag>
          </header>

          <section className="relative z-10 px-4 xl:px-8 xl:pt-5">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white/58 xl:text-[12px]">{config.subtitle}</p>
                <h1 aria-label={`${model.word.word} ${config.headingSuffix}`} className="aibd-display-en mt-1 text-[34px] leading-none xl:text-[56px]">
                  {model.word.word}
                  <span className="ml-2 align-middle text-sm font-black text-white/62 xl:text-xl">{config.headingSuffix}</span>
                </h1>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white/14 text-white shadow-[0_10px_26px_rgba(0,0,0,.22)] xl:h-14 xl:w-14">
                <BrainIcon size={22} />
              </div>
            </div>

            <div className="mt-3 flex gap-1 rounded-[14px] bg-white/10 p-1 xl:max-w-[420px]">
              {config.modes.map((item) => {
                const active = item.id === mode;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={cx(
                      "h-9 flex-1 rounded-[11px] text-xs font-extrabold transition",
                      active ? "bg-white text-[var(--c-primary-ink)] shadow-[0_6px_18px_rgba(0,0,0,.18)]" : "text-white/68"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="min-h-0 flex flex-1 flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-5 xl:px-8 xl:pb-8 xl:pt-5">
            <div className="min-h-0 flex flex-1 flex-col xl:min-h-0">
              {mode === "map" ? (
                <GraphPanel selectedNode={selectedNode} nodes={model.nodes} onSelect={setSelectedNode} word={model.word.word} pos={model.word.pos} />
              ) : null}

              {mode === "roots" ? (
                <section className="aibd-scroll min-h-0 flex-1 overflow-auto px-4 py-5 xl:rounded-[24px] xl:border xl:border-white/10 xl:bg-white/[0.06] xl:p-5">
                  <div className="space-y-3">
                    {model.rootClues.map((clue) => (
                      <motion.div
                        key={clue.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[18px] border border-white/10 bg-white/12 p-4 shadow-[0_10px_28px_rgba(0,0,0,.18)]"
                      >
                        <div className="text-[11px] font-black text-white/54">{clue.title}</div>
                        <p className="mt-2 text-sm leading-6 text-white/90">{clue.body}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ) : null}

              {mode === "tips" ? (
                <section className="aibd-scroll min-h-0 flex-1 overflow-auto px-4 py-5 xl:rounded-[24px] xl:border xl:border-white/10 xl:bg-white/[0.06] xl:p-5">
                  <div className="space-y-3">
                    {model.aiTips.map((tip, index) => (
                      <motion.div
                        key={tip}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="flex gap-3 rounded-[18px] border border-white/10 bg-white/12 p-4 shadow-[0_10px_28px_rgba(0,0,0,.18)]"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-[var(--c-primary)]">{index + 1}</span>
                        <p className="text-sm leading-6 text-white/90">{tip}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <motion.section
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative z-20 shrink-0 rounded-t-[24px] bg-white px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-4 text-[var(--c-ink)] shadow-[0_-18px_48px_rgba(0,0,0,.28)] xl:rounded-[24px] xl:p-5 xl:shadow-[0_18px_56px_rgba(0,0,0,.24)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[14px] font-extrabold xl:text-[16px]">{config.nodePanelTitle}</h2>
                <RelationLegend />
              </div>
              <div className="mt-3 min-h-[84px] xl:min-h-[170px]">
                {selectedNode ? (
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="aibd-display-en truncate text-xl font-extrabold xl:text-2xl">{selectedNode.word}</div>
                        <div className="mt-1 text-xs font-bold" style={{ color: selectedMeta?.color }}>
                          {selectedMeta?.label}
                        </div>
                      </div>
                      <Tag color={selectedMeta?.color} bg={selectedMeta?.bg} size="xs">
                        {selectedMeta?.badge}
                      </Tag>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--c-ink-soft)]">{selectedNode.label}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[var(--c-ink-muted)] xl:text-[12px] xl:leading-6">{selectedNode.clue}</p>
                  </div>
                ) : (
                  <div className="grid min-h-[84px] place-items-center text-xs font-bold text-[var(--c-ink-soft)] xl:min-h-[170px]">{config.emptyNodeHint}</div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-[1fr_1.25fr] gap-2 xl:hidden">
                <button
                  type="button"
                  onClick={() => router.push(`/word/${model.word.id}`)}
                  className="h-[52px] rounded-[14px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] text-sm font-extrabold text-[var(--c-primary)]"
                >
                  {config.mobileBackWordCta}
                </button>
                <CTA full={false} onClick={() => router.push("/study/mc")}>
                  {config.mobileReviewCta}
                </CTA>
              </div>
              <div className="mt-5 hidden rounded-[18px] bg-[var(--c-bg)] p-4 xl:block">
                <h3 className="text-[13px] font-extrabold">{config.loopTitle}</h3>
                <p className="mt-2 text-[12px] font-semibold leading-6 text-[var(--c-ink-muted)]">{config.loopBody}</p>
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/word/${model.word.id}`)}
                    className="h-10 rounded-[12px] border border-[var(--c-line)] bg-white text-[12px] font-black text-[var(--c-primary)]"
                    aria-label={config.desktopBackWordAria}
                  >
                    {config.wordCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/study/mc")}
                    className="h-10 rounded-[12px] border-0 bg-[var(--c-primary)] text-[12px] font-black text-white"
                    aria-label={config.desktopStudyAria}
                  >
                    {config.studyCta}
                  </button>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  );
}
