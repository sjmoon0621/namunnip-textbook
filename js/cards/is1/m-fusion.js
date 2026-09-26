/* 카드 2.2.1: 별은 왜 철에서 핵융합을 멈출까? — 연소 단계와 핵자당 결합 에너지 곡선 */
(() => {
  const root = document.getElementById("card-is1-fusion");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), slider = $(".stage"), sOut = $(".s-out");
  const oT = $(".temp"), oD = $(".dur"), oE = $(".en"), oF = $(".fate");

  // 핵자 1개당 결합 에너지 (MeV) — 원자 질량 평가(AME) 값으로 계산
  const BE = [
    ["H", 1, 0], ["", 2, 1.112], ["", 3, 2.573], ["He", 4, 7.074], ["", 6, 5.332], ["", 7, 5.606], ["", 9, 6.463],
    ["", 11, 6.928], ["C", 12, 7.680], ["", 14, 7.476], ["O", 16, 7.976], ["", 19, 7.779], ["Ne", 20, 8.032],
    ["", 23, 8.112], ["Mg", 24, 8.261], ["", 27, 8.332], ["Si", 28, 8.448], ["S", 32, 8.493], ["", 35, 8.520],
    ["", 40, 8.551], ["", 48, 8.723], ["", 52, 8.776], ["Fe", 56, 8.790], ["Ni", 62, 8.795], ["", 64, 8.736],
    ["", 84, 8.717], ["", 90, 8.710], ["", 107, 8.554], ["", 120, 8.505], ["", 138, 8.393],
    ["Au", 197, 7.916], ["", 208, 7.868], ["U", 238, 7.570],
  ];
  const be = (A) => BE.find((p) => p[1] === A)[2];

  // 단계: 연료, 재, 화살표(질량수), 온도, 기간, 핵자당 에너지(MeV)
  const ST = [
    { f: "수소", p: "헬륨", a: [1, 4], e: 6.68, shell: "H" },
    { f: "헬륨", p: "탄소·산소", a: [4, 12], e: 0.61, shell: "He" },
    { f: "탄소", p: "네온·마그네슘", a: [12, 20], e: 0.19, shell: "C·O" },
    { f: "네온", p: "산소·마그네슘", a: [20, 24], e: 0.11, shell: "O·Ne·Mg" },
    { f: "산소", p: "규소·황", a: [16, 28], e: 0.30, shell: "O·Si" },
    { f: "규소", p: "철·니켈", a: [28, 56], e: 0.19, shell: "Si·S" },
  ];
  const STAR = {
    "0.3": { last: 0, T: ["1000만 K 미만"], D: ["우주 나이의 수십 배"], fate: "He 백색 왜성", endNote: "헬륨 백색 왜성 (아직 우주 나이가 모자라 하나도 없음)" },
    "1": { last: 1, T: ["약 1600만 K", "약 1억 K"], D: ["약 100억 년", "약 1억 년"], fate: "C·O 백색 왜성", endNote: "바깥층은 흩어지고, 중심은 탄소·산소 백색 왜성" },
    "25": { last: 5, T: ["약 4000만 K", "약 2억 K", "약 8억 K", "약 16억 K", "약 20억 K", "약 33억 K"], D: ["약 700만 년", "약 80만 년", "약 500년", "약 1년", "약 5개월", "약 하루"], fate: "초신성", endNote: "철 중심이 무너져 초신성, 중심에는 중성자별이나 블랙홀" },
  };
  let m = "25";

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520;
    const S = STAR[m], s = +slider.value, end = s > S.last;
    const split = Math.round(w * 0.38);

    // ── 왼쪽: 양파 껍질 구조 (모식)
    const cx = split / 2, cy = h / 2 + 8, R = Math.min(split / 2 - 8, h / 2 - 22);
    const shells = ["H", "He", "C·O", "O·Ne·Mg", "O·Si", "Si·S", "Fe"];
    const COL = ["#dbe8f3", "#f3e3b8", "#cfd8c4", "#b9cfa9", "#e4c8b8", "#d5b9a5", "#8d8d92"];
    // 바깥부터: 수소 외피, 그 안으로 재가 쌓인 층들, 가운데는 지금 타는 중심
    const nLayers = end ? (m === "25" ? 7 : m === "1" ? 3 : 2) : s + 1;
    const core = R * 0.3, rad = (i) => R - i * (R - core) / (end ? nLayers - 1 : nLayers);
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    ctx.fillText(end ? "마지막 모습 (모식)" : "별 중심부 (모식)", cx, 14);
    for (let i = 0; i < nLayers; i++) {
      ctx.beginPath(); ctx.arc(cx, cy, rad(i), 0, Math.PI * 2);
      ctx.fillStyle = COL[i]; ctx.fill();
      ctx.strokeStyle = "rgba(35,35,38,.35)"; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.textAlign = "center";
    const lastShown = end ? nLayers - 1 : nLayers;
    for (let i = 0; i < lastShown; i++) {
      ctx.fillStyle = C.ink;
      ctx.fillText(shells[i], cx, cy - (rad(i) + rad(i + 1)) / 2 + 4);
    }
    const rc = core;
    if (!end) {
      ctx.beginPath(); ctx.arc(cx, cy, rc, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(224,160,42,.95)"; ctx.fill();
      ctx.fillStyle = C.ink; ctx.font = `600 ${small ? 9.5 : 11}px ${F.sans}`;
      ctx.fillText(ST[s].f, cx, cy - 2);
      ctx.font = `${small ? 9 : 10}px ${F.sans}`; ctx.fillText(`→ ${ST[s].p}`, cx, cy + 12);
    } else {
      const lab = m === "25" ? "철" : m === "1" ? "탄소·산소" : "헬륨";
      ctx.fillStyle = m === "25" ? C.paper : C.ink; ctx.font = `600 ${small ? 10 : 11}px ${F.sans}`;
      ctx.fillText(lab, cx, cy + 4);
    }

    // ── 오른쪽: 결합 에너지 곡선 (가로축 로그)
    const x0 = split + (small ? 26 : 34), y0 = 22, pw = w - x0 - 10, ph = h - y0 - 34;
    const X = (A) => x0 + Math.log(A) / Math.log(260) * pw, Y = (v) => y0 + (1 - v / 9.4) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: (small ? [1, 4, 16, 56, 238] : [1, 4, 12, 28, 56, 120, 238]).map((a) => [a, String(a)]), yt: [[0, "0"], [2, "2"], [4, "4"], [6, "6"], [8, "8"]], ylabel: "핵자 1개당 결합 에너지 (MeV)", xlabel: "질량수" });
    ctx.beginPath();
    BE.forEach(([, A, v], i) => i ? ctx.lineTo(X(A), Y(v)) : ctx.moveTo(X(A), Y(v)));
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.stroke();
    const reached = end ? S.last : s;
    for (const [lab, A, v] of BE) {
      ctx.fillStyle = C.ink2; ctx.beginPath(); ctx.arc(X(A), Y(v), 2.2, 0, Math.PI * 2); ctx.fill();
      if (!["H", "He", "C", "O", "Si", "Fe", "Au", "U"].includes(lab)) continue;
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
      ctx.fillText(lab, X(A) + (lab === "H" ? 8 : 0), Y(v) + (lab === "H" ? -6 : 14));
    }
    // 꼭대기 표시
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(56), Y(8.79)); ctx.lineTo(X(56), y0 + ph); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText("꼭대기", X(56) + 4, Y(4));
    // 이미 지나온 단계 (옅게) + 지금 단계 (진하게)
    for (let i = 0; i <= Math.min(reached, 5); i++) {
      const [a, b] = ST[i].a, cur = !end && i === s;
      arrow(X(a), Y(be(a)), X(b), Y(be(b)), cur ? C.apple : "rgba(212,73,58,.3)", cur ? 2.2 : 1.4);
    }
    if (end && m === "25") {
      // 철 + 철 → 질량수 112: 에너지를 흡수 (곡선 아래로)
      const yb = Y(8.58);
      ctx.setLineDash([4, 3]); arrow(X(56), Y(8.79), X(112), yb, C.ink, 1.5); ctx.setLineDash([]);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
      ctx.fillText("철+철: 내리막", X(112), yb + 16);
    }
    ctx.textAlign = "left";
  }

  function arrow(x1, y1, x2, y2, col, lw) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1), L = 7;
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - L * Math.cos(a - .45), y2 - L * Math.sin(a - .45));
    ctx.lineTo(x2 - L * Math.cos(a + .45), y2 - L * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
  }

  function update() {
    const S = STAR[m];
    slider.max = S.last + 1;
    if (+slider.value > S.last + 1) slider.value = S.last + 1;
    const s = +slider.value, end = s > S.last;
    if (end) {
      sOut.textContent = `끝 · ${S.endNote}`;
      oT.textContent = "—";
      oD.textContent = m === "25" ? "붕괴 1초 미만" : "—";
      oE.textContent = m === "25" ? "0 이하" : "—";
      oE.className = "en bad";
      oF.textContent = S.fate;
    } else {
      sOut.textContent = `${s + 1}. ${ST[s].f} → ${ST[s].p}`;
      oT.textContent = S.T[s]; oD.textContent = S.D[s];
      oE.textContent = `${ST[s].e.toFixed(2)} MeV`; oE.className = "en";
      oF.textContent = "연소 중";
    }
    draw();
  }

  slider.addEventListener("input", update);
  root.querySelectorAll(".mass .chip").forEach((b) => b.addEventListener("click", () => {
    m = b.dataset.m;
    root.querySelectorAll(".mass .chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  update();
})();
