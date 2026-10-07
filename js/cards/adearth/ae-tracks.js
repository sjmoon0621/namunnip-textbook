/* 카드: 중심의 수소가 바닥나면 별은 왜 오히려 커지고 밝아질까? — 질량별 진화 경로(모식)와 내부 구조 */
(() => {
  const root = document.getElementById("card-adearth-tracks");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sS = $(".s");
  /* 층 색 */
  const COL = { env: "#cfe0f2", envC: "#b8d3ee", rad: "#e4ecf5", Hc: "#f2b33d", shH: "#e8692f", He: "#f1e3a6", HeD: "#e6d58a", HeB: "#d7263d", shHe: "#c2185b", CO: "#9c86c9", Ne: "#7f9fbf", Si: "#8aa", Fe: "#555", NS: "#333", pn: "#d6efe0" };
  /* 경로(logT, logL)와 단계: [이름, 경로 위 점 번호, 에너지, 길이, 층들(바깥→안: [반지름 비, 색, 이름])] */
  const TR = [
    { name: "1 M☉",
      path: [[3.75, -0.13], [3.76, 0.15], [3.76, 0.30], [3.70, 0.42], [3.665, 0.55], [3.62, 1.5], [3.57, 2.5], [3.50, 3.4], [3.68, 1.7], [3.62, 2.0], [3.55, 2.8], [3.48, 3.6], [4.0, 3.62], [5.0, 3.5], [5.05, 2.0], [4.8, 0.0], [4.4, -1.25]],
      jump: [7],
      st: [
        ["영년 주계열", 0, "중심 H 핵융합 (p–p 연쇄)", "약 100억 년 (주계열 전체)", [[1, "envC", "대류 외피"], [0.71, "rad", "복사층"], [0.25, "Hc", "중심 H 핵융합"]]],
        ["주계열 끝 → 준거성", 2, "H 껍질 연소 (중심핵은 쉼)", "수억 년 (준거성)", [[1, "envC", "대류 외피"], [0.6, "rad", "복사층"], [0.16, "shH", "H 껍질 연소"], [0.12, "He", "He 중심핵 (핵융합 없음)"]]],
        ["적색 거성 가지 끝", 7, "H 껍질 연소 (매우 강함)", "약 10억 년에 걸쳐 오름", [[1, "envC", "깊은 대류 외피"], [0.2, "shH", "H 껍질 연소"], [0.15, "HeD", "축퇴된 He 중심핵 (약 0.47 M☉)"]]],
        ["헬륨 섬광 뒤 중심 He 연소", 8, "중심 He 핵융합 (삼중 알파) + H 껍질", "약 1억 년", [[1, "envC", "대류 외피"], [0.26, "shH", "H 껍질 연소"], [0.21, "He", "He 중심핵"], [0.12, "HeB", "중심 He 핵융합"]]],
        ["점근 거성 가지 (AGB)", 11, "He 껍질 + H 껍질 (번갈아 맥동)", "수백만 년, 강한 항성풍", [[1, "envC", "대류 외피 (질량 손실)"], [0.3, "shH", "H 껍질 연소"], [0.25, "He", "He 층"], [0.2, "shHe", "He 껍질 연소"], [0.15, "CO", "축퇴된 C·O 중심핵"]]],
        ["행성상 성운의 중심별", 13, "남은 껍질 연소가 꺼져 감", "수만 년", [[1, "pn", "흩어지는 외피 (행성상 성운)"], [0.25, "He", "얇은 H·He 막"], [0.18, "CO", "드러난 C·O 핵"]]],
        ["백색 왜성", 16, "핵융합 없음, 남은 열로 빛남", "수십억 년 이상 식어 감", [[1, "CO", "C·O 백색 왜성 (약 0.55 M☉, 지구 크기)"]]],
      ] },
    { name: "5 M☉",
      path: [[4.24, 2.75], [4.21, 2.95], [4.17, 3.05], [4.20, 3.10], [3.90, 3.08], [3.65, 3.05], [3.60, 3.30], [3.75, 3.25], [3.88, 3.20], [3.78, 3.28], [3.62, 3.35], [3.55, 3.7], [3.52, 4.0], [4.2, 4.0], [5.0, 3.9], [5.1, 2.5], [4.48, -1.25]],
      jump: [],
      st: [
        ["영년 주계열", 0, "중심 H 핵융합 (CNO 순환)", "약 1억 년 (주계열 전체)", [[1, "rad", "복사 외피"], [0.3, "Hc", "대류 중심핵 (H 핵융합)"]]],
        ["주계열 끝", 3, "중심핵 전체가 수축하며 H 껍질 점화", "수십만 년", [[1, "rad", "복사 외피"], [0.2, "shH", "H 껍질 연소"], [0.15, "He", "He 중심핵"]]],
        ["헤르츠스프룽 틈을 건넘", 5, "H 껍질 연소", "수십만 년 (매우 빠름)", [[1, "envC", "대류 외피가 깊어짐"], [0.2, "shH", "H 껍질 연소"], [0.15, "He", "He 중심핵 (축퇴 안 됨)"]]],
        ["중심 He 점화 (조용히)", 6, "중심 He 핵융합 + H 껍질", "He 연소 시작", [[1, "envC", "대류 외피"], [0.24, "shH", "H 껍질 연소"], [0.19, "He", "He 중심핵"], [0.1, "HeB", "중심 He 핵융합"]]],
        ["청색 고리 (세페이드 띠 통과)", 8, "중심 He 핵융합 + H 껍질", "약 1,000만~2,000만 년 (He 연소 전체)", [[1, "rad", "외피가 줄며 뜨거워짐"], [0.26, "shH", "H 껍질 연소"], [0.2, "He", "He 층"], [0.12, "HeB", "중심 He 핵융합"]]],
        ["점근 거성 가지 (AGB)", 12, "He 껍질 + H 껍질", "약 100만 년", [[1, "envC", "대류 외피 (질량 손실)"], [0.3, "shH", "H 껍질 연소"], [0.25, "He", "He 층"], [0.2, "shHe", "He 껍질 연소"], [0.15, "CO", "C·O 중심핵"]]],
        ["백색 왜성", 16, "핵융합 없음", "수십억 년 이상 식어 감", [[1, "CO", "C·O(또는 O·Ne) 백색 왜성 (약 0.9 M☉)"]]],
      ] },
    { name: "15 M☉",
      path: [[4.48, 4.30], [4.44, 4.48], [4.40, 4.60], [4.43, 4.62], [4.20, 4.66], [3.80, 4.72], [3.62, 4.78], [3.56, 4.85], [3.54, 5.0]],
      jump: [],
      st: [
        ["영년 주계열", 0, "중심 H 핵융합 (CNO 순환)", "약 1,100만 년 (주계열 전체)", [[1, "rad", "복사 외피 (항성풍)"], [0.38, "Hc", "대류 중심핵 (H 핵융합)"]]],
        ["주계열 끝", 3, "H 껍질 점화", "수만 년", [[1, "rad", "복사 외피"], [0.22, "shH", "H 껍질 연소"], [0.18, "He", "He 중심핵"]]],
        ["중심 He 연소 (청색 → 적색 초거성)", 6, "중심 He 핵융합 + H 껍질", "약 100만~200만 년", [[1, "envC", "대류 외피"], [0.3, "shH", "H 껍질 연소"], [0.24, "He", "He 층"], [0.14, "HeB", "중심 He 핵융합"]]],
        ["적색 초거성 말기 (양파 구조)", 8, "C → Ne → O → Si 연소가 안쪽부터 차례로", "C 수천 년, O 수 년, Si 수 주 이내", [[1, "envC", "H 외피 (대류)"], [0.5, "He", "He 층"], [0.38, "CO", "C·O 층"], [0.28, "Ne", "O·Ne·Mg 층"], [0.19, "Si", "Si·S 층"], [0.1, "Fe", "Fe 중심핵 (핵융합 끝)"]]],
        ["중심핵 붕괴 → 제2형 초신성", 8, "중력 붕괴 에너지 (대부분 중성미자)", "1초 안팎의 붕괴", [[1, "pn", "날아가는 외피 (초신성 잔해)"], [0.08, "NS", "중성자별 (약 1.4 M☉, 반지름 약 12 km)"]]],
      ] },
  ];
  let mi = 0;
  const RLINES = [0.01, 1, 10, 100, 1000];
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const tr = TR[mi], st = tr.st[+sS.value];
    /* 왼쪽: H–R도 (logT 5.2 → 3.4, logL −2.5 → 6) */
    const x0 = 40, x1 = w * 0.58, y0 = 20, y1 = h - 34;
    const X = (lt) => x0 + (5.2 - lt) / 1.8 * (x1 - x0), Y = (ll) => y1 - (ll + 2.5) / 8.5 * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y,
      xt: [[5, "100k"], [4.5, "30k"], [4, "10k"], [3.7, "5k"], [3.5, "3k"]],
      yt: [[-2, "10⁻²"], [0, "1"], [2, "10²"], [4, "10⁴"], [6, "10⁶"]],
      xlabel: "표면 온도 (K)", ylabel: "광도 (L☉)" });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    /* 같은 반지름 선 */
    ctx.strokeStyle = "rgba(141,141,146,.5)"; ctx.setLineDash([2, 4]); ctx.lineWidth = 1; ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    const rlab = [];
    for (const R of RLINES) {
      const L = (lt) => 2 * Math.log10(R) + 4 * (lt - Math.log10(5772));
      ctx.beginPath(); ctx.moveTo(X(5.2), Y(L(5.2))); ctx.lineTo(X(3.4), Y(L(3.4))); ctx.stroke();
      let lt = 3.56, ll = L(lt);
      if (ll > 5.6) { lt = Math.log10(5772) + (5.6 - 2 * Math.log10(R)) / 4; ll = 5.6; }
      if (ll > -2.3) rlab.push([`${R} R☉`, X(lt) - 2, Y(ll) - 4]);
    }
    ctx.setLineDash([]);
    /* 영년 주계열 대략선 */
    ctx.strokeStyle = "rgba(59,124,42,.35)"; ctx.lineWidth = 6; ctx.beginPath();
    [[4.62, 5.6], [4.48, 4.3], [4.24, 2.75], [3.97, 1.1], [3.75, -0.13], [3.6, -1.4], [3.5, -2.3]].forEach(([a, b], i) => i ? ctx.lineTo(X(a), Y(b)) : ctx.moveTo(X(a), Y(b)));
    ctx.stroke();
    /* 다른 질량 경로 (흐리게) */
    TR.forEach((t, j) => { if (j === mi) return; ctx.strokeStyle = "rgba(93,93,97,.25)"; ctx.lineWidth = 1.2; ctx.beginPath(); t.path.forEach(([a, b], i) => i ? ctx.lineTo(X(a), Y(b)) : ctx.moveTo(X(a), Y(b))); ctx.stroke(); });
    /* 이 질량 경로: 지나온 부분은 진하게 */
    const upto = st[1];
    for (let i = 1; i < tr.path.length; i++) {
      const [a0, b0] = tr.path[i - 1], [a1, b1] = tr.path[i], done = i <= upto, jump = tr.jump.includes(i - 1);
      ctx.strokeStyle = done ? C.apple : "rgba(212,73,58,.3)"; ctx.lineWidth = done ? 2.2 : 1.5; ctx.setLineDash(jump ? [3, 3] : []);
      ctx.beginPath(); ctx.moveTo(X(a0), Y(b0)); ctx.lineTo(X(a1), Y(b1)); ctx.stroke();
    }
    ctx.setLineDash([]);
    const [pt, pl] = tr.path[upto];
    ctx.fillStyle = C.apple; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(pt), Y(pl), 6, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    rlab.forEach(([t, x, y]) => ctx.fillText(t, x, y));
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = "rgba(59,124,42,.9)"; ctx.textAlign = "left"; ctx.textAlign = "right"; ctx.fillText("영년 주계열", X(4.5) - 8, Y(4.3));
    /* 오른쪽: 내부 구조 (반원 단면 + 아래 범례) */
    const layers = st[4], n = layers.length;
    const cx = w * 0.63, Rp = Math.min(w * 0.28, h * 0.29), cy = 28 + Rp;
    ctx.fillStyle = C.ink2; ctx.font = `bold 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${tr.name} · ${st[0]}`, cx, 14);
    layers.forEach(([f, col]) => { ctx.fillStyle = COL[col]; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, Rp * f, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill(); });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy - Rp); ctx.lineTo(cx, cy + Rp); ctx.stroke();
    ctx.font = `10.5px ${F.sans}`;
    layers.forEach(([f, col, nm], i) => {
      const ty = cy + Rp + 18 + i * 15;
      ctx.fillStyle = COL[col]; ctx.fillRect(cx, ty - 9, 10, 10);
      ctx.strokeStyle = "rgba(35,35,38,.3)"; ctx.strokeRect(cx + 0.5, ty - 8.5, 9, 9);
      ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(nm, cx + 15, ty);
    });
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.fillText("바깥 → 안 순서 · 크기 비율은 모식", cx, cy + Rp + 18 + n * 15);
  }
  function update() {
    const tr = TR[mi]; sS.max = tr.st.length - 1; if (+sS.value > +sS.max) sS.value = sS.max;
    const st = tr.st[+sS.value], [lt, ll] = tr.path[st[1]], T = 10 ** lt, L = 10 ** ll, R = Math.sqrt(L) * (5772 / T) ** 2;
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.m === mi)));
    $(".s-out").textContent = `${+sS.value + 1} / ${tr.st.length} · ${st[0]}`;
    $(".n-e").textContent = st[2]; $(".n-t").textContent = st[3];
    const last = mi === 2 && +sS.value === tr.st.length - 1;
    $(".n-s").textContent = last ? "초신성으로 폭발 (H–R도 경로 끝)" : `${Math.round(T / 100) * 100} K · ${L < 1 ? L.toPrecision(1) : Math.round(L).toLocaleString()} L☉ · ${R < 0.1 ? R.toFixed(3) : R < 10 ? R.toFixed(1) : Math.round(R)} R☉`;
    draw();
  }
  sS.addEventListener("input", update);
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mi = +b.dataset.m; sS.value = 0; update(); }));
  if (/[?&]demo\b/.test(location.search)) { mi = 2; sS.max = 4; sS.value = 3; }
  update();
})();
