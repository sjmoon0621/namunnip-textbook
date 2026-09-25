/* 카드: 방사성 동위 원소 시계는 어떻게 읽을까? — 반감기, 모원소·자원소 비 */
(() => {
  const root = document.getElementById("card-earth-half-life");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sl = $(".t"), tOut = $(".t-out");
  const nP = $(".np"), nR = $(".nr"), nA = $(".na"), note = $(".iso-note");

  // 반감기 (년)
  const ISO = {
    c14: { p: "¹⁴C", d: "¹⁴N", T: 5730, note: "생물의 유해(나무, 뼈, 숯)에 씁니다. 약 5만 년이 넘으면 남은 양이 너무 적어 재기 어렵습니다." },
    u235: { p: "²³⁵U", d: "²⁰⁷Pb", T: 7.04e8, note: "화성암 속 광물(저어콘 등)에 씁니다." },
    u238: { p: "²³⁸U", d: "²⁰⁶Pb", T: 4.47e9, note: "반감기가 지구 나이와 비슷해 가장 오래된 암석과 운석의 연령 측정에 씁니다." },
    rb87: { p: "⁸⁷Rb", d: "⁸⁷Sr", T: 4.88e10, note: "반감기가 매우 길어 수억 년보다 짧은 시간은 변화가 작아 재기 어렵습니다." },
  };
  let iso = "c14";

  // 원자 100개: 각 원자가 붕괴하는 시각(반감기 단위)을 미리 뽑아 둔다
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const life = Array.from({ length: 100 }, () => -Math.log(1 - rnd()) / Math.LN2);

  const fmtY = (y) => {
    if (y < 1e4) return `${Math.round(y).toLocaleString("ko-KR")}년`;
    if (y < 1e8) return `${(y / 1e4).toFixed(y < 1e5 ? 2 : 1)}만 년`;
    return `${(y / 1e8).toFixed(y < 1e9 ? 2 : 1)}억 년`;
  };

  const { ctx, size } = fit(cv, () => draw());
  const MAXH = 5; // 반감기 5번까지

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const th = +sl.value; // 반감기 단위 경과 시간
    const I = ISO[iso];
    // 왼쪽: 원자 격자
    const gw = Math.min(h - 56, w * 0.36), cell = gw / 10, gx = 10, gy = 26;
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("원자 100개 (확률적으로 붕괴)", gx, 14);
    let left = 0;
    for (let i = 0; i < 100; i++) {
      const x = gx + (i % 10) * cell + cell / 2, y = gy + Math.floor(i / 10) * cell + cell / 2;
      const alive = life[i] > th; if (alive) left++;
      ctx.beginPath(); ctx.arc(x, y, cell * 0.36, 0, Math.PI * 2);
      ctx.fillStyle = alive ? C.forest : C.card; ctx.fill();
      ctx.strokeStyle = alive ? C.forest : C.ink3; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.fillStyle = C.ink2;
    ctx.fillText(`모원소 ${I.p} ${left}개`, gx, gy + gw + 14);
    ctx.fillStyle = C.ink3; ctx.fillText(`자원소 ${I.d} ${100 - left}개`, gx, gy + gw + 28);

    // 오른쪽: 붕괴 곡선
    const x0 = gx + gw + 46, pw = w - x0 - 12, y0 = 22, ph = h - y0 - 36;
    const X = (t) => x0 + t / MAXH * pw, Y = (v) => y0 + (1 - v) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y,
      xt: [0, 1, 2, 3, 4, 5].map((k) => [k, k === 0 ? "0" : `${k}T`]),
      yt: [[0, "0"], [0.25, "25"], [0.5, "50"], [0.75, "75"], [1, "100"]],
      ylabel: "남은 양 (%)", xlabel: "경과 시간 (T = 반감기)" });
    // 자원소
    ctx.beginPath();
    for (let t = 0; t <= MAXH; t += 0.02) { const y = Y(1 - Math.pow(0.5, t)); t === 0 ? ctx.moveTo(X(t), y) : ctx.lineTo(X(t), y); }
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
    // 모원소
    ctx.beginPath();
    for (let t = 0; t <= MAXH; t += 0.02) { const y = Y(Math.pow(0.5, t)); t === 0 ? ctx.moveTo(X(t), y) : ctx.lineTo(X(t), y); }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.forest; ctx.fillText("모원소", X(0.7) + 6, Y(Math.pow(.5, .7)) + 2);
    ctx.fillStyle = C.ink2; ctx.fillText("자원소", X(0.7) + 6, Y(1 - Math.pow(.5, .7)) + 12);
    // 반감기마다 절반 표시
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`;
    for (let k = 1; k <= 3; k++) {
      const v = Math.pow(0.5, k);
      ctx.beginPath(); ctx.arc(X(k), Y(v), 2.5, 0, Math.PI * 2); ctx.fill();
    }
    // 원자 격자의 실제 비율
    const x = X(th), p = Math.pow(0.5, th);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, y0 + ph); ctx.lineTo(x, Y(p)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(x, Y(p), 5, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
    ctx.beginPath(); ctx.arc(x, Y(left / 100), 4, 0, Math.PI * 2); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    if (th < 0.04) return;
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2;
    const right = x > x0 + pw - 120;
    ctx.textAlign = right ? "right" : "left";
    ctx.fillText(`○ 격자 ${left}%`, x + (right ? -8 : 8), Y(left / 100) + (left / 100 > p ? -8 : 14));
    ctx.textAlign = "left";
  }

  function update() {
    const th = +sl.value, I = ISO[iso], p = Math.pow(0.5, th);
    const yrs = th * I.T;
    tOut.textContent = `${th.toFixed(2)} T = ${fmtY(yrs)}`;
    nP.textContent = `${(p * 100).toFixed(1)}%`;
    nR.textContent = p > 0 ? ((1 - p) / p).toFixed(2) : "—";
    nA.textContent = fmtY(yrs);
    note.textContent = `${I.p} → ${I.d}, 반감기 ${fmtY(I.T)}. ${I.note}`;
    draw();
  }
  sl.addEventListener("input", update);
  root.querySelectorAll("[data-iso]").forEach((b) => b.addEventListener("click", () => {
    iso = b.dataset.iso;
    root.querySelectorAll("[data-iso]").forEach((q) => q.setAttribute("aria-pressed", q === b ? "true" : "false"));
    update();
  }));
  // 측정값으로 나이 찾기: 자원소/모원소 비가 주어진 가상의 시료
  root.querySelectorAll("[data-ratio]").forEach((b) => b.addEventListener("click", () => {
    const r = +b.dataset.ratio; // 자원소/모원소
    sl.value = Math.log2(1 + r); update();
  }));
  update();
})();
