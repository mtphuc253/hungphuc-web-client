import type { Metadata } from "next";
import { ProjectEditor } from "@/components/admin/project-editor";

export const metadata: Metadata = { title: "Thêm dự án Thi công xây dựng" };

export default function Page() {
  return <ProjectEditor category="construction" />;
}
