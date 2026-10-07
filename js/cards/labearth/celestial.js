/* 카드: 별의 남중 고도만 재면 내가 선 곳의 위도를 알 수 있을까? — 천구의, 지평·적도 좌표 변환, 시간각, 항성시 */
(() => {
  const root = document.getElementById("card-labearth-celestial");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const D2R = Math.PI / 180, R2D = 180 / Math.PI, LON = 126.98;

  /* 밝은 별의 J2000.0 적경(시)·적위(°) — Hipparcos 목록 값 */
  const STARS = [
    { k: "pol", n: "북극성", ra: 2.5303, de: 89.264 },
    { k: "dub", n: "두베", ra: 11.0621, de: 61.751 },
    { k: "cap", n: "카펠라", ra: 5.2782, de: 45.998 },
    { k: "deb", n: "데네브", ra: 20.6905, de: 45.280 },
    { k: "veg", n: "직녀성", ra: 18.6156, de: 38.784 },
    { k: "arc", n: "아크투루스", ra: 14.2610, de: 19.182 },
    { k: "alt", n: "견우성", ra: 19.8464, de: 8.868 },
    { k: "bet", n: "베텔게우스", ra: 5.9195, de: 7.407 },
    { k: "rig", n: "리겔", ra: 5.2423, de: -8.202 },
    { k: "spi", n: "스피카", ra: 13.4199, de: -11.161 },
    { k: "sir", n: "시리우스", ra: 6.7525, de: -16.716 },
    { k: "ant", n: "안타레스", ra: 16.4901, de: -26.432 },
    { k: "fom", n: "포말하우트", ra: 22.9608, de: -29.622 },
    { k: "can", n: "카노푸스", ra: 6.3992, de: -52.696 },
  ];
  let star = STARS[4], camAz = 155, rec = null;

  const sLat = $(".lat"), sDay = $(".day"), sTm = $(".tm");
  const stars = $(".stars");
  stars.innerHTML = STARS.map((s) => `<button type="button" class="chip" data-k="${s.k}" aria-pressed="${s === star}">${s.n}</button>`).join("");

  const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const dateLab = (doy) => { let m = 0, d = doy; while (d > MD[m]) { d -= MD[m]; m++; } return `${m + 1}월 ${d}일`; };
  const hm = (h) => { h = ((h % 24) + 24) % 24; let H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H = (H + 1) % 24; M = 0; } return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`; };
  const hmS = (h) => { const s = h < 0 ? "−" : "+"; return s + hm(Math.abs(h)).replace(":", "h ") + "m"; };

  /* 2026년 doy일, KST 시각 → 지방 항성시(시) */
  function lst(doy, kst) {
    const jd = 2461041.5 + (doy - 1) + (kst - 9) / 24;   // 2026-01-01 0h UT = JD 2461041.5
    const gmst = 18.697374558 + 24.06570982441908 * (jd - 2451545.0);
    return (((gmst + LON / 15) % 24) + 24) % 24;
  }
  /* 시간각 H(시)·적위 → 방위각(북→동, °)·고도(°) */
  function hor(Hh, de, lat) {
    const H = Hh * 15 * D2R, d = de * D2R, p = lat * D2R;
    const sh = Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H);
    const h = Math.asin(Math.max(-1, Math.min(1, sh)));
    const A = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(p) - Math.cos(d) * Math.cos(H) * Math.sin(p));
    return { A: ((A * R2D) % 360 + 360) % 360, h: h * R2D };
  }
  const state = () => {
    const lat = +sLat.value, doy = +sDay.value, kst = +sTm.value, T = lst(doy, kst);
    let H = T - star.ra; H = ((H + 12) % 24 + 24) % 24 - 12;
    return { lat, doy, kst, T, H, ...hor(H, star.de, lat) };
  };

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "n", label: "별" }, { key: "de", label: "δ (°)", res: 0.1 }, { key: "T", label: "항성시 (h)", res: 0.01 },
    { key: "H", label: "H (h)", res: 0.01 }, { key: "A", label: "A (°)", res: 1 }, { key: "h", label: "h (°)", res: 1 }, { key: "m", label: "구분" },
  ], () => drawPlot());

  /* 3차원 → 화면 (정사영). v = [북, 동, 위] */
  function proj(v, cx, cy, R) {
    const a = camAz * D2R, e = 18 * D2R;
    const d = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
    const r = [Math.sin(a), -Math.cos(a), 0];
    const u = [-Math.sin(e) * Math.cos(a), -Math.sin(e) * Math.sin(a), Math.cos(e)];
    const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
    return { x: cx + R * dot(v, r), y: cy - R * dot(v, u), z: dot(v, d) };
  }
  const vec = (A, h) => [Math.cos(h * D2R) * Math.cos(A * D2R), Math.cos(h * D2R) * Math.sin(A * D2R), Math.sin(h * D2R)];

  function curve(ctx, pts, P, col, lw, below) {
    for (let i = 1; i < pts.length; i++) {
      const a = P(pts[i - 1]), b = P(pts[i]);
      const back = a.z + b.z < 0, under = below && pts[i][2] + pts[i - 1][2] < 0;
      ctx.strokeStyle = col; ctx.globalAlpha = under ? 0.3 : back ? 0.45 : 1; ctx.lineWidth = lw;
      ctx.setLineDash(back ? [3, 4] : []);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.setLineDash([]);
  }
  const label = (ctx, t, x, y, col, al = "center") => { ctx.fillStyle = col; ctx.textAlign = al; ctx.fillText(t, x, y); };

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const st = state(), lat = st.lat;
    const cx = w * 0.32, cy = h * 0.52, R = Math.min(w * 0.27, h * 0.42);
    const P = (v) => proj(v, cx, cy, R);
    ctx.font = `11px ${F.sans}`;
    // 지평면
    const hz = []; for (let i = 0; i <= 120; i++) hz.push(vec(i * 3, 0));
    ctx.fillStyle = "rgba(116,171,102,0.13)"; ctx.beginPath();
    hz.forEach((v, i) => { const p = P(v); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }); ctx.fill();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    curve(ctx, hz, P, C.forest, 1.4);
    // 자오선
    const mer = []; for (let i = 0; i <= 90; i++) { const t = i * 2; mer.push(t <= 90 ? vec(0, t) : vec(180, 180 - t)); }
    curve(ctx, mer, P, C.ink3, 1);
    // 천구 적도와 천구 북극
    const eq = []; for (let i = 0; i <= 96; i++) { const o = hor(i / 4, 0, lat); eq.push(vec(o.A, o.h)); }
    curve(ctx, eq, P, C.amber, 1.4, true);
    const ncp = P(vec(lat >= 0 ? 0 : 180, Math.abs(lat))), scp = P(vec(lat >= 0 ? 180 : 0, -Math.abs(lat)));
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(scp.x, scp.y); ctx.lineTo(ncp.x, ncp.y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ncp.x, ncp.y, 3, 0, Math.PI * 2); ctx.fill();
    label(ctx, "천구 북극", ncp.x + 6, ncp.y - 6, C.ink2, "left");
    // 일주권
    const dc = []; for (let i = 0; i <= 96; i++) { const o = hor(i / 4, star.de, lat); dc.push(vec(o.A, o.h)); }
    curve(ctx, dc, P, C.apple, 1.6, true);
    // 시간권 (천구 북극 → 별 → 적도)
    const hc = []; for (let i = 0; i <= 40; i++) { const de = 90 - i * (90 - Math.min(star.de, 89.5)) / 40; const o = hor(st.H, de, lat); hc.push(vec(o.A, o.h)); }
    curve(ctx, hc, P, C.amber, 1, false);
    // 방위각 호 (북점 → 별 아래 지평선)
    const az = []; for (let i = 0; i <= 60; i++) az.push(vec(st.A * i / 60, 0));
    curve(ctx, az, P, C.forest, 3);
    // 고도 호
    const al = []; for (let i = 0; i <= 30; i++) al.push(vec(st.A, st.h * i / 30));
    curve(ctx, al, P, C.warn, 2.6);
    // 별
    const sp = P(vec(st.A, st.h));
    ctx.fillStyle = st.h >= 0 ? C.apple : C.ink3; ctx.beginPath(); ctx.arc(sp.x, sp.y, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `600 12px ${F.sans}`; if (sp.x > cx) label(ctx, star.n, sp.x - 9, sp.y - 8, C.ink, "right"); else label(ctx, star.n, sp.x + 9, sp.y - 8, C.ink, "left");
    // 방위 · 천정
    ctx.font = `600 12px ${F.mono}`;
    [["N", 0], ["E", 90], ["S", 180], ["W", 270]].forEach(([t, A]) => { const p = P(vec(A, 0)); label(ctx, t, p.x + (p.x - cx) * 0.08, p.y + (p.y - cy) * 0.12 + 4, p.z < 0 ? C.ink3 : C.forest); });
    const zp = P([0, 0, 1]); ctx.font = `11px ${F.sans}`; label(ctx, "천정", zp.x, zp.y - 7, C.ink2);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
    // 범례
    const lx = w * 0.64; let ly = 26; ctx.font = `11px ${F.sans}`;
    [[C.forest, "지평선 · 방위각 A"], [C.warn, "고도 h"], [C.amber, "천구 적도 · 시간권"], [C.apple, "별의 일주권"], [C.ink3, "자오선"]].forEach(([c, t]) => {
      ctx.strokeStyle = c; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(lx, ly - 4); ctx.lineTo(lx + 16, ly - 4); ctx.stroke(); label(ctx, t, lx + 22, ly, C.ink2, "left"); ly += 18;
    });
    ly += 6; ctx.font = `11px ${F.mono}`;
    label(ctx, `φ = ${lat.toFixed(1)}°`, lx, ly, C.ink, "left"); ly += 16;
    label(ctx, `천구 북극 고도 = ${Math.abs(lat).toFixed(1)}°`, lx, ly, C.ink2, "left"); ly += 16;
    label(ctx, "실선: 앞쪽 · 점선: 뒤쪽", lx, ly, C.ink3, "left"); ly += 16;
    label(ctx, "옅은 선: 지평선 아래", lx, ly, C.ink3, "left");
    if (rec) { ctx.font = `600 12px ${F.sans}`; label(ctx, rec, w * 0.5, h - 8, C.warn); }
  }

  function nums() {
    const st = state(), lat = st.lat;
    $(".n-lst").textContent = hm(st.T).replace(":", "h ") + "m";
    $(".n-h").textContent = hmS(st.H);
    $(".n-a").textContent = st.A.toFixed(1) + "°";
    $(".n-alt").textContent = st.h.toFixed(1) + "°";
    $(".n-eq").textContent = `${hm(star.ra).replace(":", "h ")}m · ${star.de >= 0 ? "+" : "−"}${Math.abs(star.de).toFixed(1)}°`;
    const x = -Math.tan(lat * D2R) * Math.tan(star.de * D2R);
    const rs = $(".n-rs"), rt = $(".n-rt");
    if (x <= -1) { rs.textContent = "주극성 (지지 않음)"; rt.textContent = "—"; }
    else if (x >= 1) { rs.textContent = "뜨지 않음"; rt.textContent = "—"; }
    else {
      const H0 = Math.acos(x) * R2D / 15;
      rs.textContent = `지평선 위 ${(2 * H0 / 1.0027379).toFixed(1)} 시간`;
      const k = (Hh) => st.kst + ((((Hh - st.H) % 24) + 24) % 24) / 1.0027379;
      rt.textContent = `${hm(k(-H0))} · ${hm(k(H0))}`;
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const tr = tbl.rows.filter((r) => r.m !== "현재");
    const south = tr.filter((r) => r.A > 90 && r.A < 270);
    const pts = tr.map((r) => ({ x: r.de, y: r.h, south: r.A > 90 && r.A < 270 }));
    const f = south.length > 1 ? L.linfit(south.map((r) => r.de), south.map((r) => r.h)) : null;
    const box = { x0: 44, y0: 24, w: w - 60, h: h - 58 };
    const ax = L.plot(ctx, box, { pts: pts.filter((p) => p.south), fit: f, xr: [-60, 95], yr: [0, 95], xlabel: "적위 δ (°)", ylabel: "남중 고도 (°)" });
    ctx.fillStyle = C.amber;
    pts.filter((p) => !p.south).forEach((p) => { ctx.beginPath(); ctx.rect(ax.X(p.x) - 3.5, ax.Y(p.y) - 3.5, 7, 7); ctx.fill(); });
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillStyle = C.forest; ctx.fillText("● 남쪽에서 남중", box.x0 + 6, box.y0 + 14);
    ctx.fillStyle = C.amber; ctx.fillText("■ 천정 북쪽에서 남중", box.x0 + 6, box.y0 + 29);
    if (f) {
      ctx.fillStyle = C.warn; ctx.textAlign = "right";
      ctx.fillText(`기울기 ${f.a.toFixed(2)}, 절편 ${f.b.toFixed(1)}°`, box.x0 + box.w - 4, box.y0 + box.h - 24);
      ctx.fillText(`→ 위도 φ = 90° − 절편 = ${(90 - f.b).toFixed(1)}°`, box.x0 + box.w - 4, box.y0 + box.h - 9);
    }
  }

  function measure(mark) {
    const st = state();
    tbl.add({ n: star.n, de: star.de, T: L.snap(st.T, 0.01), H: L.snap(st.H, 0.01), A: ((L.measure(st.A, { sd: 0.5, res: 1 }) % 360) + 360) % 360, h: L.measure(st.h, { sd: 0.5, res: 1 }), m: mark });
  }
  function toTransit() {
    const st = state();
    let dk = -st.H / 1.0027379, k = st.kst + dk, doy = st.doy;
    if (k < 0) { k += 24; doy = Math.max(1, doy - 1); } else if (k >= 24) { k -= 24; doy = Math.min(365, doy + 1); }
    sDay.value = doy; sTm.value = k.toFixed(2);
  }
  const upd = () => {
    $(".lat-out").textContent = Math.abs(+sLat.value).toFixed(1) + (+sLat.value < 0 ? "°S" : "°N");
    $(".d-out").textContent = dateLab(+sDay.value); $(".t-out").textContent = hm(+sTm.value);
    nums(); draw();
  };
  [sLat, sDay, sTm].forEach((el) => el.addEventListener("input", () => { rec = null; upd(); }));
  stars.addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b) return;
    star = STARS.find((s) => s.k === b.dataset.k); rec = null;
    stars.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  $(".meas").addEventListener("click", () => { const st = state(); rec = st.h < 0 ? "별이 지평선 아래에 있어 볼 수 없습니다" : null; if (!rec) measure("현재"); draw(); });
  $(".transit").addEventListener("click", () => {
    toTransit(); const st = state();
    if (st.h < 0) { rec = "이 위도에서는 남중해도 지평선 아래입니다"; upd(); return; }
    rec = null; upd(); measure("남중");
  });
  $(".clear").addEventListener("click", () => tbl.clear());
  // 끌어서 돌리기
  let drag = null;
  const cv = $(".cv-wide");
  cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, a: camAz }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => { if (!drag) return; camAz = drag.a - (e.clientX - drag.x) * 0.5; draw(); });
  cv.addEventListener("pointerup", () => { drag = null; });
  upd();
  if (L.demo) {
    ["veg", "alt", "bet", "rig", "spi", "sir", "ant", "fom", "arc", "cap", "pol"].forEach((k) => {
      star = STARS.find((s) => s.k === k); toTransit(); measure("남중");
    });
    star = STARS.find((s) => s.k === "arc"); sDay.value = 80; sTm.value = 21; measure("현재");
    stars.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.k === "arc")));
    upd();
  }
})();
