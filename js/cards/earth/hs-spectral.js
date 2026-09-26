/* 카드: 별빛의 흡수선으로 무엇을 알 수 있을까? — 분광형에 따른 흡수선 세기 (선 파장은 실제 값, 세기는 모식) */
(() => {
  const root = document.getElementById("card-earth-spectral");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".temp"), oT = $(".temp-out"), oC = $(".cls-out");
  const nStrong = $(".strong"), msg = $(".sp-msg");

  // 온도(K)에 따른 선의 상대 세기: 로그 온도에서 봉우리를 갖는 모식 함수
  const bump = (T, Tpk, wid) => Math.exp(-0.5 * (Math.log10(T / Tpk) / wid) ** 2);
  const LINES = [
    // [이름, 파장 nm, 세기 함수]
    ["He II", 468.6, (T) => bump(T, 40000, 0.08)],
    ["He II", 541.1, (T) => 0.6 * bump(T, 40000, 0.08)],
    ["He I", 447.1, (T) => bump(T, 20000, 0.12)],
    ["He I", 587.6, (T) => 0.8 * bump(T, 20000, 0.12)],
    ["Hα", 656.3, (T) => bump(T, 9500, 0.2)],
    ["Hβ", 486.1, (T) => bump(T, 9500, 0.2)],
    ["Hγ", 434.0, (T) => 0.9 * bump(T, 9500, 0.2)],
    ["Hδ", 410.2, (T) => 0.8 * bump(T, 9500, 0.2)],
    ["Ca II K", 393.4, (T) => bump(T, 5000, 0.14)],
    ["Ca II H", 396.8, (T) => bump(T, 5000, 0.14)],
    ["Fe I", 527.0, (T) => 0.6 * bump(T, 4800, 0.12)],
    ["Mg I", 517.3, (T) => 0.6 * bump(T, 4800, 0.12)],
    ["Na I", 589.0, (T) => 0.7 * bump(T, 4200, 0.1)],
    ["CH (G띠)", 430.8, (T) => 0.6 * bump(T, 5000, 0.1)],
  ];
  const TIO = [476.1, 495.4, 516.7, 544.8, 615.9, 705.4];   // TiO 분자 띠머리 (nm)
  const tio = (T) => T < 4000 ? Math.min(1, (4000 - T) / 1100) : 0;
  const CLS = [["O", 30000, 60000], ["B", 10000, 30000], ["A", 7500, 10000], ["F", 6000, 7500], ["G", 5200, 6000], ["K", 3700, 5200], ["M", 2400, 3700]];
  const cls = (T) => (CLS.find(([, lo, hi]) => T >= lo && T < hi) || CLS[0])[0];
  const h = 6.626e-34, c = 2.998e8, k = 1.381e-23;
  const planck = (l, T) => 1 / l ** 5 / (Math.exp(h * c / (l * 1e-9 * k * T)) - 1);

  function wl(l) {
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = -(l - 510) / 20; }
    else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = -(l - 645) / 65; } else r = 1;
    const f = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 700 ? 0.3 + 0.7 * (780 - l) / 80 : 1;
    return [r * f, g * f, b * f];
  }
  const { ctx, size } = fit(cv, () => draw());
  const L0 = 380, L1 = 720;

  function draw() {
    const { w, h: H } = size; if (!w) return;
    ctx.clearRect(0, 0, w, H);
    const T = +sT.value;
    const x0 = 12, pw = w - 24, X = (nm) => x0 + (nm - L0) / (L1 - L0) * pw;
    // 스펙트럼 띠: 흑체 밝기 × 흡수선
    const sy = 26, sh = H * 0.34;
    let pmax = 0; for (let l = L0; l <= L1; l += 2) pmax = Math.max(pmax, planck(l, T));
    for (let px = 0; px < pw; px++) {
      const l = L0 + px / pw * (L1 - L0);
      let a = 0;
      for (const [, lc, f] of LINES) a += 0.95 * f(T) * Math.exp(-0.5 * ((l - lc) / 0.9) ** 2);
      for (const lh of TIO) if (l >= lh && l < lh + 18) a += 0.7 * tio(T) * (1 - (l - lh) / 18);
      const I = Math.max(0, 1 - Math.min(1, a)) * (0.35 + 0.65 * planck(l, T) / pmax);
      const [r, g, b] = wl(l);
      ctx.fillStyle = `rgb(${Math.round(255 * r * I)},${Math.round(255 * g * I)},${Math.round(255 * b * I)})`;
      ctx.fillRect(x0 + px, sy, 1.5, sh);
    }
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (const l of [400, 450, 500, 550, 600, 650, 700]) ctx.fillText(l, X(l), sy + sh + 13);
    ctx.textAlign = "left"; ctx.fillText("별빛의 스펙트럼 (nm)", x0, sy - 8);

    // 선 세기 막대: 원소별로 묶어서
    const groups = [["He II", "#6a3fb0"], ["He I", "#3f7fc4"], ["H", "#3b7c2a"], ["Ca II", "#b5532f"], ["금속 (Fe·Mg·Na)", "#8a6516"], ["TiO 분자", "#8d8d92"]];
    const val = {
      "He II": bump(T, 40000, 0.08), "He I": bump(T, 20000, 0.12), H: bump(T, 9500, 0.2),
      "Ca II": bump(T, 5000, 0.14), "금속 (Fe·Mg·Na)": Math.max(0.6 * bump(T, 4800, 0.12), 0.7 * bump(T, 4200, 0.1)) / 0.7, "TiO 분자": tio(T),
    };
    const by = sy + sh + 34, bh = H - by - 8, rowH = bh / groups.length;
    groups.forEach(([name, col], i) => {
      const y = by + i * rowH;
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.fillText(name, x0, y + rowH * 0.62);
      const bx = x0 + 110, bw = pw - 110;
      ctx.fillStyle = "#eceae4"; ctx.fillRect(bx, y + rowH * 0.2, bw, rowH * 0.55);
      ctx.fillStyle = col; ctx.fillRect(bx, y + rowH * 0.2, bw * Math.min(1, val[name]), rowH * 0.55);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText("흡수선 세기 (모식)", x0 + pw, by - 6); ctx.textAlign = "left";
  }

  function update() {
    const T = +sT.value;
    oT.textContent = T.toLocaleString("ko-KR"); oC.textContent = cls(T);
    const vals = { "헬륨 이온(He II)": LINES[0][2](T), "헬륨(He I)": LINES[2][2](T), "수소(H)": LINES[4][2](T), "칼슘 이온(Ca II)": LINES[8][2](T), "금속 원자": 0.9 * LINES[12][2](T) / 0.7, "TiO 분자": tio(T) };
    const top = Object.entries(vals).sort((a, b) => b[1] - a[1])[0][0];
    nStrong.textContent = top;
    msg.textContent = {
      O: "아주 뜨거워서 헬륨까지 전자를 잃습니다. 수소 흡수선은 오히려 약합니다.",
      B: "중성 헬륨의 흡수선이 두드러집니다. 수소선이 점점 강해집니다.",
      A: "수소 흡수선이 가장 강한 온도입니다. 이 온도에서 수소 원자의 전자가 두 번째 에너지 준위에 가장 많이 머물기 때문입니다.",
      F: "수소선이 약해지고 칼슘 이온의 선이 강해지기 시작합니다.",
      G: "태양이 여기 속합니다. 칼슘 이온(H, K선)과 금속의 흡수선이 두드러집니다.",
      K: "금속 원자의 흡수선이 많고 강합니다. 수소선은 약합니다.",
      M: "온도가 낮아 분자가 깨지지 않고 남습니다. 산화 타이타늄(TiO) 분자의 넓은 흡수띠가 보입니다.",
    }[cls(T)];
    root.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.t === T)));
    draw();
  }
  sT.addEventListener("input", update);
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { sT.value = b.dataset.t; update(); }));
  update();
})();
