'use client'

import { useState, useEffect } from 'react'
import { Pagination } from '../../components/pagination'
import { projectService } from '@/services/projectService'
import { IProject, ApiMeta } from '@/types'
import { ProjectCard } from '../../components/project-card'
import { ProjectFilters } from '../../components/project-filters'

const ARCHITECTURE_SUBATEGORIES = [
  'Nhà phố',
  'Biệt thự',
  'Nhà xưởng',
  'Văn phòng',
  'Khách sạn',
  'Trung tâm thương mại',
] as const

interface ArchitectureProjectListProps {
  initialProjects: IProject[];
  initialMeta: ApiMeta | null;
}

export function ArchitectureProjectList({ initialProjects, initialMeta }: ArchitectureProjectListProps) {
  const [projects, setProjects] = useState<IProject[]>(initialProjects)
  const [meta, setMeta] = useState<ApiMeta | null>(initialMeta)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  useEffect(() => {
    // Don't refetch for the initial state passed via props
    if (currentPage === 1 && selectedSubcategory === null) {
      setProjects(initialProjects)
      setMeta(initialMeta)
      return
    }

    const fetchProjects = async () => {
      setLoading(true)
      try {
        const response = await projectService.getProjects({
          page: currentPage,
          limit: 9,
          category: 'architecture',
          subcategory: selectedSubcategory || '',
        })
        setProjects(response.data)
        if (response.meta) {
          setMeta(response.meta)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [currentPage, selectedSubcategory, initialProjects, initialMeta])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const handleFilterChange = (subcategory: string | null) => {
    // The subcategory from the component is already lowercase or null
    setSelectedSubcategory(subcategory)
    setCurrentPage(1)
  }

  return (
    <>
        <div className="mb-12">
          <ProjectFilters
            subcategories={ARCHITECTURE_SUBATEGORIES}
            selectedSubcategory={selectedSubcategory}
            onSelectSubcategory={handleFilterChange}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="h-96 animate-pulse rounded-lg bg-gray-200"></div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg text-gray-500">Không tìm thấy dự án nào phù hợp.</p>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={meta.totalPages} onPageChange={handlePageChange} />
        )}
    </>
  )
}