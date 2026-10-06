/* 카드: 염기 서열을 컴퓨터로 비교하면 병의 원인을 찾을 수 있을까? — 축소 데이터베이스 유사 서열 검색(씨앗·일치율), HBB 참조 서열과 환자 서열 정렬·번역 */
(() => {
  const root = document.getElementById("card-labbio-bioinfo");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  // 사람 HBB 암호화 부위 앞 60염기 (ATG부터, 코돈 20개)
  const HBB = "ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAAC";
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const B = "ACGT";
  const mutate = (s, k) => { const a = [...s], used = new Set(); while (used.size < k) { const i = Math.floor(rnd() * a.length); if (used.has(i)) continue; used.add(i); a[i] = B.replace(a[i], "")[Math.floor(rnd() * 3)]; } return a.join(""); };
  const random = (n) => Array.from({ length: n }, () => B[Math.floor(rnd() * 4)]).join("");
  const DB = [
    { name: "사람 HBB (β-글로빈)", s: HBB },
    { name: "가상 종 A β-글로빈 유사", s: mutate(HBB, 6) },
    { name: "가상 종 B β-글로빈 유사", s: mutate(HBB, 15) },
    { name: "가상 글로빈 유사 유전자", s: mutate(HBB, 28) },
    { name: "가상 세균 유전자 X", s: random(60) },
    { name: "가상 효모 유전자 Y", s: random(60) },
  ];
  const Q = [mutate(HBB.slice(6, 36), 1), mutate(DB[2].s.slice(24, 54), 0), random(30)];
  const PAT = [
    { name: "환자 가", s: HBB.slice(0, 19) + "T" + HBB.slice(20) },   // c.20A>T, GAG→GTG
    { name: "환자 나", s: HBB.slice(0, 18) + "A" + HBB.slice(19) },   // c.19G>A, GAG→AAG
    { name: "환자 다", s: HBB.slice(0, 11) + "C" + HBB.slice(12) },   // c.12G>C, CTG→CTC
  ];
  const AA1 = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
  const AA3 = { F: "Phe", L: "Leu", S: "Ser", Y: "Tyr", "*": "종결", C: "Cys", W: "Trp", P: "Pro", H: "His", Q: "Gln", R: "Arg", I: "Ile", M: "Met", T: "Thr", N: "Asn", K: "Lys", V: "Val", A: "Ala", D: "Asp", E: "Glu", G: "Gly" };
  const KO = { Glu: "글루탐산", Val: "발린", Lys: "라이신", Leu: "류신" };
  const tr = (c) => { const i = "TCAG".indexOf(c[0]) * 16 + "TCAG".indexOf(c[1]) * 4 + "TCAG".indexOf(c[2]); return AA3[AA1[i]]; };
  let mode = "search", q = 0, p = 0, last = null, lastS = null;

  function align(qs, ds) {
    let best = { id: -1, off: 0 };
    for (let off = 0; off <= ds.length - qs.length; off++) {
      let m = 0; for (let i = 0; i < qs.length; i++) m += qs[i] === ds[off + i];
      if (m > best.id) best = { id: m, off };
    }
    let seeds = 0;
    for (let i = 0; i + 8 <= qs.length; i++) if (ds.includes(qs.slice(i, i + 8))) seeds++;
    return { ...best, pct: Math.round(best.id / qs.length * 100), seeds };
  }

  const tbl = L.table($(".tbl-host"), [{ key: "a", label: "분석" }, { key: "t", label: "대상" }, { key: "r", label: "결과" }, { key: "i", label: "해석" }], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function search() {
    const qs = Q[q];
    const hits = DB.map((d) => ({ name: d.name, s: d.s, ...align(qs, d.s) })).sort((a, b) => b.pct - a.pct || b.seeds - a.seeds);
    const top = hits[0], sig = top.seeds > 0 && top.pct >= 70;
    last = lastS = { kind: "search", qs, hits };
    tbl.add({ a: "유사 서열 검색", t: `미지 서열 ${q + 1}`, r: sig ? `${top.name} ${top.pct}% (씨앗 ${top.seeds})` : `최고 ${top.pct}%, 씨앗 0`, i: sig ? (top.pct >= 95 ? "같은 유전자로 보임" : "가까운 종의 같은 유전자 후보") : "유의한 일치 없음" });
    $(".bi-msg").textContent = sig ? `가장 비슷한 서열은 ‘${top.name}’입니다. 정렬에서 세로줄(|)은 같은 염기입니다.` : "어느 서열과도 절반 이하만 일치하고, 8염기 연속 일치(씨앗)가 하나도 없습니다. 위치를 옮겨 가며 맞추면 우연히도 이 정도는 일치합니다.";
  }
  function variant() {
    const ps = PAT[p].s, diffs = [];
    for (let i = 0; i < HBB.length; i++) if (ps[i] !== HBB[i]) diffs.push(i);
    last = { kind: "variant", ps, diffs, name: PAT[p].name };
    const d = diffs[0], ci = Math.floor(d / 3), ref = HBB.slice(ci * 3, ci * 3 + 3), alt = ps.slice(ci * 3, ci * 3 + 3), ra = tr(ref), aa = tr(alt);
    const same = ra === aa;
    tbl.add({ a: "변이 찾기", t: PAT[p].name, r: `c.${d + 1}${HBB[d]}>${ps[d]}, 코돈 ${ci} ${ref}→${alt}`, i: same ? `${ra} 그대로 (동의 변이)` : `${ra}${ci}${aa} (${KO[ra] || ra} → ${KO[aa] || aa})` });
    $(".bi-msg").textContent = same ? `코돈 ${ci}의 셋째 염기가 바뀌었지만 아미노산은 ${ra} 그대로입니다.` : `코돈 ${ci}에서 ${ra}이(가) ${aa}(으)로 바뀌었습니다.${ra === "Glu" && aa === "Val" ? " 낫 모양 적혈구 빈혈증(HbS)의 변이입니다." : ra === "Glu" && aa === "Lys" ? " 헤모글로빈 C(HbC)의 변이로, 대개 가벼운 빈혈을 일으킵니다." : ""}`;
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = "left";
    if (!last) { ctx.fillStyle = C.ink3; ctx.font = `13px ${F.sans}`; ctx.fillText(mode === "search" ? "서열을 고르고 ‘데이터베이스 검색’을 누르세요." : "환자를 고르고 ‘참조 서열과 정렬’을 누르세요.", 16, h / 2); return; }
    if (last.kind === "search") {
      const top = last.hits[0], cw = Math.min(8.4, (w - 90) / 60), fs = cw * 1.55, x0 = 80;
      ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.fillText(`가장 비슷한 서열: ${top.name}`, 12, 22);
      ctx.font = `${fs}px ${F.mono}`;
      const row = (lab, s, off, y, col) => { ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`; ctx.fillText(lab, 12, y); ctx.font = `${fs}px ${F.mono}`; [...s].forEach((c, i) => { ctx.fillStyle = typeof col === "function" ? col(i) : col; ctx.fillText(c, x0 + (off + i) * cw, y); }); };
      const y1 = h * 0.36;
      row("DB", top.s, 0, y1, (i) => (i >= top.off && i < top.off + last.qs.length ? C.ink : C.ink3));
      let bar = ""; for (let i = 0; i < last.qs.length; i++) bar += last.qs[i] === top.s[top.off + i] ? "|" : " ";
      row("", bar, top.off, y1 + fs * 1.3, C.forest);
      row("질의", last.qs, top.off, y1 + fs * 2.6, (i) => (last.qs[i] === top.s[top.off + i] ? C.ink : C.apple));
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2;
      ctx.fillText(`일치 ${top.id}/${last.qs.length} = ${top.pct}% · 8염기 씨앗 ${top.seeds}개 · 위치 ${top.off + 1}~${top.off + last.qs.length}`, 12, h - 16);
    } else {
      const n = HBB.length, gap = 0.7, cw = Math.min(8.4, (w - 70) / (n + 20 * gap)), fs = cw * 1.55, x0 = 58;
      const X = (i) => x0 + (i + Math.floor(i / 3) * gap) * cw;
      ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.fillText(`HBB 참조 서열과 ${last.name}`, 12, 22);
      const ys = [h * 0.3, h * 0.44, h * 0.58, h * 0.72];
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3;
      ["참조 aa", "참조", last.name.replace("환자 ", "환자"), "환자 aa"].forEach((t, k) => ctx.fillText(t, 8, ys[k]));
      ctx.font = `${fs * 0.8}px ${F.mono}`;
      for (let c = 0; c < 20; c++) if (c % 5 === 0 && c) { ctx.fillStyle = C.ink3; ctx.fillText(String(c), X(c * 3), ys[0] - fs * 1.3); }
      const bad = new Set(last.diffs.map((d) => Math.floor(d / 3)));
      for (let c = 0; c < 20; c++) {
        const ra = tr(HBB.slice(c * 3, c * 3 + 3)), pa = tr(last.ps.slice(c * 3, c * 3 + 3));
        if (bad.has(c)) { ctx.fillStyle = "rgba(212,73,58,.12)"; ctx.fillRect(X(c * 3) - 2, ys[0] - fs * 1.1, cw * 3 + 3, ys[3] - ys[0] + fs * 1.5); }
        ctx.font = `${fs * 0.95}px ${F.mono}`;
        ctx.fillStyle = C.forest; ctx.fillText(ra, X(c * 3), ys[0]);
        ctx.fillStyle = ra !== pa ? C.apple : C.forest; ctx.fillText(pa, X(c * 3), ys[3]);
      }
      ctx.font = `${fs}px ${F.mono}`;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = C.ink; ctx.fillText(HBB[i], X(i), ys[1]);
        const diff = last.ps[i] !== HBB[i];
        ctx.fillStyle = diff ? C.apple : C.ink2; ctx.fillText(last.ps[i], X(i), ys[2]);
        if (diff) { ctx.strokeStyle = C.apple; ctx.lineWidth = 1.2; ctx.strokeRect(X(i) - 1.5, ys[2] - fs, cw + 2, fs * 1.3); }
      }
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2;
      ctx.fillText("코돈 번호는 개시 Met를 빼고 세는 전통적인 번호입니다.", 12, h - 14);
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = lastS;
    const box = { x0: 150, y0: 26, w: w - 250, h: h - 60 };
    NM.axes(ctx, { ...box, X: (v) => box.x0 + v / 100 * box.w, Y: (v) => v, xt: [0, 25, 50, 75, 100].map((v) => [v, String(v)]), yt: [], xlabel: "일치율 (%)" });
    if (!s) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("검색하면 데이터베이스 서열마다의 일치율이 나타납니다.", box.x0, box.y0 + 20); return; }
    const bh = box.h / DB.length;
    DB.forEach((d, i) => {
      const hit = s.hits.find((x) => x.name === d.name), y = box.y0 + i * bh;
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(d.name, box.x0 - 6, y + bh / 2 + 4);
      ctx.fillStyle = hit.seeds ? C.forest : C.rule; ctx.fillRect(box.x0, y + bh * 0.2, hit.pct / 100 * box.w, bh * 0.6);
      ctx.fillStyle = C.ink; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${hit.pct}%${hit.seeds ? " · 씨앗 " + hit.seeds : ""}`, box.x0 + hit.pct / 100 * box.w + 4, y + bh / 2 + 4);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("초록: 8염기 씨앗이 있는 서열 · 회색: 씨앗 없음", box.x0, 14);
  }

  root.querySelector(".mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return;
    mode = b.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $(".qsel").style.display = mode === "search" ? "" : "none"; $(".psel").style.display = mode === "search" ? "none" : "";
    $(".run").textContent = mode === "search" ? "데이터베이스 검색" : "참조 서열과 정렬";
    last = null; $(".bi-msg").textContent = ""; drawApp(); drawPlot();
  });
  const pick = (sel, attr, f) => root.querySelector(sel).addEventListener("click", (e) => { const b = e.target.closest(`[${attr}]`); if (!b) return; root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); f(b); });
  pick(".qsel", "data-q", (b) => { q = +b.dataset.q; });
  pick(".psel", "data-p", (b) => { p = +b.dataset.p; });
  $(".run").addEventListener("click", () => { mode === "search" ? search() : variant(); drawApp(); drawPlot(); });
  $(".clear").addEventListener("click", () => tbl.clear());
  drawApp();

  if (L.demo) {
    [2, 1, 0].forEach((k) => { q = k; search(); });
    [2, 1, 0].forEach((k) => { p = k; variant(); });
    mode = "variant"; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.m === "variant")));
    $(".qsel").style.display = "none"; $(".psel").style.display = ""; $(".run").textContent = "참조 서열과 정렬";
    drawApp(); drawPlot();
  }
})();
