/* 카드: 원을 도는 점의 높이를 펼치면 어떤 그래프가 될까? — 단위원 위의 점과 y = sin x, cos x, tan x 그래프를 함께 움직인다 */
(() => {
  const root = document.getElementById("card-alg-trig-graph");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s), fchips = [...root.querySelectorAll(".fn .chip[data-f]")], full = $(".go-full");
  const sx = $(".x");
  const PI = Math.PI, M = "−";
  const n = (v, d = 3) => { const r = Math.round(v * 10 ** d) / 10 ** d; return r === 0 ? "0" : (r < 0 ? M : "") + Math.abs(r); };
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const piStr = (deg) => { let p = deg / 15, q = 12; const g = gcd(Math.abs(p), q) || 1; p /= g; q /= g; return p === 0 ? "0" : `${p < 0 ? M : ""}${Math.abs(p) === 1 ? "" : Math.abs(p)}π${q === 1 ? "" : "/" + q}`; };
  const SIN = { 0: "0", 30: "1/2", 45: "√2/2", 60: "√3/2", 90: "1", 120: "√3/2", 135: "√2/2", 150: "1/2", 180: "0", 210: "−1/2", 225: "−√2/2", 240: "−√3/2", 270: "−1", 300: "−√3/2", 315: "−√2/2", 330: "−1/2" };
  const TAN = { 0: "0", 30: "√3/3", 45: "1", 60: "√3", 120: "−√3", 135: "−1", 150: "−√3/3", 180: "0", 210: "√3/3", 225: "1", 240: "√3", 300: "−√3", 315: "−1", 330: "−√3/3" };
  const md = (d) => ((d % 360) + 360) % 360;
  const FN = {
    sin: { f: Math.sin, col: C.forest, per: "2π", info: "치역 −1 ≤ y ≤ 1 · 주기 2π · 그래프는 원점 대칭: sin(−x) = −sin x" },
    cos: { f: Math.cos, col: C.amber, per: "2π", info: "치역 −1 ≤ y ≤ 1 · 주기 2π · 그래프는 y축 대칭: cos(−x) = cos x" },
    tan: { f: Math.tan, col: C.warn, per: "π", info: "치역 실수 전체 · 주기 π · 점근선 x = π/2 + nπ · 그래프는 원점 대칭" },
  };
  let fn = "sin", showAll = false;
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const deg = +sx.value, x = deg * PI / 180, F0 = FN[fn];
    const rho = Math.min(h * 0.22, w * 0.12), cx = rho + 14, cy = h / 2;
    const gx0 = cx + rho + 36, gx1 = w - 10;
    const X = (v) => gx0 + (v + 2 * PI) / (4 * PI) * (gx1 - gx0), Y = (v) => cy - v * rho;
    const ylim = (cy - 6) / rho;
    ctx.lineWidth = 1; ctx.strokeStyle = C.rule; ctx.beginPath();
    for (let k = -4; k <= 4; k++) { const px = Math.round(X(k * PI / 2)) + .5; ctx.moveTo(px, 4); ctx.lineTo(px, h - 18); }
    [-2, -1, 1, 2].forEach((k) => { if (Math.abs(k) <= ylim) { ctx.moveTo(gx0, Y(k)); ctx.lineTo(gx1, Y(k)); } });
    ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(gx0, cy); ctx.lineTo(gx1, cy); ctx.moveTo(X(0), 4); ctx.lineTo(X(0), h - 18); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    [[-2, "−2π"], [-1, "−π"], [0, "0"], [1, "π"], [2, "2π"]].forEach(([k, s]) => ctx.fillText(s, X(k * PI) + (k === 2 ? -8 : k === -2 ? 8 : 0), h - 5));
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    [-2, -1, 1, 2].forEach((k) => { if (Math.abs(k) <= ylim && Y(k) > 10 && Y(k) < h - 26) ctx.fillText(k < 0 ? M + (-k) : String(k), gx0 - 4, Y(k)); });
    if (fn === "tan") {
      ctx.strokeStyle = C.warn; ctx.setLineDash([4, 4]); ctx.beginPath();
      [-1.5, -0.5, 0.5, 1.5].forEach((k) => { const px = X(k * PI); ctx.moveTo(px, 4); ctx.lineTo(px, h - 18); });
      ctx.stroke(); ctx.setLineDash([]);
    }
    const curve = (a, b, col, lw) => {
      ctx.save(); ctx.beginPath(); ctx.rect(gx0, 2, gx1 - gx0, h - 20); ctx.clip();
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
      let pen = false, prev = 0; const st = (b - a) / 600;
      for (let i = 0; i <= 600; i++) {
        const t = a + st * i, v = F0.f(t);
        if (fn === "tan" && (Math.abs(Math.cos(t)) < 1e-3 || (pen && Math.sign(v) !== Math.sign(prev) && Math.abs(v - prev) > 4))) { pen = false; prev = v; continue; }
        const py = Y(clamp(v, -ylim - 1, ylim + 1));
        pen ? ctx.lineTo(X(t), py) : ctx.moveTo(X(t), py); pen = true; prev = v;
      }
      ctx.stroke(); ctx.restore();
    };
    if (showAll) curve(-2 * PI, 2 * PI, C.ink3, 1.5);
    if (deg !== 0) curve(Math.min(0, x), Math.max(0, x), F0.col, 3);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - rho - 8, cy); ctx.lineTo(cx + rho + 8, cy); ctx.moveTo(cx, cy - rho - 8); ctx.lineTo(cx, cy + rho + 8); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.arc(cx, cy, rho, 0, 7); ctx.stroke();
    const px = cx + rho * Math.cos(x), py = cy - rho * Math.sin(x), undef = fn === "tan" && md(deg) % 180 === 90;
    const v = F0.f(x), gy = Y(clamp(v, -ylim, ylim)), gx = X(x);
    ctx.lineWidth = 3;
    if (fn === "sin") {
      ctx.strokeStyle = F0.col; ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    } else if (fn === "cos") {
      ctx.strokeStyle = F0.col; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
    } else {
      const tx = cx + rho;
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, 2); ctx.lineTo(tx, h - 2); ctx.stroke();
      if (!undef) {
        const ty = cy - rho * Math.tan(x);
        ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = F0.col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, cy); ctx.lineTo(tx, clamp(ty, -10, h + 10)); ctx.stroke();
        if (ty > 0 && ty < h) {
          ctx.fillStyle = F0.col; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, 7); ctx.fill();
          ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("T", tx + 5, ty - 8);
          ctx.strokeStyle = F0.col; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(gx, gy); ctx.stroke(); ctx.setLineDash([]);
        }
      }
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 4.5, 0, 7); ctx.fill();
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("P", cx + (rho + 11) * Math.cos(x), cy - (rho + 11) * Math.sin(x));
    if (fn === "sin") { ctx.strokeStyle = F0.col; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(gx, gy); ctx.stroke(); ctx.setLineDash([]); }
    if (!undef) {
      ctx.strokeStyle = F0.col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx, cy); ctx.lineTo(gx, gy); ctx.stroke();
      if (Math.abs(v) <= ylim) { ctx.fillStyle = F0.col; ctx.beginPath(); ctx.arc(gx, gy, 5, 0, 7); ctx.fill(); }
    }
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(fn === "sin" ? "높이 = sin x" : fn === "cos" ? "가로 = cos x" : "T의 높이 = tan x", 4, 4);
  }

  function update() {
    const deg = +sx.value, d = md(deg), x = deg * PI / 180;
    $(".x-out").textContent = `${piStr(deg)} (${deg}°)`;
    let val;
    if (fn === "tan" && d % 180 === 90) val = "정의되지 않음";
    else {
      const e = fn === "sin" ? SIN[d] : fn === "cos" ? SIN[md(d + 90)] : TAN[d];
      const v = FN[fn].f(x);
      val = e === undefined ? `≈ ${n(v)}` : /√/.test(e) ? `${e} ≈ ${n(v)}` : e;
    }
    $(".d-f").textContent = `${fn} x`; $(".n-v").textContent = val;
    $(".n-x").textContent = piStr(deg); $(".n-p").textContent = FN[fn].per;
    $(".eq").textContent = FN[fn].info;
    fchips.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.f === fn)));
    full.setAttribute("aria-pressed", String(showAll));
    draw();
  }
  sx.addEventListener("input", update);
  fchips.forEach((b) => b.addEventListener("click", () => { fn = b.dataset.f; update(); }));
  full.addEventListener("click", () => { showAll = !showAll; update(); });
  update();
})();
