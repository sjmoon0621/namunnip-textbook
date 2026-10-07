/* 카드: 극이 두 개였을까, 대륙이 움직였을까? — 잔류 자기 방향 → 가상 지자기 극 → 겉보기 극 이동 경로 */
(() => {
  const root = document.getElementById("card-labearth-apwp");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const LAND = (window.NMQuake || {}).land || [];
  const R = Math.PI / 180;

  /* 벡터 도구 */
  const vec = (lat, lon) => [Math.cos(lat * R) * Math.cos(lon * R), Math.cos(lat * R) * Math.sin(lon * R), Math.sin(lat * R)];
  const ll = (v) => [Math.asin(Math.max(-1, Math.min(1, v[2]))) / R, Math.atan2(v[1], v[0]) / R];
  function rot(v, axis, ang) {
    const k = vec(axis[0], axis[1]), c = Math.cos(ang * R), s = Math.sin(ang * R), d = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
    const x = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]];
    return v.map((vi, i) => vi * c + x[i] * s + k[i] * d * (1 - c));
  }
  const rotLL = (lat, lon, axis, ang) => ll(rot(vec(lat, lon), axis, ang));
  const angDist = (a, b) => { const u = vec(a[0], a[1]), v = vec(b[0], b[1]); return Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2]))) / R; };

  /* 북아메리카의 대표 극 위치 (모식: 실제 겉보기 극 이동 경로의 모양을 단순화한 값) */
  const AGES = [50, 100, 150, 200, 250, 300, 350, 400];
  const NA = { 0: [90, 0], 50: [81, 185], 100: [74, 195], 150: [70, 150], 200: [65, 90], 250: [53, 118], 300: [40, 125], 350: [28, 128], 400: [18, 132] };
  /* 대서양을 닫는 회전: 오일러 극 88.5°N 27.7°E (불러드 등, 1965의 맞춤 극) — 각도는 숨긴 참값 */
  const EP = [88.5, 27.7], ANG = 38;
  const openFrac = (t) => Math.min(1, t / 180);
  const EU = {}; AGES.forEach((t) => { EU[t] = rotLL(NA[t][0], NA[t][1], EP, ANG * openFrac(t)); });
  const SITE = { na: { name: "북아메리카 (미국 애리조나)", lat: 35.0, lon: -111.0, poles: NA, col: C.apple }, eu: { name: "유럽 (영국 스코틀랜드)", lat: 57.0, lon: -4.0, poles: EU, col: "#3460aa" } };

  /* 극과 지점 → 잔류 자기 방향 (편각 D, 복각 I) */
  function dirFromPole(site, pole) {
    const p = angDist([site.lat, site.lon], pole);
    const dl = (pole[1] - site.lon) * R, a = site.lat * R, b = pole[0] * R;
    const D = Math.atan2(Math.sin(dl) * Math.cos(b), Math.cos(a) * Math.sin(b) - Math.sin(a) * Math.cos(b) * Math.cos(dl)) / R;
    const I = Math.atan(2 / Math.tan(p * R)) / R;
    return { D: (D + 360) % 360, I };
  }
  /* 방향 → 고위도, 가상 지자기 극 (VGP) */
  function vgp(site, D, I) {
    const p = Math.atan2(2, Math.tan(I * R)), a = site.lat * R, d = D * R;
    const lp = Math.asin(Math.sin(a) * Math.cos(p) + Math.cos(a) * Math.sin(p) * Math.cos(d));
    const be = Math.asin(Math.max(-1, Math.min(1, Math.sin(p) * Math.sin(d) / Math.cos(lp))));
    let lon = Math.cos(p) >= Math.sin(a) * Math.sin(lp) ? site.lon * R + be : site.lon * R + Math.PI - be;
    lon = ((lon / R) % 360 + 360) % 360;
    return { plat: Math.atan(Math.tan(I * R) / 2) / R, lat: lp / R, lon };
  }

  let cont = "na", age = 300, theta = 0;
  const map = fit($(".cv-sq"), () => drawMap());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "c", label: "대륙" }, { key: "t", label: "나이 (Ma)", res: 1 }, { key: "D", label: "편각 D (°)", res: 1 }, { key: "I", label: "복각 I (°)", res: 1 },
    { key: "pl", label: "고위도 λ (°)", res: 0.1 }, { key: "lat", label: "극 위도 (°N)", res: 1 }, { key: "lon", label: "극 경도 (°E)", res: 1 },
  ], () => { drawMap(); drawPlot(); });

  const isNA = (p) => { const lo = p[0], la = p[1]; return (lo > -170 && lo < -52 && la > 7 && la < 84) || (lo > -75 && lo < -10 && la > 59); };

  function drawMap() {
    const { ctx } = map, { w, h } = map.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, Rr = Math.min(w, h) / 2 - 22, MAXC = 100, ROT0 = 160;
    const P = (lat, lon) => { const r = (90 - lat) / MAXC * Rr, a = (lon - ROT0) * R; return [cx + r * Math.sin(a), cy + r * Math.cos(a)]; };
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, Rr, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "#e6eef4"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 0.8;
    [30, 60, 90].forEach((c) => { ctx.beginPath(); ctx.arc(cx, cy, c / MAXC * Rr, 0, Math.PI * 2); ctx.stroke(); });
    for (let lo = 0; lo < 360; lo += 30) { const [x, y] = P(-10, lo); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); }
    for (const p of LAND) {
      const na = isNA(p);
      ctx.strokeStyle = na ? "rgba(212,73,58,.85)" : "rgba(35,35,38,.4)"; ctx.lineWidth = na ? 1.1 : 0.8;
      ctx.beginPath(); let prev = null;
      for (let k = 0; k < p.length; k += 2) {
        let la = p[k + 1], lo = p[k];
        if (na && theta) [la, lo] = rotLL(la, lo, EP, theta);
        if (la < -12) { prev = null; continue; }
        const [x, y] = P(la, lo);
        if (prev && Math.hypot(x - prev[0], y - prev[1]) < Rr * 0.25) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        prev = [x, y];
      }
      ctx.stroke();
    }
    const path = (key) => {
      const rows = tbl.rows.filter((r) => r.key === key).sort((a, b) => a.t - b.t);
      const pts = rows.map((r) => (key === "na" && theta ? rotLL(r.lat, r.lon, EP, theta) : [r.lat, r.lon]));
      ctx.strokeStyle = SITE[key].col; ctx.fillStyle = SITE[key].col; ctx.lineWidth = 1.6;
      ctx.beginPath(); [[90, 0], ...pts].forEach((q, i) => { const [x, y] = P(q[0], q[1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      ctx.font = `10.5px ${F.mono}`;
      pts.forEach((q, i) => { const [x, y] = P(q[0], q[1]); ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.fill(); if (rows[i].t % 100 === 0) { ctx.textAlign = key === "na" ? "right" : "left"; ctx.fillText(rows[i].t, x + (key === "na" ? -6 : 6), y + 4); } });
    };
    path("na"); path("eu");
    const [ex, ey] = P(EP[0], EP[1]); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ex - 4, ey); ctx.lineTo(ex + 4, ey); ctx.moveTo(ex, ey - 4); ctx.lineTo(ex, ey + 4); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.arc(cx, cy, Rr, 0, Math.PI * 2); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    [0, 90, 180, 270].forEach((lo) => { const [x, y] = P(90 - MAXC - 9, lo); ctx.fillText(lo === 0 ? "0°" : lo === 180 ? "180°" : lo === 90 ? "90°E" : "90°W", x, y + 4); });
    /* 같은 나이 극 사이 각거리 */
    const pairs = AGES.map((t) => [tbl.rows.find((r) => r.key === "na" && r.t === t), tbl.rows.find((r) => r.key === "eu" && r.t === t)]).filter(([a, b]) => a && b);
    if (pairs.length) {
      const ds = pairs.map(([a, b]) => angDist(theta ? rotLL(a.lat, a.lon, EP, theta) : [a.lat, a.lon], [b.lat, b.lon]));
      const old = pairs.map((q, i) => (q[0].t >= 200 ? ds[i] : null)).filter((v) => v != null);
      $(".n-1").textContent = ds.length ? (ds.reduce((s, v) => s + v, 0) / ds.length).toFixed(1) + "°" : "—";
      $(".n-2").textContent = old.length ? (old.reduce((s, v) => s + v, 0) / old.length).toFixed(1) + "°" : "—";
    } else { $(".n-1").textContent = "—"; $(".n-2").textContent = "—"; }
    $(".n-3").textContent = theta + "°";
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bx = { x0: 46, y0: 22, w: w - 60, h: h - 56 };
    const res = L.plot(ctx, bx, { pts: tbl.rows.filter((r) => r.key === "na").map((r) => ({ x: r.t, y: r.pl })), xr: [0, 420], yr: [-30, 60], xlabel: "나이 (Ma)", ylabel: "시료 채취 지점의 고위도 λ (°)", color: C.apple });
    ctx.fillStyle = "#3460aa";
    tbl.rows.filter((r) => r.key === "eu").forEach((r) => { ctx.beginPath(); ctx.arc(res.X(r.t), res.Y(r.pl), 3.2, 0, Math.PI * 2); ctx.fill(); });
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(bx.x0, res.Y(0)); ctx.lineTo(bx.x0 + bx.w, res.Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("적도", bx.x0 + bx.w - 4, res.Y(0) - 4);
  }

  function measure(key, t) {
    const s = SITE[key], d = dirFromPole(s, s.poles[t]);
    const I = L.snap(d.I + 2.5 * L.gauss(), 1), D = L.snap((d.D + 2.5 * L.gauss() / Math.cos(d.I * R) + 360) % 360, 1);
    const v = vgp(s, D, I);
    const old = tbl.rows.findIndex((r) => r.key === key && r.t === t); if (old >= 0) tbl.rows.splice(old, 1);
    tbl.add({ key, c: key === "na" ? "북아메리카" : "유럽", t, D, I, pl: v.plat, lat: v.lat, lon: v.lon });
  }
  const sel = (attr, val) => root.querySelectorAll(`[${attr}]`).forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute(attr) === String(val))));
  $(".conts").addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (!b) return; cont = b.dataset.c; sel("data-c", cont); $(".site").textContent = SITE[cont].name + ` ${SITE[cont].lat}°N ${Math.abs(SITE[cont].lon)}°W`; });
  const ab = $(".ages");
  ab.innerHTML = '<span class="mono small dim">지층 나이</span>' + AGES.map((t) => `<button class="chip" type="button" data-a="${t}" aria-pressed="${t === age}">${t} Ma</button>`).join("");
  ab.addEventListener("click", (e) => { const b = e.target.closest("[data-a]"); if (!b) return; age = +b.dataset.a; sel("data-a", age); });
  $(".meas").addEventListener("click", () => measure(cont, age));
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".th").addEventListener("input", (e) => { theta = +e.target.value; $(".th-out").textContent = theta; drawMap(); });
  $(".site").textContent = SITE.na.name + " 35°N 111°W";
  if (L.demo) { AGES.forEach((t) => { measure("na", t); measure("eu", t); }); }
})();
