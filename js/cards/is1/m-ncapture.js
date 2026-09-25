/* 카드 2.2.2: 철보다 무거운 금은 어디서 왔을까? — s 과정과 r 과정의 핵종 도표 경로 (모식) */
(() => {
  const root = document.getElementById("card-is1-ncap");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), go = $(".go"), stopB = $(".stop"), res = $(".result");
  const oNuc = $(".nuc"), oCap = $(".cap"), oTime = $(".time");

  const SYM = "Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm".split(" ");
  const sym = (Z) => SYM[Z - 26] || "?";
  const KO = { Hf: "하프늄", Ta: "탄탈럼", W: "텅스텐", Re: "레늄", Os: "오스뮴", Ir: "이리듐", Pt: "백금", Au: "금", Hg: "수은", Tl: "탈륨", Pb: "납", Bi: "비스무트", Th: "토륨", U: "우라늄" };

  // 안정한 핵의 띠 (모식): 질량수 A에서 가장 안정한 원자 번호의 근사식
  const Z0 = (A) => A / (1.98 + 0.0155 * Math.pow(A, 2 / 3));
  const Ns = (Z) => { let lo = Z, hi = 4 * Z; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; Z0(m) < Z ? lo = m : hi = m; } return lo - Z; };
  const NS = {}; for (let Z = 24; Z <= 96; Z++) NS[Z] = Ns(Z);
  // 질량수 180~209: 중성자가 많은 쪽에서 베타 붕괴로 내려올 때 처음 만나는 안정한 원자핵 (실제 핵종)
  const LAND = { 180: 72, 181: 73, 182: 74, 183: 74, 184: 74, 185: 75, 186: 74, 187: 75, 188: 76, 189: 76, 190: 76, 191: 77, 192: 76, 193: 77, 194: 78, 195: 78, 196: 78, 197: 79, 198: 78, 199: 80, 200: 80, 201: 80, 202: 80, 203: 81, 204: 80, 205: 81, 206: 82, 207: 82, 208: 82, 209: 83, 232: 90, 235: 92, 238: 92 };
  const landZ = (A) => LAND[A] || Math.round(Z0(A));
  // r 과정 경로 (모식): 중성자 마법수 50, 82, 126에서 잠시 머문다
  const Nr = (Z) => Z < 30 ? 50 : Z < 46 ? 50 + (Z - 30) * 2 : Z < 50 ? 82 : Z < 68 ? 82 + (Z - 50) * 44 / 18 : Z < 73 ? 126 : 126 + (Z - 73) * 2.3;

  let mode = "s", st;
  function reset() {
    st = { Z: 26, N: 30, cap: 0, path: [[26, 30]], phase: "idle", pendingBeta: false, acc: 0, back: [] };
    res.innerHTML = "철-56에서 출발합니다. 중성자를 하나 붙잡으면 오른쪽으로 한 칸, 베타 붕괴(중성자 → 양성자)가 일어나면 왼쪽 위로 한 칸 갑니다.";
    go.textContent = "시작"; stopB.disabled = true;
    readout(); draw();
  }

  function step() {
    if (st.phase === "s") {
      if (st.Z === 83 && st.N === 126) return finishS();
      if (st.pendingBeta) { st.Z++; st.N--; st.pendingBeta = false; }
      else {
        st.N++; st.cap++;
        const magicHold = st.Z === 82 && st.N <= 126;
        if (st.N > NS[st.Z] + 0.7 && !magicHold) st.pendingBeta = true;
      }
      st.path.push([st.Z, st.N]);
    } else if (st.phase === "r") {
      if (st.Z >= 94) return cut(true);
      if (st.N < Nr(st.Z)) { st.N++; st.cap++; } else { st.Z++; st.N--; }
      st.path.push([st.Z, st.N]);
    } else if (st.phase === "decay") {
      const A = st.Z + st.N;
      if (st.Z >= landZ(A)) return land();
      st.Z++; st.N--; st.back.push([st.Z, st.N]);
    }
  }
  function finishS() {
    st.phase = "done"; go.textContent = "다시 시작";
    res.innerHTML = "<b>비스무트-209에서 더 나아가지 못합니다.</b> 중성자를 하나 더 붙잡으면 비스무트-210 → 폴로늄-210이 되고, 이것이 알파 붕괴해 납-206으로 되돌아갑니다. 지나온 길에 금-197이 있었는지 찾아보세요.";
  }
  function cut(auto) {
    st.phase = "decay"; stopB.disabled = true;
    if (auto) res.innerHTML = "너무 무거워진 핵은 쪼개지기 시작합니다(핵분열). 여기서 중성자 공급이 끊겼다고 봅니다.";
  }
  function land() {
    st.phase = "done"; go.textContent = "다시 시작";
    const A = st.Z + st.N, s = sym(st.Z), ko = KO[s];
    let msg;
    if (A === 197) msg = "<b>금-197에 도착했습니다.</b> 중성자가 많은 불안정한 핵이 베타 붕괴를 거듭해, 질량수는 그대로 두고 원자 번호만 올라갔습니다.";
    else if (A === 232) msg = "<b>토륨-232</b> (반감기 약 140억 년). 지구에 지금도 남아 있습니다.";
    else if (A === 235 || A === 238) msg = `<b>우라늄-${A}</b> (반감기 약 ${A === 238 ? "45억" : "7억"} 년). s 과정으로는 닿지 못하는 원소입니다.`;
    else if (A > 209) msg = `<b>질량수 ${A}</b>의 무거운 핵은 불안정합니다. 알파 붕괴나 핵분열을 거듭해 결국 납·비스무트 같은 가벼운 핵이 됩니다.`;
    else if (ko) msg = `<b>${ko}-${A}</b>에 도착했습니다. 금(197)에 떨어뜨리려면 질량수가 몇일 때 끊어야 할까요?`;
    else msg = `질량수 ${A}: <b>${s}</b> 근처의 안정한 핵에 도착합니다(위치는 모식 계산). 금(197)을 노려 보세요.`;
    res.innerHTML = msg;
  }

  function readout() {
    const A = st.Z + st.N;
    oNuc.textContent = `${sym(st.Z)}-${A}`;
    oCap.textContent = `${st.cap}개`;
    oTime.textContent = st.phase === "idle" ? "—" : mode === "s" ? "1개에 수년~수천 년" : "전체 약 1초";
  }

  const { ctx, size } = fit(cv, () => draw());
  const N0 = 26, N1 = 176, Zlo = 24, Zhi = 96;

  function draw() {
    const { w, h } = size; if (!w || !st) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520;
    const x0 = small ? 28 : 36, y0 = 14, pw = w - x0 - 8, ph = h - y0 - 30;
    const X = (N) => x0 + (N - N0) / (N1 - N0) * pw, Y = (Z) => y0 + (1 - (Z - Zlo) / (Zhi - Zlo)) * ph;
    const cw = pw / (N1 - N0), chh = ph / (Zhi - Zlo);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[30, "30"], [50, "50"], [82, "82"], [126, "126"], [150, "150"]], yt: [[26, "26"], [50, "50"], [79, "79"], [92, "92"]], xlabel: "중성자 수 N", ylabel: "" });
    ctx.save(); ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.translate(10, y0 + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("양성자 수 Z", 0, 0); ctx.restore();
    // 안정한 핵의 띠
    ctx.fillStyle = "rgba(35,35,38,.16)";
    for (let Z = 26; Z <= 92; Z++) {
      const n = NS[Z];
      ctx.fillRect(X(n - 1.4), Y(Z) - chh / 2, 2.8 * cw, chh);
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("안정한 핵의 띠", X(NS[60]) + 10, Y(60) + 18);
    // 마법수
    ctx.setLineDash([2, 4]); ctx.strokeStyle = "rgba(35,35,38,.25)"; ctx.lineWidth = 1;
    for (const n of [50, 82, 126]) { ctx.beginPath(); ctx.moveTo(X(n), y0); ctx.lineTo(X(n), y0 + ph); ctx.stroke(); }
    ctx.setLineDash([]);
    // 표시할 핵종
    const mark = (Z, N, t, dx = 6, dy = 4, col = C.ink) => {
      ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.strokeRect(X(N) - 4, Y(Z) - 4, 8, 8);
      ctx.fillStyle = col; ctx.textAlign = dx < 0 ? "right" : "left"; ctx.fillText(t, X(N) + dx, Y(Z) + dy);
    };
    mark(79, 118, "금 Au-197", -8, 4, "#a8801c");
    mark(83, 126, "Bi-209", 8, -4);
    mark(92, 146, "U-238", 8, 4);
    mark(26, 30, "", 8, 4);
    // 경로
    const cell = Math.max(2.4, Math.min(cw, chh) * 0.95);
    const col = mode === "s" ? C.forest : C.apple;
    ctx.fillStyle = col;
    for (const [Z, N] of st.path) ctx.fillRect(X(N) - cell / 2, Y(Z) - cell / 2, cell, cell);
    ctx.fillStyle = C.amber;
    for (const [Z, N] of st.back) ctx.fillRect(X(N) - cell / 2, Y(Z) - cell / 2, cell, cell);
    // 현재 위치
    ctx.beginPath(); ctx.arc(X(st.N), Y(st.Z), 5.5, 0, Math.PI * 2);
    ctx.fillStyle = C.ink; ctx.fill();
    ctx.font = `500 12px ${F.mono}`; ctx.textAlign = X(st.N) > x0 + pw * .75 ? "right" : "left";
    ctx.fillText(`${sym(st.Z)}-${st.Z + st.N}`, X(st.N) + (ctx.textAlign === "right" ? -9 : 9), Y(st.Z) - 8);
    ctx.textAlign = "left";
  }

  go.addEventListener("click", () => {
    const again = st.phase !== "idle";
    if (again) reset();
    st.phase = mode; go.textContent = "다시 시작";
    stopB.disabled = mode !== "r";
    res.innerHTML = mode === "s" ? "중성자가 드문드문 옵니다. 불안정한 핵은 다음 중성자가 오기 전에 베타 붕괴합니다." : "중성자가 쏟아집니다. 붕괴할 틈 없이 중성자를 붙잡아 띠에서 멀어집니다. 원하는 때에 공급을 끊어 보세요.";
    readout();
  });
  stopB.addEventListener("click", () => { if (st.phase === "r") { cut(false); res.innerHTML = "공급이 끊겼습니다. 질량수는 그대로, 베타 붕괴로 안정한 띠까지 내려갑니다."; } });
  root.querySelectorAll(".mode .chip").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    root.querySelectorAll(".mode .chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    reset();
  }));

  loop(cv, (dt) => {
    if (!st || st.phase === "idle" || st.phase === "done") return;
    const rate = st.phase === "s" ? 12 : st.phase === "r" ? (st.Z + st.N < 170 ? 20 : 7) : 14;
    st.acc += dt * rate;
    let n = 0;
    while (st.acc >= 1 && n++ < 6) { st.acc -= 1; step(); if (st.phase === "done") break; }
    readout(); draw();
  });
  reset();
})();
