"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  DraftingCompass,
  FilePlus2,
  FolderPlus,
  Handshake,
  ImageIcon,
  Inbox,
  MailWarning,
  Newspaper,
  PhoneCall,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import type { ContactStatus, StatsOverview } from "@/types/admin";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import { Btn, EmptyState, PageHeader, Panel, Pill, Skel } from "@/components/admin/primitives";
import { CONTACT_STATUS, timeAgo } from "@/components/admin/format";

const STATUS_COLORS: Record<ContactStatus, string> = {
  new: "#0284c7",
  in_progress: "#d97706",
  resolved: "#059669",
  archived: "#94a3b8",
};

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [data, setData] = React.useState<StatsOverview | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStats();
      setData(res.data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không tải được số liệu thống kê"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Chào buổi sáng" : hour < 14 ? "Chào buổi trưa" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(" ").slice(-1)[0] || "bạn"} 👋`}
        description="Tổng quan hoạt động website và khách hàng của Hưng Phúc."
        actions={
          <>
            <Btn variant="outline" onClick={load} loading={loading}>
              {!loading && <RefreshCw />} Làm mới
            </Btn>
            <Link
              href="/bai-viet/tao-moi"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <FilePlus2 className="size-4" /> Viết bài mới
            </Link>
          </>
        }
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          loading={loading && !data}
          icon={Inbox}
          tone="indigo"
          label="Liên hệ tháng này"
          value={data?.contacts.this_month}
          compare={data ? { current: data.contacts.this_month, previous: data.contacts.last_month, label: "so với tháng trước" } : undefined}
          href="/lien-he-khach-hang"
        />
        <KpiCard
          loading={loading && !data}
          icon={MailWarning}
          tone="rose"
          label="Liên hệ chưa xem"
          value={data?.contacts.unviewed}
          sub={data ? `${data.contacts.byStatus.new} liên hệ đang ở trạng thái "Mới"` : undefined}
          href="/lien-he-khach-hang?viewed=unviewed"
        />
        <KpiCard
          loading={loading && !data}
          icon={Newspaper}
          tone="emerald"
          label="Bài viết đã xuất bản"
          value={data?.articles.published}
          sub={data ? `${data.articles.drafts} bản nháp · ${data.articles.this_month} bài tháng này` : undefined}
          href="/bai-viet"
        />
        <KpiCard
          loading={loading && !data}
          icon={Building2}
          tone="amber"
          label="Dự án đang hiển thị"
          value={data?.projects.published}
          sub={data ? `${data.projects.architecture} thiết kế · ${data.projects.construction} thi công` : undefined}
          href="/quan-ly-du-an/thiet-ke-kien-truc"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Liên hệ khách hàng theo tháng"
          description="12 tháng gần nhất"
          actions={data && <span className="text-xs text-slate-500">Tổng: <b className="text-slate-800">{data.contacts.total}</b></span>}
        >
          {data ? <MonthlyBars data={data.timeline} /> : <Skel className="h-[260px] w-full" />}
        </Panel>

        <Panel title="Trạng thái xử lý liên hệ" description="Toàn bộ liên hệ đã nhận">
          {data ? <StatusBreakdown byStatus={data.contacts.byStatus} total={data.contacts.total} /> : <Skel className="h-[260px] w-full" />}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Liên hệ mới nhất"
          actions={
            <Link href="/lien-he-khach-hang" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
              Xem tất cả <ArrowRight className="size-4" />
            </Link>
          }
          bodyClassName="p-0"
        >
          {!data ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skel key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data.recentContacts.length === 0 ? (
            <EmptyState title="Chưa có liên hệ nào" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentContacts.map((c) => (
                <li key={c.id}>
                  <Link href={`/lien-he-khach-hang?open=${c.id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50">
                    <div className="relative">
                      <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      {!c.is_viewed_by_me && (
                        <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-rose-500 ring-2 ring-white" aria-label="Chưa xem" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-sm", c.is_viewed_by_me ? "text-slate-700" : "font-semibold text-slate-900")}>{c.name}</p>
                      <p className="truncate text-xs text-slate-500">{c.phone || c.email}</p>
                    </div>
                    <Pill tone={CONTACT_STATUS[c.status].tone} dot>
                      {CONTACT_STATUS[c.status].label}
                    </Pill>
                    <span className="hidden w-24 text-right text-xs text-slate-400 sm:block">{timeAgo(c.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Thao tác nhanh" bodyClassName="grid grid-cols-2 gap-3 p-4">
            <QuickAction href="/bai-viet/tao-moi" icon={FilePlus2} label="Viết bài" />
            <QuickAction href="/quan-ly-du-an/thiet-ke-kien-truc/tao-moi" icon={DraftingCompass} label="Dự án thiết kế" />
            <QuickAction href="/quan-ly-du-an/thi-cong-xay-dung/tao-moi" icon={FolderPlus} label="Dự án thi công" />
            <QuickAction href="/khac" icon={ImageIcon} label="Banner" />
          </Panel>

          <Panel title="Bài viết theo danh mục">
            {!data ? (
              <Skel className="h-40 w-full" />
            ) : data.articlesByCategory.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có bài viết.</p>
            ) : (
              <CategoryBars items={data.articlesByCategory} />
            )}
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Bài viết cập nhật gần đây"
          actions={
            <Link href="/bai-viet" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
              Quản lý bài viết <ArrowRight className="size-4" />
            </Link>
          }
          bodyClassName="p-0"
        >
          {!data ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skel key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : data.recentArticles.length === 0 ? (
            <EmptyState
              title="Chưa có bài viết"
              action={
                <Link href="/bai-viet/tao-moi" className="text-sm font-medium text-indigo-600 hover:underline">
                  Viết bài đầu tiên
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentArticles.map((a) => (
                <li key={a.id}>
                  <Link href={`/bai-viet/${a.id}`} className="flex items-center gap-4 px-5 py-3 transition hover:bg-slate-50">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {a.thumbnail_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.thumbnail_url} alt="" className="size-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{a.title}</p>
                      <p className="truncate text-xs text-slate-500">
                        {a.category} · {a.author_name || "—"} · cập nhật {timeAgo(a.updated_at)}
                      </p>
                    </div>
                    <Pill tone={a.is_published ? "green" : "slate"} dot>
                      {a.is_published ? "Đã đăng" : "Nháp"}
                    </Pill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Nội dung website">
          {!data ? (
            <Skel className="h-40 w-full" />
          ) : (
            <dl className="space-y-3 text-sm">
              <Row icon={DraftingCompass} label="Dự án thiết kế kiến trúc" value={data.projects.architecture} />
              <Row icon={Building2} label="Dự án thi công xây dựng" value={data.projects.construction} />
              <Row icon={Sparkles} label="Lượt dự toán AI (30 ngày)" value={data.misc.estimates_30_days ?? 0} />
              <Row icon={PhoneCall} label="Lead từ dự toán (30 ngày)" value={data.misc.estimate_leads_30_days ?? 0} />
              <Row icon={ImageIcon} label="Ảnh công trình" value={data.misc.project_images} />
              <Row icon={Handshake} label="Đối tác" value={data.misc.partners} />
              <Row icon={ImageIcon} label="Banner trang chủ" value={data.misc.banners} />
              <Row icon={PhoneCall} label="Danh mục bảng giá" value={data.misc.pricing_categories} />
              <Row icon={Users} label="Tài khoản quản trị" value={data.misc.users} />
            </dl>
          )}
        </Panel>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------- */

const toneMap = {
  indigo: "bg-indigo-50 text-indigo-600",
  rose: "bg-rose-50 text-rose-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  href,
  loading,
  compare,
}: {
  icon: React.ElementType;
  label: string;
  value?: number;
  sub?: string;
  tone: keyof typeof toneMap;
  href: string;
  loading?: boolean;
  compare?: { current: number; previous: number; label: string };
}) {
  let delta: React.ReactNode = null;
  if (compare) {
    const diff = compare.current - compare.previous;
    const pct = compare.previous ? Math.round((diff / compare.previous) * 100) : null;
    const up = diff >= 0;
    delta = (
      <span className={cn("inline-flex items-center gap-0.5 font-medium", up ? "text-emerald-600" : "text-rose-600")}>
        {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
        {pct !== null ? `${Math.abs(pct)}%` : `${up ? "+" : ""}${diff}`}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn("flex size-10 items-center justify-center rounded-xl", toneMap[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
      {loading ? (
        <Skel className="mt-2 h-9 w-20" />
      ) : (
        <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value ?? 0}</p>
      )}
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
        {delta}
        {compare ? compare.label : sub}
      </p>
    </Link>
  );
}

function MonthlyBars({ data }: { data: StatsOverview["timeline"] }) {
  const [hover, setHover] = React.useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.contacts));
  const empty = data.every((d) => d.contacts === 0);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];

  return (
    <div>
      <div className="relative flex h-[240px] gap-3 pl-8">
        {/* gridlines */}
        <div className="pointer-events-none absolute inset-0 left-8">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-dashed border-slate-100" style={{ bottom: `${(t / top) * 100}%` }}>
              <span className="absolute -left-8 -translate-y-1/2 text-[11px] tabular-nums text-slate-400">{t}</span>
            </div>
          ))}
        </div>
        {empty && (
          <div className="absolute inset-0 left-8 z-10 flex items-center justify-center">
            <p className="rounded-lg bg-white/90 px-4 py-2 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
              Chưa có liên hệ mới trong 12 tháng gần nhất
            </p>
          </div>
        )}
        {data.map((d, i) => {
          const h = (d.contacts / top) * 100;
          const [y, m] = d.month.split("-");
          return (
            <div
              key={d.month}
              className="relative flex flex-1 cursor-default flex-col justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {hover === i && (
                <div className="absolute left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg" style={{ bottom: `${h}%` }}>
                  <p className="font-medium">Tháng {Number(m)}/{y}</p>
                  <p className="text-slate-300">
                    {d.contacts} liên hệ · {d.articles} bài viết
                  </p>
                </div>
              )}
              <div
                className={cn("mx-auto w-full max-w-[34px] rounded-t-[4px] transition-colors", hover === i ? "bg-indigo-700" : "bg-indigo-500")}
                style={{ height: `${Math.max(h, d.contacts > 0 ? 2 : 0)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3 border-t border-slate-200 pl-8 pt-2">
        {data.map((d) => (
          <span key={d.month} className="flex-1 text-center text-[11px] text-slate-500">
            T{Number(d.month.split("-")[1])}
          </span>
        ))}
      </div>
    </div>
  );
}

function niceTicks(max: number) {
  const step = max <= 4 ? 1 : max <= 10 ? 2 : max <= 25 ? 5 : max <= 50 ? 10 : Math.ceil(max / 5 / 10) * 10;
  const out: number[] = [];
  for (let t = 0; t <= max + step - 1; t += step) out.push(t);
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + step);
  return out;
}

function StatusBreakdown({ byStatus, total }: { byStatus: Record<ContactStatus, number>; total: number }) {
  const order: ContactStatus[] = ["new", "in_progress", "resolved", "archived"];
  const resolvedPct = total ? Math.round((byStatus.resolved / total) * 100) : 0;
  return (
    <div>
      <div className="mb-4">
        <p className="text-3xl font-bold tabular-nums text-slate-900">{resolvedPct}%</p>
        <p className="text-xs text-slate-500">liên hệ đã được xử lý xong</p>
      </div>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-slate-100" role="img" aria-label="Tỉ lệ trạng thái liên hệ">
        {order.map((s) =>
          byStatus[s] ? (
            <div
              key={s}
              title={`${CONTACT_STATUS[s].label}: ${byStatus[s]}`}
              style={{ width: `${(byStatus[s] / Math.max(1, total)) * 100}%`, background: STATUS_COLORS[s] }}
            />
          ) : null
        )}
      </div>
      <ul className="mt-5 space-y-3">
        {order.map((s) => (
          <li key={s}>
            <Link href={`/lien-he-khach-hang?status=${s}`} className="flex items-center gap-3 rounded-lg text-sm hover:bg-slate-50">
              <span className="size-2.5 rounded-full" style={{ background: STATUS_COLORS[s] }} />
              <span className="flex-1 text-slate-600">{CONTACT_STATUS[s].label}</span>
              <span className="font-semibold tabular-nums text-slate-900">{byStatus[s]}</span>
              <span className="w-10 text-right text-xs tabular-nums text-slate-400">
                {total ? Math.round((byStatus[s] / total) * 100) : 0}%
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryBars({ items }: { items: { category: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.category}>
          <Link href={`/bai-viet?category=${encodeURIComponent(it.category)}`} className="block">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-slate-600">{it.category}</span>
              <span className="font-semibold tabular-nums text-slate-800">{it.count}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(it.count / max) * 100}%` }} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 p-4 text-center text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700"
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 text-slate-400" />
      <dt className="flex-1 text-slate-600">{label}</dt>
      <dd className="font-semibold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}

