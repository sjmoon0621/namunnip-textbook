/* 공용 가상 실험 도구 window.NMLab — 측정값 만들기, 기록 표, 통계, 직선 맞춤, 오차 막대 그래프.
   실험 카드의 블록 머리 scripts에서 카드 스크립트보다 먼저 적는다: ["js/lib/lab.js", "js/cards/…"] */
window.NMLab = (() => {
  "use strict";
  const { C, F, axes } = NM;

  /* 표준 정규 분포 난수 (Box–Muller) */
  function gauss() {
    let u = 0, v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /* 기기 분해능 res에 맞춰 반올림 (res = 0.1 → 소수 첫째 자리) */
  const snap = (x, res) => (res ? Math.round(x / res) * res : x);
  const digits = (res) => (res && res < 1 ? Math.max(0, Math.round(-Math.log10(res) + 0.49)) : 0);
  const fmt = (x, res) => (Number.isFinite(x) ? x.toFixed(digits(res)) : "—");

  /* 참값 truth를 잰 한 번의 측정값.
     o: { sd: 우연 오차(표준편차), rel: 상대 우연 오차, bias: 계통 오차, res: 분해능 } */
  function measure(truth, o = {}) {
    const sd = (o.sd || 0) + Math.abs(truth) * (o.rel || 0);
    return snap(truth + (o.bias || 0) + sd * gauss(), o.res || 0);
  }

  /* 평균, 표본 표준편차(n−1), 평균의 표준오차 */
  function stats(xs) {
    const a = xs.filter(Number.isFinite), n = a.length;
    if (!n) return { n: 0, mean: NaN, sd: NaN, se: NaN };
    const mean = a.reduce((s, x) => s + x, 0) / n;
    const sd = n > 1 ? Math.sqrt(a.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1)) : NaN;
    return { n, mean, sd, se: sd / Math.sqrt(n) };
  }

  /* 최소제곱 직선 y = a·x + b. sa·sb는 기울기·절편의 표준오차, r2는 결정계수.
     through0이면 원점을 지나는 y = a·x로 맞춘다 */
  function linfit(xs, ys, through0 = false) {
    const p = xs.map((x, i) => [x, ys[i]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y)), n = p.length;
    if (n < 2) return null;
    let a, b = 0, dof, sa, sb = 0;
    if (through0) {
      const sxx = p.reduce((s, [x]) => s + x * x, 0);
      a = p.reduce((s, [x, y]) => s + x * y, 0) / sxx; dof = n - 1;
      const s2 = p.reduce((s, [x, y]) => s + (y - a * x) ** 2, 0) / Math.max(dof, 1);
      sa = Math.sqrt(s2 / sxx);
    } else {
      const mx = p.reduce((s, [x]) => s + x, 0) / n, my = p.reduce((s, [, y]) => s + y, 0) / n;
      const sxx = p.reduce((s, [x]) => s + (x - mx) ** 2, 0);
      if (!sxx) return null;
      a = p.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0) / sxx; b = my - a * mx; dof = n - 2;
      const s2 = dof > 0 ? p.reduce((s, [x, y]) => s + (y - a * x - b) ** 2, 0) / dof : NaN;
      sa = Math.sqrt(s2 / sxx); sb = Math.sqrt(s2 * (1 / n + mx * mx / sxx));
    }
    const my = p.reduce((s, [, y]) => s + y, 0) / n;
    const sst = p.reduce((s, [, y]) => s + (y - my) ** 2, 0), sse = p.reduce((s, [x, y]) => s + (y - a * x - b) ** 2, 0);
    return { a, b, sa, sb, r2: sst ? 1 - sse / sst : 1, n };
  }

  /* 기록 표. host 안에 표를 그리고 행 추가·지우기를 관리한다.
     cols: [{ key, label, res }], onchange(rows)는 행이 바뀔 때마다 불린다 */
  function table(host, cols, onchange = () => {}) {
    const rows = [];
    host.classList.add("lab-tbl");
    const render = (quiet) => {
      host.innerHTML = `<table><thead><tr><th>#</th>${cols.map((c) => `<th>${c.label}</th>`).join("")}<th></th></tr></thead><tbody>${
        rows.length ? rows.map((r, i) => `<tr><td>${i + 1}</td>${cols.map((c) => `<td>${typeof r[c.key] === "number" ? fmt(r[c.key], c.res) : r[c.key] ?? "—"}</td>`).join("")}<td><button type="button" class="lab-del" data-i="${i}" aria-label="${i + 1}번째 기록 지우기">×</button></td></tr>`).join("")
          : `<tr><td colspan="${cols.length + 2}" class="lab-empty">아직 기록이 없습니다</td></tr>`}</tbody></table>`;
      if (!quiet) onchange(rows);
    };
    host.addEventListener("click", (e) => {
      const b = e.target.closest(".lab-del"); if (!b) return;
      rows.splice(+b.dataset.i, 1); render();
    });
    render(true);   // 처음 그릴 때는 onchange를 부르지 않는다 (카드의 캔버스가 아직 준비 전일 수 있음)
    return {
      rows,
      add(r) { rows.push(r); render(); host.scrollTop = host.scrollHeight; },
      clear() { rows.length = 0; render(); },
      col: (k) => rows.map((r) => r[k]),
    };
  }

  /* 보기 좋은 눈금: [min, max]를 n칸 안팎으로 */
  function ticks(min, max, n = 5) {
    const span = max - min || 1, raw = span / n, mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    const out = [];
    for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) out.push(+v.toPrecision(12));
    return out;
  }
  const tlab = (v) => (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v) ? v.toExponential(1) : String(+v.toPrecision(4)));

  /* 오차 막대가 있는 산점도 + 맞춤선.
     box: {x0, y0, w, h}. o: { pts: [{x, y, ex, ey}], fit: {a, b}, model: (x)=>y (이론 곡선),
          xr: [min,max], yr: [min,max] (없으면 자료로 정함), xlabel, ylabel, color } */
  function plot(ctx, box, o) {
    const pts = o.pts || [], col = o.color || C.forest;
    const ext = (k, e) => {
      const v = pts.flatMap((p) => [p[k] - (p[e] || 0), p[k] + (p[e] || 0)]).filter(Number.isFinite);
      if (!v.length) return [0, 1];
      let lo = Math.min(...v), hi = Math.max(...v);
      if (lo > 0 && lo < (hi - lo) * 0.6) lo = 0;   // 원점이 가까우면 0부터
      const pad = (hi - lo || Math.abs(hi) || 1) * 0.08;
      return [lo === 0 ? 0 : lo - pad, hi + pad];
    };
    const [x0v, x1v] = o.xr || ext("x", "ex"), [y0v, y1v] = o.yr || ext("y", "ey");
    const X = (v) => box.x0 + (v - x0v) / (x1v - x0v) * box.w, Y = (v) => box.y0 + box.h - (v - y0v) / (y1v - y0v) * box.h;
    axes(ctx, { ...box, X, Y, xt: ticks(x0v, x1v).map((v) => [v, tlab(v)]), yt: ticks(y0v, y1v, 4).map((v) => [v, tlab(v)]), xlabel: o.xlabel, ylabel: o.ylabel });
    ctx.save();
    ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    const line = (f, style, dash) => {
      ctx.strokeStyle = style; ctx.lineWidth = 1.6; ctx.setLineDash(dash || []); ctx.beginPath();
      for (let i = 0; i <= 60; i++) { const xv = x0v + (x1v - x0v) * i / 60, yv = f(xv); i ? ctx.lineTo(X(xv), Y(yv)) : ctx.moveTo(X(xv), Y(yv)); }
      ctx.stroke(); ctx.setLineDash([]);
    };
    if (o.model) line(o.model, C.ink3, [4, 4]);
    if (o.fit) line((x) => o.fit.a * x + (o.fit.b || 0), C.warn);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.2;
    for (const p of pts) {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
      const px = X(p.x), py = Y(p.y);
      if (p.ey) { ctx.beginPath(); ctx.moveTo(px, Y(p.y - p.ey)); ctx.lineTo(px, Y(p.y + p.ey)); ctx.moveTo(px - 3, Y(p.y - p.ey)); ctx.lineTo(px + 3, Y(p.y - p.ey)); ctx.moveTo(px - 3, Y(p.y + p.ey)); ctx.lineTo(px + 3, Y(p.y + p.ey)); ctx.stroke(); }
      if (p.ex) { ctx.beginPath(); ctx.moveTo(X(p.x - p.ex), py); ctx.lineTo(X(p.x + p.ex), py); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return { X, Y, xr: [x0v, x1v], yr: [y0v, y1v] };
  }

  /* 히스토그램 (반복 측정값의 분포). 반환: 칸 너비 */
  function hist(ctx, box, xs, o = {}) {
    const a = xs.filter(Number.isFinite);
    const [lo, hi] = o.xr || (a.length ? [Math.min(...a), Math.max(...a)] : [0, 1]);
    const nb = o.bins || Math.max(5, Math.min(15, Math.round(Math.sqrt(a.length) * 1.5)));
    const bw = (hi - lo || 1) / nb, cnt = new Array(nb).fill(0);
    a.forEach((x) => { cnt[Math.min(nb - 1, Math.max(0, Math.floor((x - lo) / bw)))]++; });
    const top = Math.max(1, ...cnt);
    const X = (v) => box.x0 + (v - lo) / (hi - lo || 1) * box.w;
    axes(ctx, { ...box, X, Y: (v) => box.y0 + box.h - v / top * box.h, xt: ticks(lo, hi).map((v) => [v, tlab(v)]), yt: ticks(0, top, 3).filter((v) => v === Math.round(v)).map((v) => [v, String(v)]), xlabel: o.xlabel, ylabel: o.ylabel || "횟수" });
    ctx.fillStyle = o.color || C.sprout; ctx.strokeStyle = C.forest;
    cnt.forEach((c, i) => { if (!c) return; const x = X(lo + i * bw), w = X(lo + (i + 1) * bw) - x, h = c / top * box.h; ctx.fillRect(x + 1, box.y0 + box.h - h, w - 2, h); ctx.strokeRect(x + 1.5, box.y0 + box.h - h + .5, w - 3, h - 1); });
    return { X, bw };
  }

  /* 주소에 ?demo가 있으면 카드가 예시 기록을 미리 채운다 (캡처·점검용) */
  const demo = /[?&]demo\b/.test(location.search);

  return { demo, gauss, snap, fmt, measure, stats, linfit, table, ticks, plot, hist };
})();
