/* 카드: 반응물 하나가 먼저 바닥나면, 생성물은 얼마나 생길까? — 한정 반응물 */
(() => {
  const root = document.getElementById("card-chem-limit");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sA = $(".na"), sB = $(".nb"), oA = $(".na-out"), oB = $(".nb-out"), lA = $(".la"), lB = $(".lb");
  const dLim = $(".v-lim"), dP = $(".v-p"), dLeft = $(".v-left"), msg = $(".lim-msg");

  const AT = { H: { r: .5, c: "#f4f4f0" }, O: { r: .74, c: C.apple }, N: { r: .76, c: "#3f6fb5" } };
  const MOL = {
    H2: { f: "H₂", a: [["H", -.45, 0], ["H", .45, 0]] },
    O2: { f: "O₂", a: [["O", -.62, 0], ["O", .62, 0]] },
    N2: { f: "N₂", a: [["N", -.62, 0], ["N", .62, 0]] },
    H2O: { f: "H₂O", a: [["H", -.72, .5], ["H", .72, .5], ["O", 0, 0]] },
    NH3: { f: "NH₃", a: [["H", 0, -.86], ["H", -.8, .46], ["H", .8, .46], ["N", 0, 0]] },
  };
  const RX = {
    water: { A: "H2", B: "O2", P: "H2O", a: 2, b: 1, p: 2, eq: "2H₂ + O₂ → 2H₂O" },
    ammonia: { A: "N2", B: "H2", P: "NH3", a: 1, b: 3, p: 2, eq: "N₂ + 3H₂ → 2NH₃" },
  };
  let rx = "water";

  const result = (A, B) => {
    const r = RX[rx], x = Math.min(Math.floor(A / r.a), Math.floor(B / r.b)); // 반응이 일어난 횟수
    return { x, P: x * r.p, lA: A - x * r.a, lB: B - x * r.b };
  };

  const { ctx, size } = fit(cv, () => draw());
  function mol(k, x, y, u, ghost) {
    for (const [e, ax, ay] of MOL[k].a) {
      ctx.beginPath(); ctx.arc(x + ax * u, y + ay * u, AT[e].r * u, 0, Math.PI * 2);
      ctx.fillStyle = AT[e].c; ctx.fill();
      ctx.strokeStyle = e === "H" ? C.ink3 : "rgba(0,0,0,.25)"; ctx.lineWidth = .8; ctx.stroke();
    }
    if (ghost) { ctx.beginPath(); ctx.arc(x, y, 1.45 * u, 0, Math.PI * 2); ctx.strokeStyle = C.warn; ctx.setLineDash([2, 2]); ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]); }
  }
  function box(x, y, bw, bh, title, items, u) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, bw, bh);
    ctx.fillStyle = C.ink3; ctx.font = `${bw < 160 ? 10 : 11}px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(title, x, y - 6);
    const cols = Math.max(1, Math.floor(bw / (u * 2.9))), cw = bw / cols, rh = u * 2.6;
    items.forEach(([k, g], i) => mol(k, x + (i % cols + .5) * cw, y + u * 1.6 + Math.floor(i / cols) * rh, u, g));
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = RX[rx], A = +sA.value, B = +sB.value, res = result(A, B), small = w < 520;
    // ── 왼쪽: 반응 전 / 반응 후
    const lw = w * 0.55, bw = (lw - 30) / 2, by = 22, bh = h - by - 10;
    const nMax = Math.max(A + B, 1);
    let u = 16;
    while (u > 4) { const cols = Math.max(1, Math.floor(bw / (u * 2.9))); if (Math.ceil(nMax / cols) * u * 2.6 + u <= bh) break; u -= 0.5; }
    const before = [...Array(A)].map(() => [r.A]).concat([...Array(B)].map(() => [r.B]));
    const after = [...Array(res.P)].map(() => [r.P]).concat([...Array(res.lA)].map(() => [r.A, 1]), [...Array(res.lB)].map(() => [r.B, 1]));
    box(8, by, bw, bh, "반응 전", before, u);
    ctx.fillStyle = C.ink; ctx.font = `${small ? 15 : 20}px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("→", 8 + bw + 11, by + bh / 2);
    box(22 + bw, by, bw, bh, "반응 후 (점선: 남은 것)", after, u);

    // ── 오른쪽: B를 고정하고 A만 늘릴 때 생성물 수
    const x0 = lw + (small ? 26 : 36), y0 = 22, pw = w - x0 - 12, ph = h - y0 - 36;
    const top = Math.max(4, Math.ceil(Math.min(12 / r.a, 12 / r.b) * r.p / 4) * 4);
    const X = (a) => x0 + a / 12 * pw, Y = (p) => y0 + (1 - p / top) * ph;
    const yt = []; for (let p = 0; p <= top; p += top / 4) yt.push([p, `${p}`]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[0, "0"], [4, "4"], [8, "8"], [12, "12"]], yt, xlabel: `${MOL[r.A].f} 분자 수`, ylabel: `${MOL[r.P].f} 분자 수 (${MOL[r.B].f} ${B}개로 고정)` });
    ctx.beginPath();
    for (let a = 0; a <= 12; a++) { const p = result(a, B).P; a ? ctx.lineTo(X(a), Y(p)) : ctx.moveTo(X(a), Y(p)); }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.stroke();
    const kink = B / r.b * r.a;
    if (kink <= 12) {
      ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(kink), y0); ctx.lineTo(X(kink), y0 + ph); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`; ctx.textAlign = kink > 8 ? "right" : "left";
      ctx.fillText(`${MOL[r.B].f}가 바닥남`, X(kink) + (kink > 8 ? -4 : 4), y0 + 14);
    }
    ctx.beginPath(); ctx.arc(X(A), Y(res.P), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }

  function update() {
    const r = RX[rx], A = +sA.value, B = +sB.value, res = result(A, B);
    oA.textContent = A; oB.textContent = B;
    lA.textContent = MOL[r.A].f; lB.textContent = MOL[r.B].f;
    const fa = MOL[r.A].f, fb = MOL[r.B].f;
    const limA = A / r.a < B / r.b, limB = B / r.b < A / r.a;
    dLim.textContent = A === 0 && B === 0 ? "—" : limA ? fa : limB ? fb : "둘 다 딱 맞음";
    dP.textContent = `${MOL[r.P].f} ${res.P}개`;
    dLeft.textContent = res.lA ? `${fa} ${res.lA}개` : res.lB ? `${fb} ${res.lB}개` : "없음";
    msg.textContent = `${r.eq}: ${fa} ${r.a}개와 ${fb} ${r.b}개가 한 번 반응할 때마다 ${MOL[r.P].f} ${r.p}개가 생깁니다. ` +
      (res.lA || res.lB ? `남은 ${res.lA ? fa : fb}는 짝이 없어 반응하지 못한 것입니다.` : "");
    draw();
  }
  root.querySelectorAll("[data-rx]").forEach((b) => b.addEventListener("click", () => {
    rx = b.dataset.rx;
    root.querySelectorAll("[data-rx]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  [sA, sB].forEach((el) => el.addEventListener("input", update));
  update();
})();
