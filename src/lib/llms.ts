// Sinh nội dung llms.txt / llms-full.txt theo chuẩn https://llmstxt.org
import { apiGet, DEFAULT_DESCRIPTION, getSiteSettings, SITE_LEGAL_NAME, SITE_NAME, SITE_URL, stripHtml, truncate } from "./seo";
import { getAllArticles, getAllProjects, projectPath, type PublicProject } from "./site-content";

const oneLine = (s?: string | null, max = 180) => truncate((s || "").replace(/\s+/g, " "), max);

async function loadAll() {
  const [settings, articles, projects] = await Promise.all([
    getSiteSettings(),
    getAllArticles(),
    getAllProjects(),
  ]);
  return { settings, articles, projects };
}

function header(settings: Record<string, string>) {
  const name = settings.vnName || SITE_LEGAL_NAME;
  const lines = [
    `# ${settings.abbname || SITE_NAME} – ${name}`,
    "",
    `> ${settings.seo_description || DEFAULT_DESCRIPTION}`,
    "",
    `${name}${settings.engName ? ` (${settings.engName})` : ""} là công ty tư vấn đầu tư xây dựng tại Thành phố Hồ Chí Minh, cung cấp dịch vụ thiết kế kiến trúc, thi công xây dựng nhà phố, biệt thự, nhà xưởng và tư vấn giám sát công trình trọn gói.`,
    "",
    "## Thông tin liên hệ",
    "",
  ];
  if (settings.phone) lines.push(`- Hotline: ${settings.phone}`);
  if (settings.email) lines.push(`- Email: ${settings.email}`);
  if (settings.address) lines.push(`- Địa chỉ: ${settings.address}`);
  if (settings.working_hours) lines.push(`- Giờ làm việc: ${settings.working_hours}`);
  if (settings.tax_code) lines.push(`- Mã số thuế: ${settings.tax_code}`);
  lines.push(`- Website: ${SITE_URL}`);
  lines.push(`- Form liên hệ / yêu cầu báo giá: ${SITE_URL}/lien-lac`);
  return lines;
}

const projectLine = (p: PublicProject) => {
  const meta = [p.subcategory, p.location].filter(Boolean).join(", ");
  return `- [${p.title}](${SITE_URL}${projectPath(p)})${meta ? ` (${meta})` : ""}: ${oneLine(p.meta_description || p.description, 160)}`;
};

export async function buildLlmsTxt() {
  const { settings, articles, projects } = await loadAll();
  const arch = projects.filter((p) => p.category === "architecture");
  const cons = projects.filter((p) => p.category === "construction");

  const lines = [
    ...header(settings),
    "",
    "## Trang chính",
    "",
    `- [Trang chủ](${SITE_URL}/): Giới thiệu tổng quan dịch vụ, dự án tiêu biểu, quy trình thi công và đối tác`,
    `- [Giới thiệu](${SITE_URL}/gioi-thieu): Lịch sử, tầm nhìn, sứ mệnh và ban lãnh đạo công ty`,
    `- [Dự toán chi phí xây nhà](${SITE_URL}/bang-gia): Công cụ miễn phí ước tính chi phí xây dựng theo đơn giá tham khảo của Hưng Phúc`,
    `- [Dự án thiết kế kiến trúc](${SITE_URL}/thiet-ke-kien-truc): ${arch.length} dự án thiết kế`,
    `- [Dự án thi công xây dựng](${SITE_URL}/thi-cong-xay-dung): ${cons.length} công trình thi công`,
    `- [Tin tức & cẩm nang](${SITE_URL}/tin-tuc): ${articles.length} bài viết kiến thức xây dựng`,
    `- [Liên hệ](${SITE_URL}/lien-lac): Gửi yêu cầu tư vấn, báo giá`,
  ];
  if (arch.length) {
    lines.push("", "## Dự án thiết kế kiến trúc", "");
    arch.forEach((p) => lines.push(projectLine(p)));
  }
  if (cons.length) {
    lines.push("", "## Dự án thi công xây dựng", "");
    cons.forEach((p) => lines.push(projectLine(p)));
  }
  if (articles.length) {
    lines.push("", "## Bài viết", "");
    articles.forEach((a) =>
      lines.push(`- [${a.title}](${SITE_URL}/tin-tuc/${a.slug}) (${a.category}): ${oneLine(a.description, 160)}`)
    );
  }
  lines.push(
    "",
    "## Optional",
    "",
    `- [Toàn văn nội dung (llms-full.txt)](${SITE_URL}/llms-full.txt): Nội dung đầy đủ của bảng giá, dự án và bài viết`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    ""
  );
  return lines.join("\n");
}

export async function buildLlmsFullTxt() {
  const { settings, articles, projects } = await loadAll();
  const lines = [...header(settings), ""];

  if (projects.length) {
    lines.push("## Dự án", "");
    projects.forEach((p) => {
      lines.push(`### ${p.title}`, "");
      lines.push(`- URL: ${SITE_URL}${projectPath(p)}`);
      lines.push(`- Hạng mục: ${p.category === "construction" ? "Thi công xây dựng" : "Thiết kế kiến trúc"}`);
      if (p.subcategory) lines.push(`- Loại công trình: ${p.subcategory}`);
      if (p.location) lines.push(`- Địa điểm: ${p.location}`);
      lines.push("");
      if (p.description) lines.push(p.description.trim(), "");
    });
  }

  // Toàn văn bài viết (giới hạn để file không quá lớn)
  const full = await Promise.all(
    articles.slice(0, 60).map((a) => apiGet<{ data: { content: string } }>(`/api/articles/${a.slug}`, 3600))
  );
  if (articles.length) {
    lines.push("## Bài viết", "");
    articles.slice(0, 60).forEach((a, i) => {
      lines.push(`### ${a.title}`, "", `- URL: ${SITE_URL}/tin-tuc/${a.slug}`, `- Chuyên mục: ${a.category}`);
      if (a.published_at) lines.push(`- Ngày đăng: ${a.published_at.slice(0, 10)}`);
      lines.push("");
      if (a.description) lines.push(`> ${a.description}`, "");
      const content = full[i]?.data?.content;
      if (content) lines.push(stripHtml(content), "");
    });
  }
  return lines.join("\n");
}
