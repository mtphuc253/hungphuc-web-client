"use client";

import * as React from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder, CharacterCount } from "@tiptap/extensions";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  FileCode,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Columns3,
  Rows3,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadWithToast } from "./image-uploader";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** ALT mặc định cho ảnh chèn vào bài (thường là tiêu đề bài viết) */
  imageAlt?: string;
  compact?: boolean;
  className?: string;
}

/** Editor chỉ cho H2–H4 (H1 dành cho tiêu đề bài) -> chuyển H1 cũ thành H2 thay vì mất định dạng */
const normalize = (html: string) => (html || "").replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");

export function RichTextEditor({ value, onChange, placeholder, imageAlt, compact, className }: Props) {
  const [sourceMode, setSourceMode] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const altRef = React.useRef(imageAlt);
  altRef.current = imageAlt;

  const insertFiles = React.useCallback(async (editor: Editor, files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return false;
    setUploading(true);
    for (const file of images) {
      const url = await uploadWithToast(file);
      if (url) {
        editor
          .chain()
          .focus()
          .setImage({ src: url, alt: altRef.current || file.name.replace(/\.[^.]+$/, "") })
          .run();
      }
    }
    setUploading(false);
    return true;
  }, []);

  const editorRef = React.useRef<Editor | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableKit.configure({ table: { resizable: false, HTMLAttributes: { class: "tiptap-table" } } }),
      Placeholder.configure({ placeholder: placeholder || "Bắt đầu viết nội dung…" }),
      CharacterCount,
    ],
    content: normalize(value || ""),
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-indigo-600 prose-img:mx-auto",
          compact ? "prose-sm" : "prose-base"
        ),
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || []);
        if (files.some((f) => f.type.startsWith("image/")) && editorRef.current) {
          event.preventDefault();
          insertFiles(editorRef.current, files);
          return true;
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = Array.from((event as DragEvent).dataTransfer?.files || []);
        if (files.some((f) => f.type.startsWith("image/")) && editorRef.current) {
          event.preventDefault();
          insertFiles(editorRef.current, files);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange(html);
    },
  });

  editorRef.current = editor;

  // Đồng bộ khi value thay đổi từ bên ngoài (ví dụ: tải bài viết xong)
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if ((value || "") !== current && !editor.isFocused) {
      editor.commands.setContent(normalize(value || ""), { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div
      className={cn(
        "tiptap-content overflow-clip rounded-xl border border-slate-200 bg-white focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10",
        compact && "compact",
        className
      )}
    >
      {editor && (
        <Toolbar
          editor={editor}
          sourceMode={sourceMode}
          setSourceMode={setSourceMode}
          uploading={uploading}
          onPickImages={(files) => insertFiles(editor, files)}
          stickyClass={compact ? "top-0" : "top-16"}
        />
      )}

      {sourceMode ? (
        <textarea
          className="block min-h-[420px] w-full resize-y bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-200 outline-none"
          value={value}
          spellCheck={false}
          onChange={(e) => {
            onChange(e.target.value);
            editor?.commands.setContent(e.target.value, { emitUpdate: false });
          }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      {editor && <Footer editor={editor} />}
    </div>
  );
}

function Footer({ editor }: { editor: Editor }) {
  const { words, chars } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      words: editor.storage.characterCount?.words?.() ?? 0,
      chars: editor.storage.characterCount?.characters?.() ?? 0,
    }),
  });
  const minutes = Math.max(1, Math.round(words / 220));
  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2 text-xs text-slate-500">
      <span>
        {words.toLocaleString("vi-VN")} từ · {chars.toLocaleString("vi-VN")} ký tự
      </span>
      <span>~{minutes} phút đọc</span>
    </div>
  );
}

function Toolbar({
  editor,
  sourceMode,
  setSourceMode,
  uploading,
  onPickImages,
  stickyClass,
}: {
  editor: Editor;
  stickyClass: string;
  sourceMode: boolean;
  setSourceMode: (v: boolean) => void;
  uploading: boolean;
  onPickImages: (files: File[]) => void;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("codeBlock"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      h4: e.isActive("heading", { level: 4 }),
      paragraph: e.isActive("paragraph"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      table: e.isActive("table"),
      left: e.isActive({ textAlign: "left" }),
      center: e.isActive({ textAlign: "center" }),
      right: e.isActive({ textAlign: "right" }),
      justify: e.isActive({ textAlign: "justify" }),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const c = () => editor.chain().focus();

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      c().extendMarkRange("link").unsetLink().run();
    } else {
      const href = /^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : `https://${url}`;
      c().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkOpen(false);
  };

  return (
    <div className={cn("sticky z-10 border-b border-slate-100 bg-white/95 backdrop-blur", stickyClass)}>
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <TB title="Đoạn văn" active={s.paragraph && !s.h2 && !s.h3 && !s.h4} onClick={() => c().setParagraph().run()} disabled={sourceMode}>
          <Pilcrow />
        </TB>
        <TB title="Tiêu đề 2 (H2)" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()} disabled={sourceMode}>
          <Heading2 />
        </TB>
        <TB title="Tiêu đề 3 (H3)" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()} disabled={sourceMode}>
          <Heading3 />
        </TB>
        <TB title="Tiêu đề 4 (H4)" active={s.h4} onClick={() => c().toggleHeading({ level: 4 }).run()} disabled={sourceMode}>
          <Heading4 />
        </TB>
        <Sep />
        <TB title="In đậm (Ctrl+B)" active={s.bold} onClick={() => c().toggleBold().run()} disabled={sourceMode}>
          <Bold />
        </TB>
        <TB title="In nghiêng (Ctrl+I)" active={s.italic} onClick={() => c().toggleItalic().run()} disabled={sourceMode}>
          <Italic />
        </TB>
        <TB title="Gạch chân (Ctrl+U)" active={s.underline} onClick={() => c().toggleUnderline().run()} disabled={sourceMode}>
          <UnderlineIcon />
        </TB>
        <TB title="Gạch ngang" active={s.strike} onClick={() => c().toggleStrike().run()} disabled={sourceMode}>
          <Strikethrough />
        </TB>
        <Sep />
        <TB title="Căn trái" active={s.left} onClick={() => c().setTextAlign("left").run()} disabled={sourceMode}>
          <AlignLeft />
        </TB>
        <TB title="Căn giữa" active={s.center} onClick={() => c().setTextAlign("center").run()} disabled={sourceMode}>
          <AlignCenter />
        </TB>
        <TB title="Căn phải" active={s.right} onClick={() => c().setTextAlign("right").run()} disabled={sourceMode}>
          <AlignRight />
        </TB>
        <TB title="Căn đều" active={s.justify} onClick={() => c().setTextAlign("justify").run()} disabled={sourceMode}>
          <AlignJustify />
        </TB>
        <Sep />
        <TB title="Danh sách chấm" active={s.bullet} onClick={() => c().toggleBulletList().run()} disabled={sourceMode}>
          <List />
        </TB>
        <TB title="Danh sách số" active={s.ordered} onClick={() => c().toggleOrderedList().run()} disabled={sourceMode}>
          <ListOrdered />
        </TB>
        <TB title="Trích dẫn" active={s.quote} onClick={() => c().toggleBlockquote().run()} disabled={sourceMode}>
          <Quote />
        </TB>
        <TB title="Khối mã" active={s.code} onClick={() => c().toggleCodeBlock().run()} disabled={sourceMode}>
          <Code2 />
        </TB>
        <TB title="Đường kẻ ngang" onClick={() => c().setHorizontalRule().run()} disabled={sourceMode}>
          <Minus />
        </TB>
        <TB
          title="Chèn bảng 3×3"
          active={s.table}
          onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          disabled={sourceMode || s.table}
        >
          <TableIcon />
        </TB>
        {s.table && (
          <>
            <TB title="Thêm cột bên phải" onClick={() => c().addColumnAfter().run()} disabled={sourceMode}>
              <Columns3 />
            </TB>
            <TB title="Thêm hàng bên dưới" onClick={() => c().addRowAfter().run()} disabled={sourceMode}>
              <Rows3 />
            </TB>
            <TB title="Xoá cột hiện tại" onClick={() => c().deleteColumn().run()} disabled={sourceMode}>
              <span className="text-[10px] font-bold">−C</span>
            </TB>
            <TB title="Xoá hàng hiện tại" onClick={() => c().deleteRow().run()} disabled={sourceMode}>
              <span className="text-[10px] font-bold">−H</span>
            </TB>
            <TB title="Xoá bảng" onClick={() => c().deleteTable().run()} disabled={sourceMode}>
              <Trash2 />
            </TB>
          </>
        )}
        <Sep />
        <TB
          title="Chèn liên kết"
          active={s.link || linkOpen}
          onClick={() => {
            setLinkUrl(editor.getAttributes("link").href || "");
            setLinkOpen((v) => !v);
          }}
          disabled={sourceMode}
        >
          <LinkIcon />
        </TB>
        {s.link && (
          <TB title="Bỏ liên kết" onClick={() => c().extendMarkRange("link").unsetLink().run()} disabled={sourceMode}>
            <Unlink />
          </TB>
        )}
        <TB title="Chèn ảnh (hoặc dán / kéo thả ảnh vào nội dung)" onClick={() => fileRef.current?.click()} disabled={sourceMode || uploading}>
          {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        </TB>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onPickImages(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
        <Sep />
        <TB title="Hoàn tác (Ctrl+Z)" onClick={() => c().undo().run()} disabled={sourceMode || !s.canUndo}>
          <Undo2 />
        </TB>
        <TB title="Làm lại (Ctrl+Y)" onClick={() => c().redo().run()} disabled={sourceMode || !s.canRedo}>
          <Redo2 />
        </TB>
        <div className="ml-auto">
          <TB title="Xem / sửa mã HTML" active={sourceMode} onClick={() => setSourceMode(!sourceMode)}>
            <FileCode />
          </TB>
        </div>
      </div>

      {linkOpen && !sourceMode && (
        <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
          <LinkIcon className="size-4 text-slate-400" />
          <input
            autoFocus
            className="h-8 flex-1 rounded-md border border-slate-200 px-2 text-sm outline-none focus:border-indigo-400"
            placeholder="Dán liên kết, ví dụ: https://hungphuc.vn/bai-viet hoặc /lien-lac"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
          />
          <button type="button" onClick={applyLink} className="h-8 cursor-pointer rounded-md bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-700">
            Áp dụng
          </button>
          <button type="button" onClick={() => setLinkOpen(false)} className="h-8 cursor-pointer rounded-md px-2 text-xs text-slate-500 hover:bg-slate-100">
            Huỷ
          </button>
        </div>
      )}
    </div>
  );
}

function TB({
  children,
  active,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex size-8 cursor-pointer items-center justify-center rounded-md transition [&_svg]:size-4",
        active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        "disabled:cursor-not-allowed disabled:opacity-35"
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />;
}
