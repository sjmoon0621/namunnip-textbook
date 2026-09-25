/* 카드: 유전자, DNA, 염색체는 서로 어떤 관계일까? — 핵형 → 상동 염색체 → 염기 서열로 확대 */
(() => {
  const root = document.getElementById("card-bio-gene-chromo");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const copiesEl = $(".copies");
  const nChr = $(".n-chr"), nBp = $(".n-bp"), nCopy = $(".n-copy"), nAl = $(".n-al"), note = $(".seq-note");

  // 사람 염색체 크기 (GRCh38, 백만 염기쌍)
  const MB = [248.96, 242.19, 198.30, 190.21, 181.54, 170.81, 159.35, 145.14, 138.39, 133.80, 135.09, 133.28,
    114.36, 107.04, 101.99, 90.34, 83.26, 80.37, 58.62, 64.44, 46.71, 50.82];
  const MB_X = 156.04, MB_Y = 57.23;
  const MOM = "#c8554a", DAD = "#3f6f9c";

  const GENE = {
    abo: {
      chr: 9, band: "9q34", cen: 43 / 138.39, locus: 133.26 / 138.39,
      name: "ABO 유전자",
      allele: { m: "A", f: "O" },
      seq: { m: "GACCGTGGTGAC", f: "GACCGT-GTGAC" },
      diff: 6, real: false,
      note: "모식 서열입니다. 실제로 흔한 O 대립유전자는 A 대립유전자에서 염기 G 1개가 빠진 형태입니다. 이 한 개 때문에 뒤쪽 암호가 모두 어긋나 A형 효소가 만들어지지 않습니다.",
    },
    hbb: {
      chr: 11, band: "11p15", cen: 53.4 / 135.09, locus: 5.25 / 135.09,
      name: "HBB 유전자 (헤모글로빈 β 사슬)",
      allele: { m: "정상", f: "낫 모양" },
      seq: { m: "CCTGAGGAGAAG", f: "CCTGTGGAGAAG" },
      diff: 4, real: true,
      note: "HBB 유전자 앞부분의 실제 염기 서열입니다. 낫 모양 적혈구 대립유전자는 여섯 번째 아미노산을 정하는 자리의 A가 T로 바뀌어 있습니다. 염기 하나 차이입니다.",
    },
  };
  let gene = "hbb", rep = false, sel = "m0";

  const PAIR = { A: "T", T: "A", G: "C", C: "G", "-": "-" };
  const BASE = { A: "#d4493a", T: "#e0a02a", G: "#3b7c2a", C: "#2f5f8a", "-": "#bbb" };
  const copies = () => rep ? ["m0", "m1", "f0", "f1"] : ["m0", "f0"];
  const copyName = (k) => `${k[0] === "m" ? "어머니" : "아버지"}에게서 온 것${rep ? ` · 염색 분체 ${+k[1] + 1}` : ""}`;

  const { ctx, size } = fit(cv, () => draw());
  let hits = [];

  function chromatid(x, top, H, cw, cenF, col, locF, on) {
    const cen = top + cenF * H, bot = top + H;
    ctx.beginPath();
    ctx.moveTo(x - cw / 2, top + cw / 2); ctx.arc(x, top + cw / 2, cw / 2, Math.PI, 0);
    ctx.lineTo(x + cw / 2, cen - 5); ctx.quadraticCurveTo(x + cw * .15, cen, x + cw / 2, cen + 5);
    ctx.lineTo(x + cw / 2, bot - cw / 2); ctx.arc(x, bot - cw / 2, cw / 2, 0, Math.PI);
    ctx.lineTo(x - cw / 2, cen + 5); ctx.quadraticCurveTo(x - cw * .15, cen, x - cw / 2, cen - 5);
    ctx.closePath();
    ctx.fillStyle = col; ctx.globalAlpha = .8; ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = on ? 2.6 : 1; ctx.strokeStyle = on ? C.ink : "rgba(0,0,0,.25)"; ctx.stroke();
    const ly = top + locF * H;
    ctx.fillStyle = C.amber; ctx.fillRect(x - cw / 2 + 1, ly - 3, cw - 2, 6);
    return ly;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const G = GENE[gene];
    const small = w < 520;

    // ── 위: 핵형 (23쌍)
    const kh = h * .16, kx0 = 4, gw = (w - 8) / 23;
    for (let i = 0; i < 23; i++) {
      const pair = i < 22 ? [MB[i], MB[i]] : [MB_X, MB_Y];
      const on = i + 1 === G.chr;
      const cx = kx0 + gw * (i + .5);
      if (on) { ctx.fillStyle = "rgba(224,160,42,.18)"; ctx.fillRect(cx - gw / 2, 0, gw, kh + 4); }
      pair.forEach((mb, j) => {
        const bh = (kh - 16) * mb / 250, bx = cx + (j ? 1 : -1) * Math.max(1.6, gw * .14);
        ctx.fillStyle = j ? DAD : MOM; ctx.globalAlpha = on ? 1 : .45;
        ctx.fillRect(bx - Math.max(1, gw * .1), kh - 12 - bh, Math.max(2, gw * .2), bh);
      });
      ctx.globalAlpha = 1;
      if (!small || i % 2 === 0 || i === 22 || on) {
        ctx.font = `${small ? 8.5 : 10}px ${F.mono}`; ctx.fillStyle = on ? C.ink : C.ink3; ctx.textAlign = "center";
        ctx.fillText(i < 22 ? String(i + 1) : "XY", cx, kh);
      }
    }
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;

    // ── 아래 왼쪽: 상동 염색체 확대
    const by0 = kh + 22, bh = h - by0 - 8;
    const zx0 = 4, zw = w * .46;
    const H = bh * .86, top = by0 + bh * .1, cw = Math.min(zw * .1, 22);
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink;
    ctx.fillText(`${G.chr}번 상동 염색체`, zx0, by0 + 2);
    const pos = rep
      ? { m0: .36, m1: .36, f0: .74, f1: .74 }
      : { m0: .38, f0: .76 };
    hits = [];
    let selLy = 0, selX = 0;
    for (const k of copies()) {
      let x = zx0 + zw * pos[k];
      if (rep) x += (k[1] === "0" ? -1 : 1) * (cw / 2 + .5);
      const on = k === sel;
      const ly = chromatid(x, top, H, cw, G.cen, k[0] === "m" ? MOM : DAD, G.locus, on);
      hits.push({ k, x0: x - cw / 2 - 4, x1: x + cw / 2 + 4, y0: top, y1: top + H });
      if (on) { selLy = ly; selX = x; }
    }
    // 대립유전자 이름표
    ctx.font = `500 11px ${F.mono}`; ctx.textAlign = "left";
    for (const p of ["m", "f"]) {
      const x = zx0 + zw * pos[p + "0"] + (rep ? cw + 6 : cw / 2 + 6);
      const ly = top + G.locus * H;
      ctx.fillStyle = p === "m" ? MOM : DAD;
      ctx.fillText(G.allele[p], x, ly + 4);
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`;
      ctx.fillText(p === "m" ? "어머니에게서" : "아버지에게서", zx0 + zw * pos[p + "0"] - (rep ? cw * 1.5 : cw), top + H + 12);
      ctx.font = `500 11px ${F.mono}`;
    }
    ctx.fillStyle = "#a8781c"; ctx.font = `10px ${F.mono}`;
    ctx.fillText(G.band, zx0, top + G.locus * H + 4);

    // ── 아래 오른쪽: 염기 서열
    const dx0 = w * .5, dw = w - dx0 - 6;
    const seq = G.seq[sel[0]];
    const n = seq.length, cell = Math.min(dw / n, 30);
    const sx = dx0 + (dw - cell * n) / 2, sy = by0 + bh * .42;
    // 확대선
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(selX + cw / 2, selLy - 3); ctx.lineTo(sx, sy - cell * 1.1);
    ctx.moveTo(selX + cw / 2, selLy + 3); ctx.lineTo(sx, sy + cell * 1.1); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(small ? "선택한 사본의 DNA" : `선택한 사본의 DNA · ${G.name}`, dx0, by0 + 2);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(G.real ? "실제 서열 (일부)" : "모식 서열", dx0, by0 + 18);
    for (let i = 0; i < n; i++) {
      const b = seq[i], x = sx + i * cell;
      const diffHere = i === G.diff;
      if (diffHere) { ctx.fillStyle = "rgba(181,83,47,.14)"; ctx.fillRect(x, sy - cell * 1.15, cell, cell * 2.3); }
      ctx.fillStyle = BASE[b]; ctx.fillRect(x + 1, sy - cell * .55, cell - 2, cell * .5);
      ctx.fillStyle = BASE[PAIR[b]]; ctx.fillRect(x + 1, sy + cell * .05, cell - 2, cell * .5);
      ctx.font = `500 ${Math.min(13, cell * .62)}px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillStyle = diffHere ? C.warn : C.ink;
      ctx.fillText(b, x + cell / 2, sy - cell * .7);
      ctx.fillStyle = C.ink2; ctx.fillText(PAIR[b], x + cell / 2, sy + cell * 1.05);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx, sy - cell * .55); ctx.lineTo(sx + cell * n, sy - cell * .55);
    ctx.moveTo(sx, sy + cell * .55); ctx.lineTo(sx + cell * n, sy + cell * .55); ctx.stroke();
    // 비교: 같은 자리의 다른 대립유전자
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    const other = sel[0] === "m" ? "f" : "m";
    const oy = sy + cell * 2.2;
    ctx.fillText(`같은 자리, ${other === "m" ? "어머니" : "아버지"} 쪽:`, sx, oy);
    const os = G.seq[other], oc = Math.min(cell, 18), ox = sx, oyy = oy + 8;
    for (let i = 0; i < n; i++) {
      const same = os[i] === seq[i];
      ctx.fillStyle = same ? C.ink3 : C.warn;
      ctx.font = `${same ? 400 : 700} ${Math.min(12, oc * .7)}px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(os[i], ox + i * cell + cell / 2, oyy + oc * .7);
    }
    ctx.textAlign = "left";
  }

  function chips() {
    copiesEl.innerHTML = "";
    for (const k of copies()) {
      const b = document.createElement("button");
      b.className = "chip"; b.type = "button"; b.textContent = copyName(k);
      b.setAttribute("aria-pressed", k === sel ? "true" : "false");
      b.addEventListener("click", () => { sel = k; update(); });
      copiesEl.appendChild(b);
    }
  }

  function update() {
    const G = GENE[gene];
    if (!copies().includes(sel)) sel = sel[0] + "0";
    chips();
    const mb = MB[G.chr - 1];
    nChr.textContent = `${G.chr}번`;
    nBp.textContent = `${(mb / 100).toFixed(2)}억`;
    nCopy.textContent = `${copies().length}개`;
    nAl.textContent = G.allele[sel[0]];
    note.textContent = G.note;
    root.querySelectorAll("[data-gene]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.gene === gene ? "true" : "false"));
    root.querySelectorAll("[data-rep]").forEach((b) => b.setAttribute("aria-pressed", (b.dataset.rep === "1") === rep ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-gene]").forEach((b) => b.addEventListener("click", () => { gene = b.dataset.gene; update(); }));
  root.querySelectorAll("[data-rep]").forEach((b) => b.addEventListener("click", () => { rep = b.dataset.rep === "1"; update(); }));
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = hits.find((q) => x >= q.x0 && x <= q.x1 && y >= q.y0 && y <= q.y1);
    if (hit) { sel = hit.k; update(); }
  });
  update();
})();
