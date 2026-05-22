import { notFound } from "next/navigation";
import { isStudyModeId, STUDY_MODES } from "@/lib/study-data";
import { StudySessionScreen } from "./study-session-screen";

type StudyModePageProps = {
  params: {
    mode: string;
  };
  searchParams?: {
    ids?: string | string[];
    source?: string | string[];
  };
};

const SOURCE_LABELS: Record<string, string> = {
  review: "智能复习",
  mistakes: "错题重练"
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseWordIds(value: string | string[] | undefined) {
  const raw = firstParam(value);
  if (!raw) return undefined;

  const ids = raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => /^[A-Za-z0-9_-]+$/.test(item))
    .slice(0, 24);

  return ids.length > 0 ? ids : undefined;
}

function sourceLabel(value: string | string[] | undefined) {
  const source = firstParam(value);
  return source ? SOURCE_LABELS[source] : undefined;
}

export function generateStaticParams() {
  return STUDY_MODES.map((mode) => ({ mode: mode.id }));
}

export default function StudyModePage({ params, searchParams }: StudyModePageProps) {
  if (!isStudyModeId(params.mode)) {
    notFound();
  }

  return <StudySessionScreen mode={params.mode} sourceLabel={sourceLabel(searchParams?.source)} wordIds={parseWordIds(searchParams?.ids)} />;
}
