/* 카드: 하이브리도마 — HAT 선택(세포 수의 시간 변화, 로그 눈금)과 한계 희석(푸아송) · 모식 */
(() => {
  const root = document.getElementById("card-adbio-hybridoma");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $(".cv-grow"), pv = $(".cv-plate"), sD = $(".day"), oD = $(".d-out"), sL = $(".lam"), oL = $(".l-out");
  let med = "hat", my = "neg";

  /* 세포 종류: 처음 수(상대값), 분열 여부, 색, 이름 */
  const P = [
    { k: "B", n0: 1e8, div: false, col: "#3f6fa3", name: "B 세포" },
    { k: "BB", n0: 1e6, div: false, col: C.ink3, name: "B–B" },
    { k: "M", n0: 2e7, div: true, my: true, col: C.warn, name: "골수종" },
    { k: "MM", n0: 2e5, div: true, my: true, col: C.amber, name: "골수종–골수종" },
    { k: "H", n0: 1e3, div: true, col: C.forest, name: "하이브리도마" },
  ];
  const K = 2e9, R = Math.LN2 / 1.0, DT = 0.02, T = 14;
  let series = [];
  const sup = (v) => String(v).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c]).join("");

  function simulate() {
    const n = P.map((p) => p.n0), out = [];
    const steps = Math.round(T / DT);
    for (let i = 0; i <= steps; i++) {
      if (i % 5 === 0) out.push(n.slice());
      const D = P.reduce((s, p, j) => s + (p.div ? n[j] : 0), 0);
      const g = Math.max(0, 1 - D / K);
      P.forEach((p, j) => {
        let rate;
        if (!p.div) rate = -0.8;
        else if (p.my && med === "hat" && my === "neg") rate = -1.6;
        else rate = R * g;
        n[j] *= Math.exp(rate * DT);
        if (n[j] < 1) n[j] = 0;
      });
    }
    series = out;
  }
  const at = (d) => series[Math.min(series.length - 1, Math.round(d / (DT * 5)))];

  const g1 = fit(cv, () => drawGrow());
  function drawGrow() {
    const { ctx, size: { w, h } } = g1; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, x1 = w - 12, y0 = h - 30, y1 = 16;
    const X = (d) => x0 + d / T * (x1 - x0), Y = (lg) => y0 - lg / 10 * (y0 - y1);
    NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, X, Y,
      xt: [0, 2, 4, 6, 8, 10, 12, 14].map((d) => [d, String(d)]),
      yt: [0, 2, 4, 6, 8, 10].map((v) => [v, v === 0 ? "1" : "10" + sup(v)]),
      xlabel: "배양 일수", ylabel: "세포 수 (상대값, 로그)" });
    if (med === "normal" || my === "pos") {
      ctx.fillStyle = "rgba(181,83,47,.06)"; ctx.fillRect(x0, y1, x1 - x0, y0 - y1);
    }
    P.forEach((p, j) => {
      ctx.strokeStyle = p.col; ctx.lineWidth = p.k === "H" ? 2.8 : 1.8; ctx.beginPath();
      let started = false;
      series.forEach((s, i) => {
        if (s[j] <= 0) return;
        const x = X(i * DT * 5), y = Y(Math.log10(s[j]));
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    const d = +sD.value, xd = X(d);
    ctx.strokeStyle = C.ink; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xd, y1); ctx.lineTo(xd, y0); ctx.stroke(); ctx.setLineDash([]);
    const s = at(d);
    P.forEach((p, j) => {
      if (s[j] <= 0) return;
      ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(xd, Y(Math.log10(s[j])), 4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
    ctx.fillText(med === "hat" ? (my === "neg" ? "HAT 배지 · HGPRT 결핍 골수종" : "HAT 배지 · HGPRT 정상 골수종") : "일반 배지", x1, y1 - 6);
  }

  /* 한계 희석: 96홈 판 */
  let wells = [];
  function poisson(l) {
    const L = Math.exp(-l); let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  }
  function seed() { const l = +sL.value; wells = Array.from({ length: 96 }, () => poisson(l)); }
  const g2 = fit(pv, () => drawPlate());
  function drawPlate() {
    const { ctx, size: { w, h } } = g2; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 22, padT = 18, cw = (w - padL - 6) / 12, ch = (h - padT - 6) / 8, r = Math.min(cw, ch) * 0.42;
    ctx.fillStyle = "#ebece6"; ctx.fillRect(padL - 4, padT - 4, w - padL - 2, h - padT - 2);
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let c = 0; c < 12; c++) ctx.fillText(String(c + 1), padL + cw * (c + .5), padT - 7);
    ctx.textAlign = "right";
    for (let rr = 0; rr < 8; rr++) ctx.fillText("ABCDEFGH"[rr], padL - 7, padT + ch * (rr + .5) + 3);
    wells.forEach((n, i) => {
      const cx = padL + cw * (i % 12 + .5), cy = padT + ch * (Math.floor(i / 12) + .5);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = n === 0 ? C.card : n === 1 ? "rgba(116,171,102,.55)" : "rgba(224,160,42,.55)"; ctx.fill();
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.stroke();
      const m = Math.min(n, 6);
      for (let k = 0; k < m; k++) {
        const a = k / m * Math.PI * 2 + 0.6, rr = m === 1 ? 0 : r * 0.45;
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + rr * Math.cos(a), cy + rr * Math.sin(a), Math.max(1.6, r * 0.14), 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  function fmt(x) {
    if (x <= 0) return "0";
    if (x < 1e4) return String(Math.round(x));
    const e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e);
    return `${m.toFixed(1)}×10${sup(e)}`;
  }
  function update() {
    root.querySelectorAll("[data-med]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.med === med)));
    root.querySelectorAll("[data-my]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.my === my)));
    simulate();
    const d = +sD.value; oD.textContent = d % 1 ? d.toFixed(1) : String(d);
    const s = at(d), tot = s.reduce((a, b) => a + b, 0);
    $(".n-h").textContent = fmt(s[4]);
    $(".n-m").textContent = fmt(s[2] + s[3]);
    const f = tot > 0 ? s[4] / tot : 0;
    $(".n-f").textContent = f >= 0.01 ? `${(f * 100).toFixed(1)} %` : `${(f * 100).toPrecision(2)} %`;
    drawGrow();
  }
  function updPlate() {
    const l = +sL.value; oL.textContent = l.toFixed(1);
    const grown = wells.filter((n) => n > 0).length, one = wells.filter((n) => n === 1).length;
    $(".p-g").textContent = `${grown} / 96`;
    $(".p-1").textContent = grown ? `${one} (${Math.round(one / grown * 100)} %)` : "—";
    $(".p-t").textContent = `${(l * Math.exp(-l) / (1 - Math.exp(-l)) * 100).toFixed(0)} %`;
    drawPlate();
  }
  root.querySelectorAll("[data-med]").forEach((b) => b.addEventListener("click", () => { med = b.dataset.med; update(); }));
  root.querySelectorAll("[data-my]").forEach((b) => b.addEventListener("click", () => { my = b.dataset.my; update(); }));
  sD.addEventListener("input", update);
  sL.addEventListener("input", () => { seed(); updPlate(); });
  $(".redo").addEventListener("click", () => { seed(); updPlate(); });
  seed(); update(); updPlate();
})();
