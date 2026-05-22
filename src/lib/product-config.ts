export type ProductFeatureId =
  | "home"
  | "dashboard"
  | "study"
  | "review"
  | "mistakes"
  | "dictionary"
  | "camera"
  | "story"
  | "pk"
  | "pro"
  | "leaderboard"
  | "parent"
  | "me"
  | "settings";

export type ProductNavIconId =
  | "home"
  | "zap"
  | "brain"
  | "heart"
  | "book"
  | "camera"
  | "sparkle"
  | "sword"
  | "star"
  | "trophy"
  | "user"
  | "settings";

export type ProductBadgeId = "reviewDue" | "mistakeCount";
export type ProductNavMarker = "hot" | "gold";
export type ProductNavSectionId = "learning" | "ai" | "personal";
export type ProductMobileTabId = "home" | "review" | "rank" | "me";

export type ProductBrandConfig = {
  name: string;
  subtitle: string;
};

export type ProductFeatureConfig = {
  id: ProductFeatureId;
  label: string;
  enabled: boolean;
  releaseStage: "active" | "future";
  unavailableCopy: string;
};

export type ProductBadgeConfig = {
  id: ProductBadgeId;
  label: string;
  source: "mock" | "api";
};

export type ProductNavItem = {
  id: ProductFeatureId;
  label: string;
  href: string;
  icon: ProductNavIconId;
  badgeId?: ProductBadgeId;
  marker?: ProductNavMarker;
};

export type ProductNavSection = {
  id: ProductNavSectionId;
  title: string;
  items: ProductNavItem[];
};

export type ProductMobileTab = {
  id: ProductMobileTabId;
  featureId: ProductFeatureId;
  label: string;
  href: string;
  icon: ProductNavIconId;
};

export type ProductConfig = {
  version: number;
  brand: ProductBrandConfig;
  badges: Record<ProductBadgeId, ProductBadgeConfig>;
  features: Record<ProductFeatureId, ProductFeatureConfig>;
  navigation: {
    sections: ProductNavSection[];
    mobileTabs: ProductMobileTab[];
  };
};

const FEATURE_LABELS: Record<ProductFeatureId, string> = {
  home: "学习首页",
  dashboard: "今日学习",
  study: "刷词模式",
  review: "智能复习",
  mistakes: "错题本",
  dictionary: "我的词书",
  camera: "拍照查词",
  story: "AI 每日故事",
  pk: "单词 PK",
  pro: "升级 PRO",
  leaderboard: "排行榜",
  parent: "家长报告",
  me: "个人主页",
  settings: "设置"
};

function makeFeature(id: ProductFeatureId, enabled = true): ProductFeatureConfig {
  const label = FEATURE_LABELS[id];

  return {
    id,
    label,
    enabled,
    releaseStage: enabled ? "active" : "future",
    unavailableCopy: `${label}会在后续阶段接入`
  };
}

export const DEFAULT_PRODUCT_CONFIG: ProductConfig = {
  version: 1,
  brand: {
    name: "爱上背单词",
    subtitle: "AI · K12"
  },
  badges: {
    reviewDue: {
      id: "reviewDue",
      label: "14",
      source: "mock"
    },
    mistakeCount: {
      id: "mistakeCount",
      label: "5",
      source: "mock"
    }
  },
  features: {
    home: makeFeature("home"),
    dashboard: makeFeature("dashboard"),
    study: makeFeature("study"),
    review: makeFeature("review"),
    mistakes: makeFeature("mistakes"),
    dictionary: makeFeature("dictionary"),
    camera: makeFeature("camera"),
    story: makeFeature("story"),
    pk: makeFeature("pk"),
    pro: makeFeature("pro"),
    leaderboard: makeFeature("leaderboard"),
    parent: makeFeature("parent"),
    me: makeFeature("me"),
    settings: makeFeature("settings")
  },
  navigation: {
    sections: [
      {
        id: "learning",
        title: "学习",
        items: [
          { id: "dashboard", label: "今日学习", href: "/dashboard", icon: "home" },
          { id: "study", label: "刷词模式", href: "/study", icon: "zap" },
          { id: "review", label: "智能复习", href: "/review", icon: "brain", badgeId: "reviewDue" },
          { id: "mistakes", label: "错题本", href: "/mistakes", icon: "heart", badgeId: "mistakeCount" },
          { id: "dictionary", label: "我的词书", href: "/dictionary", icon: "book" },
          { id: "camera", label: "拍照查词", href: "/camera", icon: "camera" }
        ]
      },
      {
        id: "ai",
        title: "AI 工具",
        items: [
          { id: "story", label: "AI 每日故事", href: "/story", icon: "sparkle", marker: "hot" },
          { id: "pk", label: "单词 PK", href: "/pk", icon: "sword" },
          { id: "pro", label: "升级 PRO", href: "/pro", icon: "star", marker: "gold" }
        ]
      },
      {
        id: "personal",
        title: "个人",
        items: [
          { id: "leaderboard", label: "排行榜", href: "/leaderboard", icon: "trophy" },
          { id: "parent", label: "家长报告", href: "/parent", icon: "user" },
          { id: "me", label: "个人主页", href: "/me", icon: "user" },
          { id: "settings", label: "设置", href: "/settings", icon: "settings" }
        ]
      }
    ],
    mobileTabs: [
      { id: "home", featureId: "home", href: "/home", label: "学习", icon: "home" },
      { id: "review", featureId: "review", href: "/review", label: "复习", icon: "brain" },
      { id: "rank", featureId: "leaderboard", href: "/rank", label: "排行", icon: "trophy" },
      { id: "me", featureId: "me", href: "/me", label: "我的", icon: "user" }
    ]
  }
};

export function getProductConfig(): ProductConfig {
  return DEFAULT_PRODUCT_CONFIG;
}

export function getProductNavBadge(config: ProductConfig, item: ProductNavItem) {
  return item.badgeId ? config.badges[item.badgeId]?.label : undefined;
}

export function isProductFeatureEnabled(config: ProductConfig, featureId: ProductFeatureId) {
  return config.features[featureId]?.enabled ?? false;
}

export function getProductFeatureUnavailableCopy(config: ProductConfig, featureId: ProductFeatureId) {
  return config.features[featureId]?.unavailableCopy ?? `${config.features[featureId]?.label ?? "该功能"}会在后续阶段接入`;
}

export function getProductNavSections(config: ProductConfig, sectionIds?: ProductNavSectionId[]) {
  if (!sectionIds?.length) return config.navigation.sections;
  const allowed = new Set<ProductNavSectionId>(sectionIds);
  return config.navigation.sections.filter((section) => allowed.has(section.id));
}
