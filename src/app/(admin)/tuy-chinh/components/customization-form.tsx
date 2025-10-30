"use client";

import { useEffect, useState } from "react";
import { getSettings, deleteSetting, createSetting, getSettingsPrive } from "@/services/settingsService";
import type { Setting } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit, PlusCircle, Trash2, Copy, Check, Calendar, Key, FileText, ImageIcon, Loader2,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import uploadService from "@/services/uploadService";
import {
  Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const MIN_LOADING_MS = 200;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const CustomizationForm = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Setting dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete workflow state (hold id being deleted)
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettingsPrive();
        setSettings(data.data);


      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error("Lấy cài đặt thất bại");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const formatKey = (key: string) =>
    key
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const isImageUrl = (url: string) => /\.(jpeg|jpg|gif|png|svg)$/i.test(url);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Sao chép thất bại");
    }
  };

  // Handle file selection via hidden input

  const onFileChange = (file: File | null) => {
    setNewFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setNewPreview(url);
      setNewValue(""); // disable text input by clearing value
    } else {
      setNewPreview(null);
    }
  };

  // If user types text, clear file
  const onValueChange = (v: string) => {
    setNewValue(v);
    if (v && newFile) {
      // remove file when typing
      setNewFile(null);
      setNewPreview(null);
    }
  };

  // Add setting handler with minimum loading time
  const handleAddSetting = async () => {
    if (!newKey) {
      toast.error("Trường 'Khóa' là bắt buộc");
      return;
    }

    if (!newValue && !newFile) {
      toast.error("Vui lòng nhập giá trị hoặc chọn ảnh");
      return;
    }

    setIsSubmitting(true);
    const start = Date.now();

    try {
      let valueToSend: any = newValue;

      if (newFile) {
        const uploadRes = await uploadService.uploadImage(newFile);
        // uploadService expected response may vary; try to be flexible
        valueToSend =
          uploadRes?.data?.url || uploadRes?.url || uploadRes?.data || uploadRes;
      }

      const res = await createSetting({ key: newKey, value: valueToSend });

      // ensure at least MIN_LOADING_MS visible
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_MS) await sleep(MIN_LOADING_MS - elapsed);

      if (res?.success) {
        setSettings((prev) => [res.data, ...prev]);
        toast.success("Thêm cài đặt thành công");
        // reset form
        setIsAddOpen(false);
        setNewKey("");
        setNewValue("");
        setNewFile(null);
        setNewPreview(null);
      } else {
        toast.error(res?.message || "Thêm cài đặt thất bại");
      }
    } catch (err) {
      console.error("Create setting failed", err);
      toast.error("Thêm cài đặt thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete with overlay spinner and minimum time
  const handleConfirmDelete = async (key: string) => {
    setDeletingId(key);
    const start = Date.now();
    try {
      const res = await deleteSetting(key);
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_MS) await sleep(MIN_LOADING_MS - elapsed);

      if (res && res.success) {
        setSettings((prev) => prev.filter((s) => s.key !== key));
        toast.success("Xóa cài đặt thành công");
      } else {
        toast.error(res?.message || "Xóa cài đặt thất bại");
      }
    } catch (err) {
      console.error("Delete setting failed", err);
      toast.error("Xóa cài đặt thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global overlay spinner when adding or deleting */}
      {(isSubmitting || deletingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center gap-3 bg-white/90 dark:bg-slate-900/90 p-6 rounded-lg shadow-lg">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              {isSubmitting ? "Đang thêm cài đặt..." : "Đang xóa..."}
            </span>
          </div>
        </div>
      )}

      {/* Header Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Thông tin công ty</CardTitle>
              <CardDescription className="text-base">
                Xem và quản lý các cài đặt hệ thống
              </CardDescription>
            </div>

            {/* Thêm cài đặt (Sheet) */}
            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
              <SheetTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" /> Thêm cài đặt
                </Button>
              </SheetTrigger>

              <SheetContent className="max-w-md">
                <SheetHeader>
                  <SheetTitle>Thêm cài đặt mới</SheetTitle>
                </SheetHeader>

                <div className="space-y-4 p-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Khóa (key)</label>
                    <input
                      className="w-full rounded-md border px-3 py-2 bg-slate-50 dark:bg-slate-800"
                      placeholder="ví dụ: phone, email, logo_url"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Giá trị (text)</label>
                    <textarea
                      disabled={!!newFile}
                      className={`w-full rounded-md border px-3 py-2 min-h-[80px] bg-slate-50 dark:bg-slate-800 ${newFile ? "opacity-60" : ""
                        }`}
                      placeholder={newFile ? "Đã chọn file. Xóa file để nhập text." : "Nhập giá trị dạng văn bản"}
                      value={newValue}
                      onChange={(e) => onValueChange(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Nếu đã chọn ảnh thì không thể nhập giá trị bằng text.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Hoặc tải ảnh lên</label>

                    {/* Custom file button */}
                    <div className="flex items-center gap-3">
                      <label
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border bg-white dark:bg-slate-800 cursor-pointer select-none ${newValue ? "opacity-50 pointer-events-none" : ""
                          }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            onFileChange(f);
                          }}
                          disabled={!!newValue}
                        />
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm">{newFile ? "Thay ảnh" : "Chọn ảnh"}</span>
                      </label>

                      {/* Clear file button */}
                      {newFile && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewFile(null);
                            setNewPreview(null);
                          }}
                        >
                          Xóa ảnh
                        </Button>
                      )}
                    </div>

                    {/* Preview */}
                    {newPreview ? (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Xem trước</p>
                        <div className="w-48 h-28 rounded-md overflow-hidden border bg-muted/40">
                          {/* Use native img to avoid next/image remote blob warnings */}
                          <img src={newPreview} alt="preview" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Nếu đã nhập text thì không thể chọn file.
                    </p>
                  </div>
                </div>

                <SheetFooter>
                  <div className="flex w-full justify-between">
                    <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
                      Hủy
                    </Button>
                    <Button disabled={isSubmitting} onClick={handleAddSetting}>
                      {isSubmitting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="animate-spin h-4 w-4" /> Đang gửi...
                        </span>
                      ) : (
                        "Thêm"
                      )}
                    </Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-2">
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : settings?.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Chưa có cài đặt nào</p>
            <p className="text-sm text-muted-foreground mb-4">Bắt đầu bằng cách thêm cài đặt đầu tiên</p>
            <Button onClick={() => setIsAddOpen(true)} className="cursor-pointer">
              <PlusCircle className="mr-2 h-4 w-4" /> Thêm cài đặt
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {settings?.map((setting) => (
            <Card
              key={setting.id}
              className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50 pt-0"
            >
              <CardHeader className="pb-2 bg-foreground text-gray-50 pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 space-y-2 items-center">
                    <Key className="h-4 w-4 text-gray-50" />
                    <CardTitle className="text-lg">{formatKey(setting.key)}</CardTitle>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-pointer hover:bg-gray-800 hover:text-primary-foreground transition-colors bg-transparent"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Chỉnh sửa</span>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Xóa</span>
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc muốn xóa cài đặt này?</AlertDialogTitle>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleConfirmDelete(setting.key)}
                            disabled={!!deletingId}
                          >
                            {deletingId === setting.key ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" /> Đang xóa...
                              </span>
                            ) : (
                              "Xóa"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Value Display */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Giá trị</p>
                  {isImageUrl(String(setting.value)) ? (
                    <div className="rounded-lg border-2 p-4 bg-muted/30 w-40">
                      <Image
                        src={setting.value || "/placeholder.svg"}
                        alt={setting.key}
                        width={160}
                        height={80}
                        className="rounded-md object-contain w-full h-auto"
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 p-4 bg-muted/30">
                      <p className="text-sm break-words leading-relaxed">{setting.value}</p>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Key className="h-3 w-3" />
                      <span className="font-medium">ID:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{setting.id.slice(0, 8)}...</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 cursor-pointer"
                        onClick={() => copyToClipboard(setting.id, setting.id)}
                      >
                        {copiedId === setting.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">Tạo lúc:</span>
                    </div>
                    <span className="text-xs">{formatDate(setting.created_at)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">Cập nhật:</span>
                    </div>
                    <span className="text-xs">{formatDate(setting.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomizationForm;
