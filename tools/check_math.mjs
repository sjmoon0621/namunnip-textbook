// 블록의 수식(\( … \), \[ … \])을 KaTeX로 미리 그려 보고, 수식 변환 중 글이 바뀌지 않았는지 git HEAD와 비교한다.
//   node tools/check_math.mjs blocks/cm1/*.html        → 파일마다 OK 또는 문제 목록, 문제가 있으면 종료 코드 1
// 글 비교: 태그와 수식을 모두 지운 뒤 한글 낱말 순서가 HEAD와 같은지 본다(수식 표기만 바꾸고 문장은 그대로 두어야 한다).
import { readFileSync } from "fs";
import { execFileSync } from "child_process";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const katex = require("../assets/katex/katex.min.js");

const MATH = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;
const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
// 본문의 맨 '<'(예: k < 0이면)는 태그가 아니므로 지우기 전에 &lt;로 바꿔 둔다
const bareLt = (s) => s.replace(/<(?![a-zA-Z\/!])/g, "&lt;");
const hangul = (html) => decode(bareLt(html).replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style)[\s\S]*?<\/\1>/g, "").replace(MATH, (m) => ` ${(m.match(/[가-힣]+/g) || []).join(" ")} `).replace(/<[^>]+>/g, " "))
  .match(/[가-힣]+/g) || [];

let bad = 0;
for (const f of process.argv.slice(2)) {
  const src = readFileSync(f, "utf8");
  const probs = [];
  const body = src.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style)[\s\S]*?<\/\1>/g, "");
  for (const m of body.matchAll(/<[^>]*\\[([][^>]*>/g)) probs.push(`태그 속성 안에 수식 기호: ${m[0].slice(0, 80)}`);
  for (const m of body.replace(/<[^>]+>/g, "").matchAll(MATH)) {
    const tex = decode(m[1] ?? m[2]);
    try { katex.renderToString(tex, { displayMode: m[2] != null, throwOnError: true, strict: "error" }); }
    catch (e) { probs.push(`KaTeX: ${m[0].slice(0, 70)} → ${e.message.split("\n")[0]}`); }
  }
  const opens = (body.match(/\\\(/g) || []).length, closes = (body.match(/\\\)/g) || []).length;
  if (opens !== closes) probs.push(`\\( ${opens}개, \\) ${closes}개 — 짝이 안 맞음`);
  let head = null;
  try { head = execFileSync("git", ["show", `HEAD:${f}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { head = null; }
  if (head !== null) {
    const a = hangul(head).join(" "), b = hangul(src).join(" ");
    if (a !== b) {
      const A = a.split(" "), B = b.split(" ");
      let i = 0; while (i < A.length && A[i] === B[i]) i++;
      probs.push(`문장이 바뀜(한글 낱말 ${i + 1}번째부터): HEAD「${A.slice(i, i + 6).join(" ")}」 → 지금「${B.slice(i, i + 6).join(" ")}」`);
    }
  }
  const left = (body.replace(/<button[^>]*class="chip"[\s\S]*?<\/button>/g, "").match(/<sup>|<sub>/g) || []).length;
  if (probs.length) { bad++; console.log(`FAIL ${f}`); probs.forEach((p) => console.log(`  - ${p}`)); }
  else console.log(`OK   ${f}${left ? `  (아직 <sup>/<sub> ${left}곳)` : ""}`);
}
process.exit(bad ? 1 : 0);
