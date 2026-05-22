"use client";

import { useCallback, useMemo } from "react";
import { createFetchApiClient, type ApiClient, type ApiError } from "./api-client";
import { getAuthConfig, type AuthConfig } from "./auth-config";
import { getExperienceConfig, type ExperienceConfig } from "./experience-config";
import { getLearningPlanConfig, type LearningPlanConfig } from "./learning-plan-config";
import { getLearningWorkflowConfig, type LearningWorkflowConfig } from "./learning-workflow-config";
import { getOnboardingConfig, type OnboardingConfig } from "./onboarding-config";
import { getProductConfig, type ProductConfig } from "./product-config";
import { getStudyConfig, type StudyConfig } from "./study-config";
import { useApiQuery } from "./use-api-query";

type RemoteConfigHookOptions<TConfig, TClient> = {
  apiClient?: TClient;
  enabled?: boolean;
  fallback?: TConfig;
};

type RemoteConfigState<T> = {
  config: T;
  loading: boolean;
  error: ApiError | null;
  reload: () => void;
};

function remoteConfigEnabled(enabled?: boolean) {
  if (typeof enabled === "boolean") return enabled;
  return process.env.NODE_ENV !== "test";
}

function useRemoteConfigQuery<TConfig, TClient extends Partial<ApiClient>>(
  fallback: TConfig,
  load: (client: TClient) => Promise<TConfig>,
  options: RemoteConfigHookOptions<TConfig, TClient> = {}
): RemoteConfigState<TConfig> {
  const enabled = remoteConfigEnabled(options.enabled);
  const configFallback = options.fallback ?? fallback;
  const client = useMemo(() => options.apiClient ?? (createFetchApiClient() as TClient), [options.apiClient]);
  const loadConfig = useCallback(() => load(client), [client, load]);
  const query = useApiQuery(loadConfig, { enabled, initialData: configFallback });

  return {
    config: query.data ?? configFallback,
    loading: query.loading,
    error: query.error,
    reload: query.reload
  };
}

const loadProductConfig = (client: Pick<ApiClient, "getProductConfig">) => client.getProductConfig();
const loadOnboardingConfig = (client: Pick<ApiClient, "getOnboardingConfig">) => client.getOnboardingConfig();
const loadStudyConfig = (client: Pick<ApiClient, "getStudyConfig">) => client.getStudyConfig();
const loadLearningPlanConfig = (client: Pick<ApiClient, "getLearningPlanConfig">) => client.getLearningPlanConfig();
const loadLearningWorkflowConfig = (client: Pick<ApiClient, "getLearningWorkflowConfig">) => client.getLearningWorkflowConfig();
const loadExperienceConfig = (client: Pick<ApiClient, "getExperienceConfig">) => client.getExperienceConfig();
const loadAuthConfig = (client: Pick<ApiClient, "getAuthConfig">) => client.getAuthConfig();

export function useProductConfig(options: RemoteConfigHookOptions<ProductConfig, Pick<ApiClient, "getProductConfig">> = {}) {
  return useRemoteConfigQuery(getProductConfig(), loadProductConfig, options);
}

export function useOnboardingConfig(options: RemoteConfigHookOptions<OnboardingConfig, Pick<ApiClient, "getOnboardingConfig">> = {}) {
  return useRemoteConfigQuery(getOnboardingConfig(), loadOnboardingConfig, options);
}

export function useStudyConfig(options: RemoteConfigHookOptions<StudyConfig, Pick<ApiClient, "getStudyConfig">> = {}) {
  return useRemoteConfigQuery(getStudyConfig(), loadStudyConfig, options);
}

export function useLearningPlanConfig(options: RemoteConfigHookOptions<LearningPlanConfig, Pick<ApiClient, "getLearningPlanConfig">> = {}) {
  return useRemoteConfigQuery(getLearningPlanConfig(), loadLearningPlanConfig, options);
}

export function useLearningWorkflowConfig(options: RemoteConfigHookOptions<LearningWorkflowConfig, Pick<ApiClient, "getLearningWorkflowConfig">> = {}) {
  return useRemoteConfigQuery(getLearningWorkflowConfig(), loadLearningWorkflowConfig, options);
}

export function useExperienceConfig(options: RemoteConfigHookOptions<ExperienceConfig, Pick<ApiClient, "getExperienceConfig">> = {}) {
  return useRemoteConfigQuery(getExperienceConfig(), loadExperienceConfig, options);
}

export function useAuthConfig(options: RemoteConfigHookOptions<AuthConfig, Pick<ApiClient, "getAuthConfig">> = {}) {
  return useRemoteConfigQuery(getAuthConfig(), loadAuthConfig, options);
}
