/* 카드: 진화는 '더 나아지는 것'일까? — 몸 색과 배경색에 따른 자연 선택 시뮬레이션 (모식) */
(() => {
  const root = document.getElementById("card-bio-selection");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sB = $(".bg"), oB = $(".bg-out"), chkV = $(".var");
  const bStep = $(".step1"), bAuto = $(".auto"), bReset = $(".reset");
  const nGen = $(".n-gen"), nPop = $(".n-pop"), nMean = $(".n-mean"), nEat = $(".n-eat"), msg = $(".sel-msg");

  const K = 150, FERT = 2.5, SIG = 0.04;
  let pop = [], gen = 0, hist = [], eaten = 0, auto = false, acc = 0;

  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const bg = () => +sB.value / 100;
  const pEat = (z, b) => 0.05 + 0.65 * Math.min(1, Math.abs(z - b) / 0.5);
  const ind = (z) => ({ z, x: Math.random(), y: Math.random(), a: Math.random() * Math.PI });

  function reset() {
    gen = 0; eaten = 0; auto = false; bAuto.textContent = "자동 진행";
    sB.value = 75;
    pop = Array.from({ length: K }, () => ind(chkV.checked ? clamp01(0.75 + 0.12 * gauss()) : 0.75));
    hist = [[0, mean(), bg()]];
    update();
  }
  const mean = () => pop.length ? pop.reduce((s, p) => s + p.z, 0) / pop.length : NaN;

  function step() {
    if (!pop.length) return;
    const b = bg();
    const surv = pop.filter((p) => Math.random() > pEat(p.z, b));
    eaten = 1 - surv.length / pop.length;
    const n = Math.min(K, Math.round(surv.length * FERT));
    const next = [];
    for (let i = 0; i < n; i++) {
      const par = surv[Math.floor(Math.random() * surv.length)];
      next.push(ind(chkV.checked ? clamp01(par.z + SIG * gauss()) : par.z));
    }
    pop = next; gen++;
    hist.push([gen, mean(), b]);
    if (hist.length > 80) hist.shift();
    if (!pop.length) { auto = false; bAuto.textContent = "자동 진행"; }
    update();
  }

  const { ctx, size } = fit(cv, () => draw());
  const shade = (z) => { const v = Math.round(38 + z * (232 - 38)); return `rgb(${v},${v - 2},${v - 8})`; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = bg();
    // ── 왼쪽: 서식지
    const fw = Math.round(w * .44), fh = h - 4;
    ctx.fillStyle = shade(b); ctx.fillRect(0, 0, fw, fh);
    ctx.strokeStyle = shade(Math.max(0, b - .12)); ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); const x = (i + .5) * fw / 9; ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 8, fh * .3, x - 8, fh * .7, x + 4, fh); ctx.stroke(); }
    const r = Math.max(3.5, Math.min(7, fw / 60));
    for (const p of pop) {
      ctx.save(); ctx.translate(6 + p.x * (fw - 12), 6 + p.y * (fh - 12)); ctx.rotate(p.a);
      ctx.fillStyle = shade(p.z);
      ctx.beginPath(); ctx.ellipse(0, 0, r * 1.5, r, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-r * .3, 0, r * .9, r * 1.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    if (!pop.length) {
      ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(fw / 2 - 70, fh / 2 - 16, 140, 30);
      ctx.fillStyle = C.warn; ctx.font = `600 14px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("집단이 사라졌습니다", fw / 2, fh / 2 + 4); ctx.textAlign = "left";
    }

    // ── 오른쪽 위: 몸 색 분포
    const x0 = fw + 26, gw = w - x0 - 8, gh = (h - 100) / 2, y1 = 20;
    const X = (z) => x0 + z * gw;
    const bins = new Array(20).fill(0);
    pop.forEach((p) => bins[Math.min(19, Math.floor(p.z * 20))]++);
    const bmax = Math.max(20, ...bins);
    NM.axes(ctx, { x0, y0: y1, w: gw, h: gh, X, Y: (v) => y1 + gh - v / bmax * gh, xt: [[0, "어두움"], [1, "밝음"]], yt: [[0, "0"]], ylabel: "개체 수 (몸 색별)" });
    bins.forEach((c, i) => { if (!c) return; const bh = c / bmax * gh; ctx.fillStyle = shade((i + .5) / 20); ctx.strokeStyle = C.ink3; ctx.fillRect(X(i / 20) + 1, y1 + gh - bh, gw / 20 - 2, bh); ctx.strokeRect(X(i / 20) + 1.5, y1 + gh - bh + .5, gw / 20 - 3, bh - 1); });
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(b), y1); ctx.lineTo(X(b), y1 + gh); ctx.stroke();
    ctx.fillStyle = "#a8781c"; ctx.font = `10px ${F.mono}`; ctx.textAlign = b > .6 ? "right" : "left"; ctx.fillText("배경", X(b) + (b > .6 ? -4 : 4), y1 + 10); ctx.textAlign = "left";

    // ── 오른쪽 아래: 세대별 평균
    const y2 = y1 + gh + 44;
    const g0 = hist[0][0], g1 = Math.max(g0 + 20, hist[hist.length - 1][0]);
    const GX = (g) => x0 + (g - g0) / (g1 - g0) * gw, GY = (z) => y2 + (1 - z) * gh;
    NM.axes(ctx, { x0, y0: y2, w: gw, h: gh, X: GX, Y: GY, xt: [[g0, `${g0}`], [g1, `${g1}세대`]], yt: [[0, "0"], [1, "1"]], ylabel: "평균 몸 색(검정) · 배경(노랑)" });
    ctx.lineWidth = 2;
    for (const [k, col] of [[2, C.amber], [1, C.ink]]) {
      ctx.strokeStyle = col; ctx.beginPath(); let started = false;
      for (const hh of hist) { if (isNaN(hh[k])) continue; const x = GX(hh[0]), y = GY(hh[k]); started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true; }
      ctx.stroke();
    }
  }

  function update() {
    const b = bg();
    oB.textContent = b < .34 ? "어두움" : b > .66 ? "밝음" : "중간";
    nGen.textContent = `${gen}`;
    nPop.textContent = `${pop.length}`;
    nPop.classList.toggle("bad", pop.length < 40);
    const m = mean();
    nMean.textContent = pop.length ? m.toFixed(2) : "—";
    nEat.textContent = gen ? `${Math.round(eaten * 100)}%` : "—";
    msg.textContent = !pop.length ? "변이가 없으면 환경이 바뀌었을 때 살아남을 개체가 나오지 않습니다."
      : !chkV.checked && Math.abs(m - b) > .25 ? "모든 개체의 몸 색이 같아서 선택될 변이가 없습니다. 평균은 그대로이고 개체 수만 줄어듭니다."
      : Math.abs(m - b) < .1 ? "집단의 평균 몸 색이 배경과 비슷합니다. 배경을 반대로 바꿔 보세요."
      : `평균 몸 색과 배경이 ${Math.abs(m - b).toFixed(2)}만큼 다릅니다. 세대를 넘겨 보세요.`;
    draw();
  }

  sB.addEventListener("input", () => { if (hist.length) hist[hist.length - 1][2] = bg(); update(); });
  chkV.addEventListener("change", reset);
  bStep.addEventListener("click", () => step());
  bReset.addEventListener("click", reset);
  bAuto.addEventListener("click", () => { auto = !auto; bAuto.textContent = auto ? "멈춤" : "자동 진행"; });
  root.querySelectorAll("[data-bg]").forEach((b) => b.addEventListener("click", () => { sB.value = b.dataset.bg; if (hist.length) hist[hist.length - 1][2] = bg(); update(); }));
  loop(cv, (dt) => { if (!auto) return; acc += dt; if (acc > .35) { acc = 0; step(); } });
  reset();
})();
