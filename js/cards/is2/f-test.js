/* 카드: 진단 검사가 양성이면 정말 감염일까? — 1000명 격자로 보는 민감도·특이도·유병률 */
(() => {
  const root = document.getElementById("card-is2-test");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sP = $(".prev"), oP = $(".prev-out"), sSe = $(".sens"), oSe = $(".sens-out"), sSp = $(".spec"), oSp = $(".spec-out");
  const cTwice = $(".twice"), msg = $(".test-msg");
  const [dPos, dPpv, dFn, dNpv] = root.querySelectorAll(".nums dd");

  const PREV = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 30, 50]; // %
  const NPEOPLE = 1000, COLS = 40, ROWS = 25;

  // 비감염자 자리마다 고정된 무작위 순번: 위양성이 격자 곳곳에 흩어지되, 값을 바꿔도 자리가 튀지 않게
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const rv = Array.from({ length: NPEOPLE }, rnd);

  function state() {
    const p = PREV[+sP.value] / 100, se = +sSe.value / 100, sp = +sSp.value / 100, twice = cTwice.checked;
    const pos1 = twice ? se * se : se, fp1 = twice ? (1 - sp) ** 2 : 1 - sp;
    // 반올림 전 비율(정확한 값)
    const tpR = p * pos1, fpR = (1 - p) * fp1, fnR = p * (1 - pos1), tnR = (1 - p) * (1 - fp1);
    // 그림용 사람 수(1000명 기준 반올림)
    const inf = Math.round(NPEOPLE * p), tp = Math.round(inf * pos1), fp = Math.round((NPEOPLE - inf) * fp1);
    return { p, se, sp, twice, inf, tp, fp, fn: inf - tp, ppv: tpR / (tpR + fpR), npv: tnR / (tnR + fnR), posN: NPEOPLE * (tpR + fpR), fnN: NPEOPLE * fnR };
  }

  const { ctx, size } = fit(cv, () => draw());
  const COL = { tp: C.apple, fp: C.amber, fn: C.apple, tn: "#c9cbc2" };

  function draw() {
    const { w, h } = size;
    if (!w) return;
    const s = state();
    ctx.clearRect(0, 0, w, h);
    const barW = Math.max(70, w * 0.17), gx = 4, gy = 20;
    const cell = Math.min((w - barW - 26 - gx) / COLS, (h - gy - 8) / ROWS);
    const r = cell * 0.36;
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(`${NPEOPLE.toLocaleString("ko-KR")}명 · 한 점이 한 사람`, gx, 12);

    // 감염자는 맨 앞 칸부터, 위양성은 비감염자 칸 가운데 순번이 앞선 칸에 흩어서
    const isFP = new Uint8Array(NPEOPLE);
    Array.from({ length: NPEOPLE - s.inf }, (_, k) => s.inf + k).sort((a, b) => rv[a] - rv[b]).slice(0, s.fp).forEach((i) => { isFP[i] = 1; });
    for (let i = 0; i < NPEOPLE; i++) {
      const cx = gx + (i % COLS + .5) * cell, cy = gy + (Math.floor(i / COLS) + .5) * cell;
      let kind;
      if (i < s.inf) kind = i < s.tp ? "tp" : "fn";
      else kind = isFP[i] ? "fp" : "tn";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      if (kind === "fn") { ctx.strokeStyle = COL.fn; ctx.lineWidth = Math.max(1, cell * .12); ctx.stroke(); }
      else { ctx.fillStyle = COL[kind]; ctx.fill(); }
    }

    // 오른쪽: 양성 판정을 받은 사람들만 모은 막대
    const bx = w - barW, by = gy, bh = ROWS * cell, bw = Math.min(40, barW * 0.42);
    const pos = s.tp + s.fp;
    ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(`양성 ${pos}명`, bx, 12);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(bx + .5, by + .5, bw, bh);
    const tx = bx + bw + 6;
    if (pos > 0) {
      const hT = bh * s.tp / pos;
      ctx.fillStyle = COL.tp; ctx.fillRect(bx + 1, by + bh - hT, bw - 1, hT);
      ctx.fillStyle = COL.fp; ctx.fillRect(bx + 1, by + 1, bw - 1, bh - hT - 1);
      ctx.font = `10.5px ${F.mono}`;
      ctx.fillStyle = C.apple; ctx.fillText("감염", tx, by + bh - 18); ctx.fillText(`${s.tp}`, tx, by + bh - 5);
      ctx.fillStyle = "#a8781c"; ctx.fillText("비감염", tx, by + 11); ctx.fillText(`${s.fp}`, tx, by + 24);
    } else {
      ctx.fillStyle = C.ink3; ctx.fillText("없음", tx, by + 11);
    }
  }

  const pct = (x) => (x >= 0.9995 ? "99.9% 이상" : x < 0.0005 ? "0.1% 미만" : `${(x * 100).toFixed(x < 0.1 ? 1 : 0)}%`);
  function update() {
    const s = state();
    oP.textContent = PREV[+sP.value]; oSe.textContent = sSe.value; oSp.textContent = sSp.value;
    dPos.textContent = `${s.posN.toFixed(s.posN < 10 ? 1 : 0)}명`;
    dPpv.textContent = pct(s.ppv);
    dPpv.classList.toggle("bad", s.ppv < 0.5);
    dFn.textContent = `${s.fnN.toFixed(s.fnN < 10 ? 1 : 0)}명`;
    dNpv.textContent = pct(s.npv);
    msg.textContent = s.ppv < 0.5
      ? `양성 판정을 받은 사람 가운데 실제 감염자는 절반이 안 됩니다. 감염자보다 비감염자가 훨씬 많아서, 드물게 나오는 위양성도 모이면 진양성보다 많아집니다.`
      : `양성 판정을 받은 사람 가운데 실제 감염자가 더 많습니다. 유병률이 높거나 특이도가 매우 높을 때 이렇게 됩니다.`;
    draw();
  }
  [sP, sSe, sSp, cTwice].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [p, se, sp] = b.dataset.set.split(",");
    sP.value = PREV.indexOf(+p); sSe.value = se; sSp.value = sp; cTwice.checked = false; update();
  }));
  update();
})();
