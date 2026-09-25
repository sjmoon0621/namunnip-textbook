/* 카드: 자료를 많이 뒤지면 우연도 규칙처럼 보일까? — 무작위 변수 속 ‘가장 강한 상관’ 찾기 */
(() => {
  const root = document.getElementById("card-is2-dredge");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const bAdd = root.querySelectorAll("[data-add]"), bSize = root.querySelectorAll("[data-n]"), bReset = $(".reset"), bCheck = $(".recheck");
  const [dK, dBest, dOver, dRe] = root.querySelectorAll(".nums dd");
  const msg = $(".dr-msg");

  let seed = 20260925;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const gauss = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
  const std = (a) => { const n = a.length, m = a.reduce((s, x) => s + x) / n; const sd = Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / n); return a.map((x) => (x - m) / sd); };
  const corrZ = (za, zb) => za.reduce((s, x, i) => s + x * zb[i], 0) / za.length;

  const MAXK = 20000, TH = 0.5;
  let n = 20, score = [], vars = 0, rs = [], best = null, re = null;

  function reset() {
    score = std(Array.from({ length: n }, () => 60 + 15 * gauss()).map((x) => Math.round(Math.min(100, Math.max(0, x)))));
    vars = 0; rs = []; best = null; re = null;
    add(20);
  }
  function add(k) {
    for (let j = 0; j < k && vars < MAXK; j++) {
      const v = Array.from({ length: n }, gauss), z = std(v), r = corrZ(score, z);
      vars++; rs.push(r);
      if (!best || Math.abs(r) > Math.abs(best.r)) best = { id: vars, r, z };
    }
    re = null;
    update();
  }
  function recheck() {
    // 새 학생 n명: 성적도, 그 변수도 새로 잰다. 둘은 원래 관계가 없으므로 새 표본에서 r은 0 근처로 돌아간다.
    const s2 = std(Array.from({ length: n }, gauss)), v2 = std(Array.from({ length: n }, gauss));
    re = corrZ(s2, v2);
    update();
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w || !best) return;
    ctx.clearRect(0, 0, w, h);
    const split = Math.round(w * 0.48);
    // ── 왼쪽: 가장 강한 변수와 성적의 산점도 (표준화한 값)
    {
      const x0 = 30, y0 = 22, pw = split - x0 - 14, ph = h - y0 - 36;
      const X = (v) => x0 + (v + 3) / 6 * pw, Y = (v) => y0 + (1 - (v + 3) / 6) * ph;
      NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[-2, "−2"], [0, "0"], [2, "2"]], yt: [[-2, "−2"], [0, "0"], [2, "2"]],
        xlabel: `변수 #${best.id}`, ylabel: "과학 성적 (표준화)" });
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, pw, ph); ctx.clip();
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(X(-3), Y(-3 * best.r)); ctx.lineTo(X(3), Y(3 * best.r)); ctx.stroke();
      const rr = n > 100 ? 2.2 : 3.5;
      for (let i = 0; i < n; i++) {
        ctx.beginPath(); ctx.arc(X(best.z[i]), Y(score[i]), rr, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      }
      ctx.restore();
      ctx.font = `500 12px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "right";
      ctx.fillText(`r = ${best.r.toFixed(2)}`, x0 + pw - 4, y0 + 14);
    }
    // ── 오른쪽: 지금까지 만든 모든 변수의 r 분포
    {
      const x0 = split + 34, y0 = 22, pw = w - x0 - 12, ph = h - y0 - 36, NB = 40;
      const bins = new Array(NB).fill(0);
      for (const r of rs) bins[Math.min(NB - 1, Math.floor((r + 1) / 2 * NB))]++;
      const top = Math.max(...bins, 1);
      const X = (r) => x0 + (r + 1) / 2 * pw, Y = (c) => y0 + (1 - c / top) * ph;
      NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[-1, "−1"], [-0.5, "−0.5"], [0, "0"], [0.5, "0.5"], [1, "1"]], yt: [[0, "0"], [top, String(top)]],
        xlabel: "상관계수 r", ylabel: "변수 개수" });
      ctx.fillStyle = "rgba(181,83,47,.08)";
      ctx.fillRect(x0, y0, X(-TH) - x0, ph); ctx.fillRect(X(TH), y0, x0 + pw - X(TH), ph);
      const bw = pw / NB;
      bins.forEach((c, i) => {
        if (!c) return;
        const lo = -1 + 2 * i / NB, strong = lo >= TH || lo + 2 / NB <= -TH;
        ctx.fillStyle = strong ? C.warn : C.ink3;
        const y = Y(c), hgt = Math.max(1.5, y0 + ph - y);
        ctx.fillRect(x0 + i * bw + .5, y0 + ph - hgt, bw - 1, hgt);
      });
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(best.r), y0); ctx.lineTo(X(best.r), y0 + ph); ctx.stroke();
      if (re !== null) {
        ctx.strokeStyle = C.forest; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(X(re), y0); ctx.lineTo(X(re), y0 + ph); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
        const tw = ctx.measureText("다시 잰 값").width + 8, tx = Math.min(Math.max(X(re), x0 + tw / 2), x0 + pw - tw / 2);
        ctx.fillStyle = C.card; ctx.fillRect(tx - tw / 2, y0 + 2, tw, 15);
        ctx.fillStyle = C.forest; ctx.fillText("다시 잰 값", tx, y0 + 13);
      }
    }
  }

  function update() {
    const over = rs.filter((r) => Math.abs(r) >= TH).length;
    dK.textContent = vars.toLocaleString("ko-KR");
    dBest.textContent = best ? best.r.toFixed(2) : "—";
    dOver.textContent = over.toLocaleString("ko-KR");
    dRe.textContent = re === null ? "—" : re.toFixed(2);
    dRe.classList.toggle("good", re !== null);
    bSize.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.n === n)));
    msg.textContent = re !== null
      ? `처음에 찾은 r = ${best.r.toFixed(2)}가 새 자료에서는 ${re.toFixed(2)}입니다. 우연히 걸린 관계는 다시 재면 사라집니다.`
      : vars >= MAXK ? "변수를 더 만들 수 없습니다. ‘처음부터’를 눌러 표본 크기를 바꿔 보세요."
      : `관계가 전혀 없는 변수 ${vars.toLocaleString("ko-KR")}개 가운데 ${over.toLocaleString("ko-KR")}개가 |r| ≥ ${TH}입니다.`;
    draw();
  }

  bAdd.forEach((b) => b.addEventListener("click", () => add(+b.dataset.add)));
  bSize.forEach((b) => b.addEventListener("click", () => { n = +b.dataset.n; reset(); }));
  bReset.addEventListener("click", reset);
  bCheck.addEventListener("click", recheck);
  reset();
})();
