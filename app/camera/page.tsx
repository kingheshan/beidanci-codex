import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { Wordy } from "@/components/wordy";

export default function CameraPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--c-bg)] px-5 text-center text-[var(--c-ink)]" data-testid="camera-coming-soon">
      <section className="w-full max-w-[430px]">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-[28px] bg-[var(--c-primary-soft)]">
          <Wordy size={82} pose="wave" mood="happy" form="sprout" glow={false} />
        </div>
        <div role="alert" className="mt-6 inline-flex rounded-pill bg-[var(--c-ink)] px-4 py-2 text-sm font-black text-white shadow-pop">
          敬请期待
        </div>
        <h1 className="aibd-display mt-4 text-[28px] leading-tight">拍照查词</h1>
        <p className="mx-auto mt-2 max-w-[310px] text-[13px] font-semibold leading-6 text-[var(--c-ink-soft)]">
          OCR 圈词功能后续开放，当前先保留入口和后台配置位。
        </p>
        <div className="mt-7 flex justify-center">
          <Link
            href="/home"
            className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-[var(--c-primary)] px-5 text-[14px] font-black text-white shadow-[0_4px_0_var(--c-primary-deep)]"
          >
            返回首页 <ChevronRightIcon size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
