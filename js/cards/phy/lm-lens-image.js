/* 카드: 렌즈를 반쯤 가리면 상도 반만 생길까? — 얇은 렌즈의 상 작도 */
(() => {
  const root = document.getElementById("card-phy-lm-image");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const aS = $(".a"), fS = $(".f"), cover = $(".cover");
  const aO = $(".a-out"), fO = $(".f-out");
  const bEl = $(".b"), mEl = $(".m"), kEl = $(".kind2");
  const HO = 2, LH = 5.5, XR = 60, VS = 3; // 물체 높이 2 cm, 렌즈 반높이 5.5 cm, 가로 ±60 cm, 세로 3배 확대
  let concave = false;

  const focal = () => (concave ? -1 : 1) * +fS.value;
  const { ctx, size } = fit(cv, () => draw());
  let geo = null;

  function arrow(x, y0, y1, color, dash) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5; ctx.setLineDash(dash ? [4, 3] : []);
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.setLineDash([]);
    const s = Math.sign(y1 - y0) || 1;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 5, y1 - 8 * s); ctx.lineTo(x + 5, y1 - 8 * s); ctx.closePath(); ctx.fill();
  }

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const sc = (w - 16) / (2 * XR), X = (x) => w / 2 + x * sc, Y = (y) => h / 2 - y * sc * VS;
    geo = { X, sc, w };
    const a = +aS.value, f = focal();
    const b = Math.abs(a - f) < 1e-6 ? Infinity : a * f / (a - f), hi = isFinite(b) ? -HO * b / a : Infinity;
    // 축, 초점
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, Y(0) + .5); ctx.lineTo(w, Y(0) + .5); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (const [x, lab] of [[-Math.abs(f), "F"], [Math.abs(f), "F′"], [-2 * Math.abs(f), "2F"], [2 * Math.abs(f), "2F′"]]) {
      if (Math.abs(x) > XR) continue;
      ctx.fillStyle = C.ink3; ctx.beginPath(); ctx.arc(X(x), Y(0), 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(lab, X(x), Y(0) + 15);
    }
    // 렌즈
    const lx = X(0), ly0 = Y(LH), ly1 = Y(-LH);
    ctx.fillStyle = "rgba(92,150,190,.14)"; ctx.strokeStyle = "#4b7fa3"; ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (!concave) ctx.ellipse(lx, (ly0 + ly1) / 2, 7, (ly1 - ly0) / 2, 0, 0, Math.PI * 2);
    else { const k = 6; ctx.moveTo(lx - 8, ly0); ctx.lineTo(lx + 8, ly0); ctx.quadraticCurveTo(lx + 1, (ly0 + ly1) / 2, lx + 8, ly1); ctx.lineTo(lx - 8, ly1); ctx.quadraticCurveTo(lx - 1, (ly0 + ly1) / 2, lx - 8, ly0); void k; }
    ctx.fill(); ctx.stroke();
    if (cover.checked) { ctx.fillStyle = C.ink; ctx.fillRect(lx - 10, Y(0), 20, ly1 - Y(0) + 2); }

    // 광선: 물체 끝 (-a, HO)에서 출발. 렌즈를 지난 뒤 직선 y = y0 + s·x
    const rays = [
      { y0: HO, s: -HO / f },                       // 축에 나란히 → F′를 지남
      { y0: 0, s: -HO / a },                        // 렌즈 중심 → 곧게
      { y0: -HO * f / (a - f), s: 0 },              // F를 향해 → 축에 나란히
    ];
    const blocked = (y) => cover.checked && y < 0;
    const drawRay = (r, color, alpha, lw) => {
      if (!isFinite(r.y0) || Math.abs(r.y0) > 2.2 * LH) return;
      ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(X(-a), Y(HO)); ctx.lineTo(X(0), Y(r.y0)); ctx.stroke();
      if (blocked(r.y0)) { ctx.globalAlpha = 1; return; }
      ctx.beginPath(); ctx.moveTo(X(0), Y(r.y0)); ctx.lineTo(X(XR + 5), Y(r.y0 + r.s * (XR + 5))); ctx.stroke();
      if (b < 0 && isFinite(b)) { // 허상: 나간 광선을 뒤로 늘인다
        ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.globalAlpha = alpha * 0.7;
        ctx.beginPath(); ctx.moveTo(X(0), Y(r.y0)); ctx.lineTo(X(b), Y(r.y0 + r.s * b)); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.globalAlpha = 1;
    };
    if (cover.checked && isFinite(b)) { // 위 절반을 지나는 여러 광선
      for (let k = 1; k <= 6; k++) {
        const yl = LH * k / 6.5, s = (hi - yl) / b;
        drawRay({ y0: yl, s }, C.ink3, 0.35, 1);
      }
    }
    const cols = [C.forest, C.amber, "#4b7fa3"];
    rays.forEach((r, i) => drawRay(r, cols[i], 1, 1.5));
    // 물체
    arrow(X(-a), Y(0), Y(HO), C.ink, false);
    // 상
    ctx.textAlign = "center"; ctx.font = `10.5px ${F.mono}`;
    if (isFinite(b) && Math.abs(b) <= XR && Math.abs(hi) < 30) {
      ctx.globalAlpha = cover.checked ? 0.45 : 1;
      arrow(X(b), Y(0), Y(clamp(hi, -h / (2 * sc * VS) + 0.3, h / (2 * sc * VS) - 0.3)), C.apple, b < 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.apple; ctx.fillText(b < 0 ? "허상" : "실상", X(b), hi > 0 ? Y(0) + 15 : Y(0) - 7);
    } else {
      ctx.fillStyle = C.apple; ctx.textAlign = b > 0 ? "right" : "left";
      ctx.fillText(isFinite(b) ? (b > 0 ? "상은 오른쪽 멀리 →" : "← 상은 왼쪽 멀리") : "상이 생기지 않음 (나란한 빛)", b > 0 || !isFinite(b) ? w - 8 : 8, 16);
    }
    ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("세로는 3배 늘려 그림", 8, h - 8);
  }

  function update() {
    const a = +aS.value, f = focal();
    aO.textContent = a; fO.textContent = fS.value;
    if (Math.abs(a - f) < 1e-6) { bEl.textContent = "∞"; mEl.textContent = "—"; kEl.textContent = "상 없음"; }
    else {
      const b = a * f / (a - f), m = -b / a;
      bEl.textContent = `${b.toFixed(1)} cm`;
      mEl.textContent = `${m.toFixed(2)}배`;
      kEl.textContent = `${b > 0 ? "실상" : "허상"} · ${m < 0 ? "거꾸로" : "바로"} · ${Math.abs(m) > 1.005 ? "확대" : Math.abs(m) < 0.995 ? "축소" : "같은 크기"}`;
    }
    draw();
  }
  [aS, fS].forEach((el) => el.addEventListener("input", update));
  cover.addEventListener("change", update);
  root.querySelectorAll("[data-af]").forEach((btn) => btn.addEventListener("click", () => {
    aS.value = Math.round(+btn.dataset.af * +fS.value); update();
  }));
  const kinds = root.querySelectorAll("[data-lens]");
  kinds.forEach((btn) => btn.addEventListener("click", () => {
    concave = btn.dataset.lens === "concave"; kinds.forEach((o) => o.setAttribute("aria-pressed", o === btn)); update();
  }));
  // 물체를 좌우로 끌기
  let drag = false;
  const move = (e) => {
    if (!geo) return;
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left - geo.w / 2) / geo.sc;
    aS.value = clamp(Math.round(-x), +aS.min, +aS.max); update();
  };
  cv.style.touchAction = "pan-y";
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); move(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) move(e); });
  cv.addEventListener("pointerup", () => { drag = false; });
  update();
})();
