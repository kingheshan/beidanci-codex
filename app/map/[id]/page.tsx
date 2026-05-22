import { notFound } from "next/navigation";
import { getMemoryMap } from "@/lib/memory-map-data";
import { findAnyWord } from "@/lib/word-search";
import { STUDY_WORDS } from "@/lib/words";
import { MemoryMapScreen } from "./memory-map-screen";

type MemoryMapPageProps = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return STUDY_WORDS.map((word) => ({ id: word.id }));
}

export default function MemoryMapPage({ params }: MemoryMapPageProps) {
  const word = findAnyWord(params.id);
  if (!word) {
    notFound();
  }

  return <MemoryMapScreen wordId={params.id} initialModel={getMemoryMap(word.id)} />;
}
