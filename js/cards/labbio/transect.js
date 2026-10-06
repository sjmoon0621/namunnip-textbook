/* 카드: 연못가 비탈의 선 따라 놓은 방형구 — 거리별 피도, 흙 수분 기울기, 띠 분포, 무작위 방형구와 비교 (가상 자료) */
(() => {
  const root = document.getElementById("card-labbio-transect");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const [cvT, cvP] = root.querySelectorAll("canvas");
  const LEN = 20;
  /* 종: 이름, 색, 가장 많이 나는 거리(m), 퍼짐(m), 최대 피도(%) */
  const SP = [
    { n: "부들", c: "#3d6fb0", o: 0.5, s: 2.0, a: 80 },
    { n: "고마리", c: "#c0587e", o: 3.5, s: 1.3, a: 55 },
    { n: "토끼풀", c: "#6fa86a", o: 8, s: 2.6, a: 50 },
    { n: "바랭이", c: "#a7a33a", o: 12, s: 3.0, a: 55 },
    { n: "쑥", c: "#5f8f8c", o: 16, s: 2.4, a: 45 },
    { n: "억새", c: "#b5532f", o: 19.5, s: 2.2, a: 70 },
  ];
  const moist = (x) => 55 - 2.2 * x;
  const cover = (k, x) => SP[k].a * Math.exp(-(((x - SP[k].o) / SP[k].s) ** 2) / 2);
  let gap = 2, quads = [];
  /* 같은 화면에서는 같은 풀밭: 풀 위치는 한 번만 만든다 */
  let sd = 21; const R = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const plants = [];
  SP.forEach((sp, k) => {
    for (let i = 0; i < 260; i++) {
      const x = R() * LEN, y = R();
      if (R() < cover(k, x) / 80) plants.push({ x, y, k, a: R() * 6.28 });
    }
  });

  const tv = fit(cvT, () => drawField());
  const pl = fit(cvP, () => drawPlot());
  const cols = [{ key: "pos", label: "위치" }, { key: "w", label: "수분 %", res: 1 }].concat(SP.map((s, k) => ({ key: "s" + k, label: s.n, res: 1 })));
  const tbl = L.table($(".tbl-host"), cols, () => { drawPlot(); zones(); drawField(); });

  function quadrat(x) {
    const row = { x, w: L.measure(moist(x), { sd: 2.5, res: 1 }) };
    SP.forEach((s, k) => {
      const t = cover(k, x) * Math.exp(0.2 * L.gauss() - 0.02);
      row["s" + k] = t < 1.5 ? 0 : Math.max(0, Math.min(100, L.measure(t, { sd: 4, res: 5 })));
    });
    return row;
  }
  function line() {
    for (let x = 0; x <= LEN + 1e-9; x += gap) { const r = quadrat(x); r.pos = `${x} m`; r.g = gap; tbl.rows.push(r); }
    tbl.add(tbl.rows.pop());
  }
  function rnd() {
    const acc = { w: 0 }; SP.forEach((s, k) => { acc["s" + k] = 0; });
    for (let i = 0; i < 10; i++) { const r = quadrat(Math.random() * LEN); acc.w += r.w / 10; SP.forEach((s, k) => { acc["s" + k] += r["s" + k] / 10; }); }
    acc.pos = "무작위 10개"; acc.rnd = true; acc.x = NaN;
    tbl.add(acc);
  }

  function drawField() {
    const { ctx } = tv, { w, h } = tv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 10, x1 = w - 10, y0 = 24, y1 = h - 26, X = (v) => x0 + (v / LEN) * (x1 - x0);
    const gr = ctx.createLinearGradient(x0, 0, x1, 0);
    gr.addColorStop(0, "#9fc3cf"); gr.addColorStop(0.04, "#9fc3cf"); gr.addColorStop(0.06, "#c3d2a6"); gr.addColorStop(1, "#ddd6b0");
    ctx.fillStyle = gr; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (const p of plants) {
      const px = X(p.x), py = y0 + 4 + p.y * (y1 - y0 - 8);
      ctx.strokeStyle = SP[p.k].c; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px, py + 3); ctx.lineTo(px + Math.cos(p.a) * 2, py - 4); ctx.moveTo(px, py + 3); ctx.lineTo(px - 3, py - 2); ctx.moveTo(px, py + 3); ctx.lineTo(px + 3, py - 1); ctx.stroke();
    }
    /* 줄자 */
    const ly = (y0 + y1) / 2;
    ctx.strokeStyle = "#e0a02a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), ly); ctx.lineTo(X(LEN), ly); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    for (let v = 0; v <= LEN; v += 5) { ctx.fillRect(X(v) - 0.5, ly - 4, 1, 8); ctx.fillText(`${v} m`, Math.min(Math.max(X(v), x0 + 12), x1 - 12), y1 + 14); }
    /* 방형구: 마지막 줄 조사 */
    const last = tbl.rows.filter((r) => !r.rnd);
    const g = last.length ? last[last.length - 1].g : null;
    const sq = (x1 - x0) / LEN;
    last.filter((r) => r.g === g).forEach((r) => { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(Math.min(X(r.x), x1 - sq), ly - sq / 2, sq, sq); });
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.fillText("연못 물가", x0, 16);
    ctx.textAlign = "right"; ctx.fillText("언덕 위", x1, 16);
    ctx.textAlign = "center"; ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("→ 흙이 마름", w / 2, 16);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 40, y0: 44, w: w - 54, h: h - 78 };
    const last = tbl.rows.filter((r) => !r.rnd), g0 = last.length ? last[last.length - 1].g : null;
    const rs = last.filter((r) => r.g === g0).sort((a, b) => a.x - b.x);
    const g = L.plot(ctx, box, { pts: [], xr: [0, LEN], yr: [0, 100], xlabel: "물가에서의 거리 (m)", ylabel: "피도 · 흙 수분 (%)" });
    const ser = (key, col, dash) => {
      if (!rs.length) return;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = dash ? 1.2 : 1.8; ctx.setLineDash(dash ? [4, 4] : []);
      ctx.beginPath(); rs.forEach((r, i) => (i ? ctx.lineTo(g.X(r.x), g.Y(r[key])) : ctx.moveTo(g.X(r.x), g.Y(r[key])))); ctx.stroke(); ctx.setLineDash([]);
      if (!dash) rs.forEach((r) => { ctx.beginPath(); ctx.arc(g.X(r.x), g.Y(r[key]), 2.4, 0, Math.PI * 2); ctx.fill(); });
    };
    ser("w", C.ink3, true);
    SP.forEach((s, k) => ser("s" + k, s.c));
    /* 범례 두 줄 */
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    const items = SP.map((s) => [s.n, s.c]).concat([["흙 수분", C.ink3]]);
    const per = Math.max(1, Math.floor((w - 20) / 70));
    items.forEach(([n, c], i) => { const lx = 10 + (i % per) * 70, ly = 10 + Math.floor(i / per) * 15; ctx.fillStyle = c; ctx.fillRect(lx, ly, 9, 9); ctx.fillStyle = C.ink2; ctx.fillText(n, lx + 12, ly + 8.5); });
    if (!rs.length) { ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("줄자를 따라 조사하면 거리별 피도가 그려집니다", box.x0 + box.w / 2, box.y0 + box.h / 2); }
  }

  function zones() {
    const last = tbl.rows.filter((r) => !r.rnd), g0 = last.length ? last[last.length - 1].g : null;
    const rs = last.filter((r) => r.g === g0);
    [[0, 6.5], [6.5, 13.5], [13.5, 21]].forEach(([a, b], z) => {
      const q = rs.filter((r) => r.x >= a && r.x < b);
      const el = $(".z" + z);
      if (!q.length) { el.textContent = "—"; return; }
      const m = SP.map((s, k) => q.reduce((t, r) => t + r["s" + k], 0) / q.length);
      const k = m.indexOf(Math.max(...m));
      el.textContent = `${SP[k].n} (${m[k].toFixed(0)}%)`;
    });
  }

  $(".gap").addEventListener("click", (e) => {
    const b = e.target.closest("[data-g]"); if (!b) return;
    gap = +b.dataset.g; root.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
  $(".line").addEventListener("click", line);
  $(".rnd").addEventListener("click", rnd);
  $(".clear").addEventListener("click", () => tbl.clear());
  if (L.demo) { rnd(); line(); }
})();
