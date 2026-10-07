/* 카드: 지진 4500개가 든 표에서 어떻게 탐구 문제를 찾을까? — USGS 지진 목록 거르기·묶기·로그 눈금 (js/cards/is1/quake-data.js 사용) */
(() => {
  const root = document.getElementById("card-fusi-quake");
  if (!root || !window.NMQuake) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const Q = NMQuake.q;   /* [경도, 위도, 깊이 km, 규모, 연도] */
  const REG = {
    all: { nm: "전 세계", f: () => true },
    jp: { nm: "일본 주변", f: (e) => e[0] >= 128 && e[0] <= 150 && e[1] >= 26 && e[1] <= 46 },
    tonga: { nm: "통가·피지", f: (e) => (e[0] >= 172 || e[0] <= -172) && e[1] >= -32 && e[1] <= -12 },
    sa: { nm: "남아메리카 서해안", f: (e) => e[0] >= -82 && e[0] <= -62 && e[1] >= -45 && e[1] <= 5 },
    mh: { nm: "지중해~히말라야", f: (e) => e[0] >= -10 && e[0] <= 100 && e[1] >= 25 && e[1] <= 45 },
  };
  let rk = "all", vk = "mag";
  const lg = $(".lg");
  const view = fit($("canvas"), () => draw());

  const bins = (xs, lo, w, n) => { const c = new Array(n).fill(0); xs.forEach((x) => { const i = Math.floor((x - lo) / w + 1e-9); if (i >= 0 && i < n) c[i]++; }); return c; };
  function grFit(ms) {
    const c = bins(ms, 5.5, 0.2, 14), xs = [], ys = [];
    c.forEach((n, i) => { if (n > 0) { xs.push(5.6 + i * 0.2); ys.push(Math.log10(n)); } });
    if (xs.length < 4) return null;
    const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
    let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; });
    return { b: -sxy / sxx, a: my + (sxy / sxx) * -mx };
  }

  function bars(ctx, box, counts, lo, w, o) {
    const log = lg.checked, top = Math.max(1, ...counts);
    const yv = (n) => (log ? (n > 0 ? Math.log10(n) : -0.3) : n), yTop = log ? Math.ceil(Math.log10(top) + 0.05) : top * 1.1;
    const yBot = log ? 0 : 0;
    const X = (v) => box.x0 + (v - lo) / (counts.length * w) * box.w, Y = (v) => box.y0 + box.h - (v - yBot) / (yTop - yBot) * box.h;
    const yt = log ? Array.from({ length: yTop + 1 }, (_, i) => [i, String(10 ** i)]) : NMLab.ticks(0, yTop, 4).map((v) => [v, String(v)]);
    axes(ctx, { ...box, X, Y, xt: o.xt, yt, xlabel: o.xlabel, ylabel: log ? "지진 수 (로그 눈금)" : "지진 수" });
    ctx.fillStyle = C.sprout; ctx.strokeStyle = C.forest;
    counts.forEach((n, i) => {
      if (!n) return;
      const x = X(lo + i * w), x2 = X(lo + (i + 1) * w), y = Y(Math.max(yBot, yv(n)));
      ctx.fillRect(x + 1, y, x2 - x - 2, box.y0 + box.h - y); ctx.strokeRect(x + 1.5, y + 0.5, x2 - x - 3, box.y0 + box.h - y - 1);
    });
    return { X, Y };
  }

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const sub = Q.filter(REG[rk].f), box = { x0: 46, y0: 22, w: w - 58, h: h - 58 };
    const ms = sub.map((e) => e[3]), ds = sub.map((e) => e[2]);
    const gr = grFit(ms), deep = sub.filter((e) => e[2] >= 300).length;
    let obs = "";
    if (vk === "mag") {
      const c = bins(ms, 5.5, 0.2, 14);
      const g = bars(ctx, box, c, 5.5, 0.2, { xt: [5.5, 6, 6.5, 7, 7.5, 8, 8.5].map((v) => [v, v.toFixed(1)]), xlabel: "규모" });
      if (gr && lg.checked) {
        ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath();
        ctx.moveTo(g.X(5.6), g.Y(gr.a - gr.b * 5.6)); ctx.lineTo(g.X(8.2), g.Y(gr.a - gr.b * 8.2)); ctx.stroke();
      }
      const big = ms.filter((m) => m >= 7).length;
      obs = `${REG[rk].nm}: 규모 5.5~5.7이 ${c[0]}건, 7.0 이상은 ${big}건입니다. ${lg.checked ? "로그 눈금에서 막대 끝이 거의 직선을 이룹니다." : "로그 눈금으로 바꾸면 막대 끝의 모양이 어떻게 보일까요?"}`;
    } else if (vk === "depth") {
      const c = bins(ds, 0, 25, 28);
      bars(ctx, box, c, 0, 25, { xt: [0, 100, 200, 300, 400, 500, 600, 700].map((v) => [v, String(v)]), xlabel: "진원 깊이 (km)" });
      const mid = sub.filter((e) => e[2] >= 70 && e[2] < 300).length;
      obs = `${REG[rk].nm}: 70 km보다 얕은 지진 ${sub.length - mid - deep}건, 70~300 km ${mid}건, 300 km 이상 ${deep}건입니다.`;
    } else if (vk === "year") {
      const c = bins(sub.map((e) => e[4]), 2015, 1, 10);
      bars(ctx, box, c, 2015, 1, { xt: [2015, 2017, 2019, 2021, 2023].map((v) => [v + 0.5, String(v)]), xlabel: "연도" });
      const mn = Math.min(...c), mx = Math.max(...c);
      obs = `${REG[rk].nm}: 해마다 ${mn}~${mx}건입니다. 해마다의 차이는 우연한 들쭉날쭉일까요, 추세일까요? 마지막 해는 왜 적을까요?`;
    } else {
      const log = lg.checked;
      const X = (d) => box.x0 + d / 700 * box.w, Y = (m) => box.y0 + box.h - (m - 5.4) / 3.1 * box.h;
      axes(ctx, { ...box, X, Y, xt: [0, 100, 200, 300, 400, 500, 600, 700].map((v) => [v, String(v)]), yt: [5.5, 6, 6.5, 7, 7.5, 8, 8.5].map((v) => [v, v.toFixed(1)]), xlabel: "진원 깊이 (km)", ylabel: "규모" });
      ctx.fillStyle = C.forest; ctx.globalAlpha = sub.length > 1500 ? 0.25 : 0.5;
      sub.forEach((e) => { ctx.beginPath(); ctx.arc(X(e[2]), Y(e[3]), 2, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1;
      const cnt = (a, b) => sub.filter((e) => e[2] >= a && e[2] < b);
      const m1 = cnt(0, 70), m2 = cnt(300, 800), avg = (s) => (s.length ? (s.reduce((t, e) => t + e[3], 0) / s.length).toFixed(2) : "—");
      obs = `${REG[rk].nm}: 평균 규모는 얕은 지진(70 km 미만) ${avg(m1)}, 깊은 지진(300 km 이상) ${avg(m2)}입니다.${log ? " (이 보기에는 로그 눈금이 쓰이지 않습니다)" : ""}`;
    }
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
    ctx.fillText(`${REG[rk].nm} · ${sub.length}건`, box.x0 + box.w, box.y0 - 8);
    $(".qk-obs").textContent = obs;
    $(".n").textContent = `${sub.length}건`;
    $(".deep").textContent = `${deep}건 (${(deep / Math.max(1, sub.length) * 100).toFixed(0)} %)`;
    $(".gr").textContent = gr ? `× 1/${(10 ** gr.b).toFixed(1)}` : "자료 부족";
  }

  const sel = (grp, attr, set) => $(grp).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    set(b.dataset[attr]); $(grp).querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw();
  });
  sel(".rsel", "r", (x) => { rk = x; });
  sel(".vsel", "v", (x) => { vk = x; });
  lg.addEventListener("change", draw);
  if (/[?&]demo\b/.test(location.search)) lg.checked = true;
  draw();
})();
