import type { Metadata } from "next";
import { ProjectList } from "@/components/admin/project-list";

export const metadata: Metadata = { title: "Dự án Thiết kế kiến trúc" };

export default function Page() {
  return <ProjectList category="architecture" />;
}
