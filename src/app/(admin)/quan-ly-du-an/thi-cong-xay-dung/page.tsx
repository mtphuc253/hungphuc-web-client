import type { Metadata } from "next";
import { ProjectList } from "@/components/admin/project-list";

export const metadata: Metadata = { title: "Dự án Thi công xây dựng" };

export default function Page() {
  return <ProjectList category="construction" />;
}
