'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArticleCategories, ArticleCategory } from '@/types';

export function ArticleFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) {
      params.set('title', term);
    } else {
      params.delete('title');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row">
      <div className="flex-1">
        <Input
          placeholder="Tìm kiếm bài viết..."
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('title')?.toString()}
          className="h-12"
        />
      </div>
      <div className="w-full sm:w-[200px]">
        <Select
          onValueChange={handleCategoryChange}
          defaultValue={searchParams.get('category') || 'all'}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Lọc theo chuyên mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả chuyên mục</SelectItem>
            {ArticleCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
