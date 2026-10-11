import { BadgeCheck, Calculator, HardHat, Sparkles } from "lucide-react";
import type { EstimatePublicConfig } from "@/types/estimate";
import { EstimateWidget } from "./estimate-widget";

const getSteps = (aiEnabled: boolean) => [
  {
    icon: aiEnabled ? Sparkles : Calculator,
    title: aiEnabled ? "Mô tả ngôi nhà" : "Nhập thông tin công trình",
    text: aiEnabled
      ? "Nhập kích thước, số tầng – hoặc tả bằng lời, AI tự điền giúp."
      : "Nhập loại công trình, diện tích và số tầng để tính chi phí tham khảo.",
  },
  {
    icon: Calculator,
    title: "Tính theo đơn giá thật",
    text: "Diện tích quy đổi từng hạng mục × đơn giá tham khảo.",
  },
  {
    icon: HardHat,
    title: "Kỹ sư xác nhận",
    text: "Kỹ sư gọi lại, khảo sát và gửi báo giá chi tiết miễn phí.",
  },
];

export function EstimateSection({
  config,
  headingLevel = "h2",
  id = "du-toan",
}: {
  config: EstimatePublicConfig;
  headingLevel?: "h1" | "h2";
  id?: string;
}) {
  const Heading = headingLevel;
  const steps = getSteps(config.aiEnabled);
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative scroll-mt-28 overflow-hidden bg-[#0d0a3a] py-16 sm:py-20"
    >
      {/* Nền lưới bản vẽ kỹ thuật */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#1808AA] opacity-60 blur-3xl" />

      <div className="container relative mx-auto grid gap-10 px-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <div className="text-white lg:sticky lg:top-40">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-100 ring-1 ring-white/20">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> {config.aiEnabled ? "Dự toán AI · Miễn phí" : "Dự toán chi phí · Miễn phí"}
          </p>
          <Heading id={`${id}-title`} className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Biết trước chi phí xây nhà trong 3 phút
          </Heading>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-indigo-100/90">
            {config.aiEnabled
              ? "Trợ lý AI giúp nhập nhanh yêu cầu, hệ thống tính theo đơn giá tham khảo và kỹ sư Hưng Phúc xác nhận lại trước khi bạn quyết định."
              : "Hệ thống ước tính theo đơn giá tham khảo và kỹ sư Hưng Phúc xác nhận lại trước khi bạn quyết định."}
          </p>

          <ol className="mt-8 space-y-5">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                  <s.icon className="h-5 w-5 text-white" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold">
                    <span className="mr-1 text-indigo-300">{i + 1}.</span> {s.title}
                  </p>
                  <p className="text-sm text-indigo-100/80">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-indigo-100/90">
            {["Minh bạch từng hạng mục", "Không bắt buộc để lại số điện thoại", "Báo giá chi tiết miễn phí"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-emerald-400" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-2xl shadow-black/30 sm:p-7">
          <EstimateWidget config={config} />
        </div>
      </div>
    </section>
  );
}
