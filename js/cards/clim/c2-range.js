/* 카드: 기온이 오르면 생물은 어디로 옮겨 갈까? — 원뿔 산의 고도 띠, 한반도 위도 띠 (모식), IPCC AR6 시나리오 값 */
(() => {
  const root = document.getElementById("card-clim-range-shift");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const LAND = (window.NMEastAsia && window.NMEastAsia.land) || [];
  const SSP = [0, 1.8, 2.7, 3.6, 4.4];
  const H = 1950, T0 = 16.5, LAPSE = 0.006;
  // 산: 지금 살고 있는 고도 범위(m)
  const MT = [["고산 식물", 1300, 1950, "#3f6fa3"], ["중턱 숲", 600, 1300, C.forest], ["저지대 상록수", 0, 600, "#c48a22"]];
  // 한반도: 평지 연평균 기온 범위(°C)
  const MAP = [["상록 활엽수림 (연평균 14 °C 이상)", 14, 99, C.forest], ["사과 재배 적지 (연평균 8–11 °C)", 8, 11, C.apple]];
  // IPCC AR6 WG2 SPM B.4.1: 지구 기온 상승별 '매우 높은 멸종 위험' 육상 종 비율
  const RISK = [[1.5, "3–14 %"], [2, "3–18 %"], [3, "3–29 %"], [4, "3–39 %"], [5, "3–48 %"]];
  let tab = "mt", sp = 0;
  const { ctx, size } = fit($("canvas"), () => draw());

  const coneArea = (z1, z2) => { const a = Math.max(0, Math.min(H, z1)), b = Math.max(0, Math.min(H, z2)); return (1 - a / H) ** 2 - (1 - b / H) ** 2; };
  const Tlat = (lat) => T0 - (lat - 33.5);

  function buildSp() {
    const L = tab === "mt" ? MT : MAP;
    if (sp >= L.length) sp = 0;
    $(".c2-sp").innerHTML = '<span class="mono small dim">생물</span>' + L.map((s, i) => `<button type="button" class="chip" data-p="${i}" aria-pressed="${i === sp}">${s[0]}</button>`).join("");
  }

  function drawMountain(dT) {
    const { w, h } = size;
    const [, z1, z2, col] = MT[sp];
    const shift = dT / LAPSE, n1 = z1 + shift, n2 = z2 + shift;
    const base = h - 30, top = 30, cx = w * 0.42, half = w * 0.36;
    const Z = (z) => base - z / H * (base - top);
    const R = (z) => half * (1 - z / H);
    // 하늘의 고도 눈금
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.strokeStyle = C.rule; ctx.textAlign = "right";
    for (let z = 0; z <= 2000; z += 500) { const y = Math.round(Z(z)) + .5; ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(w - 10, y); ctx.stroke(); ctx.fillText(`${z} m`, 36, y + 3); }
    // 산
    ctx.fillStyle = "#e7e3d6"; ctx.beginPath(); ctx.moveTo(cx - half, base); ctx.lineTo(cx, Z(H)); ctx.lineTo(cx + half, base); ctx.closePath(); ctx.fill();
    const band = (a, b, fill, stroke) => {
      a = Math.max(0, a); b = Math.min(H, b); if (a >= b) return;
      ctx.beginPath(); ctx.moveTo(cx - R(a), Z(a)); ctx.lineTo(cx - R(b), Z(b)); ctx.lineTo(cx + R(b), Z(b)); ctx.lineTo(cx + R(a), Z(a)); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]); }
    };
    band(z1, z2, null, col);
    ctx.globalAlpha = 0.55; band(n1, n2, col); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx - half, base); ctx.lineTo(cx, Z(H)); ctx.lineTo(cx + half, base); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillRect(40, base, w - 50, 1);
    // 오른쪽: 기온 눈금
    const lx = cx + half * 0.55 + 24;
    ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`;
    ctx.fillStyle = C.ink2; ctx.fillText("점선: 지금 사는 구역", lx, top + 6);
    ctx.fillStyle = col; ctx.fillText(dT > 0 ? `칠한 곳: +${dT.toFixed(1)} °C에서 알맞은 구역` : "칠한 곳: 지금", lx, top + 22);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText(`꼭대기 ${(T0 - H * LAPSE + dT).toFixed(1)} °C`, cx + 8, Z(H) + 4);
    ctx.fillText(`바닷가 ${(T0 + dT).toFixed(1)} °C`, cx + half - 4, base - 6);
    if (n1 >= H) { ctx.fillStyle = C.warn; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("알맞은 구역이 산꼭대기보다 위로 올라감", cx, Z(H) - 10); }
    const a0 = coneArea(z1, z2), a1 = coneArea(n1, n2);
    $(".d1").textContent = "올라가야 할 고도"; $(".n1").textContent = `+${Math.round(shift)} m`;
    $(".d2").textContent = "남는 서식 면적 (지금 = 100 %)";
    const pct = a1 / a0 * 100, el = $(".n2");
    el.textContent = `${pct.toFixed(0)} %`; el.className = "n2 " + (pct < 99 ? "bad" : pct > 101 ? "good" : "");
  }

  function drawMap(dT) {
    const { w, h } = size;
    const [, lo, hi, col] = MAP[sp];
    const lon0 = 123.5, lon1 = 131.5, lat0 = 33, lat1 = 43.2;
    const k = Math.min((w - 250) / (lon1 - lon0) / Math.cos(38 * Math.PI / 180), (h - 20) / (lat1 - lat0));
    const ox = 46, oy = 10;
    const X = (lo_) => ox + (lo_ - lon0) * k * Math.cos(38 * Math.PI / 180), Y = (la) => oy + (lat1 - la) * k;
    // 위도 띠: 기온이 lo~hi인 위도 범위
    const bandLat = (d) => [33.5 + (T0 + d - hi), 33.5 + (T0 + d - lo)];   // [남쪽 경계, 북쪽 경계]
    ctx.save();
    ctx.beginPath(); ctx.rect(X(lon0), Y(lat1), X(lon1) - X(lon0), Y(lat0) - Y(lat1)); ctx.clip();
    ctx.fillStyle = "#e3edf3"; ctx.fillRect(X(lon0), Y(lat1), X(lon1) - X(lon0), Y(lat0) - Y(lat1));
    const landPath = () => { ctx.beginPath(); for (const p of LAND) { let on = false; for (let i = 0; i < p.length; i += 2) { const x = X(p[i]), y = Y(p[i + 1]); on ? ctx.lineTo(x, y) : ctx.moveTo(x, y); on = true; } ctx.closePath(); } };
    landPath(); ctx.fillStyle = "#ece8dc"; ctx.fill();
    ctx.save(); landPath(); ctx.clip();
    const [s1, n1] = bandLat(dT), [s0, n0] = bandLat(0);
    ctx.globalAlpha = 0.55; ctx.fillStyle = col; ctx.fillRect(X(lon0), Y(Math.min(n1, 60)), X(lon1) - X(lon0), Y(Math.max(s1, 20)) - Y(Math.min(n1, 60)));
    ctx.globalAlpha = 1; ctx.restore();
    landPath(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([5, 3]);
    [s0, n0].forEach((la) => { if (la > lat0 && la < lat1) { ctx.beginPath(); ctx.moveTo(X(lon0), Y(la)); ctx.lineTo(X(lon1), Y(la)); ctx.stroke(); } });
    ctx.setLineDash([]); ctx.restore();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let la = 34; la <= 43; la += 1) ctx.fillText(`${la}°N`, ox - 4, Y(la) + 3);
    ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`;
    const lx = X(lon1) + 14;
    ctx.fillStyle = C.ink2; ctx.fillText("점선: 지금의 경계", lx, oy + 14);
    ctx.fillStyle = col; ctx.fillText(dT > 0 ? `칠한 곳: +${dT.toFixed(1)} °C` : "칠한 곳: 지금", lx, oy + 30);
    // 수치: 북쪽 경계 이동
    const nNow = n0, nFut = n1;
    $(".d1").textContent = "북쪽 경계 (평지 기준)";
    $(".n1").textContent = `${nNow.toFixed(1)}° → ${nFut.toFixed(1)}°N`;
    $(".d2").textContent = "북쪽으로 옮긴 거리";
    const el = $(".n2"); el.textContent = `약 ${Math.round(dT * 111)} km`; el.className = "n2" + (dT > 0 ? " bad" : "");
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const dT = +$(".dt").value;
    tab === "mt" ? drawMountain(dT) : drawMap(dT);
    const r = dT < 1.25 ? "1.5 °C 미만: 평가 범위보다 낮음" : RISK.reduce((b, x) => (Math.abs(x[0] - dT) < Math.abs(b[0] - dT) ? x : b))[1];
    $(".n3").textContent = dT < 1.25 ? "—" : `${r} (${RISK.reduce((b, x) => (Math.abs(x[0] - dT) < Math.abs(b[0] - dT) ? x : b))[0]} °C)`;
  }

  root.addEventListener("click", (e) => {
    const t = e.target.closest("[data-t]"), p = e.target.closest("[data-p]"), s = e.target.closest("[data-s]");
    if (t) { tab = t.dataset.t; root.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(b === t))); sp = 0; buildSp(); draw(); }
    if (p) { sp = +p.dataset.p; root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b === p))); draw(); }
    if (s) { root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b === s))); $(".dt").value = SSP[+s.dataset.s]; $(".dt-out").textContent = SSP[+s.dataset.s].toFixed(1); draw(); }
  });
  $(".dt").addEventListener("input", () => { $(".dt-out").textContent = (+$(".dt").value).toFixed(1); root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", "false")); draw(); });
  buildSp();
  draw();
})();
