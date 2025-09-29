'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProjectFiltersProps {
  subcategories: readonly string[]
  selectedSubcategory: string | null
  onSelectSubcategory: (category: string | null) => void
}

export function ProjectFilters({ subcategories, selectedSubcategory, onSelectSubcategory }: ProjectFiltersProps) {
  const handleSelect = (subcategory: string | null) => {
    // If the same filter is clicked again, deselect it (show all)
    if (subcategory && subcategory === selectedSubcategory) {
      onSelectSubcategory(null)
    } else {
      onSelectSubcategory(subcategory)
    }
  }

  return (
    <div className="mb-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      <Button
        onClick={() => handleSelect(null)}
        className={cn(
          'h-auto rounded-md px-6 py-3 text-base font-semibold transition-all duration-200 border-2',
          !selectedSubcategory
            ? 'bg-gray-900 text-white hover:bg-gray-700 border-gray-900'
            : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100 hover:border-gray-400',
        )}
      >
        Tất cả
      </Button>
      {subcategories.map((subcategory) => {
        const subcategoryValue = subcategory.toLowerCase()
        const isSelected = selectedSubcategory === subcategoryValue

        return (
          <Button
            key={subcategory}
            onClick={() => handleSelect(subcategoryValue)}
            className={cn(
              'h-auto rounded-md px-6 py-3 text-base font-semibold transition-all duration-200 border-2',
              isSelected
                ? 'bg-gray-900 text-white hover:bg-gray-700 border-gray-900'
                : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100 hover:border-gray-400',
            )}
          >
            {subcategory}
          </Button>
        )
      })}
    </div>
  )
}