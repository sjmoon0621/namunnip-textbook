/* 카드: 미토콘드리아의 안쪽 막은 왜 주름져 있을까? — 단면 모식. 크리스타 수에 따른 내막 길이와 ATP 합성 효소 수, 부위별 기능 */
(() => {
  const root = document.getElementById("card-cell-mito");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".cr"), oC = $(".c-out"), where = $(".where");
  const nR = $(".n-r"), nA = $(".n-a");
  const INFO = {
    outer: "<b>외막</b>: 매끈한 인지질 2중층. 통로 단백질(포린)이 많아 작은 분자와 이온이 비교적 쉽게 드나듭니다.",
    ims: "<b>막 사이 공간</b>: 전자 전달계가 기질에서 퍼 낸 H⁺가 모여, 기질보다 H⁺ 농도가 높습니다(pH가 낮음).",
    inner: "<b>내막(크리스타)</b>: 전자 전달계와 ATP 합성 효소가 박혀 있어 산화적 인산화가 일어납니다. H⁺를 거의 통과시키지 않습니다.",
    matrix: "<b>기질</b>: 피루브산 산화와 TCA 회로의 효소, 미토콘드리아의 고리 모양 DNA와 리보솜이 있습니다.",
  };
  let zone = "inner";

  // 내막 경로: 캡슐 모양을 따라가다 위·아래에서 번갈아 손가락처럼 안으로 들어감
  function innerPath(cx, cy, W, H, n) {
    const pts = [], r = H / 2, x0 = cx - W / 2 + r, x1 = cx + W / 2 - r;
    const top = [], bot = [];
    const fingers = (arr, sign, k) => {
      const len = (x1 - x0), fw = Math.min(7, len / Math.max(1, k) * 0.28), depth = H * 0.4;
      for (let i = 0; i < k; i++) {
        const fx = x0 + len * (i + (sign < 0 ? 0.3 : 0.7)) / k;
        arr.push([fx - fw, cy + sign * r], [fx - fw * 0.7, cy + sign * (r - depth)], [fx + fw * 0.7, cy + sign * (r - depth)], [fx + fw, cy + sign * r]);
      }
    };
    const kt = Math.ceil(n / 2), kb = Math.floor(n / 2);
    // 위쪽 (왼→오)
    pts.push([x0, cy - r]); fingers(top, -1, kt); top.forEach((p) => pts.push(p)); pts.push([x1, cy - r]);
    for (let a = -Math.PI / 2; a <= Math.PI / 2; a += 0.1) pts.push([x1 + Math.cos(a) * r, cy + Math.sin(a) * r]);
    pts.push([x1, cy + r]); fingers(bot, 1, kb); bot.reverse().forEach((p) => pts.push(p)); pts.push([x0, cy + r]);
    for (let a = Math.PI / 2; a <= Math.PI * 1.5; a += 0.1) pts.push([x0 + Math.cos(a) * r, cy + Math.sin(a) * r]);
    return pts;
  }
  const plen = (p) => { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L + Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]); };
  const capLen = (W, H) => 2 * (W - H) + Math.PI * H;

  const { ctx, size } = fit(cv, () => draw());
  let last = { ratio: 1, n: 0 };
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sC.value, cx = w / 2, cy = h / 2 + 2, W = w * 0.9, H = h * 0.6, g = 10;
    const cap = (W2, H2) => { const r = H2 / 2; ctx.beginPath(); ctx.moveTo(cx - W2 / 2 + r, cy - r); ctx.lineTo(cx + W2 / 2 - r, cy - r); ctx.arc(cx + W2 / 2 - r, cy, r, -Math.PI / 2, Math.PI / 2); ctx.lineTo(cx - W2 / 2 + r, cy + r); ctx.arc(cx - W2 / 2 + r, cy, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); };
    const hl = (z) => zone === z;
    // 외막 + 막 사이 공간
    cap(W, H); ctx.fillStyle = hl("ims") ? "#f2c9bf" : "#f6e3dd"; ctx.fill();
    ctx.strokeStyle = hl("outer") ? C.warn : "#b98a7c"; ctx.lineWidth = hl("outer") ? 4 : 2.2; ctx.stroke();
    // 내막 + 기질
    const P = innerPath(cx, cy, W - 2 * g, H - 2 * g, n);
    ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.fillStyle = hl("matrix") ? "#e9dcc0" : "#f4efe2"; ctx.fill();
    ctx.strokeStyle = hl("inner") ? C.warn : "#b98a7c"; ctx.lineWidth = hl("inner") ? 3.2 : 2; ctx.lineJoin = "round"; ctx.stroke();
    // ATP 합성 효소: 내막을 따라 일정 간격
    const L = plen(P), step = 14; let acc = 0, cnt = 0, next = step / 2;
    ctx.fillStyle = "#3f6fa3";
    for (let i = 1; i <= P.length; i++) {
      const a = P[i - 1], b = P[i % P.length], seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
      while (next <= acc + seg) { const t = (next - acc) / seg; ctx.beginPath(); ctx.arc(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 2.4, 0, 6.29); ctx.fill(); cnt++; next += step; }
      acc += seg;
    }
    // 기질 속 DNA·리보솜
    ctx.strokeStyle = "#8a4fb0"; ctx.lineWidth = 1.4;
    [[-0.3, 0.05], [0.28, -0.05]].forEach(([fx, fy]) => { ctx.beginPath(); ctx.ellipse(cx + fx * W, cy + fy * H, 9, 6, 0.4, 0, 6.29); ctx.stroke(); });
    ctx.fillStyle = C.ink3; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(cx + (i / 8 - 0.5) * W * 0.7, cy + ((i % 3) - 1) * H * 0.12 + 4, 1.6, 0, 6.29); ctx.fill(); }
    // 이름표
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left";
    const tag = (t, x, y, z) => { ctx.fillStyle = hl(z) ? C.warn : C.ink2; ctx.fillText(t, x, y); };
    const lead = (t, x, y, tx, ty, z) => { ctx.strokeStyle = hl(z) ? C.warn : C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, ty - 4); ctx.lineTo(x, y); ctx.stroke(); tag(t, tx - 10, ty - 8, z); };
    const r0 = H / 2, ax = cx - W / 2 + r0;
    lead("외막", ax - r0 * 0.7, cy - r0 * 0.7, ax - r0 * 0.7 - 6, cy - H / 2 - 10, "outer");
    lead("막 사이 공간", ax - r0 * 0.62 + 6, cy - r0 * 0.55 + 6, ax + 30, cy - H / 2 - 10, "ims");
    ctx.fillStyle = "rgba(244,239,226,.85)"; ctx.fillRect(cx - 18, cy - 10, 36, 18);
    tag("기질", cx - 12, cy + 4, "matrix");
    ctx.fillStyle = "#3f6fa3"; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("● ATP 합성 효소", cx + W / 2, cy + H / 2 + 14);
    ctx.fillStyle = "#8a4fb0"; ctx.textAlign = "left"; ctx.fillText("○ DNA  · 리보솜", cx - W / 2, cy + H / 2 + 14);
    last = { ratio: L / capLen(W, H), n: cnt };
  }
  function update() {
    oC.textContent = sC.value;
    draw();
    nR.textContent = `${last.ratio.toFixed(1)} 배`; nA.textContent = `${last.n}개`;
    where.innerHTML = INFO[zone];
    root.querySelectorAll("[data-z]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.z === zone ? "true" : "false"));
  }
  root.querySelectorAll("[data-z]").forEach((b) => b.addEventListener("click", () => { zone = b.dataset.z; update(); }));
  sC.addEventListener("input", update);
  new ResizeObserver(() => update()).observe(cv);
  update();
})();
