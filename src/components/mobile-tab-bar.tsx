"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductNavIcon } from "@/components/product-navigation";
import { getProductFeatureUnavailableCopy, isProductFeatureEnabled, type ProductMobileTabId } from "@/lib/product-config";
import { useProductConfig } from "@/lib/use-remote-config";

type MobileTabBarProps = {
  active: ProductMobileTabId;
  onUnavailable?: (title: string) => void;
};

export function MobileTabBar({ active, onUnavailable }: MobileTabBarProps) {
  const router = useRouter();
  const { config } = useProductConfig();
  const items = config.navigation.mobileTabs;

  return (
    <nav className="absolute bottom-0 left-1/2 z-40 flex h-[72px] w-full max-w-[430px] -translate-x-1/2 items-start justify-around border-t border-[var(--c-line)] bg-white/95 pt-2.5 backdrop-blur-xl">
      {items.map((item) => {
        const isActive = item.id === active;
        const enabled = isProductFeatureEnabled(config, item.featureId);
        const className = "flex min-h-12 min-w-14 flex-col items-center gap-1 border-0 bg-transparent px-3 py-1";
        const style = { color: isActive ? "var(--c-primary)" : "var(--c-ink-muted)", transform: isActive ? "scale(1.05)" : "scale(1)", opacity: enabled ? 1 : 0.52 };

        if (enabled) {
          return (
            <Link
              href={item.href}
              role="button"
              key={item.id}
              onClick={(event) => {
                event.preventDefault();
                router.push(item.href);
              }}
              className={className}
              style={style}
              aria-current={isActive ? "page" : undefined}
            >
              <ProductNavIcon icon={item.icon} size={24} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        }

        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onUnavailable?.(getProductFeatureUnavailableCopy(config, item.featureId))}
            className={className}
            style={style}
            aria-current={isActive ? "page" : undefined}
            aria-disabled="true"
          >
            <ProductNavIcon icon={item.icon} size={24} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
