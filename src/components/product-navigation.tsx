"use client";

import type { ReactNode } from "react";
import {
  BookIcon,
  BrainIcon,
  HeartIcon,
  HomeIcon,
  SparkleIcon,
  StarIcon,
  TrophyIcon,
  UserIcon,
  ZapIcon
} from "@/components/icons";
import { Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import {
  getProductNavBadge,
  getProductNavSections,
  isProductFeatureEnabled,
  type ProductFeatureId,
  type ProductConfig,
  type ProductNavIconId,
  type ProductNavItem,
  type ProductNavSectionId
} from "@/lib/product-config";
import { useProductConfig } from "@/lib/use-remote-config";

type ProductSidebarProps = {
  activeId: ProductFeatureId;
  onNavigate: (href: string) => void;
  onUnavailable: (label: string) => void;
  brandHref?: string;
  brandSubtitle?: string;
  sectionIds?: ProductNavSectionId[];
  labelOverrides?: Partial<Record<ProductFeatureId, string>>;
  activeColor?: string;
  activeBg?: string;
  footer?: ReactNode;
};

export function ProductNavIcon({ icon, size = 18 }: { icon: ProductNavIconId; size?: number }) {
  if (icon === "home") return <HomeIcon size={size} />;
  if (icon === "zap") return <ZapIcon size={size} />;
  if (icon === "brain") return <BrainIcon size={size} />;
  if (icon === "heart") return <HeartIcon size={size} />;
  if (icon === "book") return <BookIcon size={size} />;
  if (icon === "camera") return <span aria-hidden>📷</span>;
  if (icon === "sparkle") return <SparkleIcon size={size} />;
  if (icon === "sword") return <span aria-hidden>⚔️</span>;
  if (icon === "star") return <StarIcon size={size} />;
  if (icon === "trophy") return <TrophyIcon size={size} />;
  if (icon === "user") return <UserIcon size={size} />;
  return <span aria-hidden>⚙️</span>;
}

function SidebarButton({
  config,
  item,
  active,
  label,
  activeColor,
  activeBg,
  onNavigate,
  onUnavailable
}: {
  config: ProductConfig;
  item: ProductNavItem;
  active: boolean;
  label: string;
  activeColor: string;
  activeBg: string;
  onNavigate: (href: string) => void;
  onUnavailable: (label: string) => void;
}) {
  const badge = getProductNavBadge(config, item);
  const enabled = isProductFeatureEnabled(config, item.id);
  const handleClick = () => {
    if (enabled) {
      onNavigate(item.href);
      return;
    }

    onUnavailable(label);
  };

  return (
    <button
      key={item.id}
      type="button"
      onClick={handleClick}
      className="mb-1 flex min-h-[42px] w-full items-center gap-2.5 rounded-[10px] px-3.5 text-left text-[13px] font-bold transition hover:bg-[var(--c-bg)]"
      style={{
        background: active ? activeBg : "transparent",
        color: active ? activeColor : item.marker === "gold" ? "var(--c-warning)" : "var(--c-ink-soft)",
        opacity: enabled ? 1 : 0.52
      }}
      aria-label={label}
      aria-disabled={!enabled}
    >
      <span className="grid h-5 w-5 place-items-center">
        <ProductNavIcon icon={item.icon} />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge ? (
        <Tag size="xs" color={active ? activeColor : "var(--c-ink-muted)"} bg={active ? "#fff" : "var(--c-bg-deep)"}>
          {badge}
        </Tag>
      ) : null}
      {item.marker === "hot" ? <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-coral)]" /> : null}
      {item.marker === "gold" ? <span className="text-xs">👑</span> : null}
    </button>
  );
}

export function ProductSidebar({
  activeId,
  onNavigate,
  onUnavailable,
  brandHref,
  brandSubtitle,
  sectionIds,
  labelOverrides,
  activeColor = "var(--c-primary)",
  activeBg = "var(--c-primary-soft)",
  footer
}: ProductSidebarProps) {
  const { config } = useProductConfig();
  const sections = getProductNavSections(config, sectionIds);
  const brand = (
    <>
      <Wordy size={38} pose="wave" mood="happy" glow={false} />
      <span>
        <span className="aibd-display block text-base leading-none">{config.brand.name}</span>
        <span className="mt-0.5 block text-[9px] font-bold text-[var(--c-ink-muted)]">{brandSubtitle ?? config.brand.subtitle}</span>
      </span>
    </>
  );

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[var(--c-line)] bg-white xl:flex">
      {brandHref ? (
        <button className="flex items-center gap-2 px-5 py-5 text-left" type="button" onClick={() => onNavigate(brandHref)}>
          {brand}
        </button>
      ) : (
        <div className="flex items-center gap-2 px-5 py-5">{brand}</div>
      )}

      <nav className="aibd-scroll flex-1 overflow-auto px-2 pb-4">
        {sections.map((section) => (
          <section key={section.id}>
            <div className="px-3.5 pb-1.5 pt-3 text-[10px] font-black tracking-[.1em] text-[var(--c-ink-muted)]">{section.title}</div>
            {section.items.map((item) => (
              <SidebarButton
                key={item.id}
                config={config}
                item={item}
                active={item.id === activeId}
                label={labelOverrides?.[item.id] ?? item.label}
                activeColor={activeColor}
                activeBg={activeBg}
                onNavigate={onNavigate}
                onUnavailable={onUnavailable}
              />
            ))}
          </section>
        ))}
      </nav>

      {footer ? <div className="border-t border-[var(--c-line)] p-4">{footer}</div> : null}
    </aside>
  );
}
