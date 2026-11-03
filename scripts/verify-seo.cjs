// Run with node scripts/verify-seo.cjs. No network requests or live writes.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { renderToStaticMarkup } = require("react-dom/server");
const React = require("react");
const root = path.resolve(__dirname, "..");

function fixture({ offline = false } = {}) {
  const loaded = new Map();
  const companies = [
    { companyCode: "NAVER", name: "네이버" },
    { companyCode: "MOLOCO", name: "몰로코" },
    { companyCode: "", name: "Invalid" },
    { companyCode: "MOLOCO", name: "몰로코" },
  ];
  const mocks = {
    "@/api": { api: { get: async () => {
      if (offline) throw new Error("Simulated API outage");
      return { data: { companies } };
    } } },
    "@/api/domain/community": { standardList: async ({ page }) => {
      if (page === 1) throw new Error("Simulated partial failure");
      return { status: 200, data: {
        list: [{ boardId: page === 2 ? 3 : 1, createdAt: page === 2 ? "2026-10-01" : "invalid" }],
        metadata: { totalElements: 150 },
      } };
    } },
    "@/api/domain/hotIssue": { getActivatedList: async () => ({ status: 200, data: { list: [
      { modifiedAt: "2026-01-01" }, { modifiedAt: "2026-10-01" },
    ] } }) },
    "@/components/card/Section": () => null,
    "@/components/loading/eyes-loading": () => null,
  };
  function load(name) {
    if (name in mocks) return mocks[name];
    if (!name.startsWith("@/") && !name.startsWith(".") && !path.isAbsolute(name)) return require(name);
    const base = name.startsWith("@/") ? path.join(root, "src", name.slice(2)) : name;
    const file = [base + ".ts", base + ".tsx", path.join(base, "index.ts")].find(fs.existsSync);
    if (!file) throw new Error(`Missing fixture module ${name}`);
    if (loaded.has(file)) return loaded.get(file).exports;
    const module = { exports: {} };
    loaded.set(file, module);
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename: file })(
      (specifier) => load(specifier.startsWith(".") ? path.resolve(path.dirname(file), specifier) : specifier),
      module, module.exports,
    );
    return module.exports;
  }
  return load;
}

(async () => {
  const load = fixture();
  const page = load("@/app/web/page");
  const canonical = "https://www.nklcb.kr/web?company=NAVER";
  for (const company of [undefined, "naver", "NAVER", ["NAVER", "KAKAO"]]) {
    const metadata = await page.generateMetadata({ searchParams: Promise.resolve({ company, category: "FRONTEND" }) });
    assert.equal(metadata.alternates.canonical, canonical);
    assert.equal(metadata.openGraph.url, canonical);
    assert.match(metadata.title, /네이버/);
  }
  const moloco = await page.generateMetadata({ searchParams: Promise.resolve({ company: "moloco" }) });
  assert.match(moloco.title, /몰로코/);
  assert.equal(moloco.alternates.canonical, "https://www.nklcb.kr/web?company=MOLOCO");
  const unknown = await page.generateMetadata({ searchParams: Promise.resolve({ company: "UNKNOWN" }) });
  assert.equal(unknown.robots.index, false);

  const urls = await load("@/app/sitemap").default();
  assert.deepEqual(urls.filter((entry) => entry.url.includes("/web")).map((entry) => entry.url), [
    canonical, "https://www.nklcb.kr/web?company=MOLOCO",
  ]);
  assert.equal(urls.find((entry) => entry.url.endsWith("/tech-articles")).lastModified, undefined);
  assert.equal(urls.find((entry) => entry.url.endsWith("/community/detail/1")).lastModified, undefined);
  assert.equal(urls.find((entry) => entry.url.endsWith("/community/detail/3")).lastModified.toISOString(), "2026-10-01T00:00:00.000Z");
  assert.equal(urls.find((entry) => entry.url.endsWith("/question")).lastModified.toISOString(), "2026-10-01T00:00:00.000Z");

  const offline = fixture({ offline: true });
  const fallback = await offline("@/lib/seo/companies").getRecruitmentCompanies();
  assert.ok(fallback.some((company) => company.companyCode === "NAVER"));
  const fallbackMetadata = await offline("@/app/web/page").generateMetadata({ searchParams: Promise.resolve({ company: "naver" }) });
  assert.equal(fallbackMetadata.alternates.canonical, canonical);

  const StructuredData = load("@/lib/seo/structured-data").default;
  const data = { "@type": "Thing", name: "</script><script>alert(1)</script>" };
  const html = renderToStaticMarkup(React.createElement(StructuredData, { data }));
  assert.equal((html.match(/<script/g) || []).length, 1);
  const json = html.match(/>(.*)<\/script>/s)[1];
  assert.deepEqual(JSON.parse(json), data);
  assert.ok(!json.includes("<"));
  console.log("PASS: company canonicals, repeated parameters, dynamic catalog, unknown companies, outage fallback, partial sitemap failures, honest modification dates, and server-rendered JSON-LD escaping.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
