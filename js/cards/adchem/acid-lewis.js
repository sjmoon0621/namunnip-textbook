/* 카드: H⁺가 없는 금속 이온은 어떻게 물을 산성으로 만들까? — 수화 금속 이온의 pKa와 z²/r */
(() => {
  const root = document.getElementById("card-adchem-lewis");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  /* [이름, 전하 z, 6배위 반지름 r(pm, Shannon), 첫 가수 분해 pKa(25 °C, Baes & Mesmer 1976 반올림), 배위 표기] */
  const IONS = [
    ["Na⁺", 1, 102, 14.2, "n"], ["Li⁺", 1, 76, 13.6, "n"], ["Ca²⁺", 2, 100, 12.9, "n"], ["Mg²⁺", 2, 72, 11.4, "6"],
    ["Mn²⁺", 2, 83, 10.6, "6"], ["Fe²⁺", 2, 78, 9.5, "6"], ["Zn²⁺", 2, 74, 9.0, "6"], ["Cu²⁺", 2, 73, 8.0, "6"],
    ["Hg²⁺", 2, 102, 3.4, "6"], ["Al³⁺", 3, 53.5, 5.0, "6"], ["Cr³⁺", 3, 61.5, 4.0, "6"], ["Fe³⁺", 3, 64.5, 2.2, "6"],
  ];
  /* 경향선에서 크게 벗어나는 이온(공유 결합성이 큰 이온) */
  const SOFT = new Set(["Hg²⁺", "Fe³⁺", "Cu²⁺", "Cr³⁺"]);
  const Kw = 1e-14;
  let sel = 9;
  const cv = $("canvas"), sc = $(".c"), oc = $(".c-out"), eqn = $(".eqn"), nK = $(".n-k"), nP = $(".n-ph"), nA = $(".n-a");
  const pre = $(".presets");
  pre.innerHTML = IONS.map((d, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="false">${d[0]}</button>`).join("");
  const zr = (d) => d[1] * d[1] / d[2] * 100;     /* z²/r, 단위 e²/(100 pm) */
  const sup = (n) => String(n).replace(/-/g, "⁻").replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const sci = (v) => { const e = Math.floor(Math.log10(v)), m = v / 10 ** e; return `${m.toFixed(1)} × 10${sup(e)}`; };
  function solveH(Cm, Ka) {
    let lo = -14, hi = 1;
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2, h = 10 ** m; if (h - Ka * Cm / (Ka + h) - Kw / h > 0) hi = m; else lo = m; }
    return 10 ** ((lo + hi) / 2);
  }
  const { ctx, size } = fit(cv, () => draw());
  function arrow(x1, y1, x2, y2, col, lw) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 7 * Math.cos(a - .45), y2 - 7 * Math.sin(a - .45)); ctx.lineTo(x2 - 7 * Math.cos(a + .45), y2 - 7 * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = IONS[sel], s = zr(d), pull = clamp((14.5 - d[3]) / 12.5, 0, 1);
    /* 왼쪽: 수화 이온 모식 */
    const lw = Math.min(w * 0.4, h * 1.05), cx = lw / 2, cy = h / 2 + 4, R = Math.min(lw, h) * 0.32;
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText("수화 이온 (모식)", cx, 14);
    const rr = 8 + d[2] / 102 * 16;
    const ang = [0, 60, 120, 180, 240, 300].map((a) => a * Math.PI / 180);
    ang.forEach((a, i) => {
      const ox = cx + R * Math.cos(a), oy = cy + R * Math.sin(a), hot = i === 0;
      /* 루이스 염기(O)의 전자쌍 → 루이스 산(금속) */
      ctx.strokeStyle = hot ? C.forest : C.rule; ctx.lineWidth = hot ? 1.5 + pull * 2 : 1.2; ctx.setLineDash(hot ? [] : [3, 3]);
      ctx.beginPath(); ctx.moveTo(cx + (rr + 3) * Math.cos(a), cy + (rr + 3) * Math.sin(a)); ctx.lineTo(ox - 10 * Math.cos(a), oy - 10 * Math.sin(a)); ctx.stroke(); ctx.setLineDash([]);
      /* 두 H: 바깥쪽으로 */
      [-0.62, 0.62].forEach((da, j) => {
        const off = hot && j === 0 ? pull * 9 : 0, hx = ox + (16 + off) * Math.cos(a + da), hy = oy + (16 + off) * Math.sin(a + da);
        ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash(hot && j === 0 && pull > .35 ? [2, 2] : []);
        ctx.beginPath(); ctx.moveTo(ox + 7 * Math.cos(a + da), oy + 7 * Math.sin(a + da)); ctx.lineTo(hx - 4 * Math.cos(a + da), hy - 4 * Math.sin(a + da)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = hot && j === 0 ? `rgba(212,73,58,${0.35 + 0.65 * pull})` : "#e6e6e1"; ctx.beginPath(); ctx.arc(hx, hy, 4.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = hot ? `rgba(59,124,42,${0.35 + 0.4 * pull})` : "#c9d9c4"; ctx.beginPath(); ctx.arc(ox, oy, 7.5, 0, Math.PI * 2); ctx.fill();
    });
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, rr); g.addColorStop(0, "#9fb8d6"); g.addColorStop(1, "#3f6fa3");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `600 ${rr > 16 ? 12 : 10}px ${F.sans}`; ctx.fillText(d[0], cx, cy + 4);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.forest; ctx.textAlign = "center";
    ctx.fillText("O의 전자쌍 → 금속 (루이스 염기 → 산)", cx, h - 22);
    ctx.fillStyle = C.apple; ctx.fillText(pull > .35 ? "O–H 결합이 약해져 H⁺가 떨어지기 쉬움" : "O–H 결합은 거의 그대로", cx, h - 8);
    /* 오른쪽: pKa – z²/r 산점도 */
    const x0 = lw + 38, x1 = w - 12, y0 = 22, y1 = h - 30;
    const X = (v) => x0 + v / 18 * (x1 - x0), Y = (p) => y0 + (p - 1) / 14 * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y, xt: [0, 5, 10, 15].map((v) => [v, String(v)]), yt: [2, 5, 8, 11, 14].map((v) => [v, String(v)]), xlabel: "z²/r (×10⁻² e²/pm) →", ylabel: "pKa (↓ 강한 산)" });
    IONS.forEach((q, i) => {
      const px = X(zr(q)), py = Y(q[3]), on = i === sel;
      ctx.fillStyle = on ? C.apple : SOFT.has(q[0]) ? C.warn : "#3f6fa3"; ctx.globalAlpha = on ? 1 : 0.75;
      ctx.beginPath(); SOFT.has(q[0]) ? ctx.rect(px - 4, py - 4, 8, 8) : ctx.arc(px, py, 4.2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.font = `${on ? "600 " : ""}10px ${F.sans}`; ctx.fillStyle = on ? C.apple : C.ink2;
      const right = ["Na⁺", "Li⁺", "Mg²⁺", "Fe²⁺", "Cu²⁺", "Hg²⁺"].includes(q[0]);
      ctx.textAlign = right ? "left" : "right"; ctx.fillText(q[0], px + (right ? 7 : -7), py + 3);
    });
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.warn; ctx.fillText("■ 공유 결합성이 큰 이온", x1 - 2, y1 - 6);
  }
  function update() {
    const d = IONS[sel], Ka = 10 ** -d[3], Cm = 10 ** +sc.value, h = solveH(Cm, Ka), n = d[4];
    oc.textContent = Cm >= 0.01 ? Cm.toFixed(3) : Cm.toPrecision(2);
    const z = d[1], ion = (k) => (k === 1 ? "+" : `${k}+`);
    const m = d[0].replace(/[⁺²³]/g, "");
    eqn.innerHTML = `[${m}(H₂O)<sub>${n}</sub>]<sup>${ion(z)}</sup> + H₂O ⇌ [${m}(H₂O)<sub>${n === "n" ? "n−1" : "5"}</sub>(OH)]${z - 1 ? `<sup>${ion(z - 1)}</sup>` : ""} + H₃O⁺`;
    nK.textContent = `${d[3].toFixed(1)} (${sci(Ka)})`;
    nP.textContent = (-Math.log10(h)).toFixed(2);
    const alpha = Ka / (Ka + h); nA.textContent = alpha < 1e-3 ? sci(alpha) : `${(alpha * 100).toFixed(alpha < 0.1 ? 2 : 1)} %`;
    root.querySelectorAll("[data-i]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.i === sel)));
    draw();
  }
  root.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { sel = +b.dataset.i; update(); }));
  sc.addEventListener("input", update);
  update();
})();
