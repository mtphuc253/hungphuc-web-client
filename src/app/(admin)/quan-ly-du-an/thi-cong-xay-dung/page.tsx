import { projectService } from "@/services/projectService";
import { ConstructionProjectList } from "./components/construction-project-list";
import { Suspense } from "react";

export const revalidate = 0;

async function ProjectData() {
  const initialData = await projectService.getProjects({
    page: 1,
    limit: 10,
    category: "construction",
  });

  return (
    <ConstructionProjectList
      initialProjects={initialData.data}
      initialMeta={initialData.meta ?? null}
    />
  );
}

export default function ConstructionProjectsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectData />
    </Suspense>
  );
}
