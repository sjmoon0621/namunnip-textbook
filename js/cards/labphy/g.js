/* 카드: 떨어지는 물체로 g를 몇 % 정확도까지 잴 수 있을까? — 피켓 펜스, 높이별 낙하 시간, 수평 던지기 */
(() => {
  const root = document.getElementById("card-labphy-g");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const G = 9.798;           // 서울 부근 중력 가속도 (참값, 화면에 바로 보이지 않음)
  const D = 0.05;            // 피켓 펜스 띠 간격 5.00 cm
  const NB = 10;             // 띠 개수
  const BALL = 0.025;        // 수평 던지기 공 지름 2.50 cm
  const LAG = 0.012;         // 전자석 남은 자기로 늦게 놓아 주는 시간 (모식값)
  const sZ = $(".z"), sH = $(".h"), sPH = $(".ph"), sRH = $(".H"), cLag = $(".lag");
  let mode = "fence", xKey = "ht2", anim = null;

  const NOTES = {
    fence: "포토게이트 분해능 0.1 ms. 띠가 빛살을 가리기 시작하는 순간마다 시각을 기록합니다. 한 번 떨어뜨리면 띠 사이 구간 9개가 한꺼번에 표에 들어갑니다.",
    drop: "타이머 분해능 1 ms, 높이는 줄자로 1 mm 단위(공 아래 끝부터 접촉판까지). 전자석 전류를 끊는 순간 시작, 접촉판에 닿으면 멈춥니다.",
    proj: "v₀ = 공 지름 2.50 cm ÷ 게이트 가림 시간. R은 먹지 자국을 줄자로 재며, 같은 조건에서도 자국이 ±0.5 cm쯤 흩어집니다. 책상 높이는 공이 게이트를 떠나는 높이입니다.",
  };
  const COLS = {
    fence: [{ key: "k", label: "구간", res: 1 }, { key: "tm", label: "가운데 시각 t (s)", res: 0.00005 }, { key: "dt", label: "Δt (s)", res: 0.0001 }, { key: "v", label: "v (m/s)", res: 0.001 }],
    drop: [{ key: "h", label: "h (m)", res: 0.001 }, { key: "t", label: "t (s)", res: 0.001 }, { key: "t2", label: "t² (s²)", res: 0.0001 }, { key: "sh", label: "√h (√m)", res: 0.001 }],
    proj: [{ key: "h", label: "h (m)", res: 0.001 }, { key: "dt", label: "가림 시간 (s)", res: 0.0001 }, { key: "v0", label: "v₀ (m/s)", res: 0.001 }, { key: "R", label: "R (m)", res: 0.001 }, { key: "y", label: "R²/v₀² (s²)", res: 0.0001 }],
  };
  const tbls = {};
  const app = fit($(".cv-wide"), () => drawApp()), pl = fit($(".cv-plot"), () => drawPlot());
  const host = $(".tbl-host");
  Object.keys(COLS).forEach((k) => {
    const d = document.createElement("div"); d.dataset.t = k; d.hidden = k !== "fence"; host.appendChild(d);
    tbls[k] = L.table(d, COLS[k], () => drawPlot());
  });
  const v0Of = (H) => Math.sqrt(10 / 7 * G * H) * 0.97;   // 굴러 내려온 공: 회전 에너지와 마찰 손실 (참값용)

  /* ---------- 측정 ---------- */
  function measFence() {
    const z = +sZ.value / 100, ts = [];
    for (let k = 0; k < NB; k++) ts.push(Math.sqrt(2 * (z + k * D) / G));
    const tr = ts.map((t) => L.snap(t - ts[0] + 0.00003 * L.gauss(), 0.0001));
    tr[0] = 0;
    const rows = [];
    for (let k = 1; k < NB; k++) {
      const dt = tr[k] - tr[k - 1];
      rows.push({ k, tm: (tr[k] + tr[k - 1]) / 2, dt, v: D / dt });
    }
    return { dur: ts[NB - 1] + 0.05, z, rows };
  }
  function measDrop() {
    const h = L.snap(+sH.value + 0.0008 * L.gauss(), 0.001), tt = Math.sqrt(2 * h / G);
    const t = L.measure(tt + (cLag.checked ? LAG : 0), { sd: 0.0006, res: 0.001 });
    return { dur: tt, h, rows: [{ h, t, t2: t * t, sh: Math.sqrt(h) }] };
  }
  function measProj() {
    const h = L.snap(+sPH.value + 0.001 * L.gauss(), 0.001), v0t = v0Of(+sRH.value / 100) * (1 + 0.006 * L.gauss());
    const dt = L.measure(BALL / v0t, { sd: 0.00004, res: 0.0001 }), v0 = BALL / dt;
    const R = L.measure(v0t * Math.sqrt(2 * h / G), { sd: 0.005, res: 0.001 });
    return { dur: Math.sqrt(2 * h / G), h, v0t, rows: [{ h, dt, v0, R, y: R * R / (v0 * v0) }] };
  }
  const MEAS = { fence: measFence, drop: measDrop, proj: measProj };

  /* ---------- 장치 그림 ---------- */
  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const tt = anim ? anim.el : 0;
    ctx.lineCap = "round";
    if (mode === "fence") drawFence(ctx, w, h, tt);
    else if (mode === "drop") drawDrop(ctx, w, h, tt);
    else drawProj(ctx, w, h, tt);
  }
  function stand(ctx, x, y0, y1) {
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(x - 3, y0, 6, y1 - y0); ctx.fillRect(x - 28, y1 - 6, 56, 6);
  }
  function timerBox(ctx, x, y, big, small) {
    ctx.fillStyle = "#2a2c29"; ctx.fillRect(x, y, 112, 46);
    ctx.fillStyle = "#9be08a"; ctx.font = `600 15px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(big, x + 56, y + 22);
    ctx.fillStyle = "#c9cfc4"; ctx.font = `10px ${F.sans}`; ctx.fillText(small, x + 56, y + 38);
  }
  function drawFence(ctx, w, h, tt) {
    const s = (h - 24) / 0.95, gy = h * 0.62, gx = w * 0.36;
    const z = anim ? anim.z : +sZ.value / 100, fall = anim ? Math.min(0.5 * G * tt * tt, z + NB * D + 0.1) : 0;
    stand(ctx, gx - 70, 10, h - 4);
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(gx - 70, gy - 4, 46, 8);
    // 피켓 펜스: 가장 아래 띠의 아래 끝이 게이트 위 z에서 시작
    const bottom = gy - (z - fall) * s, top = bottom - (NB * D + 0.02) * s;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h - 6); ctx.clip();
    ctx.fillStyle = "rgba(170,205,235,.35)"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.fillRect(gx - 14, top, 28, bottom - top + 0.01 * s); ctx.strokeRect(gx - 14, top, 28, bottom - top + 0.01 * s);
    ctx.fillStyle = "#26272a";
    for (let k = 0; k < NB; k++) { const yb = bottom - k * D * s; ctx.fillRect(gx - 14, yb - 0.025 * s, 28, 0.025 * s); }
    ctx.restore();
    // 게이트 (ㄷ자) 와 빛살
    ctx.fillStyle = C.forest; ctx.fillRect(gx - 26, gy - 9, 8, 18); ctx.fillRect(gx + 18, gy - 9, 8, 18); ctx.fillRect(gx - 26, gy - 9, 52, 4);
    ctx.strokeStyle = C.apple; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(gx - 18, gy + 3); ctx.lineTo(gx + 18, gy + 3); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#e9e7dc"; ctx.fillRect(gx - 40, h - 14, 80, 10);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("완충재", gx + 44, h - 6);
    const rows = tbls.fence.rows, last = rows[rows.length - 1];
    const passed = anim ? Math.max(0, Math.min(NB, Math.floor((fall - z) / D) + 1)) : 0;
    timerBox(ctx, w - 128, 14, last && !anim ? `${last.dt.toFixed(4)} s` : "— s", anim ? `띠 ${passed} / ${NB}` : "마지막 Δt");
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("띠 간격 5.00 cm", w - 128, 82); ctx.fillText("포토게이트", gx + 32, gy + 4);
  }
  function drawDrop(ctx, w, h, tt) {
    const s = (h - 46) / 1.55, top = 22, hh = anim ? anim.h : +sH.value, cx = w * 0.36;
    stand(ctx, cx - 56, 6, h - 4);
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(cx - 56, top - 12, 50, 6);
    ctx.fillStyle = "#c06a3a"; ctx.fillRect(cx - 12, top - 14, 24, 14);
    ctx.strokeStyle = "#7a3b1d"; ctx.lineWidth = 1; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(cx - 12, top - 12 + i * 3); ctx.lineTo(cx + 12, top - 12 + i * 3); ctx.stroke(); }
    const r = 7, fall = anim ? Math.min(0.5 * G * tt * tt, hh) : 0;
    const by = top + r + fall * s, padY = top + 2 * r + hh * s;
    ctx.fillStyle = "#6f7378"; ctx.beginPath(); ctx.arc(cx, by, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#b9a46a"; ctx.fillRect(cx - 22, padY, 44, 5);
    ctx.fillStyle = C.ink3; ctx.fillRect(cx - 30, padY + 5, 60, 3);
    // 줄자
    const rx = cx + 34; ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(rx, top + 2 * r); ctx.lineTo(rx, padY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx - 4, top + 2 * r); ctx.lineTo(rx + 4, top + 2 * r); ctx.moveTo(rx - 4, padY); ctx.lineTo(rx + 4, padY); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`h = ${hh.toFixed(2)} m`, rx + 8, top + 2 * r + hh * s / 2 + 4);
    ctx.font = `11px ${F.sans}`; ctx.fillText("전자석", cx + 18, top - 3);
    const rows = tbls.drop.rows, last = rows[rows.length - 1];
    timerBox(ctx, w - 128, 14, anim ? `${Math.min(tt, anim.dur).toFixed(3)} s` : last ? `${last.t.toFixed(3)} s` : "0.000 s", "타이머 (1 ms)");
  }
  function drawProj(ctx, w, h, tt) {
    const s = (h - 34) / 1.32, floor = h - 14, hh = anim ? anim.h : +sPH.value, ex = w * 0.34, ty = floor - hh * s;
    // 바닥과 책상
    ctx.fillStyle = "#e9e7dc"; ctx.fillRect(0, floor, w, 14);
    ctx.fillStyle = "#b08a5a"; ctx.fillRect(ex - 0.55 * s, ty, 0.55 * s, 6); ctx.fillRect(ex - 0.5 * s, ty + 6, 5, floor - ty - 6);
    // 경사로
    const H = +sRH.value / 100, rl = 0.36 * s, rh = (H + 0.02) * s;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ex - rl, ty - rh); ctx.quadraticCurveTo(ex - rl * 0.3, ty - 2, ex, ty - 1); ctx.stroke(); ctx.lineWidth = 1;
    // 게이트
    ctx.fillStyle = C.forest; ctx.fillRect(ex - 8, ty - 24, 5, 18);
    const v0 = anim ? anim.v0t : v0Of(H), r = 5;
    let bx = ex - rl + 4, by = ty - rh - r;
    if (anim) { const t = Math.min(tt, anim.dur); bx = ex + v0 * t * s; by = ty - r + 0.5 * G * t * t * s; }
    // 궤적 (기록 뒤)
    const rows = tbls.proj.rows, last = rows[rows.length - 1];
    if (anim || (last && Math.abs(last.h - hh) < 0.01)) {
      const R = anim ? v0 * Math.sqrt(2 * hh / G) : last.R, hv = anim ? hh : last.h, ty2 = floor - hv * s;
      ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath();
      for (let i = 0; i <= 30; i++) { const x = R * i / 30, y = hv * (x / R) ** 2; i ? ctx.lineTo(ex + x * s, ty2 - r + y * s) : ctx.moveTo(ex, ty2 - r); }
      ctx.stroke(); ctx.setLineDash([]);
      if (!anim) { ctx.fillStyle = "#26272a"; ctx.beginPath(); ctx.arc(ex + R * s, floor - 1, 3, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.fillStyle = "#6f7378"; ctx.beginPath(); ctx.arc(bx, Math.min(by, floor - r), r, 0, Math.PI * 2); ctx.fill();
    // 바닥 줄자 (책상 끝 아래가 0)
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center";
    for (let c = 0; c <= 100; c += 10) { const x = ex + c / 100 * s; if (x > w - 6) break; ctx.fillRect(x, floor, 1, c % 50 ? 4 : 7); if (c % 50 === 0) ctx.fillText(`${c / 100}`, x, floor + 13); }
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`h = ${hh.toFixed(2)} m`, ex - 0.5 * s + 9, ty + (floor - ty) / 2);
    if (last && !anim && Math.abs(last.h - hh) < 0.01) ctx.fillText(`R = ${last.R.toFixed(3)} m`, w - 128, 22);
  }

  /* ---------- 그래프 ---------- */
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbls[mode].rows, box = { x0: 52, y0: 18, w: w - 66, h: h - 52 };
    let pts, ft = null, o = {}, g = NaN, se = NaN, third = "—", tlab = "절편";
    if (mode === "fence") {
      pts = rows.map((r) => ({ x: r.tm, y: r.v }));
      if (pts.length > 1) { ft = L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)); g = ft.a; se = ft.sa; third = `${ft.b.toFixed(3)} m/s`; }
      tlab = "절편 (t = 0의 v)"; o = { xlabel: "t (s)", ylabel: "v (m/s)" };
    } else if (mode === "drop") {
      if (xKey === "ht2") {
        pts = rows.map((r) => ({ x: r.t2, y: r.h }));
        if (pts.length > 1) { ft = L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)); g = 2 * ft.a; se = 2 * ft.sa; third = `${(ft.b * 100).toFixed(1)} cm`; }
        tlab = "절편 (h)"; o = { xlabel: "t² (s²)", ylabel: "h (m)", xr: [0, 0.32], yr: [0, 1.6] };
      } else {
        pts = rows.map((r) => ({ x: r.sh, y: r.t }));
        if (pts.length > 1) { ft = L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)); g = 2 / ft.a ** 2; se = 4 * ft.sa / ft.a ** 3; third = `${(ft.b * 1000).toFixed(1)} ms`; }
        tlab = "절편 (늦은 시간)"; o = { xlabel: "√h (√m)", ylabel: "t (s)", xr: [0, 1.3], yr: [0, 0.6] };
      }
    } else {
      pts = rows.map((r) => ({ x: r.h, y: r.y }));
      if (pts.length > 1) { ft = L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)); g = 2 / ft.a; se = 2 * ft.sa / ft.a ** 2; third = `${ft.b.toFixed(4)} s²`; }
      o = { xlabel: "h (m)", ylabel: "R²/v₀² (s²)", xr: [0, 1.3], yr: [0, 0.27] };
    }
    L.plot(ctx, box, { pts, fit: ft, ...o });
    $(".n-g").textContent = Number.isFinite(g) ? `${g.toFixed(2)} m/s²` : "점 2개 이상";
    $(".n-se").textContent = Number.isFinite(se) ? `± ${se.toFixed(2)} m/s²` : "—";
    $(".n-3t").textContent = tlab; $(".n-3").textContent = third;
  }

  /* ---------- 조작 ---------- */
  function setMode(m) {
    mode = m; anim = null;
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    root.querySelectorAll("[data-g]").forEach((g) => { g.hidden = g.dataset.g !== m; });
    root.querySelectorAll("[data-t]").forEach((d) => { d.hidden = d.dataset.t !== m; });
    $(".xsel").hidden = m !== "drop";
    $(".mnote").textContent = NOTES[m];
    drawApp(); drawPlot();
  }
  const upd = () => {
    $(".z-out").textContent = (+sZ.value).toFixed(1); $(".h-out").textContent = (+sH.value).toFixed(2);
    $(".ph-out").textContent = (+sPH.value).toFixed(2); $(".H-out").textContent = sRH.value;
    if (!anim) drawApp();
  };
  [sZ, sH, sPH, sRH].forEach((el) => el.addEventListener("input", upd));
  $(".msel").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (b) setMode(b.dataset.m); });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  $(".meas").addEventListener("click", () => { if (anim) return; anim = { ...MEAS[mode](), el: 0, m: mode }; });
  $(".clear").addEventListener("click", () => { anim = null; tbls[mode].clear(); drawApp(); });
  loop($(".cv-wide"), (dt) => {
    if (!anim) return;
    anim.el += dt * 0.35;   // 느린 화면
    if (anim.el >= anim.dur + 0.15) { const a = anim; anim = null; a.rows.forEach((r) => tbls[a.m].add(r)); }
    drawApp();
  });
  setMode("fence"); upd();
  if (L.demo) {
    sZ.value = 3; measFence().rows.forEach((r) => tbls.fence.add(r));
    cLag.checked = true;
    [0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5].forEach((v) => { sH.value = v; measDrop().rows.forEach((r) => tbls.drop.add(r)); });
    [0.6, 0.7, 0.8, 0.9, 1.0, 1.1].forEach((v) => { sPH.value = v; measProj().rows.forEach((r) => tbls.proj.add(r)); });
    sH.value = 0.5; sPH.value = 0.8; upd(); drawPlot();
    const qm = /[?&]m=(drop|proj)/.exec(location.search); if (qm) setMode(qm[1]);
  }
})();
