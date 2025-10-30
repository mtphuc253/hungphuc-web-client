"use client";

import { useState, useEffect } from "react";
import { projectService } from "@/services/projectService";
import { IProject, ApiMeta } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Trash2,
  Search,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from 'next/image'
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const CONSTRUCTION_SUBCATS = [
  "Tất cả",
  "Nhà phố",
  "Biệt thự",
  "Nhà xưởng",
  "Văn phòng",
  "Khách sạn",
] as const;

interface Props {
  initialProjects: IProject[];
  initialMeta: ApiMeta | null;
}

export function ConstructionProjectList({
  initialProjects,
  initialMeta,
}: Props) {
  const [projects, setProjects] = useState<IProject[]>(initialProjects);
  const [meta, setMeta] = useState<ApiMeta | null>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const capitalizeWords = (s?: string) =>
    s
      ? s
          .split(" ")
          .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
          .join(" ")
      : "";

  useEffect(() => {
    const doFetch = async (page = 1, limit = 6) => {
      setLoading(true);
      try {
        const subcategoryRaw =
          selectedSubcategory === "Tất cả" ? undefined : selectedSubcategory;
        const subcategory = subcategoryRaw?.toLowerCase();
        const res = await projectService.getProjects({
          page,
          limit,
          category: "construction",
          subcategory,
          q: debouncedSearchTerm,
        });
        setProjects(res.data || []);
        const rawMeta = (res as any).meta || null;
        if (rawMeta) {
          setMeta({
            page: rawMeta.page ?? 1,
            limit: rawMeta.limit ?? limit,
            totalPages: rawMeta.totalPages ?? rawMeta.total_page ?? 1,
            totalRecords: rawMeta.totalRecords ?? rawMeta.total ?? rawMeta.total_records ?? 0,
          });
        } else {
          setMeta(null);
        }
      } catch (err) {
        console.error("Failed to fetch construction projects", err);
        toast.error("Không thể tải danh sách dự án.");
      } finally {
        setLoading(false);
      }
    };

    doFetch(currentPage);
    
  }, [currentPage, selectedSubcategory, debouncedSearchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (meta?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa dự án này?")) return;
    try {
      // await projectService.deleteProject(id); // Uncomment when API is ready
      toast.success("Xóa dự án thành công (demo).");
  // trigger refetch by resetting current page (keeps page)
  setCurrentPage((p) => p);
    } catch (error) {
      console.error("Failed to delete project", error);
      toast.error("Xóa dự án thất bại.");
    }
  };
  
  const limit = meta?.limit ?? 6;
  const total = (meta as any)?.totalRecords ?? (meta as any)?.total ?? 0;
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(startItem + limit - 1, total);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Dự Án Thi Công Xây Dựng
      </h1>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedSubcategory}
            onValueChange={setSelectedSubcategory}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Lọc theo danh mục" />
            </SelectTrigger>
            <SelectContent>
              {CONSTRUCTION_SUBCATS.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full md:w-auto flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Thêm Dự Án Mới
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Dự Án</TableHead>
              <TableHead className="hidden md:table-cell">Danh Mục</TableHead>
              <TableHead className="hidden lg:table-cell">Ngày Tạo</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-start gap-4">
                      <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          src={project.featured_image || '/placeholder.svg'}
                          alt={project.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-sm md:text-sm">{project.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground line-clamp-3 max-w-[56ch]">{project.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {capitalizeWords(project.subcategory)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Date((project as any).created_at ?? project.start_date).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" aria-label="Edit Project">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete()}
                        aria-label="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không có dự án nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
         <div className="flex items-center justify-between">
         <span className="text-sm text-muted-foreground">
           Hiển thị {startItem}-{endItem} trên tổng số {total}
         </span>
         <div className="flex items-center gap-2">
           <Button
             variant="outline"
             size="icon"
             onClick={() => handlePageChange(currentPage - 1)}
             disabled={currentPage === 1}
             aria-label="Go to previous page"
           >
             <ChevronLeft className="h-4 w-4" />
           </Button>
           <span className="text-sm font-medium">
             Trang {currentPage} / {meta.totalPages}
           </span>
           <Button
             variant="outline"
             size="icon"
             onClick={() => handlePageChange(currentPage + 1)}
             disabled={currentPage === meta.totalPages}
             aria-label="Go to next page"
           >
             <ChevronRight className="h-4 w-4" />
           </Button>
         </div>
       </div>
      )}
    </div>
  );
}
