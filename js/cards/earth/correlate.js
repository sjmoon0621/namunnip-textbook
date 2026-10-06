/* 카드: 멀리 떨어진 두 지역의 지층을 어떻게 이어 맞출까? — 주상도 세 개를 선으로 잇는 지층 대비, 응회암 열쇠층, 종합 주상도 */
(() => {
  const root = document.getElementById("card-earth-correlate");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);

  /* 지층 단위 (오래된 것부터). 모식 자료: 두께와 층 구성은 원리를 보이려고 만든 예입니다. */
  const U = {
    a: { n: "셰일", l: "sh", f: "tri", era: 0 },
    b: { n: "석회암", l: "ls", f: "fus", era: 0 },
    c: { n: "사암", l: "ss", f: "amm", era: 1 },
    d: { n: "응회암", l: "tf", f: null, era: 1 },
    e: { n: "셰일", l: "sh", f: "amm", era: 1 },
    f: { n: "석회암", l: "ls", f: "num", era: 2 },
    g: { n: "역암", l: "cg", f: null, era: 2 },
  };
  const ORDER = ["a", "b", "c", "d", "e", "f", "g"];
  const ERA = ["고생대", "중생대", "신생대"];
  const FOS = { tri: "삼엽충", fus: "방추충", amm: "암모나이트", num: "화폐석" };
  const LITH = { cg: "역암", ss: "사암", sh: "셰일", ls: "석회암", tf: "응회암" };
  /* 각 지역: 아래에서 위로 [단위, 두께 m], gap = 이 층 위가 부정합면 */
  const COLS = [
    { name: "지역 A", L: [["a", 30], ["b", 40], ["c", 25], ["d", 2], ["e", 35]], gap: [] },
    { name: "지역 B", L: [["b", 45], ["c", 35], ["d", 3], ["f", 30], ["g", 25]], gap: [2] },
    { name: "지역 C", L: [["a", 40], ["d", 2], ["e", 20], ["f", 45]], gap: [0] },
  ];
  const ANSWER = 5;
  let mode = "lith", ties = [], sel = null, drag = null, checked = false, comp = false;
  const cv = $("canvas");
  const { ctx, size } = fit(cv, () => draw());
  let geo = null;

  const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  function pattern(l, x, y, w, h, seed) {
    const base = { cg: "#e4d0a6", ss: "#eedfae", sh: "#b9b6ab", ls: "#d3dde4", tf: "#ecccc8" }[l];
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(60,55,45,.45)"; ctx.fillStyle = "rgba(60,55,45,.45)"; ctx.lineWidth = 1;
    if (l === "ss") { for (let i = 0; i < w * h / 30; i++) { ctx.fillRect(x + rnd(seed + i) * w, y + rnd(seed + i + 500) * h, 1.3, 1.3); } }
    if (l === "sh") { for (let yy = y + 4; yy < y + h; yy += 5) { for (let xx = x + ((yy / 5) % 2) * 6; xx < x + w; xx += 14) { ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 8, yy); ctx.stroke(); } } }
    if (l === "ls") { let r = 0; for (let yy = y; yy < y + h; yy += 8, r++) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); for (let xx = x + (r % 2) * 9; xx < x + w; xx += 18) { ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + 8); ctx.stroke(); } } }
    if (l === "cg") { for (let i = 0; i < w * h / 70; i++) { const r = 2 + rnd(seed + i) * 3; ctx.beginPath(); ctx.ellipse(x + rnd(seed + i + 90) * w, y + rnd(seed + i + 900) * h, r * 1.3, r, 0, 0, 7); ctx.stroke(); } }
    if (l === "tf") { for (let yy = y + 5; yy < y + h; yy += 7) { for (let xx = x + 4 + ((yy / 7) % 2) * 5; xx < x + w; xx += 11) { ctx.beginPath(); ctx.moveTo(xx - 2.5, yy - 2.5); ctx.lineTo(xx, yy + 1.5); ctx.lineTo(xx + 2.5, yy - 2.5); ctx.stroke(); } } }
    ctx.restore();
  }
  function fossil(f, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = "#3a2f22"; ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, 0, s + 3, 0, 7); ctx.fill();
    if (f === "tri") { ctx.beginPath(); ctx.ellipse(0, 1, s * 0.6, s * 0.9, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -s * 0.45, s * 0.65, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.3); ctx.lineTo(-s * 0.2, s * 0.9); ctx.moveTo(s * 0.2, -s * 0.3); ctx.lineTo(s * 0.2, s * 0.9); ctx.stroke(); }
    if (f === "amm") { ctx.beginPath(); for (let t = 0; t < 14; t += 0.2) { const r = s * 0.95 * Math.exp(-t * 0.16); ctx.lineTo(Math.cos(t) * r, Math.sin(t) * r); } ctx.stroke(); }
    if (f === "fus") { ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.42, 0, 0, 7); ctx.stroke(); for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * s * 0.3, -s * 0.38 * Math.cos(k * 0.45)); ctx.lineTo(k * s * 0.3, s * 0.38 * Math.cos(k * 0.45)); ctx.stroke(); } }
    if (f === "num") { [1, 0.65, 0.3].forEach((k) => { ctx.beginPath(); ctx.arc(0, 0, s * 0.85 * k, 0, 7); ctx.stroke(); }); }
    ctx.restore();
  }
  function wavy(x, y, w) {
    ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
    for (let xx = 0; xx <= w + 10; xx += 2) ctx.lineTo(x - 5 + xx, y + Math.sin(xx / 4) * 2.2);
    ctx.stroke(); ctx.restore();
  }

  function layout() {
    const { w, h } = size;
    const top = 50, bot = h - 62, H = bot - top;
    const cw = w * 0.12, gap = w * 0.115;
    const xs = [w * 0.03, w * 0.03 + cw + gap, w * 0.03 + 2 * (cw + gap)];
    const tot = Math.max(...COLS.map((c) => c.L.reduce((s, l) => s + l[1], 0)));
    const k = (H - 40) / tot;
    const cols = COLS.map((c, ci) => {
      let y = bot;
      const L = c.L.map(([u, t], i) => { const hh = Math.max(13, t * k); y -= hh; return { u, i, x: xs[ci], y, w: cw, h: hh }; });
      return { ...c, L, x: xs[ci] };
    });
    const cx = xs[2] + cw + w * 0.11;
    return { top, bot, H, cw, cols, cx };
  }
  const mid = (r) => r.y + r.h / 2;
  const tieOk = (t) => COLS[t[0]].L[t[1]][0] === COLS[t[0] + 1].L[t[2]][0];
  const crosses = (t) => ties.some((s) => s !== t && s[0] === t[0] && (s[1] - t[1]) * (s[2] - t[2]) < 0);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    geo = layout();
    const { cols, cw, top, bot, cx } = geo;
    ctx.textAlign = "center"; ctx.fillStyle = C.ink; ctx.font = `600 12.5px ${F.sans}`;
    cols.forEach((c) => ctx.fillText(c.name, c.x + cw / 2, 20));
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("↔ 2 km", (cols[0].x + cw + cols[1].x) / 2, 38);
    ctx.fillText("↔ 150 km", (cols[1].x + cw + cols[2].x) / 2, 38);
    /* 지층 */
    cols.forEach((c, ci) => {
      c.L.forEach((r) => {
        pattern(U[r.u].l, r.x, r.y, r.w, r.h, ci * 1000 + r.i * 97);
        ctx.strokeStyle = "rgba(40,40,40,.55)"; ctx.lineWidth = 1; ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
        if (mode === "fos" && U[r.u].f) fossil(U[r.u].f, r.x + r.w - 13, mid(r), Math.min(8, r.h / 2 - 3));
        if (U[r.u].l === "tf") { ctx.fillStyle = "#8e2f3c"; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("열쇠층", r.x + 3, mid(r) + 3.5); }
      });
      c.gap.forEach((i) => wavy(c.x, c.L[i].y, cw));
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("지표", c.x + cw / 2, c.L[c.L.length - 1].y - 5);
    });
    /* 선택 표시 */
    const hl = (p, col) => { const r = cols[p.col].L[p.i]; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.strokeRect(r.x - 1, r.y - 1, r.w + 2, r.h + 2); };
    if (sel) hl(sel, C.forest);
    if (drag && drag.start) hl(drag.start, C.forest);
    /* 대비선 */
    ties.forEach((t) => {
      const A = cols[t[0]].L[t[1]], B = cols[t[0] + 1].L[t[2]];
      const ok = tieOk(t) && !crosses(t);
      ctx.strokeStyle = checked ? (ok ? C.forest : C.warn) : C.ink; ctx.lineWidth = 2; ctx.setLineDash(checked && !ok ? [5, 3] : []);
      ctx.beginPath(); ctx.moveTo(A.x + A.w, mid(A)); ctx.lineTo(B.x, mid(B)); ctx.stroke(); ctx.setLineDash([]);
      [[A.x + A.w, mid(A)], [B.x, mid(B)]].forEach(([x, y]) => { ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); });
    });
    if (drag && drag.start && drag.p) { const r = cols[drag.start.col].L[drag.start.i]; ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(r.x + r.w / 2, mid(r)); ctx.lineTo(drag.p[0], drag.p[1]); ctx.stroke(); ctx.setLineDash([]); }
    /* 종합 주상도 */
    ctx.textAlign = "center"; ctx.fillStyle = C.ink; ctx.font = `600 12.5px ${F.sans}`; ctx.fillText("종합 주상도", cx + cw / 2, 20);
    const uh = (bot - top - 10) / 7;
    if (!comp) {
      ctx.strokeStyle = C.rule; ctx.setLineDash([4, 4]); ctx.strokeRect(cx, top + 10, cw, bot - top - 10); ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`;
      ["대비를", "마치고", "버튼을", "누르세요"].forEach((s, i) => ctx.fillText(s, cx + cw / 2, (top + bot) / 2 - 24 + i * 16));
    } else {
      ORDER.forEach((u, i) => {
        const y = bot - (i + 1) * uh;
        pattern(U[u].l, cx, y, cw, uh, 7000 + i * 31);
        ctx.strokeStyle = "rgba(40,40,40,.6)"; ctx.lineWidth = 1; ctx.strokeRect(cx + 0.5, y + 0.5, cw - 1, uh - 1);
        ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(cx + 4, y + uh / 2 - 9, cw - 8, 17);
        ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(U[u].n, cx + cw / 2, y + uh / 2 + 4);
        const rank = (x) => ORDER.indexOf(x), gapIn = [], outside = [];
        COLS.forEach((c) => { if (c.L.some((l) => l[0] === u)) return; const lo = rank(c.L[0][0]), hi = rank(c.L[c.L.length - 1][0]); (i > lo && i < hi ? gapIn : outside).push(c.name.slice(-1)); });
        ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`;
        ctx.fillStyle = C.ink2; ctx.fillText(U[u].f ? FOS[U[u].f] : (u === "d" ? "화산재 (동시면)" : "화석 없음"), cx + cw + 8, y + uh / 2 - 3);
        if (gapIn.length) { ctx.fillStyle = C.warn; ctx.fillText(`${gapIn.join("·")} 결층`, cx + cw + 8, y + uh / 2 + 11); }
        else { ctx.fillStyle = C.ink3; ctx.fillText(outside.length ? `${outside.join("·")} 노출 없음` : "세 곳 모두", cx + cw + 8, y + uh / 2 + 11); }
      });
      /* 대 구분 */
      [[0, 2], [2, 5], [5, 7]].forEach(([a, b], e) => {
        const y0 = bot - b * uh, y1 = bot - a * uh, x = cx - 8;
        ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 4, y0 + 2); ctx.lineTo(x, y0 + 2); ctx.lineTo(x, y1 - 2); ctx.lineTo(x + 4, y1 - 2); ctx.stroke();
        ctx.save(); ctx.translate(x - 7, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); ctx.fillStyle = C.ink2; ctx.font = `600 10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(ERA[e], 0, 0); ctx.restore();
      });
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("↑ 젊음", cx + cw / 2, top + 4);
    }
    /* 범례 */
    let lx = 6; const ly = h - 40;
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    Object.entries(LITH).forEach(([l, n], i) => { pattern(l, lx, ly - 9, 18, 12, 50 + i); ctx.strokeStyle = C.ink3; ctx.strokeRect(lx + 0.5, ly - 8.5, 17, 11); ctx.fillStyle = C.ink2; ctx.fillText(n, lx + 22, ly + 1); lx += 30 + ctx.measureText(n).width; });
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); for (let xx = 0; xx <= 18; xx += 2) ctx.lineTo(lx + xx, ly - 3 + Math.sin(xx / 4) * 2); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillText("부정합", lx + 22, ly + 1);
    if (mode === "fos") {
      lx = 6;
      Object.entries(FOS).forEach(([f, n]) => { fossil(f, lx + 8, h - 15, 6); ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(n, lx + 22, h - 11); lx += 34 + ctx.measureText(n).width; });
    } else { ctx.fillStyle = C.ink3; ctx.fillText("암상 대비: 화석은 보이지 않습니다. ‘화석 대비’로 바꿔 보세요.", 6, h - 11); }
    nums();
  }

  function nums() {
    const good = ties.filter((t) => tieOk(t) && !crosses(t)).length;
    $(".n-t").textContent = `${ties.length}개`;
    $(".n-g").textContent = checked ? `${good} / ${ANSWER}` : "—";
    $(".n-b").textContent = checked ? `${ties.length - good}개` : "—";
    $(".n-b").className = "n-b" + (checked && ties.length - good ? " bad" : "");
    $(".n-g").className = "n-g" + (checked && good === ANSWER && ties.length === ANSWER ? " good" : "");
  }
  const say = (t, cls) => { const v = $(".verdict"); v.textContent = t; v.className = "verdict small " + (cls || ""); };
  const allRight = () => ties.length === ANSWER && ties.every((t) => tieOk(t) && !crosses(t));

  function check() {
    checked = true;
    const bad = ties.filter((t) => !tieOk(t) || crosses(t));
    if (!ties.length) say("먼저 이웃한 두 지역의 층을 선으로 이어 보세요.");
    else if (allRight()) say("대비 완성. 세 지역을 모두 잇는 선은 응회암 열쇠층 하나뿐입니다. ‘종합 주상도’를 눌러 시대 순서를 세워 보세요.", "good");
    else if (bad.length) {
      const t = bad[0], ua = U[COLS[t[0]].L[t[1]][0]], ub = U[COLS[t[0] + 1].L[t[2]][0]];
      if (crosses(t) && tieOk(t)) say("대비선이 서로 엇갈립니다. 한 지역에서 위에 있는 층이 다른 지역에서 아래에 올 수는 없습니다(지층 누중의 법칙).", "bad");
      else if (ua.l === ub.l) say(`같은 ${ua.n}이지만 같은 때 쌓인 층이 아닙니다. 같은 암석은 여러 시대에 되풀이해 쌓일 수 있습니다. ${mode === "lith" ? "‘화석 대비’로 바꿔 화석을 비교해 보세요." : "들어 있는 화석이 다릅니다."}`, "bad");
      else if (ua.f && ua.f === ub.f) say(`둘 다 ${FOS[ua.f]} 화석이 나오지만, 응회암 열쇠층을 기준으로 한쪽은 아래, 한쪽은 위에 있습니다. 열쇠층을 가로질러 이을 수는 없습니다.`, "bad");
      else say("암상도 화석도 다른 층을 이었습니다. 빨간 점선을 지우고 다시 이어 보세요.", "bad");
    } else say(`틀린 선은 없습니다. 아직 이을 수 있는 층이 ${ANSWER - ties.length}쌍 남았습니다. ${mode === "lith" ? "암상만으로 정하기 어려우면 화석을 보세요." : ""}`);
    draw();
  }

  function hit(px, py) {
    if (!geo) return null;
    for (let ci = 0; ci < geo.cols.length; ci++) for (const r of geo.cols[ci].L) if (px >= r.x - 4 && px <= r.x + r.w + 4 && py >= r.y && py <= r.y + r.h) return { col: ci, i: r.i };
    return null;
  }
  function addTie(p, q) {
    if (Math.abs(p.col - q.col) !== 1) { say("이웃한 두 지역(A와 B, B와 C)끼리 이으세요. 가운데 지역을 거쳐 이어집니다."); return; }
    const [L, R] = p.col < q.col ? [p, q] : [q, p];
    ties = ties.filter((t) => !(t[0] === L.col && (t[1] === L.i || t[2] === R.i)));
    ties.push([L.col, L.i, R.i]);
    checked = false; comp = false; say("");
  }
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener("pointerdown", (e) => { const p = pos(e), s = hit(...p); drag = { start: s, p: null }; if (s) cv.setPointerCapture(e.pointerId); draw(); });
  cv.addEventListener("pointermove", (e) => { if (drag && drag.start) { drag.p = pos(e); draw(); } });
  cv.addEventListener("pointerup", (e) => {
    if (!drag) return;
    const s = drag.start, t = hit(...pos(e)); drag = null;
    if (s && t && t.col !== s.col) { addTie(s, t); sel = null; }
    else if (s && t && t.col === s.col && t.i === s.i) {
      if (sel && sel.col !== t.col) { addTie(sel, t); sel = null; }
      else sel = sel && sel.col === t.col && sel.i === t.i ? null : t;
    }
    draw();
  });
  cv.addEventListener("pointercancel", () => { drag = null; draw(); });

  $(".mode").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (!b) return; mode = b.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); });
  $(".chk").addEventListener("click", check);
  $(".clr").addEventListener("click", () => { ties = []; sel = null; checked = false; comp = false; say(""); draw(); });
  const solve = () => {
    ties = [];
    COLS.slice(0, 2).forEach((c, ci) => c.L.forEach((l, i) => { const j = COLS[ci + 1].L.findIndex((m) => m[0] === l[0]); if (j >= 0) ties.push([ci, i, j]); }));
  };
  $(".ans").addEventListener("click", () => { solve(); check(); });
  $(".cmp").addEventListener("click", () => {
    if (!allRight()) { say(`종합 주상도는 대비가 끝나야 세울 수 있습니다. 맞는 선 ${ANSWER}개를 모두 이은 뒤 다시 누르세요.`, "bad"); return; }
    comp = true; checked = true;
    say("종합 주상도: 셰일(삼엽충) → 석회암(방추충) → 사암(암모나이트) → 응회암 → 셰일(암모나이트) → 석회암(화폐석) → 역암. 지역 B는 응회암 위가, 지역 C는 셰일 위가 부정합이라 그 사이 층이 빠져 있습니다(결층).", "good");
    draw();
  });
  draw();
  if (/[?&]demo\b/.test(location.search)) { root.querySelector('[data-m="fos"]').click(); solve(); check(); $(".cmp").click(); }
})();
