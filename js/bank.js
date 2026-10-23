/* 연습 시험 화면 (bank.html): 과목의 AI 출제 연습 문항과 기출 문항으로 중간·기말 범위 시험지를 풀고 채점한다.
   bank.html?c=<과목>                 시험지 고르기(중간고사·기말고사 범위, 절별 연습)
   bank.html?c=<과목>&r=mid|fin&s=2   그 범위의 2번 시험지(r=all은 전 범위). &s=x면 무작위로 새로 뽑은 시험지
   bank.html?c=<과목>&sec=1-2         그 절의 AI 문항만, 한 문항씩 바로 채점
   &lv=b|ah|h                         무작위 시험지와 절별 연습에서 난이도 고르기(기본 / 응용·심화 / 심화)
   &ex=1|0                            기출 문항을 시험지에 섞을지(기본 섞음). 고른 값은 이 브라우저에 기억한다
   문항: AI 문항은 exams/bank/<과목>.json (형식은 tools/bank.py 머리말). 기출은 exams/sec/<과목>-<대단원>-<절>.json 중
         분류 확신도 conf가 high인 문항만 쓴다(절 매핑이 확실해야 중간·기말 범위가 맞는다).
         중간고사 범위는 목차 순서로 앞쪽 절 TOC[c].split개(tools/build.py exam_split), 기말고사는 나머지.
   기출 난이도(exLv): 배점으로 정한다. 배점(pts)이 비어 있으면 문항 글(text·html)의 '[2점]·[3점]·[4점]' 표기를 읽는다.
         수학 과목(과목명에 수학·미적분·확률·기하): 2점 기본, 3점 응용, 4점 심화.
           배점을 끝내 모르면 번호로: 1~3번 기본, 15·21·22·29·30번 심화, 나머지 응용.
         탐구 과목(2점·3점만 있음): 3점이면서 16번 이후 심화, 그 밖의 3점 응용, 2점과 표기 없음(탐구의 기본 배점 2점) 기본.
   시험지(sheets): 사람마다 다르지만 같은 사람에게는 늘 같다.
         이 브라우저에 무작위 씨앗(localStorage "namunnip-bank-seed")을 한 번 만들어 두고, 씨앗·과목·범위·기출 포함 여부로
         의사 난수를 만든다. 범위 문항을 층(기본·응용·심화, 서술형)으로 나눠 층마다 섞고, 층 안에서는 절을 번갈아 늘어놓은 뒤
         1, 2, …, n번 시험지에 돌려 담는다. 한 번 섞은 순서를 장마다 나눠 담으므로 장끼리 문항이 겹치지 않는다.
         장마다 서술형을 먼저 돌려 담고, 장 전체가 기본 30 · 응용 50 · 심화 20(최대 나머지 방식)이 되도록 남은 몫을
         객관식·단답형으로 채운다. 층이 모자라면 가까운 층에서 채운다.
         AI 문항을 먼저 모두 고르게 나눠 담고, 남는 자리를 기출로 채운다(장마다 AI·기출이 고르게 섞인다).
         기출을 섞으면 한 장 PER문항, 장 수는 MAXS까지. 기출을 빼면 범위의 AI 문항을 남김없이 round(문항/PER)장에 나눈다.
         무작위 시험지(s=x)는 같은 방식으로 한 장을 뽑되 Math.random을 써서 풀 때마다 새로 뽑는다.
   기록: 문항마다 NMStore.recordAnswer(id, 0, …) — 처음에 틀린 문항은 오답노트(notes.html)에 모인다. 기출은 기출 연습 화면과 같은 id·형식.
         시험지 점수는 localStorage "namunnip-bank-v5" = { "<과목>/<범위>/<장>[/ai]": { n, ok, at } } (/ai는 기출을 뺀 시험지). */
(() => {
  "use strict";
  const S = window.NMStore;
  const body = document.getElementById("bk-body");
  if (!body || !window.TOC) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const CIRCLE = ["①", "②", "③", "④", "⑤"];
  const R = ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ"];
  const PER = 20;    // 시험지 한 장의 문항 수(대략). tools/bank.py의 SHEET와 같게
  const MAXS = 10;   // 기출을 섞을 때 범위마다 시험지 수
  const FREE_EX = 2; // 기출을 섞을 때 장마다 서술형 수(많아야)
  const KEY = "namunnip-bank-v5";  // v1~v3은 고정 시험지 점수, v4는 심화 문항 보강 전 시험지 점수라 버린다
  const SEED_KEY = "namunnip-bank-seed", EX_KEY = "namunnip-bank-ex";
  const KIND = { csat: "수능", mock: "모의평가", hakp: "학력평가" };

  const P = new URLSearchParams(location.search);
  const c = TOC.find((x) => x.id === P.get("c"));
  const head = document.getElementById("px-head");
  if (!c) { head.innerHTML = `<h1>연습 시험</h1><p class="lead">과목을 찾을 수 없습니다. <a href="./">전체 목차</a>에서 과목을 고른 뒤 <b>연습 시험</b>을 눌러 주세요.</p>`; return; }
  document.getElementById("px-back").href = `c/${c.id}/`;

  const secOrder = {}, flat = [];
  c.chapters.forEach((ch) => ch.sections.forEach((s) => { secOrder[`${ch.n}-${s.n}`] = { ch, s, i: flat.length }; flat.push({ ch, s }); }));
  const split = Math.min(c.split || flat.length, flat.length);
  const part = (a, b) => { const fs = flat.slice(a, b); return { fs, chs: c.chapters.filter((ch) => fs.some((f) => f.ch === ch)), lo: a, hi: b }; };
  const RANGES = { mid: { name: "중간고사", ...part(0, split) }, fin: { name: "기말고사", ...part(split, flat.length) }, all: { name: "전 범위", ...part(0, flat.length) } };
  if (!RANGES.fin.fs.length) delete RANGES.fin;
  const inRange = (r) => (it) => secOrder[it.sec].i >= RANGES[r].lo && secOrder[it.sec].i < RANGES[r].hi;
  /* 범위 이름: 대단원 경계면 'Ⅰ~Ⅱ단원', 대단원 중간에서 나뉘면 'Ⅰ단원~Ⅱ.3' */
  const rangeLabel = (r) => {
    const { fs } = RANGES[r], a = fs[0], b = fs[fs.length - 1];
    const whole = (f, end) => (end ? f.s === f.ch.sections[f.ch.sections.length - 1] : f.s === f.ch.sections[0]);
    const A = whole(a, false) ? `${R[a.ch.n]}` : `${R[a.ch.n]}.${a.s.n}`, B = whole(b, true) ? `${R[b.ch.n]}` : `${R[b.ch.n]}.${b.s.n}`;
    return A === B ? `${A}단원` : whole(a, false) && whole(b, true) ? `${A}~${B}단원` : `${A}~${B}`;
  };

  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* 저장 못 해도 화면은 돈다 */ } } };
  let scores = {};
  try { scores = JSON.parse(ls.get(KEY) || "{}") || {}; } catch (e) { scores = {}; }
  try { ["namunnip-bank-v1", "namunnip-bank-v2", "namunnip-bank-v3", "namunnip-bank-v4"].forEach((k) => localStorage.removeItem(k)); } catch (e) { /* 지울 수 없어도 v5만 읽는다 */ }
  const saveScore = (k, v) => { scores[k] = v; ls.set(KEY, JSON.stringify(scores)); };

  /* 씨앗: 브라우저마다 한 번 만들어 둔다. 저장할 수 없으면 이번 화면에서만 쓰는 씨앗이 된다 */
  let seed = ls.get(SEED_KEY);
  if (!seed) { seed = Math.random().toString(36).slice(2, 10) + Date.now().toString(36); ls.set(SEED_KEY, seed); }
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const mulberry = (a) => () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  /* 기출 섞기: URL의 ex가 먼저, 없으면 기억한 값, 그것도 없으면 섞는다 */
  const hasEx = flat.some((f) => f.s.ex);
  if (P.has("ex")) ls.set(EX_KEY, P.get("ex") === "0" ? "0" : "1");
  const exOn = hasEx && (P.has("ex") ? P.get("ex") !== "0" : ls.get(EX_KEY) !== "0");

  const bySec = (a, b) => secOrder[a.sec].i - secOrder[b.sec].i || (a.id < b.id ? -1 : 1);
  const freeLast = (a, b) => (a.type === "free") - (b.type === "free");
  const LV_ORDER = ["기본", "응용", "심화"];
  const TARGET = [0.3, 0.5, 0.2];
  const NEAR = [[1, 2], [0, 2], [1, 0]];   // 층이 모자랄 때 빌려 올 층 순서(기본→응용·심화, 응용→기본·심화, 심화→응용·기본)
  const lvIdx = (it) => Math.max(0, LV_ORDER.indexOf(it.lv));
  function shuffle(a, rnd = Math.random) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  /* 섞은 뒤 절을 번갈아 늘어놓는다: 앞에서부터 담으면 단원이 고르게 들어간다 */
  function spread(xs, rnd) {
    const b = {};
    shuffle(xs, rnd).forEach((it) => (b[it.sec] = b[it.sec] || []).push(it));
    const keys = shuffle(Object.keys(b), rnd), out = [];
    for (let i = 0; out.length < xs.length; i++) { const q = b[keys[i % keys.length]]; if (q.length) out.push(q.pop()); }
    return out;
  }
  /* 두 줄을 길이 비율대로 엇갈려 합친다(AI·기출이 장마다 고르게) */
  function mix(a, e) {
    const out = [], n = a.length + e.length; let i = 0, j = 0;
    for (let k = 0; k < n; k++) { if (j >= e.length || (i < a.length && (i + 1) / (a.length + 1) <= (j + 1) / (e.length + 1))) out.push(a[i++]); else out.push(e[j++]); }
    return out;
  }
  const quota = (m) => {   // m문항을 30/50/20으로(최대 나머지 방식)
    const raw = TARGET.map((t) => m * t), q = raw.map(Math.floor);
    let left = m - q.reduce((s, x) => s + x, 0);
    raw.map((x, i) => [x % 1, i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { q[i]++; left--; } });
    return q;
  };
  /* 범위 문항 pool을 sizes[k]문항짜리 시험지 sizes.length장에 나눠 담는다. freeCap: 장마다 서술형 많아야 몇 문항 */
  function deal(pool, sizes, rnd, freeCap, span = sizes.length) {
    const n = sizes.length, out = sizes.map(() => []);
    if (!n) return out;
    const free = spread(pool.filter((it) => it.type === "free").sort((a, b) => lvIdx(a) - lvIdx(b)), rnd);
    const fq = free.slice(0, n * freeCap);
    fq.forEach((it, i) => out[i % n].push(it));
    // 장 전체(서술형 포함)를 30/50/20으로 나눈 몫에서 이미 담은 서술형의 층을 빼고 남은 몫을 객관식·단답형으로 채운다
    const want = sizes.map((m, k) => {
      const w = quota(m);
      out[k].forEach((it) => { const t = [lvIdx(it), ...NEAR[lvIdx(it)]].find((u) => w[u] > 0); if (t != null) w[t]--; });
      return w;
    });
    const spare = [[], [], []];
    LV_ORDER.forEach((lv, t) => {
      const obj = pool.filter((it) => it.type !== "free" && lvIdx(it) === t);
      const A = spread(obj.filter((it) => !it.ex), rnd), E = spread(obj.filter((it) => it.ex), rnd);
      const need = want.reduce((s, q) => s + q[t], 0);
      // AI 문항은 span장에 고르게 퍼지도록 몫을 정한다(무작위 한 장도 범위 시험지와 같은 AI·기출 비율)
      const ta = Math.min(A.length, Math.round(need * Math.min(1, A.length * n / Math.max(1, need * span)))), te = Math.min(E.length, need - ta);
      const q = mix(A.slice(0, ta), E.slice(0, te));
      spare[t] = mix(A.slice(ta), E.slice(te));
      const got = out.map(() => 0);
      for (let moved = true; q.length && moved;) {   // 돌려 담기: 모자람이 생겨도 장마다 ±1 안
        moved = false;
        for (let k = 0; k < n && q.length; k++) if (got[k] < want[k][t]) { out[k].push(q.shift()); got[k]++; moved = true; }
      }
      want.forEach((w, k) => { w[t] -= got[k]; });   // 남은 몫은 아래에서 다른 층으로 채운다
    });
    LV_ORDER.forEach((lv, t) => {
      for (let moved = true; moved;) {
        moved = false;
        for (let k = 0; k < n; k++) {
          if (want[k][t] <= 0) continue;
          const from = NEAR[t].find((u) => spare[u].length);
          if (from == null) break;
          out[k].push(spare[from].shift()); want[k][t]--; moved = true;
        }
      }
    });
    return out.map((s) => s.sort(bySec).sort(freeLast));
  }
  /* 범위의 시험지들: 씨앗·과목·범위·기출 여부로 섞으므로 같은 브라우저에서는 늘 같다 */
  function sheets(items, r) {
    const pool = items.filter(inRange(r));
    if (!pool.length) return [];
    const rnd = mulberry(hash(`${seed}|${c.id}|${r}|${exOn ? "ex" : "ai"}`));
    if (exOn && pool.some((it) => it.ex)) {
      const n = Math.max(1, Math.min(MAXS, Math.floor(pool.length / PER)));
      return deal(pool, Array(n).fill(Math.min(PER, pool.length)), rnd, FREE_EX);
    }
    const n = Math.max(1, Math.round(pool.length / PER));
    const sizes = Array.from({ length: n }, (_, k) => Math.floor(pool.length / n) + (k < pool.length % n ? 1 : 0));
    return deal(pool, sizes, rnd, Math.ceil(pool.filter((it) => it.type === "free").length / n));
  }
  /* 무작위 시험지: 같은 규칙으로 한 장, 풀 때마다 새로 */
  function randomSheet(pool) {
    const nf = pool.filter((it) => it.type === "free").length;
    const mixEx = exOn && pool.some((it) => it.ex);
    const cap = mixEx ? FREE_EX : Math.round(PER * nf / Math.max(1, pool.length));
    return deal(pool, [Math.min(PER, pool.length)], Math.random, Math.min(nf, cap), mixEx ? MAXS : 1)[0];
  }
  const lvMix = (xs) => {
    const n = lvCount(xs), m = n.기본 + n.응용 + n.심화;
    const avg = m ? (n.기본 + 2 * n.응용 + 3 * n.심화) / m : 0;
    const pct = (x) => (m ? Math.round((100 * x) / m) : 0);
    return `기본 ${n.기본} · 응용 ${n.응용} · 심화 ${n.심화}${n.free ? ` · 서술형 ${n.free}` : ""} (${pct(n.기본)}/${pct(n.응용)}/${pct(n.심화)}%)${n.ex ? ` · 기출 ${n.ex}` : ""} · 평균 난이도 ${avg.toFixed(2)}`;
  };
  /* 난이도 거르기: lv=b 기본, ah 응용·심화, h 심화 */
  const LVF = { b: ["기본"], ah: ["응용", "심화"], h: ["심화"] };
  const LVN = { b: "기본", ah: "응용·심화", h: "심화" };
  const lvKey = LVF[P.get("lv")] ? P.get("lv") : "";
  const lvOk = (it) => !lvKey || LVF[lvKey].includes(it.lv);
  const lvCount = (xs) => { const n = { 기본: 0, 응용: 0, 심화: 0, free: 0, ex: 0 }; xs.forEach((it) => { if (n[it.lv] != null) n[it.lv]++; if (it.type === "free") n.free++; if (it.ex) n.ex++; }); return n; };
  const exQ = exOn ? "" : "&ex=0";
  const lvLinks = (base) => `<span class="bk-lvs">${[["", "전체"], ["b", "기본"], ["ah", "응용·심화"], ["h", "심화"]].map(([k, t]) => `<a href="${base}${k ? `&lv=${k}` : ""}"${k === lvKey ? ' aria-current="true"' : ""}>${t}</a>`).join("")}</span>`;

  /* ───── 기출 문항: 절 파일을 읽어 난이도를 붙인다 ───── */
  const PT = /\[\s*([234])\s*점\s*\]/;
  const MATHS = /수학|미적분|확률|기하/;
  function exLv(it) {
    let p = it.pts;
    if (!p) { const m = PT.exec(`${it.text || ""} ${it.html || ""}`); p = m ? +m[1] : 0; }
    const no = it.no || 0;
    if (MATHS.test(it.subject || "")) {
      if (p === 2) return "기본";
      if (p === 3) return "응용";
      if (p === 4) return "심화";
      return no <= 3 ? "기본" : [15, 21, 22, 29, 30].includes(no) ? "심화" : "응용";
    }
    return p === 3 ? (no >= 16 ? "심화" : "응용") : "기본";
  }
  const exLabel = (it) => `${it.year}${it.kind === "hakp" ? "년" : "학년도"} ${it.grade ? `고${it.grade} ` : ""}${it.month ? `${it.month}월 ` : ""}${KIND[it.kind] || ""} ${it.subject} ${it.no}번`;
  function loadEx() {
    if (!exOn) return Promise.resolve([]);
    const fs = flat.filter((f) => f.s.ex);
    return Promise.all(fs.map((f) => fetch(`exams/sec/${c.id}-${f.ch.n}-${f.s.n}.json`).then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] }))
      .then((d) => (d.items || []).filter((it) => it.conf === "high" && it.answer != null && it.answer !== "").map((it) => ({ ...it, sec: `${f.ch.n}-${f.s.n}`, ex: true, lv: exLv(it) })))))
      .then((xs) => { const seen = new Set(); return xs.flat().filter((it) => !seen.has(it.id) && seen.add(it.id)); });
  }

  const crumbs = document.querySelector(".crumbs");
  const crumb = (last) => { crumbs.innerHTML = `<span aria-hidden="true">/</span><a href="c/${c.id}/">${esc(c.name)}</a><span aria-hidden="true">/</span>${last ? `<a href="bank.html?c=${c.id}">연습 시험</a><span aria-hidden="true">/</span><b>${esc(last)}</b>` : "<b>연습 시험</b>"}`; };
  const recOf = (it) => { const r = S && S.get(it.id); return r && r.quiz && r.quiz[0]; };
  const secName = (sec) => { const o = secOrder[sec]; return o ? `${o.ch.n}.${o.s.n} ${o.s.title}` : sec; };
  const SRC = (xs) => (xs.some((it) => it.ex) ? `<span class="bk-ai">AI 출제 연습 문항 + 기출 문항</span>` : `<span class="bk-ai">AI 출제 연습 문항</span>`);

  /* ───── 채점: 객관식은 번호, 단답형은 공백·전각 무시, 숫자(분수·소수)는 값으로 비교 ───── */
  const norm = (v) => String(v ?? "").normalize("NFKC").replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/^\+/, "").toLowerCase();
  const num = (v) => { const s = norm(v); let m; if ((m = /^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(s))) return +m[1] / +m[2]; return /^-?\d*\.?\d+$/.test(s) ? +s : NaN; };
  function correct(it, v) {
    if (it.type === "mc") return String(v) === String(it.answer);
    return [it.answer, ...(it.alt || [])].some((a) => { const x = num(a), y = num(v); return !isNaN(x) && !isNaN(y) ? Math.abs(x - y) < 1e-9 * Math.max(1, Math.abs(x)) : norm(a) === norm(v); });
  }
  const shown = (it) => (it.type === "mc" ? CIRCLE[+it.answer - 1] || it.answer : it.answer);

  const fullPt = (it) => (it.rubric || []).reduce((s, x) => s + x.pt, 0);
  /* 기출 문항 본문: 텍스트로 옮겨 쓴 문항은 공통 지문 → 본문 → 그림, 아니면 문항 그림(기출 연습 화면과 같다) */
  const figs = (fs, lab) => (fs || []).map((f) => `<figure class="px-figimg"><img src="${esc(f.src)}" alt="${esc(f.alt || lab)}" loading="lazy"></figure>`).join("");
  const exBody = (it) => (it.html
    ? `<div class="px-text">${it.shared ? `<div class="px-shared">${it.shared}${figs(it.sfigs, "공통 지문 그림")}</div>` : ""}<div class="px-stem">${it.html}</div>${figs(it.figs, exLabel(it))}</div>`
    : `<figure class="px-fig"><img src="${esc(it.img)}" alt="${esc(exLabel(it))} 문항: ${esc((it.text || "").slice(0, 120))}" loading="lazy"></figure>`);
  function itemHtml(it, k, instant) {
    const r = recOf(it), o = secOrder[it.sec], free = it.type === "free", ex = !!it.ex;
    const opts = ex && !(Array.isArray(it.choices) && it.choices.length === 5)
      ? `<div class="px-opts" role="group" aria-label="답 고르기">${CIRCLE.map((t, i) => `<button type="button" class="px-opt" data-v="${i + 1}" aria-pressed="false">${t}</button>`).join("")}</div>`
      : it.type === "mc" ? `<div class="px-opts long" role="group" aria-label="답 고르기">${it.choices.map((t, i) => `<button type="button" class="px-opt" data-v="${i + 1}" aria-pressed="false"><span class="n">${CIRCLE[i]}</span><span class="c">${t}</span></button>`).join("")}</div>` : "";
    const ans = it.type === "mc" ? opts
      : free ? `<div class="bk-free"><textarea rows="6" aria-label="풀이 과정과 답 쓰기" placeholder="풀이 과정과 답을 쓰세요(종이에 써도 됩니다)"></textarea>${instant ? `<button type="button" class="btn bk-show">모범 답안 보고 채점하기</button>` : ""}</div>`
      : `<form class="px-short"><input type="text"${ex ? ' inputmode="numeric"' : ""} aria-label="답 쓰기" placeholder="답" autocomplete="off">${instant ? `<button type="submit" class="btn">확인</button>` : ""}</form>`;
    const hints = it.hints && it.hints.length ? `<details class="bk-hint"><summary>힌트</summary>${it.hints.map((h, i) => `<p><span class="mono">${i + 1}</span> ${h}</p>`).join("")}</details>` : "";
    const rub = free ? `<div class="bk-rub"><b>채점 기준</b><span class="small dim"> 내 답안에 들어 있는 요소를 고르세요.</span>
        ${it.rubric.map((x, i) => `<label><input type="checkbox" data-pt="${x.pt}" data-i="${i}"> <span>${x.t}</span> <span class="mono">${x.pt}점</span></label>`).join("")}
        <p class="bk-self mono">자기 채점 <b>0</b> / ${fullPt(it)}점</p></div>` : "";
    const sol = ex
      ? `<b>정답</b> <p>${esc(shown(it))}. 기출 문항이라 풀이는 싣지 않았습니다.</p><p class="mono small"><a href="practice.html?sec=${c.id}-${it.sec}#${esc(it.id)}">이 절의 기출문제</a> · <a href="c/${c.id}/${o.ch.n}-${o.s.n}.html">이 절 다시 보기 · ${esc(secName(it.sec))}</a></p>`
      : `<b>${free ? "모범 답안" : "풀이"}</b>${it.sol}${rub}<p class="mono small"><a href="c/${c.id}/${o.ch.n}-${o.s.n}.html">이 절 다시 보기 · ${esc(secName(it.sec))}</a></p>`;
    return `<article class="px-item bk-item${free ? " free" : ""}${ex ? " ex" : ""}" id="${esc(it.id)}" data-id="${esc(it.id)}">
      <header><span class="bk-no">${k}</span><a class="mono dim" href="c/${c.id}/${o.ch.n}-${o.s.n}.html">${esc(secName(it.sec))}</a>${it.lv ? `<span class="bk-lv lv-${esc(it.lv)}">${esc(it.lv)}</span>` : ""}${ex ? `<span class="mono">기출 · ${esc(exLabel(it))}${it.pts ? ` · ${it.pts}점` : ""}</span>` : ""}${it.type === "short" ? `<span class="mono dim">단답형</span>` : free ? `<span class="mono dim">서술형 ${fullPt(it)}점</span>` : ""}${r ? `<span class="mono px-prev ${r.firstOk ? "ok" : "bad"}">${r.firstOk ? "전에 맞힘" : "오답노트에 있음"}</span>` : ""}</header>
      ${ex ? exBody(it) : `<div class="px-text"><div class="px-stem">${it.q}</div></div>`}
      ${hints}${ans}
      <p class="px-result" aria-live="polite"></p>
      <div class="bk-sol" hidden>${sol}</div>
    </article>`;
  }

  /* 서술형: 답안을 잠그고 모범 답안·채점 기준을 연다. 점수는 학생이 기준을 골라 매긴다 */
  function openFree(card, it) {
    const ta = card.querySelector("textarea"); if (ta) ta.readOnly = true;
    const b = card.querySelector(".bk-show"); if (b) b.remove();
    card.querySelector(".px-result").innerHTML = `<b>결론</b> ${it.answer}`;
    card.querySelector(".bk-sol").hidden = false;
    if (S) S.markSeen(it.id);
  }
  const selfPt = (card) => [...card.querySelectorAll(".bk-rub input:checked")].reduce((s, x) => s + +x.dataset.pt, 0);
  function onRubric(e, after) {
    const box = e.target.closest(".bk-rub input"); if (!box) return;
    const card = box.closest(".bk-item");
    card.querySelector(".bk-self b").textContent = selfPt(card);
    if (after) after();
  }

  function mark(card, it, v) {
    const ok = correct(it, v);
    card.querySelectorAll(".px-opt").forEach((b) => {
      b.disabled = true;
      b.classList.toggle("right", b.dataset.v === String(it.answer));
      b.classList.toggle("wrong", !ok && b.dataset.v === String(v));
    });
    const inp = card.querySelector(".px-short input"); if (inp) inp.disabled = true;
    const btn = card.querySelector(".px-short button"); if (btn) btn.disabled = true;
    const got = v === "" || v == null ? "답 없음" : it.type === "mc" ? CIRCLE[+v - 1] : v;
    card.querySelector(".px-result").innerHTML = ok ? `<b>맞았습니다.</b> 정답 ${esc(shown(it))}` : `<b>틀렸습니다.</b> 고른 답 ${esc(got)} · 정답 ${esc(shown(it))}`;
    card.classList.toggle("bad", !ok); card.classList.toggle("ok", ok);
    card.querySelector(".bk-sol").hidden = false;
    if (S) {
      if (it.ex) {   // 기출 연습 화면(js/practice.js)과 같은 형식으로 남긴다
        const sec = `${c.id}-${it.sec}`;
        S.recordAnswer(it.id, 0, {
          ok, q: exLabel(it), answer: shown(it), why: `${exLabel(it)}의 정답입니다.`, chosen: got, chosenWhy: "",
          extra: { src: exLabel(it), sec, img: it.img, href: `practice.html?sec=${sec}#${it.id}`,
            ...(it.html ? { html: it.html, shared: it.shared || null, choices: it.choices || null, figs: [...(it.sfigs || []), ...(it.figs || [])].map((f) => f.src) } : {}) },
        });
      } else {
        S.recordAnswer(it.id, 0, {
          ok, q: `${c.name} 연습 · ${secName(it.sec)}`, answer: shown(it), why: it.sol.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300),
          chosen: got, chosenWhy: "",
          extra: { src: `AI 연습 · ${c.name} ${secName(it.sec)}`, sec: `${c.id}-${it.sec}`, href: `bank.html?c=${c.id}&sec=${it.sec}#${it.id}`, html: it.q, choices: it.choices || null, ai: true },
        });
      }
      S.markSeen(it.id);
    }
    return ok;
  }

  /* ───── 시험지 고르기 ───── */
  function hub(items) {
    crumb("");
    document.title = `연습 시험 · ${c.name} — 나뭇잎 교과서`;
    const nAi = items.filter((it) => !it.ex).length, nEx = items.length - nAi;
    head.innerHTML = `<span class="mono dim">${esc(c.name)} · ${esc(c.meta)}</span>
      <h1>${esc(c.name)} <em>연습 시험</em></h1>
      <p class="lead">${SRC(items)} 중간고사(${rangeLabel("mid")})${RANGES.fin ? `와 기말고사(${rangeLabel("fin")})` : ""} 범위로 시험지를 골라 푸세요. 한 장에 ${PER}문항 안팎이며, 장마다 문항이 겹치지 않고 난이도는 기본 30 · 응용 50 · 심화 20 비율에 맞춥니다. 시험지는 사람마다 다르게 뽑히고, 이 브라우저에서는 다시 열어도 같은 시험지가 나옵니다. 다 풀고 <b>채점하기</b>를 누르면 점수와 풀이가 나옵니다.</p>
      <p class="mono small dim">AI 출제 문항 ${nAi}${nEx ? ` · 수능·모의평가·학력평가 기출 ${nEx}` : ""} · AI 문항은 실제 시험 문항이 아니라 AI가 고등학교 교육과정 범위에서 출제한 문항입니다.</p>
      ${hasEx ? `<p class="small bk-lvrow">기출 문항 섞기 <span class="bk-lvs"><a href="bank.html?c=${c.id}&ex=1"${exOn ? ' aria-current="true"' : ""}>섞기</a><a href="bank.html?c=${c.id}&ex=0"${exOn ? "" : ' aria-current="true"'}>AI 문항만</a></span></p>` : ""}`;
    const range = (r) => {
      const sh = sheets(items, r);
      if (!sh.length) return "";
      return `<section class="bk-range">
        <h2>${RANGES[r].name} <span class="mono dim">${r === "all" ? "" : rangeLabel(r)}</span></h2>
        <p class="small dim">${RANGES[r].chs.map((ch) => { const n = RANGES[r].fs.filter((f) => f.ch === ch).length; return `${R[ch.n]}. ${esc(ch.title)}${n < ch.sections.length ? ` (${n}절)` : ""}`; }).join(" · ")}</p>
        <div class="bk-sheets">${sh.map((s, i) => { const sc = scores[`${c.id}/${r}/${i + 1}${exOn ? "" : "/ai"}`]; return `<a class="bk-sheet" href="bank.html?c=${c.id}&r=${r}&s=${i + 1}${exQ}"><b>시험지 ${i + 1}</b><span class="mono">${s.length}문항${(() => { const n = lvCount(s); return n.ex ? ` · 기출 ${n.ex}` : ""; })()}</span><span class="mono dim">${(() => { const n = lvCount(s); return `기본 ${n.기본} · 응용 ${n.응용} · 심화 ${n.심화}`; })()}</span><span class="mono ${sc ? "ok" : "dim"}">${sc ? `최근 ${sc.ok}/${sc.n}` : "아직 안 풂"}</span></a>`; }).join("")}
          <a class="bk-sheet rand" href="bank.html?c=${c.id}&r=${r}&s=x${exQ}"><b>무작위 시험지</b><span class="mono">${Math.min(PER, items.filter(inRange(r)).length)}문항</span><span class="mono dim">풀 때마다 새로 뽑음</span></a></div>
        <p class="small bk-lvrow">${(() => { const n = lvCount(items.filter(inRange(r))); return `<span class="mono dim">기본 ${n.기본} · 응용 ${n.응용} · 심화 ${n.심화}${n.free ? ` · 서술형 ${n.free}` : ""}${n.ex ? ` (기출 ${n.ex} 포함)` : ""}</span>`; })()} 난이도를 골라 무작위로 풀기 ${lvLinks(`bank.html?c=${c.id}&r=${r}&s=x${exQ}`)}</p>
      </section>`;
    };
    const perSec = {}; items.forEach((it) => { if (!it.ex) perSec[it.sec] = (perSec[it.sec] || 0) + 1; });
    body.innerHTML = range("mid") + (RANGES.fin ? range("fin") : "") + `
      <section class="bk-range"><h2>절별 연습 <span class="mono dim">한 문항씩 바로 채점</span></h2>
        ${c.chapters.map((ch) => `<h3 class="bk-ch">${R[ch.n]}. ${esc(ch.title)}</h3><ul class="bk-secs">${ch.sections.map((s) => { const k = `${ch.n}-${s.n}`, n = perSec[k] || 0;
          return `<li>${n ? `<a href="bank.html?c=${c.id}&sec=${k}">` : "<span class=\"dim\">"}<span class="mono">${ch.n}.${s.n}</span> ${esc(s.title)}${n ? "</a>" : "</span>"}<span class="mono dim">${n ? `${n}문항` : "준비 중"}${s.ex ? ` · <a href="practice.html?sec=${c.id}-${k}">기출 ${s.ex}</a>` : ""}</span></li>`; }).join("")}</ul>`).join("")}
      </section>`;
  }

  /* ───── 시험지: 다 풀고 한꺼번에 채점 ───── */
  function sheet(items, r, sNo) {
    if (!RANGES[r]) r = "mid";
    const sh = sheets(items, r);
    const rand = sNo === "x";
    const k = rand ? 0 : Math.min(Math.max(1, +sNo || 1), sh.length || 1);
    const list = rand ? randomSheet(items.filter(inRange(r)).filter(lvOk)) : sh[k - 1] || [];
    const title = `${RANGES[r].name} ${rand ? `무작위 시험지${lvKey ? ` · ${LVN[lvKey]}` : ""}` : `시험지 ${k}`}`;
    crumb(title);
    document.title = `${title} · ${c.name} — 나뭇잎 교과서`;
    head.innerHTML = `<span class="mono dim">${esc(c.name)} · ${RANGES[r].name} 범위 ${r === "all" ? "" : rangeLabel(r)}</span>
      <h1>${esc(c.name)} <em>${esc(title)}</em></h1>
      <p class="lead">${SRC(list)} ${list.length}문항입니다. 객관식은 번호를 고르고, 단답형은 답을 적으세요.${list.some((it) => it.type === "free") ? " 서술형은 풀이 과정을 쓰고, 채점 뒤 모범 답안과 채점 기준을 보고 스스로 점수를 매깁니다." : ""} 다 풀면 맨 아래 <b>채점하기</b>를 누릅니다.</p>
      <p class="mono small bk-lvrow">난이도 구성: ${lvMix(list)} <span class="dim">(기본 1 · 응용 2 · 심화 3으로 평균)</span></p>
      <p class="mono small dim">${list.some((it) => it.ex) ? "기출 문항은 출처와 배점을 함께 적었고, 기출 난이도는 배점으로 정했습니다. " : ""}AI 문항은 실제 시험 문항이 아닙니다. 고등학교 교육과정 범위에서 AI가 출제했습니다.</p>`;
    const nav = rand ? `<a class="btn ghost" href="bank.html?c=${c.id}&r=${r}&s=x${lvKey ? `&lv=${lvKey}` : ""}${exQ}">다른 무작위 시험지</a>`
      : `${k > 1 ? `<a class="btn ghost" href="bank.html?c=${c.id}&r=${r}&s=${k - 1}${exQ}">← 시험지 ${k - 1}</a>` : ""}${k < sh.length ? `<a class="btn ghost" href="bank.html?c=${c.id}&r=${r}&s=${k + 1}${exQ}">시험지 ${k + 1} →</a>` : ""}`;
    body.innerHTML = `<div class="px-list bk-list">${list.map((it, i) => itemHtml(it, i + 1, false)).join("")}</div>
      <div class="bk-submit"><button type="button" class="btn" id="bk-grade">채점하기</button><span class="mono small dim" id="bk-left"></span></div>
      <div class="bk-score" id="bk-score" hidden></div>
      <p class="bk-nav"><a class="btn ghost" href="bank.html?c=${c.id}">시험지 목록</a>${nav}</p>`;
    if (window.NMMath) NMMath.render(body);
    const pick = {};
    const left = () => { const n = list.filter((it) => (pick[it.id] ?? "") === "").length; document.getElementById("bk-left").textContent = n ? `안 푼 문항 ${n}` : "모두 풀었습니다"; };
    body.addEventListener("click", (e) => {
      const b = e.target.closest(".px-opt"); if (!b || b.disabled) return;
      const card = b.closest(".bk-item");
      card.querySelectorAll(".px-opt").forEach((x) => { x.setAttribute("aria-pressed", String(x === b)); x.classList.toggle("sel", x === b); });
      pick[card.dataset.id] = b.dataset.v; left();
    });
    body.addEventListener("input", (e) => { const card = e.target.closest(".bk-item"); if (card) { pick[card.dataset.id] = e.target.value.trim(); left(); } });
    body.addEventListener("submit", (e) => e.preventDefault());
    left();
    document.getElementById("bk-grade").addEventListener("click", (e) => {
      const n = list.filter((it) => (pick[it.id] ?? "") === "").length;
      if (n && e.target.dataset.warned !== "1") {   // 안 푼 문항이 있으면 한 번 알려 주고, 다시 누르면 채점한다
        e.target.dataset.warned = "1";
        e.target.textContent = "그래도 채점하기";
        document.getElementById("bk-left").textContent = `안 푼 문항이 ${n}개 있습니다. 한 번 더 누르면 빈 답은 틀린 것으로 채점합니다.`;
        return;
      }
      let ok = 0;
      const wrong = [], obj = list.filter((it) => it.type !== "free"), fr = list.filter((it) => it.type === "free");
      list.forEach((it, i) => {
        const card = body.querySelector(`[data-id="${it.id}"]`);
        if (it.type === "free") openFree(card, it);
        else if (mark(card, it, pick[it.id] ?? "")) ok++;
        else wrong.push(i + 1);
      });
      e.target.disabled = true;
      const fmax = fr.reduce((s, it) => s + fullPt(it), 0);
      const box = document.getElementById("bk-score");
      const show = () => {
        const fp = fr.reduce((s, it) => s + selfPt(body.querySelector(`[data-id="${it.id}"]`)), 0);
        if (!rand) saveScore(`${c.id}/${r}/${k}${exOn ? "" : "/ai"}`, { n: obj.length, ok, ...(fr.length ? { fp, fmax } : {}), at: Date.now() });
        box.innerHTML = `<b>${ok} / ${obj.length}</b><span>${obj.length ? `${Math.round((100 * ok) / obj.length)}점 환산` : ""}${fr.length ? ` · 서술형 자기 채점 ${fp} / ${fmax}점` : ""}</span>${wrong.length ? `<p class="small">틀린 문항: ${wrong.map((w) => `<a href="#${list[w - 1].id}">${w}번</a>`).join(" · ")}. 문항마다 풀이(기출은 정답)와 해당 절 링크가 열렸습니다. 처음 풀 때 틀린 문항은 <a href="notes.html#wrong">오답노트</a>에 모입니다.</p>` : obj.length ? `<p class="small">객관식·단답형을 모두 맞았습니다.</p>` : ""}${fr.length ? `<p class="small">서술형 ${fr.length}문항은 모범 답안 아래 채점 기준에서 내 답안에 있는 요소를 고르면 점수가 더해집니다.</p>` : ""}`;
      };
      box.hidden = false;
      show();
      body.addEventListener("change", (ev) => onRubric(ev, show));
      box.scrollIntoView({ block: "center" });
      if (window.NMMath) NMMath.render(body);
    });
  }

  /* ───── 절별 연습: 한 문항씩 바로 채점(AI 문항만. 기출은 기출 연습 화면에서) ───── */
  function section(items, sec) {
    const o = secOrder[sec];
    if (!o) return hub(items);
    const all = items.filter((it) => it.sec === sec);
    const list = all.filter(lvOk).sort(freeLast);
    crumb(`${o.ch.n}.${o.s.n} ${o.s.title}`);
    document.title = `연습문제 · ${o.s.title} — 나뭇잎 교과서`;
    const rng = o.i < split ? "mid" : "fin";
    head.innerHTML = `<span class="mono dim">${esc(c.name)} · ${o.ch.n}.${o.s.n}${/\d/.test(o.s.code || "") ? ` · [${esc(o.s.code)}]` : ""}</span>
      <h1>${esc(o.s.title)} <em>연습문제</em></h1>
      <p class="lead">${SRC([])} 이 절의 문항 ${list.length}개입니다${lvKey ? `(${LVN[lvKey]}만, 전체 ${all.length}개)` : ""}. 답을 고르면 바로 채점하고 풀이를 보여 줍니다. 서술형은 답안을 쓴 뒤 모범 답안을 보고 스스로 채점합니다. 범위 전체를 시험처럼 풀려면 <a href="bank.html?c=${c.id}">${RANGES[rng] ? RANGES[rng].name : ""} 시험지</a>로 가세요.</p>
      <p class="small bk-lvrow">난이도 ${lvLinks(`bank.html?c=${c.id}&sec=${sec}`)}</p>
      <p class="mono small dim"><a href="c/${c.id}/${o.ch.n}-${o.s.n}.html">← 이 절로 돌아가기</a>${o.s.ex ? ` · <a href="practice.html?sec=${c.id}-${sec}">이 절의 기출문제 ${o.s.ex}문항</a>` : ""}</p>`;
    document.getElementById("px-back").href = `c/${c.id}/${o.ch.n}-${o.s.n}.html`;
    document.getElementById("px-back").textContent = "← 절로 돌아가기";
    body.innerHTML = list.length ? `<div class="px-list bk-list">${list.map((it, i) => itemHtml(it, i + 1, true)).join("")}</div>`
      : `<p class="px-empty">이 절의 연습 문항은 아직 없습니다. <a href="bank.html?c=${c.id}">시험지 목록</a>에서 범위 시험지를 풀어 보세요.</p>`;
    if (window.NMMath) NMMath.render(body);
    const find = (card) => list.find((x) => x.id === card.dataset.id);
    body.addEventListener("click", (e) => {
      const f = e.target.closest(".bk-show");
      if (f) { const card = f.closest(".bk-item"); openFree(card, find(card)); if (window.NMMath) NMMath.render(card); return; }
      const b = e.target.closest(".px-opt"); if (!b || b.disabled) return;
      const card = b.closest(".bk-item"); mark(card, find(card), b.dataset.v); if (window.NMMath) NMMath.render(card);
    });
    body.addEventListener("change", (e) => onRubric(e));
    body.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = e.target.querySelector("input").value.trim(); if (!v) return;
      const card = e.target.closest(".bk-item"); mark(card, find(card), v); if (window.NMMath) NMMath.render(card);
    });
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }

  const secView = P.get("sec");
  if (!secView) { crumb(""); body.innerHTML = `<p class="px-empty">${exOn ? "AI 문항과 기출 문항을 불러오는 중입니다." : "문항을 불러오는 중입니다."}</p>`; }
  const ai = fetch(`exams/bank/${c.id}.json`).then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] }));
  Promise.all([ai, secView ? Promise.resolve([]) : loadEx()]).then(([d, ex]) => {
    const own = (d.items || []).filter((it) => secOrder[it.sec]);
    const items = own.concat(ex);
    if (!items.length) {
      crumb("");
      head.innerHTML = `<h1>${esc(c.name)} <em>연습 시험</em></h1><p class="lead">이 과목의 연습 문항은 아직 준비 중입니다.</p>`;
      body.innerHTML = "";
      return;
    }
    if (secView) section(own, secView);
    else if (P.get("r")) sheet(items, P.get("r"), P.get("s"));
    else hub(items);
  });
})();
