'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalPages: number;
}

export function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const visiblePages = 5;

    if (totalPages <= visiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
      const endPage = Math.min(totalPages, startPage + visiblePages - 1);

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="mt-12 flex items-center justify-center space-x-2">
      <Button
        asChild
        variant={currentPage === 1 ? 'outline' : 'default'}
        size="icon"
        disabled={currentPage === 1}
      >
        <Link href={createPageURL(currentPage - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {renderPageNumbers().map((page, index) => (
        <Button
          key={index}
          asChild
          variant={page === currentPage ? 'default' : 'outline'}
          className={cn({
            'pointer-events-none': page === '...',
          })}
        >
          {page === '...' ? (
            <span>...</span>
          ) : (
            <Link href={createPageURL(page as number)}>{page}</Link>
          )}
        </Button>
      ))}

      <Button
        asChild
        variant={currentPage === totalPages ? 'outline' : 'default'}
        size="icon"
        disabled={currentPage === totalPages}
      >
        <Link href={createPageURL(currentPage + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
