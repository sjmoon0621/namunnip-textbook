/* 카드: H–R도는 어떻게 읽을까? — 실제 별의 표면 온도와 광도, 반지름이 같은 선 */
(() => {
  const root = document.getElementById("card-earth-hrd");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), rad = $(".radii"), nName = $(".s-name"), nT = $(".s-t"), nL = $(".s-l"), nR = $(".s-r"), msg = $(".hr-msg");
  const TSUN = 5772;
  // [이름, 표면 온도 K, 광도 (태양 = 1), 무리] — 대표 추정값
  const STARS = [
    ["태양", 5772, 1, "ms"], ["시리우스 A", 9940, 25.4, "ms"], ["베가", 9600, 40, "ms"], ["알타이르", 7700, 10.6, "ms"],
    ["프로키온 A", 6530, 6.9, "ms"], ["스피카", 22400, 20500, "ms"], ["프록시마 센타우리", 3042, 0.0017, "ms"], ["바너드별", 3134, 0.0035, "ms"],
    ["베텔게우스", 3600, 100000, "sg"], ["리겔", 12100, 120000, "sg"], ["안타레스", 3570, 75000, "sg"], ["데네브", 8525, 196000, "sg"],
    ["알데바란", 3910, 440, "g"], ["아크투루스", 4290, 170, "g"], ["카펠라 Aa", 4970, 79, "g"], ["북극성", 6015, 1260, "sg"],
    ["시리우스 B", 25200, 0.056, "wd"], ["에리다누스자리 40 B", 16500, 0.013, "wd"],
  ];
  const GROUP = { ms: ["주계열성", C.forest], g: ["거성", "#c9463d"], sg: ["초거성", "#8a2e24"], wd: ["백색 왜성", "#3f7fc4"] };
  const radius = (T, L) => Math.sqrt(L) * (TSUN / T) ** 2;   // L = R² (T/T☉)⁴ 에서
  let sel = 0, pts = [];

  const { ctx, size } = fit(cv, () => draw());
  const lT0 = Math.log10(40000), lT1 = Math.log10(2400), lL0 = -4, lL1 = 6;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 46, y0 = 22, pw = w - x0 - 10, ph = h - y0 - 36;
    const X = (T) => x0 + (Math.log10(T) - lT0) / (lT1 - lT0) * pw, Y = (L) => y0 + (1 - (Math.log10(L) - lL0) / (lL1 - lL0)) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y,
      xt: [[30000, "30000"], [10000, "10000"], [6000, "6000"], [3000, "3000 K"]],
      yt: [[1e-4, "10⁻⁴"], [1e-2, "10⁻²"], [1, "1"], [1e2, "10²"], [1e4, "10⁴"], [1e6, "10⁶"]], ylabel: "광도 (태양 = 1)", xlabel: "표면 온도 (왼쪽이 뜨거움)" });
    // 반지름이 같은 선: L = R² (T/T☉)⁴
    if (rad.checked) {
      ctx.font = `10px ${F.mono}`;
      for (const R of [0.01, 0.1, 1, 10, 100, 1000]) {
        ctx.beginPath(); let first = true;
        for (let lt = lT1; lt <= lT0; lt += 0.01) { const T = 10 ** lt, L = R * R * (T / TSUN) ** 4; if (L < 10 ** lL0 || L > 10 ** lL1) { first = true; continue; } const x = X(T), y = Y(L); first ? ctx.moveTo(x, y) : ctx.lineTo(x, y); first = false; }
        ctx.strokeStyle = "rgba(141,141,146,.5)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
        const Tl = 3000, Ll = R * R * (Tl / TSUN) ** 4;
        if (Ll > 10 ** lL0 && Ll < 10 ** lL1) { ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(`${R} R☉`, X(Tl) - 2, Y(Ll) - 3); }
      }
      ctx.textAlign = "left";
    }
    // 주계열 띠 (모식)
    ctx.strokeStyle = "rgba(59,124,42,.18)"; ctx.lineWidth = 16; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(X(32000), Y(40000)); ctx.quadraticCurveTo(X(8000), Y(8), X(3000), Y(0.002)); ctx.stroke(); ctx.lineCap = "butt";
    // 별
    pts = STARS.map(([name, T, L, g], i) => {
      const x = X(T), y = Y(L), r = i === sel ? 7 : 5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = GROUP[g][1]; ctx.fill();
      if (i === sel) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); }
      return [x, y];
    });
    const [sx, sy] = pts[sel];
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = sx > x0 + pw * 0.7 ? "right" : "left";
    ctx.fillText(STARS[sel][0], sx + (sx > x0 + pw * 0.7 ? -10 : 10), sy - 8);
    // 범례
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    Object.values(GROUP).forEach(([n, col], i) => { const lx = x0 + 8, ly = y0 + ph - 60 + i * 15; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx, ly - 4, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.fillText(n, lx + 9, ly); });
  }

  function update() {
    const [name, T, L, g] = STARS[sel], R = radius(T, L);
    nName.textContent = `${name} · ${GROUP[g][0]}`;
    nT.textContent = `${T.toLocaleString("ko-KR")} K`;
    nL.textContent = L >= 100 ? `${Math.round(L).toLocaleString("ko-KR")}` : L >= 1 ? L.toFixed(1) : L.toPrecision(2);
    nR.textContent = R >= 10 ? `${Math.round(R)} R☉` : R >= 0.1 ? `${R.toFixed(2)} R☉` : `${R.toPrecision(2)} R☉ (지구의 약 ${(R * 109).toFixed(1)}배)`;
    msg.textContent = g === "wd" ? "표면은 태양보다 뜨거운데 광도는 수백 분의 일입니다. 크기가 지구만 할 만큼 작기 때문입니다."
      : g === "sg" || g === "g" ? "표면 온도가 태양과 비슷하거나 낮은데 광도는 훨씬 큽니다. 몸집이 매우 크기 때문입니다."
      : "주계열성은 중심에서 수소를 태우는 별입니다. 왼쪽 위로 갈수록 무겁고, 뜨겁고, 밝습니다.";
    draw();
  }
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = -1, bd = 1e9; pts.forEach(([px, py], i) => { const d = (px - x) ** 2 + (py - y) ** 2; if (d < bd) { bd = d; best = i; } });
    if (best >= 0 && bd < 900) { sel = best; update(); }
  });
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { sel = STARS.findIndex((s) => s[0] === b.dataset.s); update(); }));
  rad.addEventListener("change", draw);
  update();
})();
