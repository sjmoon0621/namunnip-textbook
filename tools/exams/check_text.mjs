// 기출 텍스트 변환 결과(exams/text-work/<시험>/text.json) 검사.
//   node tools/exams/check_text.mjs exams/text-work/<시험> [...]  → 시험마다 한 줄 JSON {exam, ok, items, bad:[{img, why}]}, 하나라도 실패하면 종료 코드 1
// 기준: list.json과 문항 수·순서 일치, 모든 수식 KaTeX 엄격 렌더, 한글 낱말이 PDF 글자층과 90% 이상 일치, 객관식 보기 5개·단답형 null, 그림 상자가 이미지 안.
import { readFileSync, existsSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const katex = require("../../assets/katex/katex.min.js");
const MATH = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;
const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const hangul = (s) => (decode(String(s || "").replace(MATH, (m) => " " + (m.match(/[가-힣]+/g) || []).join(" ") + " ").replace(/<[^>]+>/g, " ")).match(/[가-힣]+/g) || []).filter((w) => w !== "식" && w !== "점");
function lcs(a, b) { const dp = new Array(b.length + 1).fill(0); for (const x of a) { let prev = 0; for (let j = 1; j <= b.length; j++) { const t = dp[j]; dp[j] = x === b[j - 1] ? prev + 1 : Math.max(dp[j], dp[j - 1]); prev = t; } } return dp[b.length]; }
const sim = (a, b) => (a.length + b.length ? (2 * lcs(a, b)) / (a.length + b.length) : 1);

let failed = 0;
for (const dir of process.argv.slice(2)) {
  const exam = dir.replace(/\/$/, "").split("/").pop();
  const bad = [];
  let list, out;
  try { list = JSON.parse(readFileSync(`${dir}/list.json`, "utf8")); } catch (e) { console.log(JSON.stringify({ exam, ok: false, bad: [{ img: "*", why: "list.json 없음" }] })); failed++; continue; }
  if (!existsSync(`${dir}/text.json`)) { console.log(JSON.stringify({ exam, ok: false, items: list.length, bad: [{ img: "*", why: "text.json 없음" }] })); failed++; continue; }
  try { out = JSON.parse(readFileSync(`${dir}/text.json`, "utf8")); } catch (e) { console.log(JSON.stringify({ exam, ok: false, items: list.length, bad: [{ img: "*", why: `JSON 오류: ${e.message.slice(0, 80)}` }] })); failed++; continue; }
  if (!Array.isArray(out) || out.length !== list.length) bad.push({ img: "*", why: `문항 수 ${Array.isArray(out) ? out.length : "?"} ≠ ${list.length}` });
  let noref = 0;
  list.forEach((it, i) => {
    const o = (Array.isArray(out) && out[i]) || {};
    const why = [];
    if (o.img !== it.img) why.push(`순서 어긋남(${o.img})`);
    for (const part of [o.stem, o.shared, ...(Array.isArray(o.choices) ? o.choices : [])]) {
      for (const m of String(part || "").matchAll(MATH)) {
        try { katex.renderToString(decode(m[1] ?? m[2]), { displayMode: m[2] != null, throwOnError: true, strict: "error" }); }
        catch (e) { why.push(`KaTeX: ${m[0].slice(0, 50)} → ${e.message.split("\n")[0].slice(0, 70)}`); }
      }
      if (/<[^>]*\\[([]/.test(String(part || ""))) why.push("태그 속성 안에 수식");
    }
    // 오래된 시험지는 PDF에 한글 글자층이 없다(빈 문자열이나 ⟦식⟧뿐). 그때는 대조할 기준이 없으므로 건너뛰고 noref로 센다.
    const ref = hangul(it.text_layer);
    if (ref.join("").length < 8) noref++;
    else { const s = sim(ref, hangul(`${o.stem || ""} ${(o.choices || []).join(" ")}`)); if (s < 0.9) why.push(`한글 일치 ${(s * 100).toFixed(0)}%`); }
    // 글자층이 없는 시험지는 분류 때 객관식을 단답형으로 잘못 잡은 경우가 있다. 보기 5개를 읽었으면 객관식으로 인정하고(publish가 유형을 고침), 객관식인데 보기가 없으면 실패.
    if (Array.isArray(o.choices) ? o.choices.length !== 5 : (o.choices != null || it.type === "mc")) why.push("보기 형식");
    for (const f of o.figs || []) { const [x, y, w, h] = f.box || []; if (!(x >= 0 && y >= 0 && w > 10 && h > 10 && x + w <= it.w + 2 && y + h <= it.h + 2)) why.push(`그림 상자 범위 ${JSON.stringify(f.box)}`); }
    if (!o.stem) why.push("본문 없음");
    if (why.length) bad.push({ img: it.img, why: why.join("; ") });
  });
  const ok = bad.length === 0;
  if (!ok) failed++;
  console.log(JSON.stringify({ exam, ok, items: list.length, low: (out || []).filter((o) => o && o.conf === "low").length, noref, bad }));
}
process.exit(failed ? 1 : 0);
