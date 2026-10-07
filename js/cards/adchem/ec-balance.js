/* 카드: 잃은 전자와 얻은 전자를 어떻게 맞출까? — 반쪽 반응식에 정수를 곱해 전자 수 맞추기 */
(() => {
  const root = document.getElementById("card-adchem-balance");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), sB = $(".b");
  const BLUE = "#3f6fa3";
  /* 화학종: 전하 q */
  const Q = { "MnO₄⁻": -1, "H⁺": 1, "Mn²⁺": 2, "H₂O": 0, "Fe²⁺": 2, "Fe³⁺": 3, "Cr₂O₇²⁻": -2, "Cr³⁺": 3, "I⁻": -1, "I₂": 0,
    "MnO₂": 0, "OH⁻": -1, "SO₃²⁻": -2, "SO₄²⁻": -2, "Cl₂": 0, "Cl⁻": -1, "ClO₃⁻": -1, "Cu": 0, "Cu²⁺": 2, "NO₃⁻": -1, "NO": 0 };
  /* 반쪽 반응: L, R = [[계수, 화학종]], n = 전자 수, at = [원소, 처음 산화수, 나중 산화수] */
  const RX = {
    mnfe: { med: "산성", ox: { L: [[1, "Fe²⁺"]], R: [[1, "Fe³⁺"]], n: 1, at: ["Fe", 2, 3] },
      red: { L: [[1, "MnO₄⁻"], [8, "H⁺"]], R: [[1, "Mn²⁺"], [4, "H₂O"]], n: 5, at: ["Mn", 7, 2] } },
    cri: { med: "산성", ox: { L: [[2, "I⁻"]], R: [[1, "I₂"]], n: 2, at: ["I", -1, 0] },
      red: { L: [[1, "Cr₂O₇²⁻"], [14, "H⁺"]], R: [[2, "Cr³⁺"], [7, "H₂O"]], n: 6, at: ["Cr", 6, 3] } },
    cuno: { med: "산성", ox: { L: [[1, "Cu"]], R: [[1, "Cu²⁺"]], n: 2, at: ["Cu", 0, 2] },
      red: { L: [[1, "NO₃⁻"], [4, "H⁺"]], R: [[1, "NO"], [2, "H₂O"]], n: 3, at: ["N", 5, 2] } },
    mnso: { med: "염기성", ox: { L: [[1, "SO₃²⁻"], [2, "OH⁻"]], R: [[1, "SO₄²⁻"], [1, "H₂O"]], n: 2, at: ["S", 4, 6] },
      red: { L: [[1, "MnO₄⁻"], [2, "H₂O"]], R: [[1, "MnO₂"], [4, "OH⁻"]], n: 3, at: ["Mn", 7, 4] } },
    cl2: { med: "염기성", ox: { L: [[1, "Cl₂"], [12, "OH⁻"]], R: [[2, "ClO₃⁻"], [6, "H₂O"]], n: 10, at: ["Cl", 0, 5] },
      red: { L: [[1, "Cl₂"]], R: [[2, "Cl⁻"]], n: 2, at: ["Cl", 0, -1] } },
  };
  let r = "mnfe";
  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  const term = (c, s) => (c === 1 ? "" : c) + s;
  const halfStr = (hf, isOx) => {
    const L = hf.L.map(([c, s]) => term(c, s)), R = hf.R.map(([c, s]) => term(c, s));
    if (isOx) R.push(term(hf.n, "e⁻")); else L.push(term(hf.n, "e⁻"));
    return L.join(" + ") + " → " + R.join(" + ");
  };
  function combine(a, b) {
    const { ox, red } = RX[r], net = new Map(), order = [];
    const add = (s, c) => { if (!net.has(s)) { net.set(s, 0); order.push(s); } net.set(s, net.get(s) + c); };
    ox.L.forEach(([c, s]) => add(s, -a * c)); red.L.forEach(([c, s]) => add(s, -b * c));
    ox.R.forEach(([c, s]) => add(s, a * c)); red.R.forEach(([c, s]) => add(s, b * c));
    const e = a * ox.n - b * red.n; /* + 이면 생성물 쪽에 전자가 남음 */
    const L = [], R = []; let qL = 0, qR = 0;
    order.forEach((s) => { const c = net.get(s); if (c < 0) { L.push(term(-c, s)); qL += -c * Q[s]; } else if (c > 0) { R.push(term(c, s)); qR += c * Q[s]; } });
    if (e > 0) R.push(term(e, "e⁻")); if (e < 0) L.push(term(-e, "e⁻"));
    return { str: L.join(" + ") + " → " + R.join(" + "), e, qL, qR };
  }
  const sq = (x) => (x > 0 ? "+" : "") + String(x).replace("-", "−");

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { ox, red } = RX[r], a = +sA.value, b = +sB.value;
    /* 위: 산화수 수직선 −1 ~ +7 */
    const x0 = 40, x1 = w - 30, ay = h * 0.46, X = (v) => x0 + (v + 1) / 8 * (x1 - x0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 - 10, ay); ctx.lineTo(x1 + 10, ay); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    for (let v = -1; v <= 7; v++) { ctx.beginPath(); ctx.moveTo(X(v), ay - 3); ctx.lineTo(X(v), ay + 3); ctx.stroke(); ctx.fillText(sq(v), X(v), ay + 15); }
    ctx.textAlign = "left"; ctx.fillText("산화수", 4, ay - 6);
    const arc = ([el, from, to], y, col, lab) => {
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(X(from), ay, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(from), ay); ctx.lineTo(X(from), y); ctx.lineTo(X(to), y); ctx.lineTo(X(to), ay - 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(to), ay - 2); ctx.lineTo(X(to) - 4.5, ay - 10); ctx.lineTo(X(to) + 4.5, ay - 10); ctx.closePath(); ctx.fill();
      ctx.font = `600 11px ${F.sans}`;
      const mid = (X(from) + X(to)) / 2;
      ctx.textAlign = "center"; ctx.fillText(`${el}: ${sq(from)} → ${sq(to)}  ${lab}`, Math.min(Math.max(mid, x0 + 90), x1 - 90), y - 6);
    };
    arc(ox.at, 30, C.warn, "산화");
    arc(red.at, (30 + ay) / 2 + 6, BLUE, "환원");
    /* 아래: 전자 개수 */
    const eo = a * ox.n, er = b * red.n, mx = Math.max(eo, er, 1);
    const ex0 = 120, ex1 = w - 12, step = Math.min(18, (ex1 - ex0) / mx), rad = Math.max(2.2, Math.min(6, step * 0.36));
    const row = (n, y, col, lab) => {
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(lab, ex0 - 10, y + 4);
      ctx.fillStyle = col;
      for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(ex0 + step * (i + 0.5), y, rad, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(String(n), Math.min(ex0 + step * n + 6, w - 22), y + 4);
    };
    const y1 = h * 0.70, y2 = h * 0.70 + 26;
    row(eo, y1, C.warn, `내놓는 e⁻ (${a}×${ox.n})`);
    row(er, y2, BLUE, `받는 e⁻ (${b}×${red.n})`);
    const ok = eo === er;
    ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = ok ? C.forest : C.warn;
    ctx.fillText(ok ? "전자 수가 같습니다" : (eo > er ? `전자 ${eo - er}개가 갈 곳이 없습니다` : `전자 ${er - eo}개가 모자랍니다`), ex0, h - 10);
  }

  function update() {
    root.querySelectorAll("[data-r]").forEach((q) => q.setAttribute("aria-pressed", String(q.dataset.r === r)));
    const a = +sA.value, b = +sB.value, X = RX[r];
    $(".a-out").textContent = a; $(".b-out").textContent = b;
    $(".half").innerHTML = `<b>산화</b> (${X.med}) ${halfStr(X.ox, true)}  × ${a}<br><b>환원</b> (${X.med}) ${halfStr(X.red, false)}  × ${b}`;
    const k = combine(a, b), net = $(".net");
    net.textContent = k.str; net.classList.toggle("ok", k.e === 0);
    const v = $(".verdict-line");
    if (k.e !== 0) { v.textContent = `전자를 빼고 센 전하: 왼쪽 ${sq(k.qL)}, 오른쪽 ${sq(k.qR)} — 전하가 맞지 않습니다.`; v.style.color = "var(--warn)"; }
    else if (gcd(a, b) > 1) { v.textContent = `전하: 왼쪽 ${sq(k.qL)}, 오른쪽 ${sq(k.qR)}. 맞았지만 모든 계수를 ${gcd(a, b)}로 나눌 수 있습니다.`; v.style.color = "var(--ink-2)"; }
    else { v.textContent = `전하: 왼쪽 ${sq(k.qL)}, 오른쪽 ${sq(k.qR)}. 원자 수와 전하가 모두 맞았습니다.`; v.style.color = "var(--forest)"; }
    draw();
  }
  root.querySelectorAll("[data-r]").forEach((q) => q.addEventListener("click", () => { r = q.dataset.r; sA.value = 1; sB.value = 1; update(); }));
  sA.addEventListener("input", update); sB.addEventListener("input", update);
  if (/demo/.test(location.search)) { sA.value = 5; sB.value = 1; }
  update();
})();
