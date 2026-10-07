/* 카드: 전사 개시 — 원핵 σ 인자와 −35/−10 상자, 진핵 기본 전사 인자·활성자·매개자 (모식, 상대값) */
(() => {
  const root = document.getElementById("card-adbio-promoter");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  let mode = "pro";
  const C35 = "TTGACA", C10 = "TATAAT", M35 = [3, 1, 5], M10 = [2, 4, 1];
  const ALT = { A: "G", T: "C", G: "A", C: "T" };
  const BLUE = "#3f6fa3", PURP = "#7a5aa6";
  const mut = (seq, order, k) => [...seq].map((b, i) => (order.slice(0, k).includes(i) ? ALT[b] : b));
  function proState() {
    const sig = $(".t-sig").checked, m35 = +$(".s35").value, m10 = +$(".s10").value, sp = +$(".ssp").value;
    const r = sig ? Math.pow(3, -m35 - m10) * Math.pow(4, -Math.abs(sp - 17)) : 0;
    return { sig, m35, m10, sp, r };
  }
  function eukState() {
    const tata = $(".t-tata").checked, tfiid = $(".t-tfiid").checked, gtf = $(".t-gtf").checked, act = $(".t-act").checked, med = $(".t-med").checked;
    const d = tata && tfiid, basal = d && gtf;
    const r = basal ? (act && med ? 50 : act ? 2 : 1) : 0;
    return { tata, tfiid, gtf, act, med, d, basal, r };
  }
  const { ctx, size } = fit(cv, () => draw());
  function blob(x, y, rx, ry, fill, stroke, label, lc) {
    ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (label) { ctx.fillStyle = lc || stroke; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(label, x, y + 4); }
  }
  function dna(x0, x1, y) {
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, y - 3); ctx.lineTo(x1, y - 3); ctx.moveTo(x0, y + 3); ctx.lineTo(x1, y + 3); ctx.stroke();
  }
  function bar(w, h, r, max, label) {
    const x0 = 20, x1 = w - 20, y = h - 26;
    ctx.fillStyle = "#e9ebe4"; ctx.fillRect(x0, y, x1 - x0, 12);
    ctx.fillStyle = r > 0 ? C.forest : C.warn; ctx.fillRect(x0, y, (x1 - x0) * Math.min(1, r / max), 12);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(label, x0, y - 5);
  }
  function drawPro(w, h) {
    const s = proState(), yD = h * 0.5, P0 = -52, P1 = 12, X = (p) => 20 + (p - P0) / (P1 - P0) * (w - 40);
    dna(20, w - 20, yD);
    const e10 = -7, s10 = -12, e35 = s10 - s.sp - 1, s35 = e35 - 5;
    const hexes = [[s35, mut(C35, M35, s.m35), C35, "−35 상자"], [s10, mut(C10, M10, s.m10), C10, "−10 상자"]];
    const bw = (X(1) - X(0));
    hexes.forEach(([st, seq, cons, lab]) => {
      ctx.fillStyle = "rgba(224,160,42,.25)"; ctx.fillRect(X(st) - bw / 2, yD - 8, bw * 6, 16);
      ctx.font = `bold ${Math.min(13, bw * 1.1)}px ${F.mono}`; ctx.textAlign = "center";
      seq.forEach((b, i) => { ctx.fillStyle = b === cons[i] ? C.ink : C.warn; ctx.fillText(b, X(st + i), yD + 26); });
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText(lab, X(st + 2.5), yD + 42);
    });
    /* 간격 표시 */
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(X(e35) + bw / 2, yD + 50); ctx.lineTo(X(e35) + bw / 2, yD + 55); ctx.lineTo(X(s10) - bw / 2, yD + 55); ctx.lineTo(X(s10) - bw / 2, yD + 50); ctx.stroke();
    ctx.fillStyle = s.sp === 17 ? C.ink2 : C.warn; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${s.sp} bp`, (X(e35) + X(s10)) / 2, yD + 67);
    /* +1 */
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), yD - 6); ctx.lineTo(X(0), yD - 18); ctx.lineTo(X(8), yD - 18); ctx.stroke();
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.moveTo(X(8) + 6, yD - 18); ctx.lineTo(X(8), yD - 22); ctx.lineTo(X(8), yD - 14); ctx.fill();
    ctx.font = `10px ${F.mono}`; ctx.fillText("+1", X(0), yD + 26);
    if (s.sig) {
      const fitOK = s.sp === 17, cx = (X(s35) + X(6)) / 2;
      blob(cx, yD - 42, (X(10) - X(s35)) / 2, 30, "rgba(63,111,163,.12)", BLUE, "", BLUE);
      ctx.fillStyle = BLUE; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("중심 효소 α₂ββ′ω", cx + 20, yD - 50);
      /* σ: 두 상자에 닿는 팔 */
      const a = X(s35 + 2.5), b = X(s10 + 2.5);
      ctx.strokeStyle = PURP; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(a, yD - 9); ctx.lineTo(a, yD - 28); ctx.lineTo(b, yD - 28); ctx.stroke();
      ctx.setLineDash(fitOK ? [] : [4, 3]); ctx.beginPath(); ctx.moveTo(b, yD - 28); ctx.lineTo(b, yD - 9); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = PURP; ctx.fillText("σ⁷⁰", (a + b) / 2, yD - 32);
      if (!fitOK) { ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.sans}`; ctx.fillText("σ의 두 팔 사이 거리는 정해져 있어 한쪽이 어긋남", w / 2, 20); }
    } else {
      blob(w * 0.7, 40, 70, 22, "rgba(63,111,163,.12)", BLUE, "중심 효소만", BLUE);
      ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("σ 없음 → 프로모터를 알아보지 못하고 DNA 아무 곳에나 약하게 붙음", w / 2, yD - 20);
    }
    bar(w, h, s.r, 1, `상대 전사 개시 빈도 (공통 서열 = 1, 모식): ${s.r >= 0.01 ? s.r.toFixed(2) : s.r > 0 ? s.r.toExponential(1) : "0"}`);
  }
  function drawEuk(w, h) {
    const s = eukState(), yD = h * 0.62, X = (p) => w * 0.42 + (p + 40) / 75 * (w * 0.55);
    dna(14, w * 0.27, yD); dna(w * 0.33, w - 14, yD);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2;
    [w * 0.28, w * 0.31].forEach((x) => { ctx.beginPath(); ctx.moveTo(x - 4, yD + 9); ctx.lineTo(x + 4, yD - 9); ctx.stroke(); });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("수천~수만 bp", w * 0.30, yD + 24);
    /* 인핸서 */
    const ex = w * 0.13;
    ctx.fillStyle = "rgba(122,90,166,.2)"; ctx.fillRect(ex - 26, yD - 8, 52, 16);
    ctx.fillStyle = PURP; ctx.fillText("인핸서", ex, yD + 24);
    /* TATA */
    if (s.tata) { ctx.fillStyle = "rgba(224,160,42,.3)"; ctx.fillRect(X(-31), yD - 8, X(-24) - X(-31), 16); ctx.fillStyle = C.ink2; ctx.fillText("TATA", (X(-31) + X(-24)) / 2, yD + 24); }
    else { ctx.fillStyle = C.warn; ctx.fillText("TATA 없음", (X(-31) + X(-24)) / 2, yD + 24); }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), yD - 6); ctx.lineTo(X(0), yD - 18); ctx.lineTo(X(10), yD - 18); ctx.stroke();
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.moveTo(X(10) + 6, yD - 18); ctx.lineTo(X(10), yD - 22); ctx.lineTo(X(10), yD - 14); ctx.fill();
    ctx.font = `10px ${F.mono}`; ctx.fillText("+1", X(0), yD + 24);
    /* TFIID */
    const tx = (X(-31) + X(-24)) / 2;
    if (s.tfiid) {
      if (s.d) blob(tx, yD - 20, 22, 12, "rgba(224,160,42,.25)", "#b07a10", "TFIID", "#7a5208");
      else { blob(w * 0.55, 30, 26, 12, "rgba(224,160,42,.15)", "#b07a10", "TFIID", "#7a5208"); }
    }
    /* 기본 전사 인자와 중합 효소 Ⅱ */
    if (s.gtf) {
      if (s.d) { blob(tx + 32, yD - 26, 16, 10, "rgba(116,171,102,.25)", C.forest, "B·F", C.forest); blob(X(4), yD - 56, 16, 10, "rgba(116,171,102,.25)", C.forest, "E·H", C.forest); }
      else blob(w * 0.75, 30, 30, 12, "rgba(116,171,102,.15)", C.forest, "TFIIB·E·F·H", C.forest);
    }
    if (s.basal) blob(X(-2), yD - 28, 34, 18, "rgba(63,111,163,.15)", BLUE, "Pol Ⅱ", BLUE);
    else blob(w * 0.88, yD - 60, 30, 15, "rgba(63,111,163,.1)", BLUE, "Pol Ⅱ", BLUE);
    /* 활성자 */
    if (s.act) blob(ex, yD - 18, 22, 11, "rgba(122,90,166,.25)", PURP, "활성자", PURP);
    if (s.med) {
      const mx = s.basal ? X(-12) : w * 0.62, my = s.basal ? yD - 70 : yD - 100;
      blob(mx, my, 34, 13, "rgba(93,93,97,.12)", C.ink2, "매개자", C.ink2);
      if (s.act && s.basal) {
        ctx.strokeStyle = PURP; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath();
        ctx.moveTo(ex, yD - 30); ctx.quadraticCurveTo(ex + 40, my - 30, mx - 34, my); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = PURP; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("DNA가 휘어 고리를 만들며 접촉", ex + 70, my - 26);
      }
    }
    let msg = "";
    if (!s.tata && s.tfiid) msg = "TBP가 붙을 TATA 상자가 없어 TFIID가 자리를 못 잡음";
    else if (!s.tfiid) msg = "TFIID가 없으면 나머지 인자도, 중합 효소도 프로모터에 앉지 못함";
    else if (!s.gtf) msg = "TFIID만으로는 중합 효소를 앉히지 못함";
    else if (s.act && !s.med) msg = "활성자가 있어도 매개자가 없으면 신호가 잘 전달되지 않음";
    if (msg) { ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(msg, w / 2, 16); }
    bar(w, h, s.r, 50, `상대 전사 개시 빈도 (기본 전사 복합체만 = 1, 모식): ${s.r}`);
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "pro") drawPro(w, h); else drawEuk(w, h);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    root.querySelectorAll(".pm-mode").forEach((p) => { p.hidden = p.dataset.p !== mode; });
    const nk = $(".n-k"), ns = $(".n-s"), nr = $(".n-r");
    if (mode === "pro") {
      const s = proState();
      $(".o35").textContent = s.m35; $(".o10").textContent = s.m10; $(".osp").textContent = s.sp;
      nk.textContent = s.sig ? "σ⁷⁰ → −35·−10 상자" : "없음 (중심 효소만)";
      ns.textContent = !s.sig ? "비특이적 결합" : s.r > 0.3 ? "결합 → 개시" : s.r > 0.02 ? "약하게 결합" : "거의 결합 못 함";
      nr.textContent = s.r >= 0.01 ? `${Math.round(s.r * 100)}%` : s.r > 0 ? "< 1%" : "0";
      ns.className = s.r > 0.3 ? "n-s good" : s.r > 0.02 ? "n-s" : "n-s bad";
    } else {
      const s = eukState();
      nk.textContent = s.d ? "TFIID의 TBP → TATA 상자" : "없음";
      ns.textContent = s.basal ? (s.r > 2 ? "개시 복합체 + 활성화" : "기본 전사 복합체") : "프로모터에 못 앉음";
      nr.textContent = s.basal ? `기본의 ${s.r}배` : "0";
      ns.className = s.basal ? (s.r > 2 ? "n-s good" : "n-s") : "n-s bad";
    }
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  root.querySelectorAll("input").forEach((i) => i.addEventListener("input", update));
  if (/[?&]demo/.test(location.search)) { mode = "euk"; $(".t-act").checked = true; $(".t-med").checked = true; }
  update();
})();
