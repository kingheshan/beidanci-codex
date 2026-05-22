import { notFound } from "next/navigation";
import { REVIEW_QUEUE } from "@/lib/review-data";
import { findAnyWord } from "@/lib/word-search";
import { STUDY_WORDS } from "@/lib/words";
import { WordDetailScreen } from "./word-detail-screen";

type WordPageProps = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return STUDY_WORDS.map((word) => ({ id: word.id }));
}

export default function WordPage({ params }: WordPageProps) {
  const word = findAnyWord(params.id);
  if (!word) {
    notFound();
  }

  return <WordDetailScreen wordId={params.id} initialWord={word} initialReviewQueue={REVIEW_QUEUE} />;
}
