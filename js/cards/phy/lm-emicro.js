/* 카드: 전자 현미경은 왜 광학 현미경보다 더 작은 것을 볼까? — 드브로이 파장과 분해능 */
(() => {
  const root = document.getElementById("card-phy-lm-emicro");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const vS = $(".v"), vO = $(".v-out");
  const lEl = $(".lame"), rEl = $(".rese"), oEl = $(".reso");
  const h = 6.62607e-34, me = 9.10938e-31, e = 1.602177e-19, c = 2.99792458e8;
  const LAM_L = 550e-9, NA = 1.4, ALPHA = 0.010; // 광학: 초록빛, 기름 담금 대물렌즈 / 전자: 대물 조리개 반각 10 mrad (모식)
  const resL = 0.61 * LAM_L / NA;
  let spacing = 100e-9;

  const volts = () => Math.pow(10, +vS.value);
  // 상대론 보정을 넣은 전자의 드브로이 파장
  const lamE = (V) => h / Math.sqrt(2 * me * e * V * (1 + e * V / (2 * me * c * c)));
  const resE = (V) => 0.61 * lamE(V) / ALPHA;
  const len = (m) => {
    const a = Math.abs(m);
    if (a >= 1e-6) return `${+(m * 1e6).toPrecision(3)} μm`;
    if (a >= 1e-9) return `${+(m * 1e9).toPrecision(3)} nm`;
    return `${+(m * 1e12).toPrecision(3)} pm`;
  };

  const { ctx, size } = fit(cv, () => draw());
  const G = 72;
  const img = (res, n) => { // 3×3 점을 가우스 번짐(반치폭 = 분해능)으로 그린 상
    const fov = 4 * spacing, sg = Math.max(res / 2.355, fov / n * 1.1), out = new Float32Array(n * n);
    let mx = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = (i / (n - 1) - 0.5) * fov, y = (j / (n - 1) - 0.5) * fov;
      let v = 0;
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
        const dx = x - a * spacing, dy = y - b * spacing;
        v += Math.exp(-(dx * dx + dy * dy) / (2 * sg * sg));
      }
      out[j * n + i] = v; mx = Math.max(mx, v);
    }
    let mn = Infinity; for (const v of out) mn = Math.min(mn, v);
    return { out, mx, con: (mx - mn) / (mx + mn) };
  };

  function panel(x0, y0, s, res, title, sub) {
    const I = img(res, G), cell = s / G;
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const v = Math.round(20 + 225 * I.out[j * G + i] / I.mx);
      ctx.fillStyle = `rgb(${v},${v},${Math.min(255, v + 6)})`;
      ctx.fillRect(x0 + i * cell, y0 + j * cell, cell + 0.6, cell + 0.6);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, y0 + .5, s, s);
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(title, x0, y0 - 20);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText(sub, x0, y0 - 6);
    const ok = res < spacing * 0.9;
    ctx.fillStyle = ok ? C.forest : C.warn;
    ctx.fillText(ok ? "점 9개가 구분됨" : I.con < 0.02 ? "한 덩어리로 보임" : "흐려서 구분하기 어려움", x0, y0 + s + 15);
  }

  function draw() {
    const { w, h: H } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, H);
    const s = Math.min((w - 40) / 2, H - 80), y0 = 34;
    const x1 = (w - 2 * s - 20) / 2;
    panel(x1, y0, s, resL, "광학 현미경", `분해능 ≈ ${len(resL)}`);
    panel(x1 + s + 20, y0, s, resE(volts()), "전자 현미경", `분해능 ≈ ${len(resE(volts()))}`);
    // 눈금 막대: 점 간격
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(`점 사이 간격 ${len(spacing)} · 시야 한 변 ${len(4 * spacing)}`, w - 4, H - 4);
  }

  function update() {
    const V = volts();
    vO.textContent = V >= 1000 ? `${+(V / 1000).toPrecision(3)} kV` : `${Math.round(V)} V`;
    lEl.textContent = len(lamE(V));
    rEl.textContent = len(resE(V));
    oEl.textContent = len(resL);
    draw();
  }
  vS.addEventListener("input", update);
  const chips = root.querySelectorAll("[data-sp]");
  chips.forEach((b) => b.addEventListener("click", () => {
    spacing = +b.dataset.sp; chips.forEach((o) => o.setAttribute("aria-pressed", o === b)); update();
  }));
  update();
})();
