/* 카드: 시냅스에서 신호는 왜 한 방향으로만 갈까? — 전도(양방향)와 전달(한 방향) 비교 (모식) */
(() => {
  const root = document.getElementById("card-bio-syndir");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const probes = [...root.querySelectorAll(".probe dd")];
  const msg = $(".syn-msg");
  const ACT = "#c9542f", TR = "#3b7c2a", CA = "#7a5aa6";

  const A = [0.04, 0.47], B = [0.51, 0.97]; // 두 뉴런이 차지하는 가로 구간 (비율)
  const PROBE = [0.15, 0.40, 0.62, 0.88], PNAME = ["A 세포체", "A 축삭 끝", "B 세포체", "B 축삭"];
  const V = 0.32, DUR = 0.22, DELAY = 1.0; // 전도 속도(화면 폭/초), 흥분이 남아 있는 시간, 시냅스 지연(연출)

  let st = null; // {nrn, x0, t}
  let T = 0;
  const { ctx, size } = fit(cv, () => draw());

  function fronts() {
    // 각 뉴런의 흥분 파: [뉴런, 시작 위치, 시작 시각]
    const w = [];
    if (!st) return w;
    w.push([st.nrn, st.x0, 0]);
    const iv = st.nrn === "A" ? A : B;
    if (st.nrn === "A") w.push(["B", B[0], (iv[1] - st.x0) / V + DELAY]);
    return w;
  }
  function excited(nrn, x, t) {
    for (const [n, x0, t0] of fronts()) {
      if (n !== nrn) continue;
      const iv = n === "A" ? A : B;
      if (x < iv[0] || x > iv[1]) continue;
      const arrive = t0 + Math.abs(x - x0) / V;
      if (t >= arrive && t < arrive + DUR) return 1 - (t - arrive) / DUR;
    }
    return 0;
  }
  const ever = (nrn, x, t) => fronts().some(([n, x0, t0]) => n === nrn && t >= t0 + Math.abs(x - x0) / V);
  const arriveTerm = () => st && st.nrn === "A" ? (A[1] - st.x0) / V : null;
  const arriveBDend = () => st && st.nrn === "B" ? (st.x0 - B[0]) / V : null;

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const topH = h * 0.5, cy = topH * 0.55, X = (f) => f * w;
    ctx.font = `10.5px ${F.mono}`;

    // 뉴런 그리기
    const nrn = (name, iv, col) => {
      const [x0, x1] = iv.map(X);
      const soma = X(name === "A" ? 0.15 : 0.62), r = Math.max(11, topH * 0.09);
      ctx.strokeStyle = col; ctx.lineWidth = 2;
      // 가지돌기
      const dx = name === "A" ? x0 : x0;
      for (const k of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(soma - r * 0.8, cy); ctx.quadraticCurveTo(dx + 6, cy + k * r * 0.4, dx, cy + k * r * 1.6); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(dx, cy); ctx.lineTo(soma, cy); ctx.stroke();
      // 축삭
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(soma, cy); ctx.lineTo(x1 - (name === "A" ? 6 : 0), cy); ctx.stroke();
      if (name === "A") { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x1 - 4, cy, 7, 0, Math.PI * 2); ctx.fill(); }
      else { for (const k of [-1, 0, 1]) { ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1 - 8, cy); ctx.lineTo(x1, cy + k * 7); ctx.stroke(); } }
      ctx.fillStyle = C.card; ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(soma, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = col; ctx.textAlign = "center"; ctx.font = `600 12px ${F.sans}`;
      ctx.fillText(`뉴런 ${name}`, soma, cy - r - 8);
      ctx.font = `10.5px ${F.mono}`;
      // 흥분한 곳 칠하기
      for (let px = x0; px <= x1; px += 2) {
        const e = excited(name, px / w, T);
        if (e > 0) { ctx.fillStyle = `rgba(201,84,47,${0.25 + 0.7 * e})`; ctx.fillRect(px - 1, cy - 5, 3, 10); }
      }
    };
    nrn("A", A, C.ink2); nrn("B", B, C.ink2);
    // 시냅스 표시
    ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("시냅스", X((A[1] + B[0]) / 2), cy - 18);
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.strokeRect(X(A[1]) - 12, cy - 12, X(B[0]) - X(A[1]) + 24, 24); ctx.setLineDash([]);
    // 전극
    PROBE.forEach((f, i) => {
      const nr = i < 2 ? "A" : "B", hit = ever(nr, f, T), px = X(f);
      ctx.strokeStyle = hit ? ACT : C.ink3; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px, cy + 8); ctx.lineTo(px, cy + 26); ctx.stroke();
      ctx.fillStyle = hit ? ACT : C.ink3; ctx.textAlign = "center";
      ctx.fillText(`${"①②③④"[i]}`, px, cy + 38);
    });
    // 자극 위치
    if (st) {
      const px = X(st.x0);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(px, cy - 9); ctx.lineTo(px - 5, cy - 19); ctx.lineTo(px + 5, cy - 19); ctx.fill();
      ctx.textAlign = "center"; ctx.fillText("자극", px, cy - 23);
    }
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText("뉴런 위를 눌러 자극하세요", 8, 14);

    drawInset({ x: 8, y: topH + 8, w: w - 16, h: h - topH - 14 });
  }

  /* 확대: 시냅스 이전 뉴런의 축삭 끝 | 시냅스 틈 | 시냅스 이후 뉴런의 가지돌기 */
  function drawInset(b) {
    const { x, y, w, h } = b;
    ctx.save();
    ctx.fillStyle = "#f6f1e4"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.rule; ctx.strokeRect(x + .5, y + .5, w, h);
    const midX = x + w * 0.5, gap = Math.max(14, w * 0.05);
    const preR = x + w * 0.5 - gap / 2, postL = x + w * 0.5 + gap / 2;
    const top = y + 22, bot = y + h - 16;
    // 시냅스 이전 (왼쪽)
    ctx.fillStyle = "#eee6cf"; ctx.beginPath(); ctx.roundRect(x + 10, top, preR - x - 10, bot - top, [0, 26, 26, 0]); ctx.fill();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.stroke();
    // 시냅스 이후 (오른쪽)
    ctx.fillStyle = "#e9eee3"; ctx.beginPath(); ctx.roundRect(postL, top, x + w - 10 - postL, bot - top, [26, 0, 0, 26]); ctx.fill(); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("A의 축삭 돌기 말단", x + 14, y + 15);
    ctx.textAlign = "right"; ctx.fillText("B의 가지돌기", x + w - 14, y + 15);
    ctx.textAlign = "center"; ctx.fillStyle = C.ink3; ctx.fillText("시냅스 틈", midX, bot + 12);

    const tA = arriveTerm(), dt = tA == null ? -1 : T - tA; // 흥분이 말단에 도착한 뒤 지난 시간
    const midY = (top + bot) / 2, span = bot - top;
    // Ca²⁺ 유입
    if (dt > 0 && dt < 0.5) {
      for (let i = 0; i < 4; i++) {
        const p = clamp((dt - i * 0.05) / 0.3, 0, 1);
        const cy = top - 10 + p * 34, cx = preR - 30 - i * 16;
        ctx.fillStyle = CA; ctx.globalAlpha = 1 - p * 0.3; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.fillStyle = CA; ctx.textAlign = "right"; ctx.fillText("Ca²⁺", preR - 90, top + 12);
    }
    // 시냅스 소포
    const ves = [[0.3, 0.3], [0.55, 0.22], [0.45, 0.55], [0.7, 0.45], [0.35, 0.78], [0.62, 0.72]];
    const vr = Math.max(7, Math.min(11, span * 0.1));
    ves.forEach(([fx, fy], i) => {
      let vx = x + 18 + (preR - x - 30) * fx, vy = top + span * fy;
      const fuse = i % 2 === 0 && dt > 0.15;
      if (fuse) { const p = clamp((dt - 0.15) / 0.25, 0, 1); vx += (preR - vr - vx) * p; vy += (midY - vy) * p * 0.5; if (p >= 1 && dt > 0.45) return; }
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(vx, vy, vr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = TR;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(vx + Math.cos(k * 1.7) * vr * 0.45, vy + Math.sin(k * 1.7) * vr * 0.45, 1.8, 0, Math.PI * 2); ctx.fill(); }
    });
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("시냅스 소포", x + 16, bot - 6);
    // 수용체 (시냅스 이후 막에만)
    const recs = [0.2, 0.4, 0.6, 0.8].map((f) => top + span * f);
    const bound = dt > 0.75 && dt < DELAY + DUR + 0.6;
    recs.forEach((ry) => {
      ctx.fillStyle = bound ? ACT : "#7d8a70";
      ctx.fillRect(postL - 2, ry - 6, 7, 12);
    });
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("수용체", x + w - 16, bot - 6);
    // 신경 전달 물질 확산
    if (dt > 0.4 && dt < DELAY + 0.9) {
      const p = clamp((dt - 0.4) / 0.45, 0, 1);
      for (let i = 0; i < 18; i++) {
        const fy = ((i * 37) % 100) / 100, jitter = Math.sin(i * 3.1 + T * 6) * 2;
        const px = preR + (postL - preR) * p * (0.5 + 0.5 * ((i * 13) % 10) / 10);
        const py = midY + (fy - 0.5) * span * (0.2 + 0.7 * p) + jitter;
        ctx.fillStyle = TR; ctx.globalAlpha = dt > DELAY + 0.5 ? clamp((DELAY + 0.9 - dt) / 0.4, 0, 1) : 1;
        ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // 역방향: B의 흥분이 가지돌기 끝에 도착
    const tB = arriveBDend();
    if (tB != null && T > tB) {
      const a = clamp((T - tB) / 0.3, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(201,84,47,.25)"; ctx.fillRect(postL + 2, top + 2, 10, span - 4);
      ctx.fillStyle = C.warn; ctx.textAlign = "center"; ctx.font = `600 11px ${F.sans}`;
      ctx.fillText("여기서 멈춤: B 쪽에는 시냅스 소포가 없습니다", midX, y + h - 24 < midY + 10 ? midY : top + span * 0.5 + 4);
      ctx.globalAlpha = 1;
    }
    // 단계 설명
    let step = "";
    if (dt > 0 && dt < 0.2) step = "① 말단에 흥분 도착 → Ca²⁺ 유입";
    else if (dt >= 0.2 && dt < 0.45) step = "② 시냅스 소포가 막과 합쳐짐";
    else if (dt >= 0.45 && dt < 0.8) step = "③ 신경 전달 물질이 틈으로 확산";
    else if (dt >= 0.8 && dt < DELAY + 0.4) step = "④ 수용체에 결합 → B에 탈분극";
    if (step) { ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.fillText(step, midX, y + 15 + 14); }
    ctx.restore();
  }

  function report() {
    PROBE.forEach((f, i) => {
      const nr = i < 2 ? "A" : "B";
      const done = st && fronts().some(([n]) => n === nr);
      const hit = ever(nr, f, T);
      probes[i].textContent = !st ? "—" : hit ? "흥분" : done ? "…" : "없음";
      probes[i].className = hit ? "bad" : "";
    });
    if (!st) { msg.textContent = "뉴런 A나 B의 아무 곳이나 눌러 자극을 주세요."; return; }
    const allDone = T > 6;
    if (st.nrn === "A") msg.textContent = T < arriveTerm() ? "흥분이 A 안에서 양쪽으로 퍼집니다." : "A의 말단에서 신경 전달 물질이 나와 B로 전달됩니다. 이 과정 때문에 시냅스에서 시간이 조금 걸립니다.";
    else msg.textContent = allDone || T > arriveBDend() ? "B의 흥분은 B의 가지돌기 끝까지 전도되지만 A로는 넘어가지 않습니다. ①② 전극은 반응이 없습니다." : "흥분이 B 안에서 양쪽으로 퍼집니다.";
  }

  function stim(nrn, x0) { st = { nrn, x0 }; T = 0; }
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    if (fy > 0.52) return;
    if (fx >= A[0] && fx <= A[1] - 0.01) stim("A", fx);
    else if (fx >= B[0] + 0.01 && fx <= B[1]) stim("B", fx);
  });
  root.querySelectorAll("[data-stim]").forEach((b) => b.addEventListener("click", () => {
    const [n, x0] = b.dataset.stim.split(","); stim(n, +x0);
  }));
  stim("A", 0.30);
  report();
  loop(cv, (dt) => { if (st) T += dt; report(); draw(); });
})();
