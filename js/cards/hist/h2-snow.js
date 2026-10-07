/* 카드: 1854년 런던의 콜레라는 어디에서 왔을까? — 스노의 지도 (실제 자료 H2_SNOW) */
(() => {
  const root = document.getElementById("card-hist-snow");
  if (!root || !window.H2_SNOW) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const S = window.H2_SNOW;
  const sR = $(".r"), cVor = $(".vor");
  let sel = 6, mode = 1;
  const KO = { 6: "브로드가", 9: "남소호", 5: "크라운 채플", 8: "브리들가", 3: "옥스퍼드가 2" };
  const XR = [3.0, 20.3], YR = [2.9, 19.1];
  const PCOL = ["#8d8d92", "#6b8fb8", "#c98a3a", "#7a6bb0", "#5f9e8f", "#b56b8f", "#b5532f", "#4f7d3a", "#a0763f", "#3f6fa0", "#9a5f9e", "#6f8f3f", "#8f6f5f"];

  const nearest = (x, y) => {
    let b = 0, bd = Infinity;
    S.pumps.forEach((p, i) => { const d = (p[1] - x) ** 2 + (p[2] - y) ** 2; if (d < bd) { bd = d; b = i; } });
    return b;
  };
  const near = S.deaths.map(([x, y]) => nearest(x, y));

  const map = fit($(".cv-map"), () => drawMap());
  const cur = fit($(".cv-curve"), () => drawCurve());

  function geom() {
    const { w, h } = map.size, pad = 8;
    const sc = Math.min((w - 2 * pad) / (XR[1] - XR[0]), (h - 2 * pad) / (YR[1] - YR[0]));
    const ox = (w - sc * (XR[1] - XR[0])) / 2, oy = (h - sc * (YR[1] - YR[0])) / 2;
    return { sc, X: (x) => ox + (x - XR[0]) * sc, Y: (y) => h - oy - (y - YR[0]) * sc, ix: (px) => XR[0] + (px - ox) / sc, iy: (py) => YR[0] + (h - oy - py) / sc };
  }

  function drawMap() {
    const { ctx } = map, { w, h } = map.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = geom(), r = +sR.value;
    if (cVor.checked) {
      const step = 4;
      for (let py = 0; py < h; py += step) for (let px = 0; px < w; px += step) {
        const i = nearest(g.ix(px + step / 2), g.iy(py + step / 2));
        ctx.fillStyle = PCOL[i]; ctx.globalAlpha = i === sel ? 0.2 : 0.07; ctx.fillRect(px, py, step, step);
      }
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = "#b9bab2"; ctx.lineWidth = 1.1;
    for (const s of S.streets) {
      ctx.beginPath();
      for (let i = 0; i < s.length; i += 2) { const x = g.X(s[i]), y = g.Y(s[i + 1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    const p = S.pumps[sel];
    if (r > 0) {
      ctx.fillStyle = "rgba(181,83,47,.08)"; ctx.strokeStyle = C.warn; ctx.lineWidth = 1.4; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.arc(g.X(p[1]), g.Y(p[2]), r * g.sc, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    }
    const dr = Math.max(1.6, g.sc * 0.11);
    S.deaths.forEach(([x, y], k) => {
      const inR = Math.hypot(x - p[1], y - p[2]) <= r;
      ctx.fillStyle = cVor.checked ? PCOL[near[k]] : inR ? C.warn : C.ink;
      ctx.fillRect(g.X(x) - dr / 2, g.Y(y) - dr / 2, dr, dr);
    });
    S.pumps.forEach((q, i) => {
      const x = g.X(q[1]), y = g.Y(q[2]), a = i === sel ? 6 : 4.5;
      ctx.fillStyle = i === sel ? C.warn : C.card; ctx.strokeStyle = i === sel ? C.warn : C.forest; ctx.lineWidth = 1.8;
      ctx.fillRect(x - a, y - a, 2 * a, 2 * a); ctx.strokeRect(x - a, y - a, 2 * a, 2 * a);
    });
    ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.warn;
    const lx = g.X(p[1]) + 9, ly = g.Y(p[2]) - 8;
    const txt = `${KO[sel] || p[0]} 펌프`, tw = ctx.measureText(txt).width, tx = Math.min(lx, w - tw - 12);
    ctx.fillStyle = "rgba(251,251,248,.92)"; ctx.fillRect(tx - 4, ly - 13, tw + 8, 18);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.strokeRect(tx - 4, ly - 13, tw + 8, 18);
    ctx.fillStyle = C.warn; ctx.fillText(txt, tx, ly);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`;
    ctx.beginPath(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5;
    const bx = 12, by = h - 14; ctx.moveTo(bx, by); ctx.lineTo(bx + g.sc * 2, by); ctx.stroke();
    ctx.fillText("200 m", bx, by - 5);
    ctx.textAlign = "right"; ctx.fillText("↑ 북", w - 10, 16);
    ctx.fillText("■ 펌프   · 사망자", w - 10, h - 10);
  }

  function drawCurve() {
    const { ctx } = cur, { w, h } = cur.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const D = S.dates, n = D.length, top = mode === 1 ? 150 : 130;
    const box = { x0: 34, y0: 18, w: w - 44, h: h - 46 };
    const X = (i) => box.x0 + (i + 0.5) / n * box.w, Y = (v) => box.y0 + box.h - v / top * box.h;
    const lab = ["08-19", "08-26", "09-01", "09-08", "09-15", "09-22", "09-29"];
    const xt = lab.map((d) => [D.findIndex((e) => e[0] === d), d.replace("-", "/")]).filter(([i]) => i >= 0);
    axes(ctx, { ...box, X, Y, xt, yt: [0, 50, 100, 150].filter((v) => v <= top).map((v) => [v, String(v)]), ylabel: mode === 1 ? "하루 발병 수" : "하루 사망 수" });
    const bw = box.w / n * 0.72, i8 = D.findIndex((e) => e[0] === "09-08");
    D.forEach((e, i) => {
      const v = e[mode];
      ctx.fillStyle = i < i8 ? C.warn : C.leaf;
      ctx.fillRect(X(i) - bw / 2, Y(v), bw, box.y0 + box.h - Y(v));
    });
    const xl = X(i8) - box.w / n / 2;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(xl, box.y0); ctx.lineTo(xl, box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.font = `11.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("9월 8일 손잡이 제거", xl + 6, box.y0 + 12);
    const tot = D.reduce((s, e) => s + e[mode], 0), before = D.slice(0, i8).reduce((s, e) => s + e[mode], 0);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.font = `11px ${F.mono}`;
    ctx.fillText(`합계 ${tot}명 · 제거 전 ${Math.round(before / tot * 100)}%`, box.x0 + box.w, box.y0 + 12);
  }

  function upd() {
    const r = +sR.value, p = S.pumps[sel];
    $(".r-out").textContent = Math.round(r * 100);
    const nIn = S.deaths.filter(([x, y]) => Math.hypot(x - p[1], y - p[2]) <= r).length;
    const nNear = near.filter((i) => i === sel).length;
    $(".n-in").textContent = nIn + "명";
    $(".n-near").textContent = nNear + "명";
    $(".n-share").textContent = Math.round(nNear / S.deaths.length * 100) + "%";
    drawMap();
  }

  const press = (grp, attr, v) => grp.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attr] === String(v))));
  $(".pumps").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    sel = +b.dataset.p; press($(".pumps"), "p", sel); upd();
  });
  $(".mode").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    mode = +b.dataset.m; press($(".mode"), "m", mode); drawCurve();
  });
  $(".cv-map").addEventListener("click", (e) => {
    const rc = e.currentTarget.getBoundingClientRect(), g = geom();
    sel = nearest(g.ix(e.clientX - rc.left), g.iy(e.clientY - rc.top));
    press($(".pumps"), "p", sel); upd();
  });
  sR.addEventListener("input", upd);
  cVor.addEventListener("change", drawMap);
  if (/[?&]demo\b/.test(location.search)) cVor.checked = true;
  upd();
})();
