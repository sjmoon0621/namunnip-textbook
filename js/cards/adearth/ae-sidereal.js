/* 카드: 오늘 밤 9시에 남중한 별은 한 달 뒤 몇 시에 남중할까? — 항성일과 태양일, 지방 항성시와 시간각 */
(() => {
  const root = document.getElementById("card-adearth-sidereal");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".d"), sT = $(".t"), sL = $(".l");
  const R = Math.PI / 180, EPS = 23.439;
  /* 밝은 별: 이름, 적경(시), 적위(°) — J2000.0 */
  const STARS = [
    ["시리우스", 6.752, -16.72], ["레굴루스", 10.140, 11.97], ["안타레스", 16.490, -26.43], ["직녀성", 18.616, 38.78], ["포말하우트", 22.961, -29.62],
    ["리겔", 5.242, -8.20], ["베텔게우스", 5.919, 7.41], ["알데바란", 4.599, 16.51], ["카펠라", 5.278, 46.00], ["프로키온", 7.655, 5.22],
    ["폴룩스", 7.755, 28.03], ["스피카", 13.420, -11.16], ["아크투루스", 14.261, 19.18], ["견우성", 19.846, 8.87], ["데네브", 20.690, 45.28],
  ];
  let T = 45 * 1440 + 1260; /* 2026-01-01 00:00 KST부터 흐른 분 */
  let pick = 0;
  const wrap24 = (h) => ((h % 24) + 24) % 24;
  const wrap12 = (h) => { h = wrap24(h); return h > 12 ? h - 24 : h; };
  const D0 = 9496.5; /* 2026-01-01 00:00 UT의 J2000.0 기준 일수 */
  const dayJ = (Tm) => D0 + (Tm / 60 - 9) / 24;
  const gmst = (D) => wrap24(18.697374558 + 24.06570982441908 * D);
  const lst = (Tm) => wrap24(gmst(dayJ(Tm)) + +sL.value / 15);
  function sun(D) {
    const L = 280.460 + 0.9856474 * D, g = (357.528 + 0.9856003 * D) * R;
    const lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * R;
    const ra = wrap24(Math.atan2(Math.cos(EPS * R) * Math.sin(lam), Math.cos(lam)) / R / 15);
    const dec = Math.asin(Math.sin(EPS * R) * Math.sin(lam)) / R;
    return { lam: ((lam / R) % 360 + 360) % 360, ra, dec };
  }
  const hms = (h, sec) => { const s = Math.round(wrap24(h) * 3600) % 86400; const hh = Math.floor(s / 3600), mm = Math.floor(s / 60) % 60, ss = s % 60; return sec ? `${hh}시 ${String(mm).padStart(2, "0")}분 ${String(ss).padStart(2, "0")}초` : `${hh}시 ${String(mm).padStart(2, "0")}분`; };
  const sgn = (h) => { const s = h < 0 ? "−" : "+"; const m = Math.round(Math.abs(h) * 60); return `${s}${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`; };
  const dateStr = (Tm) => { const d = new Date(Date.UTC(2026, 0, 1) + Math.floor(Tm / 1440) * 864e5); return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`; };
  /* 그날(한국 표준시 0–24시) 별이 남중하는 시각 */
  function transit(ra, Tm) {
    const day0 = Math.floor(Tm / 1440) * 1440;
    let h = wrap12(lst(day0) - ra); /* 자정의 시간각 */
    let m = -h * 60 / 1.0027379;
    if (m < 0) m += 1436.068;
    return day0 + m;
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const D = dayJ(T), S = sun(D), L = lst(T);
    /* 위: 공전 궤도 (북쪽에서 본 모식) */
    const cy = h * 0.32, cx = w * 0.40, ro = Math.min(h * 0.24, w * 0.26);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, ro, 0, 2 * Math.PI); ctx.stroke();
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 2 * Math.PI); ctx.fill();
    /* 춘분점 방향: 오른쪽 */
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("→ 춘분점 방향 (먼 별)", cx + ro + 6, 14);
    const ea = (S.lam + 180) * R, ex = cx + ro * Math.cos(ea), ey = cy - ro * Math.sin(ea);
    /* 밤쪽 */
    const toSun = Math.atan2(cy - ey, cx - ex);
    ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(ex, ey, 11, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = C.night; ctx.beginPath(); ctx.arc(ex, ey, 11, toSun + Math.PI / 2, toSun + 1.5 * Math.PI); ctx.fill();
    /* 태양 방향(점선), 춘분점 방향 평행선(점선) */
    ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.strokeStyle = C.amber; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(cx, cy); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + 40, ey); ctx.stroke();
    ctx.setLineDash([]);
    /* 관측자의 자오선 방향 = 적경 LST 방향 */
    const ma = L * 15 * R;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + 34 * Math.cos(ma), ey - 34 * Math.sin(ma)); ctx.stroke();
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(ex + 11 * Math.cos(ma), ey - 11 * Math.sin(ma), 2.6, 0, 2 * Math.PI); ctx.fill();
    /* 오른쪽 범례 */
    const lx = w * 0.74; let ly = cy - 30;
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    const leg = (col, dash, txt) => { ctx.strokeStyle = col; ctx.lineWidth = dash ? 1 : 2.2; ctx.setLineDash(dash ? [3, 3] : []); ctx.beginPath(); ctx.moveTo(lx, ly - 3); ctx.lineTo(lx + 16, ly - 3); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.ink2; ctx.fillText(txt, lx + 20, ly); ly += 16; };
    leg(C.forest, false, "관측자 자오선");
    leg(C.amber, true, "태양 방향");
    leg(C.ink3, true, "춘분점 방향");
    ctx.fillStyle = C.ink3; ctx.fillText(`태양 황경 ${S.lam.toFixed(1)}°`, lx, ly + 4);
    ctx.fillText(`태양 적경 ${hms(S.ra)}`, lx, ly + 18);
    /* 아래: 하늘 띠 */
    const y0 = h * 0.62, y1 = h - 22, x0 = 34, x1 = w - 8, xc = (x0 + x1) / 2;
    const X = (ra) => xc - wrap12(ra - L) / 12 * (x1 - x0) / 2;
    const Y = (dec) => y1 - (dec + 35) / 85 * (y1 - y0);
    ctx.fillStyle = "#101418"; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(x0, y0, (x1 - x0) / 4, y1 - y0); ctx.fillRect(x1 - (x1 - x0) / 4, y0, (x1 - x0) / 4, y1 - y0);
    ctx.strokeStyle = "rgba(255,255,255,.15)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(xc, y0); ctx.lineTo(xc, y1); ctx.stroke();
    /* 적경 눈금 */
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    for (let k = 0; k < 24; k += 2) { const x = X(k); if (x > x0 + 6 && x < x1 - 6) ctx.fillText(`${k}h`, x, y1 + 13); }
    ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`;
    ctx.fillText("← 동쪽 (적경 증가)", x0, y0 - 6); ctx.textAlign = "right"; ctx.fillText("서쪽 →", x1, y0 - 6);
    ctx.textAlign = "center"; ctx.fillStyle = C.forest; ctx.fillText("자오선", xc, y0 - 6);
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`;
    for (const d of [-30, 0, 30]) ctx.fillText(`${d}°`, x0 - 3, Y(d) + 3);
    /* 태양 */
    const sx = X(S.ra);
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(sx, Y(S.dec), 6, 0, 2 * Math.PI); ctx.fill();
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("태양", sx, Y(S.dec) - 10);
    /* 별 */
    STARS.forEach(([nm, ra, dec], i) => {
      const x = X(ra), y = Y(dec), on = i === pick;
      ctx.fillStyle = on ? "#ffd166" : "#dfe8f5"; ctx.beginPath(); ctx.arc(x, y, on ? 3.6 : 2.2, 0, 2 * Math.PI); ctx.fill();
      if (i < 5 || on) { ctx.font = `${on ? "bold " : ""}10px ${F.sans}`; ctx.fillStyle = on ? "#ffd166" : "#b9c4d4"; ctx.textAlign = x > x1 - 50 ? "right" : "left"; ctx.fillText(nm, x + (x > x1 - 50 ? -5 : 5), y - 4); }
    });
  }
  function update() {
    sD.value = Math.floor(T / 1440); sT.value = Math.floor(T % 1440);
    root.querySelector(".d-out").textContent = dateStr(T);
    const m = T % 1440; root.querySelector(".t-out").textContent = `${Math.floor(m / 60)}시 ${String(Math.floor(m % 60)).padStart(2, "0")}분 ${String(Math.round((m % 1) * 60) % 60).padStart(2, "0")}초`;
    root.querySelector(".l-out").textContent = (+sL.value).toFixed(1);
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.s === pick)));
    const L = lst(T), S = sun(dayJ(T)), st = STARS[pick];
    root.querySelector(".n-lst").textContent = hms(L, true);
    root.querySelector(".n-hs").textContent = sgn(wrap12(L - S.ra));
    root.querySelector(".n-h").textContent = sgn(wrap12(L - st[1]));
    const tr = transit(st[1], T) % 1440;
    root.querySelector(".n-tr").textContent = `${Math.floor(tr / 60)}:${String(Math.floor(tr % 60)).padStart(2, "0")}:${String(Math.floor((tr % 1) * 60)).padStart(2, "0")}`;
    draw();
  }
  const setT = () => { T = +sD.value * 1440 + +sT.value; update(); };
  sD.addEventListener("input", setT); sT.addEventListener("input", setT); sL.addEventListener("input", update);
  const step = (dm) => { T = Math.min(364 * 1440 + 1439, Math.max(0, T + dm)); update(); };
  $(".ae-sid").addEventListener("click", () => step(1436.0682));
  $(".ae-sol").addEventListener("click", () => step(1440));
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { pick = +b.dataset.s; update(); }));
  update();
})();
