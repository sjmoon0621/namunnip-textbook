/* 카드: 생김새가 비슷한 광물을 어떻게 가려낼까? — 색·조흔색·광택·굳기·쪼개짐·비중·염산·자성 시험과 화학적 분류 */
(() => {
  const root = document.getElementById("card-labearth-mineral-id");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 광물 성질 (일반적인 광물학 교재 값). H: 대표 굳기, sg: 비중, rgb: 그림 색 */
  const M = [
    { k: "석영", color: "무색~흰색", streak: "흰색", luster: "유리", H: 7, cl: "깨짐 (조개껍데기 모양)", sg: 2.65, acid: 0, mag: 0, cls: "규산염", sub: "망상", rgb: [228, 230, 232], form: "conch" },
    { k: "정장석", color: "분홍빛 흰색", streak: "흰색", luster: "유리", H: 6, cl: "2방향 쪼개짐 (약 90°)", sg: 2.56, acid: 0, mag: 0, cls: "규산염", sub: "망상", rgb: [226, 185, 168], form: "block" },
    { k: "흑운모", color: "검은색~짙은 갈색", streak: "흰색~회색", luster: "유리~진주", H: 2.75, cl: "1방향 (얇은 판으로 벗겨짐)", sg: 3.0, acid: 0, mag: 0, cls: "규산염", sub: "판상", rgb: [52, 40, 32], form: "sheet" },
    { k: "백운모", color: "은백색 (얇으면 투명)", streak: "흰색", luster: "진주", H: 2.25, cl: "1방향 (얇은 판으로 벗겨짐)", sg: 2.83, acid: 0, mag: 0, cls: "규산염", sub: "판상", rgb: [205, 200, 185], form: "sheet" },
    { k: "각섬석", color: "검은 녹색", streak: "흰색~회녹색", luster: "유리", H: 5.5, cl: "2방향 쪼개짐 (약 56°·124°)", sg: 3.2, acid: 0, mag: 0, cls: "규산염", sub: "복사슬", rgb: [38, 52, 40], form: "prism56" },
    { k: "휘석", color: "검은 녹색", streak: "회녹색", luster: "유리", H: 5.75, cl: "2방향 쪼개짐 (약 87°·93°)", sg: 3.35, acid: 0, mag: 0, cls: "규산염", sub: "단사슬", rgb: [44, 50, 38], form: "block" },
    { k: "감람석", color: "올리브 녹색", streak: "흰색", luster: "유리", H: 6.75, cl: "깨짐 (조개껍데기 모양)", sg: 3.3, acid: 0, mag: 0, cls: "규산염", sub: "독립", rgb: [128, 150, 58], form: "conch" },
    { k: "방해석", color: "무색~흰색", streak: "흰색", luster: "유리", H: 3, cl: "3방향 쪼개짐 (마름모꼴 육면체)", sg: 2.71, acid: 1, mag: 0, cls: "탄산염", sub: "", rgb: [236, 232, 220], form: "rhomb" },
    { k: "자철석", color: "검은색", streak: "검은색", luster: "금속", H: 6, cl: "깨짐 (고르지 않음)", sg: 5.18, acid: 0, mag: 1, cls: "산화 광물", sub: "", rgb: [40, 40, 44], form: "octa" },
    { k: "황철석", color: "놋쇠 같은 노란색", streak: "녹색 띤 검은색", luster: "금속", H: 6.25, cl: "깨짐 (고르지 않음)", sg: 5.01, acid: 0, mag: 0, cls: "황화 광물", sub: "", rgb: [196, 170, 84], form: "cube" },
    { k: "적철석", color: "적갈색~검은 회색", streak: "적갈색", luster: "금속~흙", H: 5.75, cl: "깨짐 (고르지 않음)", sg: 5.26, acid: 0, mag: 0, cls: "산화 광물", sub: "", rgb: [108, 52, 44], form: "lump" },
    { k: "석류석", color: "적갈색", streak: "흰색", luster: "유리", H: 7.25, cl: "깨짐 (조개껍데기 모양)", sg: 4.0, acid: 0, mag: 0, cls: "규산염", sub: "독립", rgb: [128, 36, 40], form: "dodeca" },
  ];
  const STREAK_RGB = { "흰색": "#f4f4f2", "흰색~회색": "#dcdcd8", "흰색~회녹색": "#d6dcd2", "회녹색": "#a9b3a3", "검은색": "#2a2a2c", "녹색 띤 검은색": "#2f3a30", "적갈색": "#8a3a2c" };
  const TOOLS = [{ n: "손톱", h: 2.5 }, { n: "구리 동전", h: 3.5 }, { n: "유리판", h: 5.5 }, { n: "강철 줄", h: 6.5 }];
  const ORDER = [7, 2, 10, 0, 5, 8, 3, 11, 1, 9, 6, 4];   // 시료 A~L에 광물을 섞어 배정
  const LET = "ABCDEFGHIJKL";
  const S = ORDER.map((mi, i) => ({ id: LET[i], m: M[mi], mass: 18 + ((i * 37) % 41), obs: {} }));

  let cur = 0, last = "시험을 골라 보세요.";
  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "id", label: "시료" }, { key: "streak", label: "조흔색" }, { key: "hard", label: "굳기" },
    { key: "cl", label: "쪼개짐" }, { key: "sg", label: "비중", res: 0.01 }, { key: "etc", label: "염산·자석" }, { key: "guess", label: "판정" }, { key: "ok", label: "확인" },
  ], () => drawPlot());

  /* 굳기 시험 결과로 범위 정하기 */
  function hardRange(o) {
    let lo = 1, hi = 10;
    TOOLS.forEach((t) => { const r = o["h" + t.h]; if (r === "scratched") hi = Math.min(hi, t.h); if (r === "not") lo = Math.max(lo, t.h); });
    if (lo === 1 && hi === 10) return null;
    return { lo, hi, txt: hi === 10 ? `${lo} 초과` : lo === 1 ? `${hi} 미만` : `${lo}~${hi}`, mid: hi === 10 ? lo + 0.75 : lo === 1 ? hi - 0.75 : (lo + hi) / 2 };
  }

  function seeded(i) { let s = 1234 + i * 97; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function shape(ctx, cx, cy, r, form, rnd) {
    ctx.beginPath();
    if (form === "rhomb") { ctx.moveTo(cx - r, cy + r * 0.5); ctx.lineTo(cx - r * 0.35, cy - r * 0.7); ctx.lineTo(cx + r, cy - r * 0.5); ctx.lineTo(cx + r * 0.35, cy + r * 0.7); }
    else if (form === "cube") { ctx.rect(cx - r * 0.75, cy - r * 0.75, r * 1.5, r * 1.5); }
    else if (form === "octa") { ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r * 0.85, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r * 0.85, cy); }
    else if (form === "sheet") { ctx.moveTo(cx - r, cy - r * 0.25); ctx.lineTo(cx + r * 0.9, cy - r * 0.45); ctx.lineTo(cx + r, cy + r * 0.25); ctx.lineTo(cx - r * 0.9, cy + r * 0.45); }
    else if (form === "prism56") { ctx.moveTo(cx - r * 0.9, cy - r * 0.3); ctx.lineTo(cx - r * 0.4, cy - r * 0.75); ctx.lineTo(cx + r * 0.9, cy - r * 0.3); ctx.lineTo(cx + r * 0.4, cy + r * 0.75); }
    else if (form === "dodeca") { for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + 0.3; ctx.lineTo(cx + r * 0.85 * Math.cos(a), cy + r * 0.85 * Math.sin(a)); } }
    else { for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; const rr = r * (0.72 + 0.28 * rnd()); ctx.lineTo(cx + rr * Math.cos(a), cy + rr * 0.8 * Math.sin(a)); } }
    ctx.closePath();
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = S[cur], m = s.m, o = s.obs, rnd = seeded(cur);
    const cx = w * 0.27, cy = h * 0.48, r = Math.min(w * 0.2, h * 0.36);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, w, h);
    shape(ctx, cx, cy, r, m.form, rnd);
    const [R, G, B] = m.rgb;
    const gr = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    if (m.luster.startsWith("금속")) { gr.addColorStop(0, `rgb(${Math.min(255, R + 90)},${Math.min(255, G + 90)},${Math.min(255, B + 90)})`); gr.addColorStop(0.45, `rgb(${R},${G},${B})`); gr.addColorStop(1, `rgb(${R * 0.6 | 0},${G * 0.6 | 0},${B * 0.6 | 0})`); }
    else { gr.addColorStop(0, `rgb(${Math.min(255, R + 25)},${Math.min(255, G + 25)},${Math.min(255, B + 25)})`); gr.addColorStop(1, `rgb(${R * 0.85 | 0},${G * 0.85 | 0},${B * 0.85 | 0})`); }
    ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = "rgba(35,35,38,.5)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.save(); shape(ctx, cx, cy, r, m.form, seeded(cur)); ctx.clip();
    if (m.form === "sheet") { ctx.strokeStyle = "rgba(255,255,255,.35)"; for (let k = -5; k <= 5; k++) { ctx.beginPath(); ctx.moveTo(cx - r, cy + k * 5 - 4); ctx.lineTo(cx + r, cy + k * 5 - 12); ctx.stroke(); } }
    if (!m.luster.startsWith("금속")) { ctx.fillStyle = m.luster.includes("진주") ? "rgba(255,255,255,.28)" : "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.ellipse(cx - r * 0.3, cy - r * 0.3, r * 0.22, r * 0.08, -0.5, 0, Math.PI * 2); ctx.fill(); }
    if (o.acid && m.acid) { ctx.fillStyle = "rgba(255,255,255,.9)"; for (let k = 0; k < 18; k++) { ctx.beginPath(); ctx.arc(cx + (rnd() - 0.5) * r * 0.6, cy + (rnd() - 0.5) * r * 0.5, 1.5 + rnd() * 2.5, 0, Math.PI * 2); ctx.fill(); } }
    ctx.restore();
    ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    ctx.fillText(`시료 ${s.id}`, cx, Math.min(h - 8, cy + r + 22));
    /* 조흔판 */
    const px = w * 0.56, py = h * 0.22, pw = w * 0.38, ph = h * 0.32;
    ctx.fillStyle = "#f7f5ef"; ctx.fillRect(px, py, pw, ph); ctx.strokeStyle = C.ink3; ctx.strokeRect(px + .5, py + .5, pw, ph);
    if (o.streak) {
      ctx.strokeStyle = STREAK_RGB[m.streak] || "#ddd"; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(px + pw * 0.15, py + ph * 0.6); ctx.quadraticCurveTo(px + pw * 0.5, py + ph * 0.35, px + pw * 0.85, py + ph * 0.55); ctx.stroke(); ctx.lineCap = "butt";
      if (m.H > 6.5) { ctx.strokeStyle = "rgba(35,35,38,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px + pw * 0.15, py + ph * 0.62); ctx.lineTo(px + pw * 0.85, py + ph * 0.57); ctx.stroke(); }
    }
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("조흔판 (유약 안 바른 자기판, 굳기 약 6.5~7)", px, py - 7);
    ctx.fillStyle = C.ink; ctx.font = `12px ${F.sans}`;
    const lines = []; let line = "";
    for (const ch of last) { if (ctx.measureText(line + ch).width > pw) { lines.push(line); line = ch; } else line += ch; }
    lines.push(line);
    lines.slice(0, 4).forEach((t, i) => ctx.fillText(t, px, py + ph + 24 + i * 17));
  }

  const REF_OFF = { "석영": [6, -4], "정장석": [6, 12], "흑운모": [8, -7], "백운모": [-6, 14, "right"], "각섬석": [-6, 4, "right"], "휘석": [-4, -8, "right"], "감람석": [6, 4], "방해석": [6, 4], "자철석": [-6, 14, "right"], "황철석": [6, 10], "적철석": [-8, -6, "right"], "석류석": [6, 4] };
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bx = { x0: 44, y0: 22, w: w - 60, h: h - 56 };
    const pts = S.filter((s) => s.obs.sg && hardRange(s.obs)).map((s) => ({ x: hardRange(s.obs).mid, y: s.obs.sg, id: s.id }));
    const res = L.plot(ctx, bx, { pts: [], xr: [1, 8], yr: [2.3, 5.6], xlabel: "모스 굳기", ylabel: "비중" });
    ctx.font = `600 11px ${F.mono}`;
    pts.forEach((p) => {
      ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(res.X(p.x), res.Y(p.y), 4, 0, Math.PI * 2); ctx.fill();
      if (p.id === S[cur].id) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(res.X(p.x), res.Y(p.y), 8, 0, Math.PI * 2); ctx.stroke(); }
    });
    ctx.font = `10.5px ${F.sans}`;
    M.forEach((m) => {
      const x = res.X(m.H), y = res.Y(m.sg), off = REF_OFF[m.k];
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.textAlign = off[2] || "left"; ctx.fillText(m.k, x + off[0], y + off[1]);
    });
  }

  function renderObs() {
    const o = S[cur].obs, m = S[cur].m, hr = hardRange(o);
    const v = { col: o.color ? m.color : "—", str: o.streak ? m.streak + (m.H > 6.5 ? " (판이 긁힘)" : "") : "—", lus: o.luster ? m.luster + " 광택" : "—", hard: hr ? hr.txt : "—", cl: o.cl ? m.cl : "—", sg: o.sg ? o.sg.toFixed(2) : "—", acid: o.acid ? (m.acid ? "거품 발생" : "반응 없음") : "—", mag: o.mag ? (m.mag ? "강하게 붙음" : "반응 없음") : "—" };
    Object.keys(v).forEach((k) => { $(".o-" + k).textContent = v[k]; });
  }
  function test(kind, arg) {
    const s = S[cur], m = s.m, o = s.obs;
    if (kind === "color") { o.color = 1; last = `색: ${m.color}. 같은 광물도 불순물에 따라 색이 달라질 수 있습니다.`; }
    if (kind === "streak") { o.streak = 1; last = m.H > 6.5 ? "조흔판에 긁었더니 시료 대신 판이 긁혔습니다. 가루는 흰색입니다." : `조흔판에 남은 가루의 색: ${m.streak}.`; }
    if (kind === "luster") { o.luster = 1; last = `빛을 비추어 보니 ${m.luster} 광택이 납니다.`; }
    if (kind === "hard") {
      const t = TOOLS[arg], d = m.H - t.h;
      o["h" + t.h] = d < 0 ? "scratched" : "not";
      last = Math.abs(d) < 0.3 ? `${t.n}(${t.h})으로 긁으니 자국이 희미합니다. 굳기가 비슷합니다. 다시 확인하세요.` : d < 0 ? `${t.n}(${t.h})으로 긁으니 시료에 홈이 생겼습니다. 굳기 < ${t.h}.` : `${t.n}(${t.h})으로 긁어도 시료에 홈이 생기지 않습니다. 굳기 > ${t.h}.`;
    }
    if (kind === "cl") { o.cl = 1; last = `망치로 살짝 깨뜨린 조각: ${m.cl}.`; }
    if (kind === "sg") {
      const ma = L.measure(s.mass, { sd: 0.01, res: 0.01 }), mw = L.measure(s.mass * (1 - 1 / m.sg), { sd: 0.02, res: 0.01 });
      o.sg = ma / (ma - mw); last = `전자저울: 공기 중 ${ma.toFixed(2)} g, 물속에 매단 채 ${mw.toFixed(2)} g → 비중 = ${ma.toFixed(2)} ÷ (${ma.toFixed(2)} − ${mw.toFixed(2)}) = ${o.sg.toFixed(2)}.`;
    }
    if (kind === "acid") { o.acid = 1; last = m.acid ? "묽은 염산을 한 방울 떨어뜨리니 거품(CO₂)이 활발하게 생깁니다." : "묽은 염산을 떨어뜨려도 아무 반응이 없습니다."; }
    if (kind === "mag") { o.mag = 1; last = m.mag ? "자석을 대니 강하게 달라붙습니다." : "자석을 대도 끌리지 않습니다."; }
    renderObs(); draw(); drawPlot();
  }
  function record() {
    const s = S[cur], m = s.m, o = s.obs, hr = hardRange(o), g = $(".guess").value, c = $(".gcls").value;
    const old = tbl.rows.findIndex((r) => r.id === s.id); if (old >= 0) tbl.rows.splice(old, 1);
    tbl.add({
      id: s.id, streak: o.streak ? m.streak : "—", luster: o.luster ? m.luster : "—", hard: hr ? hr.txt : "—", cl: o.cl ? m.cl.split(" (")[0] : "—", sg: o.sg ?? NaN,
      etc: [o.acid ? (m.acid ? "거품" : "—") : "?", o.mag ? (m.mag ? "자성" : "—") : "?"].join("/"), guess: g ? `${g} · ${c || "?"}` : "—",
      ok: !g ? "—" : g === m.k ? (c === m.cls ? "맞음" : "광물 맞음, 분류 다시") : "다시",
    });
  }
  const sb = $(".samples");
  sb.innerHTML = S.map((s, i) => `<button class="chip" type="button" data-s="${i}" aria-pressed="${i === cur}">${s.id}</button>`).join("");
  sb.addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; cur = +b.dataset.s; sb.querySelectorAll("[data-s]").forEach((q) => q.setAttribute("aria-pressed", String(q === b))); last = "시험을 골라 보세요."; renderObs(); draw(); drawPlot(); });
  $(".tests").addEventListener("click", (e) => { const b = e.target.closest("[data-t]"); if (b) test(b.dataset.t, b.dataset.a == null ? null : +b.dataset.a); });
  $(".guess").innerHTML = '<option value="">광물 이름 고르기</option>' + M.map((m) => m.k).sort().map((k) => `<option>${k}</option>`).join("");
  $(".gcls").innerHTML = '<option value="">화학적 분류 고르기</option>' + ["규산염", "탄산염", "산화 광물", "황화 광물"].map((k) => `<option>${k}</option>`).join("");
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  renderObs();
  if (L.demo) {
    [0, 1, 2, 3, 5, 7].forEach((i) => {
      cur = i; ["color", "streak", "luster", "cl", "sg", "acid", "mag"].forEach((t) => test(t)); [0, 1, 2, 3].forEach((a) => test("hard", a));
      $(".guess").value = S[i].m.k; $(".gcls").value = S[i].m.cls; record();
    });
    cur = 5; sb.querySelectorAll("[data-s]").forEach((q) => q.setAttribute("aria-pressed", String(+q.dataset.s === cur))); $(".guess").value = ""; $(".gcls").value = ""; last = "시료 F의 시험 결과가 위에 정리되어 있습니다."; renderObs(); draw(); drawPlot();
  }
})();
