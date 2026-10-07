/* 카드: 흑점을 며칠 따라가면 태양이 위도마다 다르게 돈다는 것을 알 수 있을까? — NOAA SRS 실제 흑점 자료로 자전 주기, 상대 흑점수, 흑점 주기 */
(() => {
  const root = document.getElementById("card-labearth-sunspot");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const DAT = window.LE_SUNSPOT; if (!DAT) return;
  const D2R = Math.PI / 180;
  const DAYS = DAT.days, MON = DAT.monthly.map(([t, v, s]) => ({ t: +t.slice(0, 4) + (+t.slice(5, 7) - 0.5) / 12, v, s }));
  const sDay = $(".day");
  let mode = "rot", pv = "track", sel = null;

  const ZUR = { A: "A형: 반암부 없는 작은 흑점 하나 또는 몇 개 (단극)", B: "B형: 반암부 없는 쌍극 흑점군", C: "C형: 쌍극, 한쪽 끝 흑점에만 반암부", D: "D형: 쌍극, 양쪽 끝에 반암부, 길이 10° 이하", E: "E형: 쌍극, 양쪽에 반암부, 길이 10°–15°", F: "F형: 쌍극, 양쪽에 반암부, 길이 15° 넘음", H: "H형: 반암부가 있는 단극 흑점" };
  const PEN = { x: "반암부 없음", r: "덜 발달한 반암부", s: "작고 대칭인 반암부", a: "작고 비대칭인 반암부", h: "크고 대칭인 반암부", k: "크고 비대칭인 반암부" };
  const CMP = { x: "흑점 하나", o: "흩어짐", i: "중간", c: "빽빽함" };

  const groups = (i) => DAYS[i][2].map(([n, lat, cmd, area, z, ll, nn]) => ({ n, lat, cmd, area, z, ll, nn }));
  const dayIdx = () => +sDay.value;

  /* 일면 좌표 → 원반 위 (B0 반영, 태양 북쪽이 위, 동쪽이 왼쪽) */
  function disk(lat, cmd, B0) {
    const p = lat * D2R, l = cmd * D2R, b = B0 * D2R;
    return { x: Math.cos(p) * Math.sin(l), y: Math.sin(p) * Math.cos(b) - Math.cos(p) * Math.cos(l) * Math.sin(b), z: Math.sin(p) * Math.sin(b) + Math.cos(p) * Math.cos(l) * Math.cos(b) };
  }
  /* 고정 난수 */
  const rng = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const T = {
    rot: L.table($(".t-rot"), [{ key: "d", label: "날짜" }, { key: "t", label: "경과일", res: 1 }, { key: "n", label: "NOAA", res: 1 }, { key: "lat", label: "위도 (°)", res: 1 }, { key: "cmd", label: "CMD (°)", res: 1 }], () => { drawPlot(); nums(); }),
    wolf: L.table($(".t-wolf"), [{ key: "d", label: "날짜" }, { key: "g", label: "g", res: 1 }, { key: "f", label: "f", res: 1 }, { key: "R", label: "R = 10g + f", res: 1 }, { key: "noaa", label: "NOAA 발표", res: 1 }], () => drawPlot()),
    cyc: L.table($(".t-cyc"), [{ key: "y", label: "표시한 때 (년)", res: 0.1 }, { key: "s", label: "평활 흑점수", res: 0.1 }, { key: "k", label: "구분" }, { key: "dt", label: "앞 극소기와 간격 (년)", res: 0.1 }], () => drawPlot()),
  };

  let hits = [], cycBox = null;
  function drawDisk(ctx, w, h) {
    const i = dayIdx(), [date, B0] = DAYS[i], gs = groups(i);
    const R = Math.min(h * 0.44, w * 0.27), cx = R + 24, cy = h / 2;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, "#f6e7b8"); g.addColorStop(0.75, "#eed39a"); g.addColorStop(1, "#c99a55");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    // 격자 (10°)
    ctx.strokeStyle = "rgba(90,60,20,0.25)"; ctx.lineWidth = 0.8;
    for (let lat = -80; lat <= 80; lat += 10) { ctx.beginPath(); let f = true; for (let l = -90; l <= 90; l += 3) { const p = disk(lat, l, B0); if (p.z < 0) { f = true; continue; } f ? ctx.moveTo(cx + R * p.x, cy - R * p.y) : ctx.lineTo(cx + R * p.x, cy - R * p.y); f = false; } ctx.stroke(); }
    for (let l = -90; l <= 90; l += 10) { ctx.strokeStyle = l === 0 ? "rgba(90,60,20,0.55)" : "rgba(90,60,20,0.25)"; ctx.beginPath(); let f = true; for (let lat = -90; lat <= 90; lat += 3) { const p = disk(lat, l, B0); if (p.z < 0) { f = true; continue; } f ? ctx.moveTo(cx + R * p.x, cy - R * p.y) : ctx.lineTo(cx + R * p.x, cy - R * p.y); f = false; } ctx.stroke(); }
    // 흑점군
    hits = [];
    gs.forEach((gr) => {
      const r = rng(gr.n * 7919 + 13), pen = gr.z[1], total = gr.area * 1e-6 * 2 * Math.PI;   // 반지름 1 기준 실제 면적
      const nn = Math.max(1, gr.nn), span = Math.max(gr.ll, gr.nn > 1 ? 2 : 0);
      for (let k = 0; k < nn; k++) {
        const big = k === 0 ? 0.55 : k === nn - 1 && nn > 2 ? 0.25 : 0.2 / Math.max(1, nn - 2);
        const share = nn === 1 ? 1 : big;
        const dl = k === 0 ? span / 2 : k === nn - 1 ? -span / 2 : (r() - 0.5) * span * 0.9;
        const db = (r() - 0.5) * Math.min(4, 1 + span * 0.25);
        const p = disk(gr.lat + db, gr.cmd + dl, B0); if (p.z <= 0.02) continue;
        const rad = Math.max(0.9, Math.sqrt(total * share / Math.PI) * R * Math.sqrt(p.z));
        const x = cx + R * p.x, y = cy - R * p.y;
        if (pen !== "x" && (k === 0 || (k === nn - 1 && "DEF".includes(gr.z[0])) || share > 0.15)) { ctx.fillStyle = "rgba(120,80,40,0.75)"; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = "#2a1a0d"; ctx.beginPath(); ctx.arc(x, y, Math.max(0.8, rad * (pen === "x" ? 0.6 : 0.42)), 0, Math.PI * 2); ctx.fill();
      }
      const c = disk(gr.lat, gr.cmd, B0);
      hits.push({ gr, x: cx + R * c.x, y: cy - R * c.y });
      if (sel === gr.n) { ctx.strokeStyle = C.forest; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx + R * c.x, cy - R * c.y, 9 + gr.ll * R / 120, 0, Math.PI * 2); ctx.stroke(); }
    });
    ctx.font = `600 11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("N", cx, cy - R - 6); ctx.fillText("S", cx, cy + R + 14); ctx.fillText("E", cx - R - 10, cy + 4); ctx.fillText("W", cx + R + 10, cy + 4);
    // 오른쪽 정보
    const tx = cx + R + 30; let ty = 22;
    ctx.textAlign = "left"; ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.fillText(`${date} 24시 (UT)`, tx, ty); ty += 18;
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(`B₀ = ${B0 >= 0 ? "+" : ""}${B0.toFixed(1)}°`, tx, ty); ty += 16;
    ctx.fillText("격자 간격 10°", tx, ty); ty += 16;
    ctx.fillText("진한 경선: 중앙 자오선", tx, ty); ty += 22;
    if (mode === "wolf") { ctx.fillStyle = C.ink3; ctx.fillText("흑점군을 하나씩 눌러", tx, ty); ty += 15; ctx.fillText("분류와 흑점 수를 확인", tx, ty); }
    else { ctx.fillStyle = C.ink3; ctx.fillText(`보이는 흑점군 ${gs.length}개`, tx, ty); }
  }
  function drawCycle(ctx, w, h) {
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 52 }; cycBox = box;
    const X = (t) => box.x0 + (t - 1996.5) / 30.5 * box.w, Y = (v) => box.y0 + box.h - v / 250 * box.h;
    NM.axes(ctx, { ...box, X, Y, xt: [2000, 2005, 2010, 2015, 2020, 2025].map((v) => [v, String(v)]), yt: [0, 50, 100, 150, 200, 250].map((v) => [v, String(v)]), xlabel: "연도", ylabel: "월평균 흑점수 (NOAA SWPC)" });
    ctx.strokeStyle = "rgba(141,141,146,0.7)"; ctx.lineWidth = 1; ctx.beginPath();
    MON.forEach((m, i) => (i ? ctx.lineTo(X(m.t), Y(m.v)) : ctx.moveTo(X(m.t), Y(m.v)))); ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); let f = true;
    MON.forEach((m) => { if (m.s == null) { f = true; return; } f ? ctx.moveTo(X(m.t), Y(m.s)) : ctx.lineTo(X(m.t), Y(m.s)); f = false; }); ctx.stroke();
    T.cyc.rows.forEach((r) => { ctx.fillStyle = r.k === "극소기" ? C.forest : C.amber; ctx.beginPath(); ctx.arc(X(r.y), Y(r.s), 5, 0, Math.PI * 2); ctx.fill(); });
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.fillText("회색: 월평균 · 붉은 선: 13개월 평활값", X(2003.3), box.y0 + 12);
    ctx.fillText("그래프를 눌러 극소기·극대기 표시", X(2003.3), box.y0 + 27);
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    mode === "cyc" ? drawCycle(ctx, w, h) : drawDisk(ctx, w, h);
  }

  /* 한 흑점군의 기록으로 자전 주기 */
  function rot(n) {
    const r = T.rot.rows.filter((x) => x.n === n && Math.abs(x.cmd) <= 75); if (r.length < 3) return null;
    const f = L.linfit(r.map((x) => x.t), r.map((x) => x.cmd)); if (!f || f.a <= 0) return null;
    const Ps = 360 / f.a, Pd = 1 / (1 / Ps + 1 / 365.25);
    return { f, Ps, Pd, lat: r.reduce((s, x) => s + x.lat, 0) / r.length, n: r.length };
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 46, y0: 22, w: w - 60, h: h - 56 };
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    if (mode === "rot" && pv === "track") {
      const r = T.rot.rows.filter((x) => x.n === sel), o = sel != null ? rot(sel) : null;
      L.plot(ctx, box, { pts: r.map((x) => ({ x: x.t, y: x.cmd })), fit: o && o.f, xr: [0, 27], yr: [-90, 90], xlabel: "2022-09-19부터 지난 날 (일)", ylabel: `NOAA ${sel ?? "—"} 의 CMD (°, 서쪽 +)` });
      if (o) { ctx.fillStyle = C.warn; ctx.fillText(`ω = ${o.f.a.toFixed(2)}°/일 → P회합 = ${o.Ps.toFixed(1)}일 → P항성 = ${o.Pd.toFixed(1)}일`, box.x0 + 6, box.y0 + 14); }
    } else if (mode === "rot") {
      const ns = [...new Set(T.rot.rows.map((x) => x.n))], res = ns.map(rot).filter(Boolean);
      L.plot(ctx, box, { pts: res.map((o) => ({ x: Math.abs(o.lat), y: o.Pd })), xr: [0, 40], yr: [22, 30], xlabel: "위도 |φ| (°)", ylabel: "항성 자전 주기 (일)", model: (x) => 360 / (14.38 - 2.77 * Math.sin(x * D2R) ** 2) });
      ctx.fillStyle = C.ink3; ctx.fillText("점선: 흑점 추적 경험식 ω = 14.38 − 2.77 sin²φ (°/일)", box.x0 + 6, box.y0 + 14);
      ctx.fillText(`흑점군 ${res.length}개 (기록 3개 이상)`, box.x0 + 6, box.y0 + 29);
    } else if (mode === "wolf") {
      const rr = T.wolf.rows.map((r) => ({ x: r.noaa, y: r.R }));
      L.plot(ctx, box, { pts: rr, xr: [0, 200], yr: [0, 200], xlabel: "NOAA 발표 흑점수", ylabel: "내가 구한 R", model: (x) => x });
      ctx.fillStyle = C.ink3; ctx.fillText("점선: 같은 값 (k = 1)", box.x0 + 6, box.y0 + 14);
    }
  }
  function nums() {
    if (mode === "cyc") return;
    const gs = groups(dayIdx()), g = gs.find((x) => x.n === sel);
    $(".n-g").textContent = g ? `${g.n} (${g.lat >= 0 ? "N" : "S"}${Math.abs(g.lat)})` : (sel ? `${sel} (이날 없음)` : "—");
    $(".n-z").textContent = g ? g.z : "—";
    $(".zdesc").textContent = g ? `${ZUR[g.z[0]] || g.z[0]} · ${PEN[g.z[1]] || ""} · 흑점 분포: ${CMP[g.z[2]] || ""}` : "흑점군을 누르면 분류 설명이 나옵니다";
    if (mode === "rot") {
      const o = sel != null ? rot(sel) : null;
      $(".k3").textContent = "하루 회전각 ω"; $(".n-3").textContent = o ? o.f.a.toFixed(2) + "°/일" : "—";
      $(".k4").textContent = "항성 자전 주기"; $(".n-4").textContent = o ? o.Pd.toFixed(1) + "일" : "—";
    } else {
      $(".k3").textContent = "이 흑점군의 흑점 수"; $(".n-3").textContent = g ? g.nn + "개" : "—";
      $(".k4").textContent = "면적 (백만분의 반구)"; $(".n-4").textContent = g ? g.area : "—";
    }
  }

  function measure() {
    const i = dayIdx(), [date] = DAYS[i], gs = groups(i);
    if (mode === "rot") {
      const g = gs.find((x) => x.n === sel); if (!g) return;
      T.rot.add({ d: date, t: i, n: g.n, lat: L.measure(g.lat, { sd: 0.7, res: 1 }), cmd: L.measure(g.cmd, { sd: 0.7 + Math.abs(g.cmd) / 60, res: 1 }) });
    } else if (mode === "wolf") {
      const f = gs.reduce((s, x) => s + x.nn, 0);
      const fc = Math.max(gs.length, L.measure(f, { rel: 0.06, res: 1 }));   // 작은 흑점을 놓치거나 겹쳐 세는 오차
      T.wolf.add({ d: date, g: gs.length, f: fc, R: 10 * gs.length + fc, noaa: 10 * gs.length + f });
    }
  }
  function markCycle(t) {
    let best = null; MON.forEach((m) => { if (m.s != null && (!best || Math.abs(m.t - t) < Math.abs(best.t - t))) best = m; });
    if (!best) return;
    const near = MON.filter((m) => m.s != null && Math.abs(m.t - best.t) < 2);
    const lo = near.reduce((a, b) => (b.s < a.s ? b : a)), hi = near.reduce((a, b) => (b.s > a.s ? b : a));
    const isMin = best.s < 60;
    const pick = isMin ? lo : hi;   // 손으로 고른 근처에서 가장 낮은(높은) 평활값을 골라 준다
    const prev = T.cyc.rows.filter((r) => r.k === "극소기" && r.y < pick.t).pop();
    T.cyc.add({ y: pick.t, s: pick.s, k: isMin ? "극소기" : "극대기", dt: isMin && prev ? pick.t - prev.y : NaN });
  }

  $(".cv-wide").addEventListener("click", (e) => {
    const rc = e.currentTarget.getBoundingClientRect(), x = e.clientX - rc.left, y = e.clientY - rc.top;
    if (mode === "cyc") { if (cycBox && x > cycBox.x0) markCycle(1996.5 + (x - cycBox.x0) / cycBox.w * 30.5); draw(); return; }
    let b = null, bd = 18; hits.forEach((hh) => { const d = Math.hypot(hh.x - x, hh.y - y); if (d < bd) { bd = d; b = hh; } });
    if (b) { sel = b.gr.n; nums(); draw(); drawPlot(); }
  });
  const upd = () => { $(".d-out").textContent = DAYS[dayIdx()][0]; nums(); draw(); };
  sDay.addEventListener("input", upd);
  $(".mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return;
    mode = b.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    ["rot", "wolf", "cyc"].forEach((k) => { $(".t-" + k).hidden = k !== mode; });
    root.querySelectorAll(".g-day").forEach((el) => { el.hidden = mode === "cyc"; });
    $(".psel").hidden = mode !== "rot"; $(".cv-plot").hidden = mode === "cyc";
    $(".meas").hidden = mode === "cyc";
    $(".meas").textContent = mode === "rot" ? "위치 읽기" : "이날 흑점군·흑점 세기";
    upd(); drawPlot();
  });
  $(".psel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    pv = b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => T[mode].clear());
  sel = 3112; upd();
  if (L.demo) {
    [3110, 3112, 3105, 3107, 3111, 3116, 3119, 3108, 3115].forEach((n) => {
      sel = n;
      DAYS.forEach((d, i) => { if (d[2].some((g) => g[0] === n && Math.abs(g[2]) <= 70)) { sDay.value = i; measure(); } });
    });
    mode = "wolf"; [0, 5, 10, 15, 20, 25].forEach((i) => { sDay.value = i; measure(); });
    [2008.9, 2014.3, 2019.9].forEach(markCycle); mode = "rot";
    sel = 3112; sDay.value = 12; root.querySelector('[data-p="lat"]').click(); upd();
  }
})();
