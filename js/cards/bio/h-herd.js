/* 카드: 집단 면역은 몇 %가 접종해야 생길까? — SIR 전염병 모형 (모식) */
(() => {
  const root = document.getElementById("card-bio-herd");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r0"), oR = $(".r0-out"), sP = $(".cov"), oP = $(".cov-out");
  const nTh = $(".th"), nAll = $(".all"), nUn = $(".un"), msg = $(".hd-msg");
  const GAMMA = 1 / 7, I0 = 0.001, DAYS = 300, DT = 0.1;

  // S, I, R 비율로 푼다. 접종한 사람(p)은 처음부터 면역(R)으로 둔다 (백신 효과 100% 가정)
  function sim(R0, p) {
    const beta = R0 * GAMMA;
    let S = Math.max(0, 1 - p - I0), I = I0, peak = 0, peakDay = 0; const pts = [];
    for (let t = 0; t <= DAYS; t += DT) {
      const dS = -beta * S * I, dI = beta * S * I - GAMMA * I;
      S += dS * DT; I += dI * DT;
      if (I > peak) { peak = I; peakDay = t; }
      if (Math.round(t / DT) % 10 === 0) pts.push([t, I]);
    }
    const S0 = Math.max(0, 1 - p - I0);
    return { pts, infected: S0 - S + I0, S0, peak, peakDay };
  }

  const { ctx, size } = fit(cv, () => draw());
  let res, grid = [];
  // 400명의 자리 (고정 난수)
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const order = Array.from({ length: 400 }, (_, i) => i).sort(() => rnd() - 0.5);

  function draw() {
    const { w, h } = size; if (!w || !res) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 520;
    const gw = narrow ? w - 8 : w * 0.56, gh = narrow ? h * 0.46 : h - 40;
    // 유행 곡선
    const x0 = 40, y0 = 22, pw = gw - x0 - 6, ph = gh - y0 - 30;
    const ymax = res.peak > 0.28 ? Math.ceil(res.peak * 1.15 * 10) / 10 : res.peak > 0.14 ? 0.3 : 0.15;
    const X = (t) => x0 + t / DAYS * pw, Y = (v) => y0 + (1 - Math.min(v, ymax) / ymax) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 100, 200, 300].map((t) => [t, `${t}`]), yt: (ymax > 0.35 ? [0, 0.2, 0.4, 0.6, 0.8] : ymax > 0.2 ? [0, 0.1, 0.2, 0.3] : [0, 0.05, 0.1, 0.15]).filter((v) => v <= ymax + 1e-9).map((v) => [v, `${Math.round(v * 100)}%`]), ylabel: "지금 앓는 사람", xlabel: "날" });
    ctx.beginPath(); res.pts.forEach(([t, I], i) => i ? ctx.lineTo(X(t), Y(I)) : ctx.moveTo(X(t), Y(I)));
    ctx.lineTo(X(DAYS), Y(0)); ctx.lineTo(X(0), Y(0)); ctx.closePath();
    ctx.fillStyle = "rgba(201,70,61,.22)"; ctx.fill();
    ctx.beginPath(); res.pts.forEach(([t, I], i) => i ? ctx.lineTo(X(t), Y(I)) : ctx.moveTo(X(t), Y(I)));
    ctx.strokeStyle = "#c9463d"; ctx.lineWidth = 2.2; ctx.stroke();
    // 400명 격자
    const side = narrow ? Math.min(w - 16, h - gh - 34) : Math.min(w - gw - 26, h - 50);
    const gx = narrow ? (w - side) / 2 : gw + 18, gy = narrow ? gh + 8 : 22;
    const n = 20, cell = side / n, p = +sP.value / 100;
    const nVac = Math.round(400 * p), nInf = Math.round(400 * res.infected);
    order.forEach((idx, k) => {
      const x = gx + (idx % n) * cell + cell / 2, y = gy + Math.floor(idx / n) * cell + cell / 2;
      ctx.fillStyle = k < nVac ? C.forest : k < nVac + nInf ? "#c9463d" : "#d6d6d0";
      ctx.beginPath(); ctx.arc(x, y, cell * 0.36, 0, Math.PI * 2); ctx.fill();
    });
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    const ly = gy + side + 14;
    [["접종", C.forest], ["결국 감염", "#c9463d"], ["감염 안 됨", "#b8b8b2"]].forEach(([s, c], i) => {
      const lx = gx + i * (side / 3); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(lx + 5, ly - 4, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.fillText(s, lx + 13, ly);
    });
  }

  function update() {
    const R0 = +sR.value, p = +sP.value / 100, th = Math.max(0, 1 - 1 / R0);
    oR.textContent = R0.toFixed(1); oP.textContent = sP.value;
    res = sim(R0, p);
    nTh.textContent = `${Math.round(th * 100)}%`;
    nAll.textContent = `${(res.infected * 100).toFixed(1)}%`;
    const un = res.S0 > 0 ? res.infected / (1 - p) : 0;
    nUn.textContent = p >= 0.999 ? "—" : `${(un * 100).toFixed(1)}%`;
    nUn.classList.toggle("bad", un > 0.1);
    msg.textContent = p >= th
      ? "접종률이 문턱을 넘었습니다. 감염된 사람이 한 명씩 더 옮기지 못해 유행이 커지지 않고, 접종하지 않은 사람도 함께 보호됩니다."
      : `접종률이 문턱(${Math.round(th * 100)}%)보다 낮아 유행이 번집니다. 접종하지 않은 사람의 ${(un * 100).toFixed(0)}%가 결국 감염됩니다.`;
    root.querySelectorAll("[data-r0]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.r0 - R0) < 0.05)));
    draw();
  }
  [sR, sP].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-r0]").forEach((b) => b.addEventListener("click", () => { sR.value = b.dataset.r0; update(); }));
  update();
})();
