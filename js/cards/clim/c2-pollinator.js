/* 카드: 꽃은 일찍 피는데 벌이 제때 나오지 못하면? — 생물 계절 불일치와 여러 스트레스의 곱 (모식, 상대값) */
(() => {
  const root = document.getElementById("card-clim-pollinator");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const D0 = 60, D1 = 170;                   // 3월 1일 ~ 6월 19일 (1월 1일 = 1)
  const FP = 105, FS = 8, BP = 108, BS = 13; // 꽃·벌 곡선의 봉우리 날과 퍼짐 (모식)
  const g = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2);
  const overlap = (fp, bp) => { let s = 0; for (let d = 0; d <= 240; d += 0.5) s += g(d, fp, FS) * g(d, bp, BS); return s; };
  const BASE = overlap(FP, BP);
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const dT = +$(".dt").value, sf = +$(".sf").value, sb = +$(".sb").value;
    const fp = FP - sf * dT, bp = BP - sb * dT;
    const hab = $(".s-hab").checked ? 0.6 : 1, pest = $(".s-pest").checked ? 0.8 : 1, mite = $(".s-mite").checked ? 0.75 : 1, heat = $(".s-heat").checked ? Math.pow(0.95, dT) : 1;
    const x0 = 34, y0 = 24, gw = w - x0 - 12, gh = h - y0 - 40;
    const X = (d) => x0 + (d - D0) / (D1 - D0) * gw, Y = (v) => y0 + gh - v * gh * 0.92;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [[60, "3월"], [91, "4월"], [121, "5월"], [152, "6월"]], yt: [] });
    // 겹친 부분
    ctx.beginPath(); ctx.moveTo(X(D0), Y(0));
    for (let d = D0; d <= D1; d += 0.5) ctx.lineTo(X(d), Y(Math.min(g(d, fp, FS) * hab, g(d, bp, BS))));
    ctx.lineTo(X(D1), Y(0)); ctx.closePath(); ctx.fillStyle = "rgba(224,160,42,.35)"; ctx.fill();
    const curve = (f, col, dash) => { ctx.beginPath(); for (let d = D0; d <= D1; d += 0.5) { const y = Y(f(d)); d === D0 ? ctx.moveTo(X(d), y) : ctx.lineTo(X(d), y); } ctx.strokeStyle = col; ctx.lineWidth = dash ? 1.2 : 2.2; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); };
    if (dT > 0) { curve((d) => g(d, FP, FS), C.apple, [3, 3]); curve((d) => g(d, BP, BS), "#3f6fa3", [3, 3]); }
    curve((d) => g(d, fp, FS) * hab, C.apple);
    curve((d) => g(d, bp, BS), "#3f6fa3");
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    [["꽃이 핀 정도", C.apple], ["벌의 활동", "#3f6fa3"], ["겹침 = 벌이 얻는 먹이", C.amber]].forEach(([s, c], i) => { ctx.fillStyle = c; ctx.fillRect(x0 + gw - 150, y0 + i * 16 - 6, 12, 4); ctx.fillStyle = C.ink2; ctx.fillText(s, x0 + gw - 133, y0 + i * 16); });
    if (dT > 0) { ctx.fillStyle = C.ink3; ctx.fillText("점선: 지금", x0 + gw - 150, y0 + 48); }
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("날짜 (모식)", x0 + gw, y0 + gh + 28);
    const ov = overlap(fp, bp) / BASE, food = ov * hab, pop = food * pest * mite * heat;
    const set = (sel, txt, v) => { const el = $(sel); el.textContent = txt; el.className = sel.slice(1) + (v < 0.8 ? " bad" : v > 0.97 ? " good" : ""); };
    set(".n1", `${Math.round(ov * 100)} %`, ov);
    set(".n2", `${Math.round(food * 100)}`, food);
    set(".n3", `${Math.round(pop * 100)}`, pop);
  }
  const bind = (sel, o) => $(sel).addEventListener("input", () => { $(o).textContent = (+$(sel).value).toFixed(1); draw(); });
  bind(".dt", ".t-out"); bind(".sf", ".f-out"); bind(".sb", ".b-out");
  root.querySelectorAll(".c2-stress input").forEach((c) => c.addEventListener("change", draw));
  if (/[?&]demo\b/.test(location.search)) { $(".dt").value = 2; $(".t-out").textContent = "2.0"; }
  draw();
})();
