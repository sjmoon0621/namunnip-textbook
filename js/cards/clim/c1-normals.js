/* 카드: "평년보다 덥다"는 무슨 뜻일까? — 서울 일평균 기온(ERA5)으로 날씨와 기후(평년값) 비교 */
(() => {
  const root = document.getElementById("card-clim-normals");
  if (!root || !window.NMSeoulDay) return;
  const { C, F, fit, axes } = NM;
  const D = NMSeoulDay, $ = (s) => root.querySelector(s);
  const Y0 = D.y0, Y1 = D.y0 + D.t.length - 1;
  // 윤년의 2월 29일을 빼고 365일로 맞춘다
  const days = D.t.map((a) => (a.length === 366 ? a.slice(0, 59).concat(a.slice(60)) : a).map((v) => v / 10));
  const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], MS = [];
  MD.reduce((s, d, k) => { MS[k] = s; return s + d; }, 0);
  const dateOf = (i) => { let m = 0; while (m < 11 && i >= MS[m + 1]) m++; return `${m + 1}월 ${i - MS[m] + 1}일`; };
  const annual = days.map((a) => a.reduce((s, v) => s + v, 0) / a.length);

  // 평년값: 기간의 날짜별 평균과 표준 편차를 ±15일 이동 평균으로 매끄럽게
  function normals(a, b) {
    const n = b - a + 1, mu = new Array(365).fill(0), sd = new Array(365).fill(0);
    for (let y = a; y <= b; y++) days[y - Y0].forEach((v, i) => { mu[i] += v / n; });
    for (let y = a; y <= b; y++) days[y - Y0].forEach((v, i) => { sd[i] += (v - mu[i]) ** 2 / (n - 1); });
    const sm = (arr) => arr.map((_, i) => { let s = 0; for (let k = -15; k <= 15; k++) s += arr[(i + k + 365) % 365]; return s / 31; });
    const m2 = sm(mu), s2 = sm(sd).map(Math.sqrt);
    let am = 0; for (let y = a; y <= b; y++) am += annual[y - Y0] / n;
    return { mu: m2, sd: s2, am, a, b };
  }
  const NORM = { new: normals(1991, 2020), old: normals(1961, 1990) };
  let per = "new";
  const a = fit($(".nm-day"), () => drawDay()), b = fit($(".nm-yr"), () => drawYr());
  const COL = { band: "rgba(116,171,102,.22)", band2: "rgba(116,171,102,.10)", mu: C.forest, hot: "#c4462f", cold: "#2f62a8", obs: C.ink2, old: "#9a8f7a" };

  function drawDay() {
    const { ctx } = a, { w, h } = a.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const N = NORM[per], yr = +$(".yr").value, di = +$(".dy").value, T = days[yr - Y0];
    const box = { x0: 34, y0: 22, w: w - 44, h: h - 48 }, lo = -20, hi = 35;
    const X = (i) => box.x0 + (i + 0.5) / 365 * box.w, Y = (v) => box.y0 + (hi - v) / (hi - lo) * box.h;
    axes(ctx, { ...box, X, Y, xt: [0, 2, 4, 6, 8, 10].map((m) => [MS[m], `${m + 1}월`]), yt: [-20, -10, 0, 10, 20, 30].map((v) => [v, String(v)]), ylabel: `서울 일평균 기온 (°C) · ${yr}년` });
    // ±2σ, ±1σ 띠
    [[2, COL.band2], [1, COL.band]].forEach(([k, c]) => {
      ctx.fillStyle = c; ctx.beginPath();
      for (let i = 0; i < 365; i++) { const p = [X(i), Y(N.mu[i] + k * N.sd[i])]; i ? ctx.lineTo(...p) : ctx.moveTo(...p); }
      for (let i = 364; i >= 0; i--) ctx.lineTo(X(i), Y(N.mu[i] - k * N.sd[i]));
      ctx.closePath(); ctx.fill();
    });
    ctx.strokeStyle = COL.mu; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i < 365; i++) { const p = [X(i), Y(N.mu[i])]; i ? ctx.lineTo(...p) : ctx.moveTo(...p); }
    ctx.stroke();
    // 그해의 날씨
    ctx.strokeStyle = "rgba(93,93,97,.55)"; ctx.lineWidth = 1; ctx.beginPath();
    T.forEach((v, i) => { const p = [X(i), Y(v)]; i ? ctx.lineTo(...p) : ctx.moveTo(...p); }); ctx.stroke();
    T.forEach((v, i) => {
      const z = (v - N.mu[i]) / N.sd[i];
      if (Math.abs(z) < 2) return;
      ctx.fillStyle = z > 0 ? COL.hot : COL.cold; ctx.beginPath(); ctx.arc(X(i), Y(v), 2.2, 0, Math.PI * 2); ctx.fill();
    });
    // 고른 날
    const x = X(di);
    ctx.strokeStyle = C.ink; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x, box.y0); ctx.lineTo(x, box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, Y(T[di]), 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = COL.mu; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 6, Y(N.mu[di])); ctx.lineTo(x + 6, Y(N.mu[di])); ctx.stroke();
    // 범례
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    const lx = box.x0 + box.w - 150, ly = box.y0 + box.h - 44;
    ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(lx - 4, ly - 11, 152, 50);
    ctx.fillStyle = COL.mu; ctx.fillRect(lx, ly - 4, 14, 2.5); ctx.fillStyle = C.ink2; ctx.fillText(`평년값 ${N.a}–${N.b}`, lx + 20, ly);
    ctx.fillStyle = COL.band; ctx.fillRect(lx, ly + 8, 14, 8); ctx.fillStyle = C.ink2; ctx.fillText("평년 ±1σ (연한 띠 ±2σ)", lx + 20, ly + 15);
    ctx.fillStyle = COL.hot; ctx.beginPath(); ctx.arc(lx + 4, ly + 27, 2.5, 0, 7); ctx.fill();
    ctx.fillStyle = COL.cold; ctx.beginPath(); ctx.arc(lx + 10, ly + 27, 2.5, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.fillText("±2σ 밖의 날", lx + 20, ly + 30);
  }

  function drawYr() {
    const { ctx } = b, { w, h } = b.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const yr = +$(".yr").value;
    const box = { x0: 34, y0: 22, w: w - 44, h: h - 48 }, lo = 10.5, hi = 15;
    const X = (y) => box.x0 + (y - Y0 + 0.5) / (Y1 - Y0 + 1) * box.w, Y = (v) => box.y0 + (hi - v) / (hi - lo) * box.h;
    axes(ctx, { ...box, X, Y, xt: [1970, 1990, 2010].map((y) => [y, String(y)]), yt: [11, 12, 13, 14, 15].map((v) => [v, String(v)]), ylabel: "서울 연평균 기온 (°C)" });
    ["old", "new"].forEach((k) => {
      const N = NORM[k]; ctx.strokeStyle = k === "new" ? COL.mu : COL.old; ctx.lineWidth = k === per ? 3 : 1.5;
      ctx.beginPath(); ctx.moveTo(X(N.a - 0.5), Y(N.am)); ctx.lineTo(X(N.b + 0.5), Y(N.am)); ctx.stroke();
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = k === "new" ? COL.mu : COL.old; ctx.textAlign = "center";
      ctx.fillText(`${N.a}–${N.b} 평균 ${N.am.toFixed(1)}`, X((N.a + N.b) / 2), Y(N.am) + (k === "new" ? -36 : 30));
    });
    annual.forEach((v, k) => {
      const y = Y0 + k; ctx.fillStyle = y === yr ? C.ink : "rgba(93,93,97,.55)";
      ctx.beginPath(); ctx.arc(X(y), Y(v), y === yr ? 4 : 2.2, 0, Math.PI * 2); ctx.fill();
    });
  }

  function update() {
    const N = NORM[per], yr = +$(".yr").value, di = +$(".dy").value, T = days[yr - Y0];
    $(".yr-out").textContent = String(yr); $(".dy-out").textContent = dateOf(di);
    const v = T[di], z = (v - N.mu[di]) / N.sd[di];
    $(".n-d").textContent = `${v.toFixed(1)} °C`;
    $(".n-n").textContent = `${N.mu[di].toFixed(1)} ± ${N.sd[di].toFixed(1)} °C`;
    $(".n-z").textContent = `${v - N.mu[di] >= 0 ? "+" : ""}${(v - N.mu[di]).toFixed(1)} °C (${z >= 0 ? "+" : ""}${z.toFixed(1)}σ)`;
    const da = annual[yr - Y0] - N.am;
    $(".n-y").textContent = `${da >= 0 ? "+" : ""}${da.toFixed(2)} °C`;
    let out = 0; T.forEach((x, i) => { if (Math.abs(x - N.mu[i]) > 2 * N.sd[i]) out++; });
    const sdAnn = Math.sqrt(annual.slice(N.a - Y0, N.b - Y0 + 1).reduce((s, x) => s + (x - N.am) ** 2, 0) / (N.b - N.a));
    const meanSd = N.sd.reduce((s, x) => s + x, 0) / 365;
    $(".verdict").textContent = `${yr}년 ${dateOf(di)}은 평년보다 ${Math.abs(v - N.mu[di]).toFixed(1)} °C ${v >= N.mu[di] ? "따뜻" : "추웠"}${v >= N.mu[di] ? "했" : ""}습니다. 이해에 평년 ±2σ를 벗어난 날은 ${out}일입니다. 하루 기온이 평년에서 벗어나는 폭은 평균 ±${meanSd.toFixed(1)} °C(1σ)이지만, 연평균 기온의 해마다 흔들림은 ±${sdAnn.toFixed(2)} °C에 그칩니다. 두 평년값의 차이는 ${(NORM.new.am - NORM.old.am).toFixed(2)} °C입니다.`;
    drawDay(); drawYr();
  }

  $(".per").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-p]"); if (!bt) return;
    per = bt.dataset.p; root.querySelectorAll(".per [data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update();
  });
  $(".yr").min = String(Y0); $(".yr").max = String(Y1);
  root.querySelectorAll(".yr, .dy").forEach((el) => el.addEventListener("input", update));
  update();
  if (/[?&]demo\b/.test(location.search)) { $(".yr").value = "2018"; $(".dy").value = "212"; update(); }
})();
