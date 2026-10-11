import type { Metadata } from "next";
import { ProjectDetail, projectMetadata } from "../../components/project-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return projectMetadata(slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProjectDetail slug={slug} category="construction" />;
}
