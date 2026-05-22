import { DAILY_STORY } from "@/lib/story-data";
import { StoryScreen } from "./story-screen";

export default function StoryPage() {
  return <StoryScreen initialStory={DAILY_STORY} />;
}
