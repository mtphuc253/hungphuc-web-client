/**
 * Chèn dữ liệu có cấu trúc (schema.org) dạng JSON-LD.
 * Escape "<" để không thể đóng thẻ <script> sớm từ dữ liệu người dùng nhập.
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data, (_k, v) => (v === undefined || v === "" ? undefined : v)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
