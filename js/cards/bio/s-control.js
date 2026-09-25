/* 카드: 가설은 어떻게 검증할까? — 두 모둠 강낭콩 대조 실험 (모식 시뮬레이션) */
(() => {
  const root = document.getElementById("card-bio-control");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".n"), oN = $(".n-out"), verdict = $(".verdict");
  const G = [...root.querySelectorAll(".grp")];

  // 모식 모형: 2주 뒤 키(cm) = 10 + 비료 2.5 + 온도 효과 + 빛 효과 + 개체 차이(표준 편차 3)
  const TEMP = { 15: -2.5, 20: 0, 25: 2 }, LIGHT = { 8: -2, 12: 0, 16: 1.5 };
  const FERT = 2.5, SD = 3, NMAX = 30;
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  let Z = [[], []];
  const replant = () => { Z = [0, 1].map(() => Array.from({ length: NMAX }, gauss)); };
  replant();

  const cond = (g) => ({ fert: G[g].querySelector(".fert").checked, temp: +G[g].querySelector(".temp").value, light: +G[g].querySelector(".light").value });
  const mu = (c) => 10 + (c.fert ? FERT : 0) + TEMP[c.temp] + LIGHT[c.light];
  const heights = (g, n) => { const m = mu(cond(g)); return Z[g].slice(0, n).map((z) => Math.max(1, m + SD * z)); };
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const sd = (a) => { if (a.length < 2) return NaN; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
  const label = (c) => `${c.fert ? "비료 O" : "비료 X"} · ${c.temp} °C · ${c.light} h`;

  const { ctx, size } = fit(cv, () => draw());
  const YMAX = 26;

  function draw() {
    const { w, h } = size;
    if (!w) return;
    const n = +sN.value, H = [heights(0, n), heights(1, n)], cs = [cond(0), cond(1)];
    const padL = 34, padR = 12, padT = 22, padB = 34, pw = w - padL - padR, ph = h - padT - padB;
    const Y = (v) => padT + (1 - v / YMAX) * ph;
    ctx.clearRect(0, 0, w, h);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X: (v) => v, Y, yt: [[0, "0"], [5, "5"], [10, "10"], [15, "15"], [20, "20"], [25, "25"]], ylabel: "2주 뒤 키 (cm)" });
    const cols = [padL + pw * 0.3, padL + pw * 0.72], colr = [C.forest, C.ink2];
    H.forEach((a, g) => {
      const cx = cols[g], spread = Math.min(pw * 0.14, 60);
      a.forEach((v, i) => {
        const jx = ((i * 0.618) % 1 - 0.5) * 2 * spread;
        ctx.beginPath(); ctx.arc(cx + jx, Y(v), 3.6, 0, Math.PI * 2);
        ctx.fillStyle = g ? "rgba(93,93,97,.55)" : "rgba(59,124,42,.6)"; ctx.fill();
      });
      const m = mean(a);
      ctx.strokeStyle = colr[g]; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx - spread - 8, Y(m)); ctx.lineTo(cx + spread + 8, Y(m)); ctx.stroke();
      ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
      ctx.fillText(g ? "모둠 B" : "모둠 A", cx, h - 18);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
      ctx.fillText(label(cs[g]), cx, h - 5);
    });
    ctx.textAlign = "left";
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("가로선 = 평균", padL + pw - 80, padT + 12);
  }

  function update() {
    const n = +sN.value; oN.textContent = n;
    const a = heights(0, n), b = heights(1, n), cs = [cond(0), cond(1)];
    const ma = mean(a), mb = mean(b), d = ma - mb;
    $(".ma").textContent = `${ma.toFixed(1)} cm`; $(".mb").textContent = `${mb.toFixed(1)} cm`;
    $(".md").textContent = `${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(1)} cm`;
    const diff = [];
    if (cs[0].fert !== cs[1].fert) diff.push("비료");
    if (cs[0].temp !== cs[1].temp) diff.push("온도");
    if (cs[0].light !== cs[1].light) diff.push("빛 시간");
    let msg, cls = "bad";
    if (!diff.length) {
      msg = `두 모둠의 조건이 모두 같습니다. 조작 변인이 없으니 아무것도 검증할 수 없습니다. 그런데도 평균이 ${Math.abs(d).toFixed(1)} cm 다릅니다. 이 차이는 순전히 개체 사이의 우연한 차이입니다.`;
      cls = "";
    } else if (diff.length > 1) {
      msg = `두 모둠의 조건이 ${diff.join(", ")} ${diff.length}가지나 다릅니다. 키 차이가 어느 조건 때문인지 가를 수 없습니다. 조작 변인 하나만 다르게 하고 나머지는 통제하세요.`;
    } else if (diff[0] !== "비료") {
      msg = `다른 조건이 ${diff[0]} 하나뿐이라 대조 실험의 모양은 갖췄습니다. 하지만 이 실험은 ${diff[0]}의 효과를 보는 실험입니다. 비료에 대한 가설은 검증하지 못합니다.`;
    } else {
      const se = Math.sqrt((sd(a) ** 2 + sd(b) ** 2) / n);
      const exp = cs[0].fert ? "A" : "B";
      if (n < 3) msg = `비료만 다른 좋은 설계입니다(실험군 ${exp}). 하지만 한 모둠에 ${n}포기로는 개체 사이의 흩어짐을 알 수 없어, 차이가 우연인지 판단할 수 없습니다.`;
      else if (Math.abs(d) > 2 * se) { msg = `비료만 다른 대조 실험입니다(실험군 ${exp}). 평균 차이 ${Math.abs(d).toFixed(1)} cm가 우연히 생길 만한 크기(약 ±${(2 * se).toFixed(1)} cm)보다 큽니다. 가설을 지지하는 결과입니다.`; cls = "good"; }
      else msg = `비료만 다른 대조 실험입니다(실험군 ${exp}). 하지만 평균 차이 ${Math.abs(d).toFixed(1)} cm는 우연히도 생길 수 있는 크기(약 ±${(2 * se).toFixed(1)} cm) 안에 있습니다. 개체 수를 늘려 다시 해 보세요.`;
    }
    verdict.textContent = msg;
    verdict.className = "verdict " + cls;
    draw();
  }
  root.querySelectorAll("input, select").forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("input[type=checkbox], select").forEach((el) => el.addEventListener("change", update));
  $(".replant").addEventListener("click", () => { replant(); update(); });
  update();
})();
