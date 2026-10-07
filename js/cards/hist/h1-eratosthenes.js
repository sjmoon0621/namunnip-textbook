/* 카드: 그림자 두 개로 지구의 크기를 잴 수 있을까? — 둥근 지구 + 먼 태양 vs 평평한 땅 + 가까운 태양 */
(() => {
  const root = document.getElementById("card-hist-eratosthenes");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sA = $(".a"), sD = $(".d"), cb = $(".third");
  const RAD = Math.PI / 180;
  const SUN = "#e0a02a", RAY = "rgba(224,160,42,.55)", STICK = C.ink, SHADOW = "#5d5d61";
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n3 = +cb.value, th = +sA.value * RAD, E = Math.max(1, Math.min(4, 75 / (Math.max(n3, 1) * +sA.value))), phi = E * th, third = n3 > 0;
    const pw = w / 2;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pw, 8); ctx.lineTo(pw, h - 8); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("둥근 지구 · 먼 태양", 10, 16); ctx.fillText("평평한 땅 · 가까운 태양", pw + 10, 16);

    /* 왼쪽: 둥근 지구 */
    const R = Math.min(pw * 0.36, h * 0.36), cx = pw * 0.55, cy = h * 0.6;
    ctx.fillStyle = "#e7efe2"; ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const cities = [[0, "시에네"], [phi, "알렉산드리아"]]; if (third) cities.push([n3 * phi, "세 번째"]);
    /* 평행 광선 */
    ctx.strokeStyle = RAY; ctx.lineWidth = 1;
    for (let k = -3; k <= 3; k++) { const x = cx + k * R * 0.32; ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, cy - Math.sqrt(Math.max(0, R * R - (x - cx) ** 2))); ctx.stroke(); }
    ctx.fillStyle = SUN; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("햇빛 (평행)", pw - 8, 34);
    const L = 26;
    cities.forEach(([a, name], i) => {
      const x = cx - Math.sin(a) * R, y = cy - Math.cos(a) * R;
      ctx.strokeStyle = "rgba(93,93,97,.5)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
      const tx = x - Math.sin(a) * L, ty = y - Math.cos(a) * L;
      /* 그림자: 막대 끝에서 연직으로 내려온 빛이 땅(원)에 닿는 점 */
      ctx.strokeStyle = STICK; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
      if (a > 1e-4 && a < Math.PI / 2) {
        /* 그림자: 그 자리의 지평면(접선)을 따라 L·tan(a) */
        const sl = Math.min(L * Math.tan(a), 3 * L), ex = x - Math.cos(a) * sl, ey = y + Math.sin(a) * sl;
        ctx.strokeStyle = SHADOW; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = RAY; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ex, Math.min(ty, ey) - 30); ctx.lineTo(ex, ey); ctx.stroke();
      }
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = i ? "left" : "center";
      if (i) ctx.fillText(name, x + 6 + 8 * Math.cos(a), y + 10 + 8 * Math.sin(a)); else ctx.fillText(name, tx, ty - 8);
    });
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 22, -Math.PI / 2 - phi, -Math.PI / 2); ctx.stroke();
    ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${(+sA.value).toFixed(1)}°`, cx + 6, cy - 8);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("지구 중심", cx, cy + 16);

    /* 오른쪽: 평평한 땅 */
    const gy = h * 0.86, xs = pw + pw * 0.16, D = Math.min(pw * 0.3, (w - 30 - xs) / Math.max(n3, 1)), H = D / Math.tan(phi), top = 46;
    const sunY = gy - H, sunShown = Math.max(top, sunY);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pw + 10, gy); ctx.lineTo(w - 8, gy); ctx.stroke();
    ctx.fillStyle = SUN; ctx.beginPath(); ctx.arc(xs, sunShown, 9, 0, Math.PI * 2); ctx.fill();
    if (sunY < top) { ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("↑ 태양은 더 높이", xs + 14, top + 4); }
    else { ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("가까운 태양", xs + 14, sunShown + 4); }
    const Lf = 26, flat = [[xs, "시에네"], [xs + D, "알렉산드리아"]]; if (third) flat.push([xs + n3 * D, "세 번째"]);
    flat.forEach(([x, name], i) => {
      const ty = gy - Lf;
      ctx.strokeStyle = RAY; ctx.lineWidth = 1.2; ctx.beginPath();
      const t = (gy - sunY) / (ty - sunY), shx = xs + (x - xs) * t;
      if (sunY >= top) { ctx.moveTo(xs, sunY); ctx.lineTo(shx, gy); } else { const t0 = (top - sunY) / (ty - sunY); ctx.moveTo(xs + (x - xs) * t0, top); ctx.lineTo(shx, gy); }
      ctx.stroke();
      ctx.strokeStyle = STICK; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, ty); ctx.stroke();
      if (i) { ctx.strokeStyle = SHADOW; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(Math.min(shx, w - 8), gy); ctx.stroke(); }
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(name, x, gy + 16 + (i === 1 && D < 80 ? 14 : 0));
    });
  }
  function update() {
    const a = +sA.value, d = +sD.value;
    $(".a-out").textContent = a.toFixed(1); $(".d-out").textContent = d;
    const c = 360 / a * d;
    $(".n-c").textContent = `${Math.round(c).toLocaleString()} 스타디온`;
    $(".n-km").textContent = `${Math.round(c * 0.1575).toLocaleString()} ~ ${Math.round(c * 0.185).toLocaleString()} km`;
    const H = d / Math.tan(a * RAD);
    $(".n-h").textContent = `${Math.round(H).toLocaleString()} 스타디온 (약 ${Math.round(H * 0.1575).toLocaleString()}~${Math.round(H * 0.185).toLocaleString()} km)`;
    const n3 = +cb.value; $(".n-out").textContent = n3;
    $(".n-3").textContent = !n3 ? "관측지를 추가하세요" : `${n3 * a >= 90 ? "해가 지평선 아래" : (n3 * a).toFixed(1) + "°"} / ${(Math.atan(n3 * Math.tan(a * RAD)) / RAD).toFixed(1)}°`;
    draw();
  }
  sA.addEventListener("input", update); sD.addEventListener("input", update); cb.addEventListener("input", update);
  if (window.NMLab && NMLab.demo) cb.value = 5;
  update();
})();
