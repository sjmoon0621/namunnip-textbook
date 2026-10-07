/* 카드: 물감을 섞지 않고 점으로 찍으면 색이 더 밝아질까? — 감법 혼합(기하 평균)과 광학 혼합(산술 평균) 비교 (모식 반사율) */
(() => {
  const root = document.getElementById("card-fusi-pointil");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sF = $(".f"), sD = $(".d");

  const LAM = Array.from({ length: 31 }, (_, i) => 400 + i * 10);
  const sig = (x) => 1 / (1 + Math.exp(-x));
  const gau = (l, m, s) => Math.exp(-0.5 * ((l - m) / s) ** 2);
  /* 모식 반사율 곡선 (실제 안료의 대략적인 모양) */
  const PAINTS = {
    yellow: { name: "노랑", R: (l) => 0.06 + 0.82 * sig((l - 505) / 12) },
    blue: { name: "파랑", R: (l) => 0.05 + 0.55 * gau(l, 455, 35) + 0.06 * sig((l - 680) / 10) },
    red: { name: "빨강", R: (l) => 0.05 + 0.8 * sig((l - 595) / 10) },
    green: { name: "초록", R: (l) => 0.05 + 0.45 * gau(l, 515, 40) },
    orange: { name: "주황", R: (l) => 0.05 + 0.82 * sig((l - 565) / 12) },
    white: { name: "흰색", R: () => 0.9 },
    black: { name: "검정", R: () => 0.04 },
  };
  for (const p of Object.values(PAINTS)) p.s = LAM.map(p.R);

  /* CIE 1931 등색 함수 근사 (Wyman, Sloan, Shirley 2013) */
  const g2 = (l, m, a, b) => Math.exp(-0.5 * ((l - m) / (l < m ? a : b)) ** 2);
  const XB = LAM.map((l) => 1.056 * g2(l, 599.8, 37.9, 31) + 0.362 * g2(l, 442, 16, 26.7) - 0.065 * g2(l, 501.1, 20.4, 26.2));
  const YB = LAM.map((l) => 0.821 * g2(l, 568.8, 46.9, 40.5) + 0.286 * g2(l, 530.9, 16.3, 31.1));
  const ZB = LAM.map((l) => 1.217 * g2(l, 437, 11.8, 36) + 0.681 * g2(l, 459, 26, 13.8));
  const YS = YB.reduce((a, b) => a + b, 0);
  const lin = (s) => {
    const X = s.reduce((a, r, i) => a + r * XB[i], 0) / YS, Y = s.reduce((a, r, i) => a + r * YB[i], 0) / YS, Z = s.reduce((a, r, i) => a + r * ZB[i], 0) / YS;
    return [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z, Y];
  };
  const W = lin(LAM.map(() => 1));
  const enc = (v) => { v = Math.max(0, Math.min(1, v)); return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)); };
  const rgb = (s) => { const c = lin(s); return { css: `rgb(${enc(c[0] / W[0])},${enc(c[1] / W[1])},${enc(c[2] / W[2])})`, Y: c[3] / W[3] }; };

  let A = "yellow", B = "blue";
  const chips = (host, cur, key) => {
    host.insertAdjacentHTML("beforeend", Object.entries(PAINTS).map(([k, p]) => `<button type="button" class="chip" data-${key}="${k}" aria-pressed="${k === cur}">${p.name}</button>`).join(""));
  };
  chips($(".pa"), A, "a"); chips($(".pb"), B, "b");

  /* 점 배치: 매번 같은 무작위 순서를 쓰도록 미리 만든다 */
  const RND = Array.from({ length: 160 * 120 }, (_, i) => ((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1 + 1) % 1);
  const view = fit($("canvas"), () => draw());

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = +sF.value / 100, d = +sD.value;
    const sa = PAINTS[A].s, sb = PAINTS[B].s;
    const sub = sa.map((r, i) => Math.pow(r, f) * Math.pow(sb[i], 1 - f));
    const opt = sa.map((r, i) => f * r + (1 - f) * sb[i]);
    const cA = rgb(sa), cB = rgb(sb), cS = rgb(sub), cO = rgb(opt);
    const topH = Math.round(h * 0.46), pw = Math.round(w * 0.4), sw = (w - pw - 24) / 2;
    /* 점묘 화면 */
    const cell = Math.max(1, 10 / d);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 16, pw, topH - 16); ctx.clip();
    let k = 0;
    for (let y = 16; y < topH; y += cell) for (let x = 0; x < pw; x += cell) {
      ctx.fillStyle = RND[k++ % RND.length] < f ? cA.css : cB.css;
      ctx.fillRect(x, y, Math.ceil(cell), Math.ceil(cell));
    }
    ctx.restore();
    const sw0 = pw + 12;
    ctx.fillStyle = cO.css; ctx.fillRect(sw0, 16, sw, topH - 16);
    ctx.fillStyle = cS.css; ctx.fillRect(sw0 + sw + 12, 16, sw, topH - 16);
    ctx.strokeStyle = C.rule; [[0, pw], [sw0, sw], [sw0 + sw + 12, sw]].forEach(([x, ww]) => ctx.strokeRect(x + 0.5, 16.5, ww - 1, topH - 17));
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`점묘 (${d.toFixed(1)} m에서 본 모습)`, 0, 11);
    ctx.fillText("점묘가 섞여 보인 색", sw0, 11);
    ctx.fillText("팔레트에서 섞은 색", sw0 + sw + 12, 11);
    /* 반사율 스펙트럼 */
    const box = { x0: 34, y0: topH + 26, w: w - 44, h: h - topH - 56 };
    const X = (l) => box.x0 + (l - 400) / 300 * box.w, Y = (r) => box.y0 + box.h - r * box.h;
    NM.axes(ctx, { ...box, X, Y, xt: [400, 450, 500, 550, 600, 650, 700].map((v) => [v, String(v)]), yt: [0, 0.5, 1].map((v) => [v, String(v)]), xlabel: "파장 (nm)", ylabel: "반사율" });
    const curve = (s, col, wd, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash || []); ctx.beginPath();
      s.forEach((r, i) => (i ? ctx.lineTo(X(LAM[i]), Y(r)) : ctx.moveTo(X(LAM[i]), Y(r)))); ctx.stroke(); ctx.setLineDash([]);
    };
    curve(sa, cA.css, 1.5, [4, 3]); curve(sb, cB.css, 1.5, [4, 3]);
    curve(opt, C.ink2, 2.2); curve(sub, C.warn, 2.2);
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = C.ink2; ctx.fillText("─ 점묘(산술 평균)", box.x0 + box.w, box.y0 - 8);
    ctx.fillStyle = C.warn; ctx.fillText("─ 팔레트(기하 평균)", box.x0 + box.w - 118, box.y0 - 8);
    $(".y-opt").textContent = (cO.Y * 100).toFixed(0);
    $(".y-sub").textContent = (cS.Y * 100).toFixed(0);
    $(".y-rat").textContent = cS.Y > 0 ? (cO.Y / cS.Y).toFixed(2) + " 배" : "—";
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a],[data-b]"); if (!b) return;
    if (b.dataset.a) { A = b.dataset.a; root.querySelectorAll("[data-a]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }
    else { B = b.dataset.b; root.querySelectorAll("[data-b]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }
    draw();
  });
  const upd = () => { $(".f-out").textContent = sF.value; $(".d-out").textContent = (+sD.value).toFixed(1); draw(); };
  [sF, sD].forEach((el) => el.addEventListener("input", upd));
  upd();
})();
