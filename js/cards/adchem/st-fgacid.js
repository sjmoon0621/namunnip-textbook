/* 카드: 페놀은 왜 수산화 나트륨에는 녹고 탄산수소 나트륨에는 안 녹을까? — pKa 사다리로 산 염기 반응의 방향 예측 */
(() => {
  const root = document.getElementById("card-adchem-fg-acid");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  /* [pKa, 산, 짝염기, 이름] (25 °C 물; 에타인은 추정값) */
  const A = {
    tca: [0.7, "Cl₃CCOOH", "Cl₃CCOO⁻", "트라이클로로아세트산"],
    mca: [2.87, "ClCH₂COOH", "ClCH₂COO⁻", "클로로아세트산"],
    bz: [4.20, "C₆H₅COOH", "C₆H₅COO⁻", "벤조산"],
    ac: [4.76, "CH₃COOH", "CH₃COO⁻", "아세트산"],
    ph: [9.99, "C₆H₅OH", "C₆H₅O⁻", "페놀"],
    et: [16, "C₂H₅OH", "C₂H₅O⁻", "에탄올"],
    yn: [25, "HC≡CH", "HC≡C⁻", "에타인"],
  };
  /* [짝산 pKa, 염기, 짝산] (암모니아는 추정값) */
  const B = {
    hco3: [6.35, "HCO₃⁻", "H₂CO₃(CO₂ + H₂O)"],
    nh3: [9.25, "NH₃", "NH₄⁺"],
    co3: [10.33, "CO₃²⁻", "HCO₃⁻"],
    oh: [14.0, "OH⁻", "H₂O"],
    nh2: [38, "NH₂⁻", "NH₃"],
  };
  let a = "ph", b = "hco3";
  const { ctx, size } = fit(cv, () => draw());
  function spread(items, Y, gap, top, bot) {
    const s = items.slice().sort((p, q) => p.v - q.v); let prev = -1e9;
    s.forEach((it) => { it.y = Math.max(Y(it.v), prev + gap); prev = it.y; });
    const over = prev - bot; if (over > 0) s.forEach((it) => { it.y -= over; });
    return s;
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = 30, Bt = h - 12, ax = w * 0.5, Y = (v) => T + (v <= 17 ? v / 17 * 0.74 : 0.74 + (v - 17) / 23 * 0.26) * (Bt - T);
    /* 눈금 */
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ax, T); ctx.lineTo(ax, Bt); ctx.stroke();
    ctx.fillStyle = C.ink3; for (let v = 0; v <= 40; v += 5) ctx.fillRect(ax - 3, Y(v), 6, 1);
    ctx.fillStyle = C.paper; ctx.fillRect(ax - 6, Y(17) - 3, 12, 6); ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ax - 6, Y(17) - 1); ctx.lineTo(ax + 6, Y(17) - 5); ctx.moveTo(ax - 6, Y(17) + 5); ctx.lineTo(ax + 6, Y(17) + 1); ctx.stroke();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.textAlign = "left"; ctx.fillText("산 HA의 pKa", 6, 13);
    ctx.textAlign = "right"; ctx.fillText("염기의 짝산 HB의 pKa", w - 6, 13);
    ctx.textAlign = "center"; ctx.fillText("↑ 강한 산", ax, T - 12);
    const L = spread(Object.entries(A).map(([k, d]) => ({ k, v: d[0], t: `${d[3]} ${d[0]}` })), Y, 15, T, Bt);
    const R = spread(Object.entries(B).map(([k, d]) => ({ k, v: d[0], t: `${d[2]} ${d[0]}` })), Y, 15, T, Bt);
    const draws = (list, side) => list.forEach((it) => {
      const on = side < 0 ? it.k === a : it.k === b, x0 = ax + side * 10, x1 = ax + side * 34;
      ctx.strokeStyle = on ? C.ink : C.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ax + side * 4, Y(it.v)); ctx.lineTo(x0, Y(it.v)); ctx.lineTo(x1 - side * 4, it.y); ctx.stroke();
      ctx.fillStyle = on ? C.ink : C.ink3; ctx.font = `${on ? "600 " : ""}11px ${F.sans}`; ctx.textAlign = side < 0 ? "right" : "left";
      ctx.fillText(it.t, x1, it.y + 4);
      it.x = x1;
    });
    draws(L, -1); draws(R, 1);
    /* 양성자 이동 화살표 */
    const pa = A[a][0], pb = B[b][0], K = Math.pow(10, pb - pa), ok = K > 1;
    const ya = Y(pa), yb = Y(pb), col = ok ? C.forest : C.warn;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(ax - 8, ya); ctx.bezierCurveTo(ax - 22, ya, ax - 22, (ya + yb) / 2, ax, (ya + yb) / 2); ctx.bezierCurveTo(ax + 22, (ya + yb) / 2, ax + 22, yb, ax + 9, yb); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax + 4, yb); ctx.lineTo(ax + 12, yb - 5); ctx.lineTo(ax + 12, yb + 5); ctx.fill();
    ctx.beginPath(); ctx.arc(ax - 8, ya, 3.5, 0, 7); ctx.fill();
    ctx.textAlign = "left"; ctx.font = `600 12px ${F.sans}`;
    const bx = 8, by = Y(30);
    ctx.fillText(ok ? "H⁺가 염기로 넘어갑니다" : "H⁺가 거의 넘어가지 않습니다", bx, by);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`${A[a][3]}(pKa ${pa}) ${ok ? "<" : ">"} ${B[b][2].replace(/\(.*\)/, "")}(pKa ${pb})`, bx, by + 17);
  }
  function update() {
    root.querySelectorAll("[data-a]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.a === a)));
    root.querySelectorAll("[data-b]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.b === b)));
    const [pa, ha, ca] = A[a], [pb, bb, hb] = B[b], lk = pb - pa, K = Math.pow(10, lk), r = Math.sqrt(K), x = r / (1 + r);
    $(".eq").textContent = `${ha} + ${bb} ⇌ ${ca} + ${hb.replace(/\(.*\)/, "")}`;
    $(".n-k").textContent = Math.abs(lk) < 3 ? (K >= 1 ? K.toFixed(K < 10 ? 2 : 0) : K.toPrecision(2)) : `10^${lk.toFixed(1)}`;
    $(".n-x").textContent = x > 0.9995 ? "≈ 100 %" : x < 0.0005 ? "≈ 0 %" : `${(x * 100).toFixed(x < 0.01 ? 2 : 1)} %`;
    const j = $(".n-j");
    j.textContent = K > 1e3 ? "거의 완전히 반응" : K > 1 ? "대부분 반응" : K > 1e-3 ? "일부만 반응" : "거의 반응 안 함";
    j.className = K > 1 ? "n-j good" : "n-j bad";
    draw();
  }
  root.querySelectorAll("[data-a]").forEach((x) => x.addEventListener("click", () => { a = x.dataset.a; update(); }));
  root.querySelectorAll("[data-b]").forEach((x) => x.addEventListener("click", () => { b = x.dataset.b; update(); }));
  update();
})();
