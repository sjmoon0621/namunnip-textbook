/* 카드: 소금물에 담근 세포는 왜 쪼그라들까? — 보일–반트호프 관계 V/V0 = b + (1−b)·π0/π. 적혈구(b=0.4, 1.55배에서 용혈), 식물 세포(세포벽, 팽압, 원형질 분리) */
(() => {
  const root = document.getElementById("card-cell-osmosis");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".conc"), oC = $(".c-out");
  const nV = $(".n-v"), nW = $(".n-w"), nS = $(".n-s");
  const K = 290 / 0.9;          // mOsm/L per % NaCl
  const RT = 2.48;              // MPa per osmol/L (25 °C)
  let cell = "rbc";
  function model(pct) {
    const pi = Math.max(1, pct * K);
    if (cell === "rbc") {
      const b = 0.4, v = b + (1 - b) * 290 / pi;
      return { v, lysis: v >= 1.55, pi, iso: 290 };
    }
    const b = 0.1, pin = 400;
    if (pi <= pin) return { v: 1, P: (pin - pi) / 1000 * RT, pi, iso: pin };
    return { v: b + (1 - b) * pin / pi, P: 0, pi, iso: pin, plas: true };
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pct = +sC.value, m = model(pct);
    const cx = w / 2, cy = h * 0.27;
    ctx.fillStyle = "#eaf1f5"; ctx.fillRect(10, 10, w - 20, h * 0.48);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`바깥: ${pct.toFixed(2)} % NaCl ≈ ${Math.round(pct * K)} mOsm/L`, 18, 26);
    if (cell === "rbc") {
      if (m.lysis) {
        ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, 58, 0, 6.29); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(212,73,58,.15)"; ctx.beginPath(); ctx.arc(cx, cy, 95, 0, 6.29); ctx.fill();
        ctx.fillStyle = C.warn; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("터짐 (용혈): 헤모글로빈이 새어 나옴", cx, cy + 4);
      } else {
        // 옆에서 본 모양: 오목한 원반(v=1) → 공(v=1.55), 쪼그라들면 톱니 모양
        const s = Math.min(1, Math.max(0, (m.v - 1) / 0.55));
        const R = 70 * (1 - 0.18 * s) * (m.v < 1 ? Math.pow(m.v, 0.33) : 1);
        ctx.fillStyle = "#d9695c"; ctx.strokeStyle = "#8f2b21"; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const a = i / 120 * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a);
          // 원반: 두께가 가장자리에서 두껍고 가운데서 얇다
          const disc = 0.28 + 0.2 * Math.pow(Math.abs(cs), 3) - 0.1 * Math.pow(1 - Math.abs(cs), 2);
          let ry = (disc * (1 - s) + s) * R, rx = R;
          let spike = m.v < 0.9 ? (0.9 - m.v) * 0.9 * Math.max(0, Math.cos(a * 18)) : 0;
          const x = cx + rx * cs * (1 + spike), y = cy + ry * sn * (1 + spike * 2);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
        ctx.fillText("적혈구를 옆에서 본 모양 (모식)", cx, h * 0.48);
      }
    } else {
      const W = 170, H = 110, x0 = cx - W / 2, y0 = cy - H / 2;
      ctx.fillStyle = "#dfe9d6"; ctx.fillRect(x0 - 7, y0 - 7, W + 14, H + 14);
      ctx.fillStyle = "#eaf1f5"; ctx.fillRect(x0, y0, W, H);
      const k = Math.sqrt(m.v), pw = W * k, ph = H * k;
      ctx.fillStyle = "#c9dfb8"; ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, m.plas ? 24 * k + 6 : 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#b1cfe3"; ctx.beginPath(); ctx.roundRect(cx - pw * 0.4, cy - ph * 0.36, pw * 0.8, ph * 0.72, 14 * k); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("액포", cx, cy + 4);
      ctx.fillText("세포벽", x0 + W + 30, y0 - 10);
      if (m.P > 0.01) {
        ctx.strokeStyle = C.warn; ctx.fillStyle = C.warn; ctx.lineWidth = 2;
        const L = 6 + m.P * 16;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const sx = cx + dx * (W / 2 - 4 - L), sy = cy + dy * (H / 2 - 4 - L);
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + dx * L, sy + dy * L); ctx.stroke();
        });
        ctx.font = `600 12px ${F.sans}`; ctx.fillText(`팽압 약 ${m.P.toFixed(2)} MPa`, cx, y0 + H + 28);
      } else if (m.plas) { ctx.fillStyle = C.warn; ctx.font = `600 12px ${F.sans}`; ctx.fillText("원형질 분리: 세포막이 세포벽에서 떨어짐", cx, y0 + H + 28); }
      else { ctx.font = `600 12px ${F.sans}`; ctx.fillText("원형질 분리가 막 시작되는 농도", cx, y0 + H + 28); }
    }
    // 그래프
    const gx = 44, gy = h * 0.6, gw = w - gx - 14, gh = h * 0.3;
    const X = (p) => gx + p / 2 * gw, Y = (v) => gy + gh - v / 2 * gh;
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [0, 0.5, 1, 1.5, 2].map((v) => [v, v]), yt: [[0, "0"], [1, "1"], [2, "2"]], xlabel: "% NaCl", ylabel: "부피 (처음 = 1)" });
    ctx.strokeStyle = cell === "rbc" ? "#8f2b21" : C.forest; ctx.lineWidth = 2; ctx.beginPath();
    let first = true;
    for (let p = 0.01; p <= 2; p += 0.01) {
      const mm = model(p); const v = Math.min(2, mm.v);
      if (cell === "rbc" && mm.lysis) { first = true; continue; }
      first ? ctx.moveTo(X(p), Y(v)) : ctx.lineTo(X(p), Y(v)); first = false;
    }
    ctx.stroke();
    if (cell === "rbc") { const pl = 290 * 0.6 / 1.15 / K; ctx.fillStyle = "rgba(212,73,58,.12)"; ctx.fillRect(X(0), gy, X(pl) - X(0), gh); ctx.fillStyle = C.warn; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("용혈", X(0) + 4, gy + 14); }
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(m.iso / K), gy); ctx.lineTo(X(m.iso / K), gy + gh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("등장", X(m.iso / K) + 4, gy + 14);
    if (!(cell === "rbc" && m.lysis)) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(pct), Y(Math.min(2, m.v)), 5, 0, 6.29); ctx.fill(); }
  }
  function update() {
    const pct = +sC.value, m = model(pct);
    oC.textContent = pct.toFixed(2);
    nV.textContent = cell === "rbc" && m.lysis ? "—" : `${m.v.toFixed(2)} 배`;
    const d = m.pi - m.iso;
    nW.textContent = Math.abs(d) < 8 ? "거의 없음" : d < 0 ? "세포 안으로" : "세포 밖으로";
    nS.textContent = cell === "rbc" ? (m.lysis ? "용혈" : Math.abs(d) < 8 ? "등장액" : d < 0 ? "저장액: 부풂" : "고장액: 쪼그라듦") : (m.plas ? "원형질 분리" : Math.abs(d) < 8 ? "등장액" : "팽압 생김");
    nS.classList.toggle("bad", !!(m.lysis || m.plas));
    root.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.c === cell ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { cell = b.dataset.c; update(); }));
  sC.addEventListener("input", update);
  update();
})();
