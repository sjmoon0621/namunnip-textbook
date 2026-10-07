/* 카드: 공기 중 CO₂는 왜 톱니 모양으로 오르고, 사람이 내보낸 CO₂는 얼마나 남을까? — NOAA 마우나로아 + Global Carbon Budget 배출량 */
(() => {
  const root = document.getElementById("card-clim-keeling");
  if (!root || !window.NMKeeling) return;
  const { C, F, fit, axes } = NM;
  const D = NMKeeling, $ = (s) => root.querySelector(s);
  const PPM = 2.124;   // 1 ppm CO₂ = 2.124 GtC
  const N = D.avg.length;
  const tOf = (i) => D.y0 + (D.m0 - 1 + i + 0.5) / 12;
  const yLast = Math.floor(tOf(N - 1));
  // 연평균 (1월–12월이 다 있는 해)
  const ann = {};
  for (let i = 0; i < N; i++) {
    const y = D.y0 + Math.floor((D.m0 - 1 + i) / 12);
    (ann[y] = ann[y] || []).push(D.avg[i]);
  }
  const AM = {};
  Object.keys(ann).forEach((y) => { if (ann[y].length === 12) AM[y] = ann[y].reduce((s, v) => s + v, 0) / 12; });
  const GR = {};
  Object.keys(AM).forEach((y) => { if (AM[y - 1] !== undefined) GR[y] = AM[y] - AM[y - 1]; });
  const EM = {};
  D.fos.forEach((v, k) => { EM[D.eY0 + k] = (v + D.luc[k]) / PPM; });
  const gY = Object.keys(GR).map(Number), G0 = Math.min(...gY), G1 = Math.max(...gY);
  const COL = { co2: "#2f62a8", des: C.ink, em: "#d9b8a8", gr: "#c4462f", sel: "rgba(116,171,102,.16)" };

  let zoom = false, seas = true;
  const a = fit($(".kl-ts"), () => drawTS()), b = fit($(".kl-bud"), () => drawBud());
  const win = () => { const s = +$(".ws").value, L = +$(".wl").value; return [s, Math.min(s + L - 1, G1)]; };

  function drawTS() {
    const { ctx } = a, { w, h } = a.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 40, y0: 22, w: w - 52, h: h - 50 };
    const t0 = zoom ? yLast - 3 : 1958, t1 = zoom ? tOf(N - 1) + 0.2 : yLast + 1;
    const i0 = zoom ? D.avg.findIndex((_, i) => tOf(i) >= t0) : 0;
    let lo = 1e9, hi = -1e9;
    for (let i = i0; i < N; i++) { lo = Math.min(lo, D.avg[i]); hi = Math.max(hi, D.avg[i]); }
    lo = Math.floor(lo / (zoom ? 2 : 20)) * (zoom ? 2 : 20); hi = Math.ceil(hi / (zoom ? 2 : 20)) * (zoom ? 2 : 20);
    const X = (t) => box.x0 + (t - t0) / (t1 - t0) * box.w, Y = (v) => box.y0 + (hi - v) / (hi - lo) * box.h;
    const xt = zoom ? [0, 1, 2, 3].map((k) => [yLast - 3 + k, String(yLast - 3 + k)]) : [1960, 1980, 2000, 2020].map((y) => [y, String(y)]);
    const st = zoom ? 2 : 20, yt = [];
    for (let v = lo; v <= hi + 1e-6; v += st) yt.push([v, String(v)]);
    axes(ctx, { ...box, X, Y, xt, yt, ylabel: "CO₂ 농도 (ppm, 마우나로아 월평균)" });
    if (!zoom) {
      const [s, e] = win();
      ctx.fillStyle = COL.sel; ctx.fillRect(X(s), box.y0, X(e + 1) - X(s), box.h);
    }
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    if (seas || zoom) {
      ctx.strokeStyle = COL.co2; ctx.lineWidth = zoom ? 1.6 : 1; ctx.beginPath();
      for (let i = i0; i < N; i++) { const p = [X(tOf(i)), Y(D.avg[i])]; i === i0 ? ctx.moveTo(...p) : ctx.lineTo(...p); }
      ctx.stroke();
    }
    ctx.strokeStyle = COL.des; ctx.lineWidth = seas && !zoom ? 1.4 : 2; ctx.setLineDash(zoom ? [4, 3] : []); ctx.beginPath();
    for (let i = i0; i < N; i++) { const p = [X(tOf(i)), Y(D.des[i])]; i === i0 ? ctx.moveTo(...p) : ctx.lineTo(...p); }
    ctx.stroke(); ctx.setLineDash([]);
    if (zoom) {
      ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
      for (let i = i0; i < N; i++) {
        ctx.fillStyle = COL.co2; ctx.beginPath(); ctx.arc(X(tOf(i)), Y(D.avg[i]), 2.2, 0, Math.PI * 2); ctx.fill();
        const m = (D.m0 - 1 + i) % 12 + 1;
        if (m === 5 || m === 9) { ctx.fillStyle = C.ink2; ctx.fillText(m + "월", X(tOf(i)), Y(D.avg[i]) + (m === 5 ? -8 : 15)); }
      }
    }
    ctx.restore();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    const L = [[COL.co2, "월평균", seas || zoom], [COL.des, "계절 변동을 뺀 값", true]];
    let ly = box.y0 + 12;
    L.forEach(([c, t, on]) => { if (!on) return; ctx.fillStyle = c; ctx.fillRect(box.x0 + 8, ly - 4, 14, 2.4); ctx.fillStyle = C.ink2; ctx.fillText(t, box.x0 + 28, ly); ly += 14; });
  }

  function drawBud() {
    const { ctx } = b, { w, h } = b.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 40, y0: 46, w: w - 52, h: h - 74 }, hi = 6;
    const X = (y) => box.x0 + (y - 1959) / (G1 + 1 - 1959) * box.w, Y = (v) => box.y0 + (hi - v) / hi * box.h;
    axes(ctx, { ...box, X, Y, xt: [1960, 1980, 2000, 2020].map((y) => [y + 0.5, String(y)]), yt: [0, 2, 4, 6].map((v) => [v, String(v)]), ylabel: "한 해 동안 (ppm/년)" });
    const [s, e] = win();
    ctx.fillStyle = COL.sel; ctx.fillRect(X(s), box.y0, X(e + 1) - X(s), box.h);
    const bw = Math.max(1.5, box.w / (G1 + 1 - 1959) - 1);
    for (let y = 1959; y <= G1; y++) {
      if (EM[y] !== undefined) { ctx.fillStyle = COL.em; ctx.fillRect(X(y) + 0.5, Y(EM[y]), bw, Y(0) - Y(EM[y])); }
    }
    for (let y = 1960; y <= G1; y++) {
      if (GR[y] === undefined) continue;
      ctx.fillStyle = COL.gr; ctx.globalAlpha = y >= s && y <= e ? 1 : 0.55;
      const x = X(y) + 0.5 + bw * 0.2, ww = bw * 0.6;
      ctx.fillRect(x, Y(GR[y]), ww, Y(0) - Y(GR[y]));
    }
    ctx.globalAlpha = 1;
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = COL.em; ctx.fillRect(box.x0, 10, 12, 8); ctx.fillStyle = C.ink2; ctx.fillText("사람이 내보낸 양 (ppm 환산)", box.x0 + 16, 18);
    const x2 = box.x0 + Math.min(190, box.w * 0.55);
    ctx.fillStyle = COL.gr; ctx.fillRect(x2, 10, 12, 8); ctx.fillStyle = C.ink2; ctx.fillText("공기 중 실제 증가량", x2 + 16, 18);
  }

  function lin(ts, vs) {
    const n = ts.length, mt = ts.reduce((p, v) => p + v, 0) / n, mv = vs.reduce((p, v) => p + v, 0) / n;
    let sxy = 0, sxx = 0; ts.forEach((t, k) => { sxy += (t - mt) * (vs[k] - mv); sxx += (t - mt) ** 2; });
    return sxy / sxx;
  }

  function update() {
    const [s, e] = win();
    $(".ws-out").textContent = `${s}–${e}`;
    $(".wl-out").textContent = String(e - s + 1);
    const ts = [], vs = [];
    for (let i = 0; i < N; i++) { const t = tOf(i); if (t >= s && t < e + 1) { ts.push(t); vs.push(D.des[i]); } }
    const rate = lin(ts, vs);
    // 계절 진폭: 해마다 (최댓값 − 최솟값)의 평균
    const amps = [];
    for (let y = s; y <= e; y++) if (ann[y] && ann[y].length === 12) {
      const lin0 = ann[y].map((v, k) => v - rate * k / 12);
      amps.push(Math.max(...lin0) - Math.min(...lin0));
    }
    const amp = amps.reduce((p, v) => p + v, 0) / amps.length;
    let sg = 0, se = 0, n = 0;
    for (let y = s; y <= e; y++) if (GR[y] !== undefined && EM[y] !== undefined) { sg += GR[y]; se += EM[y]; n++; }
    $(".n-r").textContent = `${rate.toFixed(2)} ppm/년`;
    $(".n-a").textContent = amps.length ? `${amp.toFixed(1)} ppm` : "—";
    $(".n-e").textContent = n ? `${(se / n).toFixed(2)} ppm/년` : "자료 없음";
    $(".n-f").textContent = n ? `${Math.round(sg / se * 100)} %` : "—";
    const last = D.avg[N - 1], lm = (D.m0 - 1 + N - 1) % 12 + 1;
    $(".verdict").textContent = n
      ? `${s}–${e}년에 사람은 해마다 평균 ${(se / n * PPM).toFixed(1)} GtC(약 ${(se / n).toFixed(1)} ppm)를 내보냈고, 공기 중 CO₂는 해마다 ${(sg / n).toFixed(1)} ppm 늘었습니다. 나머지 ${Math.round(100 - sg / se * 100)} %는 바다와 육상 생태계가 흡수했습니다. 가장 최근 값은 ${yLast}년 ${lm}월 ${last.toFixed(1)} ppm입니다.`
      : "배출량 자료는 2024년까지입니다. 구간을 앞으로 옮겨 보세요.";
    drawTS(); drawBud();
  }

  $(".views").addEventListener("click", (ev) => {
    const bt = ev.target.closest("[data-v]"); if (!bt) return;
    const v = bt.dataset.v;
    if (v === "zoom") zoom = !zoom;
    if (v === "seas") seas = !seas;
    $("[data-v=zoom]").setAttribute("aria-pressed", String(zoom));
    $("[data-v=seas]").setAttribute("aria-pressed", String(seas));
    update();
  });
  $(".ws").max = String(G1 - 4);
  root.querySelectorAll(".ws, .wl").forEach((el) => el.addEventListener("input", update));
  update();
  if (/[?&]demo\b/.test(location.search)) { $(".ws").value = "2014"; update(); }
})();
