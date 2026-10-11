import type { Metadata } from "next";
import { ProjectEditor } from "@/components/admin/project-editor";

export const metadata: Metadata = { title: "Thêm dự án Thiết kế kiến trúc" };

export default function Page() {
  return <ProjectEditor category="architecture" />;
}
