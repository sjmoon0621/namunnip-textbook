/* 카드: 사실 판단(점수)과 가치 판단(가중치) — 가상 쟁점의 다기준 의사결정 */
(() => {
  const root = document.getElementById("card-hist-values");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), cU = $(".unc"), host = $(".wts"), flip = $(".flip");
  const CRIT = ["안전", "전기 요금", "온실가스", "공급 안정", "지역 일자리"];
  const COL = ["#d4493a", "#3f6fa3", "#3b7c2a", "#e0a02a", "#8a6fb0"];
  const OPT = [
    { k: "A", name: "A 계속 운전", s: [2, 5, 5, 4, 3], safe: [1, 3.5] },
    { k: "B", name: "B 가스 발전", s: [4, 3, 2, 5, 3], safe: [3.5, 4.5] },
    { k: "C", name: "C 재생+저장", s: [5, 2, 5, 2, 3], safe: [4.5, 5] },
  ];
  const PRE = { even: [5, 5, 5, 5, 5], town: [10, 4, 3, 3, 8], biz: [4, 9, 2, 10, 5], eco: [7, 2, 10, 3, 3] };
  let who = "even";
  host.innerHTML = CRIT.map((c, i) => `<div><label class="mono">${c} 가중치 = <output class="o${i}">5</output></label><input class="w${i}" type="range" min="0" max="10" step="1" value="5" aria-label="${c} 가중치"></div>`).join("");
  const W = () => CRIT.map((_, i) => +root.querySelector(`.w${i}`).value);
  const total = (s, w) => { const sw = w.reduce((a, b) => a + b, 0); return sw ? s.reduce((a, v, i) => a + v * w[i], 0) / sw * 20 : 0; };
  const winner = (w) => { let b = 0, bv = -1; OPT.forEach((o, i) => { const v = total(o.s, w); if (v > bv + 1e-9) { bv = v; b = i; } }); return b; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const ws = W(), sw = ws.reduce((a, b) => a + b, 0) || 1, win = winner(ws);
    const x0 = 92, x1 = w - 46, X = (v) => x0 + v / 100 * (x1 - x0), bh = Math.min(30, (h - 70) / 3 - 14);
    NM.axes(ctx, { x0, y0: 10, w: x1 - x0, h: h - 62, X, Y: () => 0, xt: [[0, "0"], [20, "20"], [40, "40"], [60, "60"], [80, "80"], [100, "100"]], yt: [] });
    OPT.forEach((o, j) => {
      const y = 22 + j * ((h - 72) / 3) + 6;
      ctx.fillStyle = j === win ? C.ink : C.ink2; ctx.font = `${j === win ? 600 : 400} 12px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(o.name, x0 - 8, y + bh / 2 + 4);
      let acc = 0;
      o.s.forEach((v, i) => { const part = v * ws[i] / sw * 20; ctx.fillStyle = COL[i]; ctx.globalAlpha = j === win ? 1 : 0.55; ctx.fillRect(X(acc), y, X(acc + part) - X(acc), bh); acc += part; });
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(acc.toFixed(0), X(acc) + 5, y + bh / 2 + 4);
      if (cU.checked) {
        const lo = acc + (o.safe[0] - o.s[0]) * ws[0] / sw * 20, hi = acc + (o.safe[1] - o.s[0]) * ws[0] / sw * 20, yy = y + bh + 6;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(lo), yy); ctx.lineTo(X(hi), yy); ctx.moveTo(X(lo), yy - 4); ctx.lineTo(X(lo), yy + 4); ctx.moveTo(X(hi), yy - 4); ctx.lineTo(X(hi), yy + 4); ctx.stroke();
      }
    });
    // 범례
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; let lx = 8;
    CRIT.forEach((c, i) => { ctx.fillStyle = COL[i]; ctx.fillRect(lx, h - 22, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText(c, lx + 14, h - 13); lx += ctx.measureText(c).width + 30; });
  }
  function update() {
    root.querySelectorAll("[data-w]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.w === who)));
    const ws = W(); ws.forEach((v, i) => { root.querySelector(`.o${i}`).textContent = v; });
    const win = winner(ws); let best = null;
    ws.forEach((cur, i) => {
      for (let v = 0; v <= 10; v++) {
        if (v === cur) continue;
        const t = ws.slice(); t[i] = v; const nw = winner(t);
        if (nw !== win && (!best || Math.abs(v - cur) < Math.abs(best.v - best.cur))) best = { i, v, cur, nw };
      }
    });
    flip.innerHTML = best
      ? `지금 1위는 <b>${OPT[win].name}</b>입니다. 가중치 하나만 가장 적게 바꿔 1위를 바꾸려면: ‘${CRIT[best.i]}’을 ${best.cur} → ${best.v}로 바꾸면 <b>${OPT[best.nw].name}</b>이(가) 1위가 됩니다.`
      : `지금 1위는 <b>${OPT[win].name}</b>입니다. 가중치 하나만 바꿔서는 1위가 바뀌지 않습니다.`;
    draw();
  }
  root.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => {
    who = b.dataset.w; PRE[who].forEach((v, i) => { root.querySelector(`.w${i}`).value = v; }); update();
  }));
  CRIT.forEach((_, i) => root.querySelector(`.w${i}`).addEventListener("input", () => { who = ""; update(); }));
  cU.addEventListener("change", update);
  if (/[?&]demo\b/.test(location.search)) { cU.checked = true; }
  update();
})();
