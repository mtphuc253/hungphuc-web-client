import { projectService } from "@/services/projectService";
import { ArchitectureProjectList } from "./components/architecture-project-list";
import { Suspense } from "react";

export const revalidate = 0;

async function ProjectData() {
  const initialData = await projectService.getProjects({
    page: 1,
    limit: 10,
    category: "architecture",
  });

  return (
    <ArchitectureProjectList
      initialProjects={initialData.data}
      initialMeta={initialData.meta}
    />
  );
}

export default function ArchitectureProjectsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectData />
    </Suspense>
  );
}
