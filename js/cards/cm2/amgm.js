/* 카드: 두 양수의 산술평균과 기하평균 가운데 어느 쪽이 클까? — 지름 a + b인 반원에서 수선 √(ab)와 반지름 (a + b)/2를 비교 */
(() => {
  const root = document.getElementById("card-cm2-amgm");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), ss = $(".s"), sa = $(".a");
  const n = (v) => String(Math.round(v * 1000) / 1000);
  let geo = null, drag = false;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = +ss.value, a = +sa.value, b = s - a, r = s / 2;
    const k = Math.min((w - 40) / s, (h - 46) / r), bx = (w - s * k) / 2, by = h - 30, cx = bx + r * k;
    geo = { bx, k, s };
    const Cx = bx + a * k, hgt = Math.sqrt(a * b) * k;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, by, r * k, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + s * k, by); ctx.stroke();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(Cx, by - hgt); ctx.lineTo(bx + s * k, by); ctx.stroke();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, by); ctx.lineTo(cx, by - r * k); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(Cx, by); ctx.lineTo(Cx, by - hgt); ctx.stroke();
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(Cx, by, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(Cx, by - hgt, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `12px ${F.mono}`; ctx.textBaseline = "top"; ctx.textAlign = "center"; ctx.fillStyle = C.ink2;
    if (a * k > 22) ctx.fillText(`a = ${n(a)}`, bx + a * k / 2, by + 8);
    if (b * k > 22) ctx.fillText(`b = ${n(b)}`, Cx + b * k / 2, by + 8);
    ctx.textBaseline = "middle"; ctx.font = `600 12px ${F.mono}`;
    const left = Cx < cx, gt = `√(ab) = ${n(Math.sqrt(a * b))}`, at = `(a+b)/2 = ${n(r)}`;
    const gw = ctx.measureText(gt).width, aw = ctx.measureText(at).width;
    /* 라벨이 캔버스 밖으로 나가면 선의 반대쪽에 붙이고, 배경을 깔아 호와 겹쳐도 읽히게 한다 */
    const tag = (t, tw, x, y, onLeft, col) => {
      const x1 = onLeft ? x - 8 - tw : x + 8;
      ctx.fillStyle = C.card; ctx.globalAlpha = 0.85; ctx.fillRect(x1 - 2, y - 8, tw + 4, 16); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.textAlign = "left"; ctx.fillText(t, x1, y);
    };
    if (Math.abs(Cx - cx) > 4) tag(gt, gw, Cx, by - hgt / 2, left && Cx - 8 - gw > 2 || !left && Cx + 8 + gw > w - 2, C.forest);
    tag(at, aw, cx, by - r * k * 0.75, !left, C.amber);
    if (Math.abs(a - b) < 1e-9) { ctx.fillStyle = C.forest; ctx.textAlign = "left"; ctx.fillText("a = b: 두 평균이 같습니다", cx + 8, by - r * k * 0.3); }
  }
  function update() {
    const s = +ss.value; sa.max = s - 0.5; if (+sa.value > s - 0.5) sa.value = s - 0.5;
    const a = +sa.value, b = s - a, am = s / 2, gm = Math.sqrt(a * b);
    $(".s-out").textContent = s; $(".a-out").textContent = n(a);
    $(".n-am").textContent = n(am); $(".n-gm").textContent = n(gm);
    const d = $(".n-d"); d.textContent = n(am - gm); d.className = `n-d ${am - gm < 1e-9 ? "good" : ""}`;
    $(".eq").innerHTML = `<i>a</i> = ${n(a)}, <i>b</i> = ${n(b)}, <i>ab</i> = ${n(a * b)}<br>합이 ${s}일 때 <i>ab</i>의 최댓값은 (${s}/2)<sup>2</sup> = ${n(am * am)}`;
    draw();
  }
  const pick = (e) => {
    if (!geo) return;
    const r = cv.getBoundingClientRect(), v = ((e.clientX - r.left) - geo.bx) / geo.k;
    sa.value = clamp(Math.round(v * 2) / 2, 0.5, geo.s - 0.5); update();
  };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) pick(e); });
  cv.addEventListener("pointerup", () => { drag = false; });
  cv.addEventListener("pointercancel", () => { drag = false; });
  [ss, sa].forEach((s) => s.addEventListener("input", update));
  update();
})();
