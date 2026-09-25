/* 카드: 2 m나 되는 DNA가 어떻게 핵 속에 들어갈까? — 응축 단계별 굵기와 길이 */
(() => {
  const root = document.getElementById("card-bio-dna-pack");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sL = $(".lv"), oL = $(".lv-out");
  const nW = $(".n-w"), nK = $(".n-k"), nLen = $(".n-len"), nAll = $(".n-all"), msg = $(".pack-msg");

  // 염색체 크기: GRCh38 기준 염기쌍 수
  const CHR = {
    1: { name: "1번 염색체", short: "1번", bp: 248.96e6 },
    11: { name: "11번 염색체", short: "11번", bp: 135.09e6 },
    21: { name: "21번 염색체", short: "21번", bp: 46.71e6 },
    X: { name: "X 염색체", short: "X", bp: 156.04e6 },
    Y: { name: "Y 염색체", short: "Y", bp: 57.23e6 },
  };
  const ALL_BP = 6.06e9; // 46개 모두 (여성 기준)
  const RISE = 0.34e-9;  // 염기쌍 하나당 길이 (m)
  const NUC = 6e-6;      // 핵 지름 (대표값)

  // 굵기(nm)와 압축 배율(대략)
  const LV = [
    { name: "DNA 이중 나선", w: 2, k: 1, kTxt: "1배", bar: [2, "2 nm"] },
    { name: "뉴클레오솜이 이어진 염색사", w: 11, k: 6, kTxt: "약 6배", bar: [10, "10 nm"] },
    { name: "더 감긴 염색사 (30 nm 섬유)", w: 30, k: 40, kTxt: "약 40배", bar: [30, "30 nm"] },
    { name: "고리 모양으로 접힌 염색사", w: 300, k: 1000, kTxt: "약 1,000배", bar: [200, "200 nm"] },
    { name: "응축된 염색체 (분열기)", w: 1400, k: 10000, kTxt: "약 10,000배", bar: [1000, "1 μm"] },
  ];
  let chr = "1";

  const fmtLen = (m) => {
    if (m >= 1) return `${m.toFixed(2)} m`;
    if (m >= 0.01) return `${(m * 100).toFixed(1)} cm`;
    if (m >= 1e-3) return `${(m * 1000).toFixed(1)} mm`;
    if (m >= 1e-6) return `${(m * 1e6).toFixed(m >= 1e-5 ? 0 : 1)} μm`;
    return `${(m * 1e9).toFixed(0)} nm`;
  };
  const fmtW = (nm) => nm >= 1000 ? `${(nm / 1000).toFixed(1)} μm` : `${nm} nm`;

  const { ctx, size } = fit(cv, () => draw());
  const BASE = { A: "#d4493a", T: "#e0a02a", G: "#3b7c2a", C: "#2f5f8a" };
  const PAIR = { A: "T", T: "A", G: "C", C: "G" };
  const SEQ = "ATGCGTACCGATTGCAGGCTAACGTTAGCCATGCATCGGATCCTAGGCTTAACG";

  function scaleBar(x, y, px, label) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + px, y);
    ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.moveTo(x + px, y - 4); ctx.lineTo(x + px, y + 4); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(label, x + px + 7, y + 4);
  }

  function nucleosome(x, y, r, tilt = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    ctx.fillStyle = "#efd9a8"; ctx.strokeStyle = "#c9a45c"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * .82, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.lineWidth = Math.max(1.2, r * .22);
    for (const dy of [-r * .32, r * .32]) {
      ctx.beginPath(); ctx.ellipse(0, dy, r * 1.04, r * .38, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawLevel(i, x0, y0, pw, ph) {
    const cx = x0 + pw / 2, cy = y0 + ph / 2;
    if (i === 0) {
      const A = Math.min(ph * .2, pw * .07), P = 3.4 * A, ph0 = 2.4;
      const x1 = x0 + 6, x2 = x0 + pw - 6;
      let k = 0;
      for (let x = x1; x <= x2; x += 0.34 * A, k++) {
        const t = 2 * Math.PI * (x - x1) / P;
        const ya = cy + A * Math.sin(t), yb = cy + A * Math.sin(t + ph0);
        const b = SEQ[k % SEQ.length], m = (ya + yb) / 2;
        ctx.globalAlpha = .35 + .65 * Math.abs(Math.cos(t + ph0 / 2));
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = BASE[b]; ctx.beginPath(); ctx.moveTo(x, ya); ctx.lineTo(x, m); ctx.stroke();
        ctx.strokeStyle = BASE[PAIR[b]]; ctx.beginPath(); ctx.moveTo(x, m); ctx.lineTo(x, yb); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const [off, col] of [[0, C.ink], [ph0, C.ink2]]) {
        ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.beginPath();
        for (let x = x1; x <= x2; x += 1) { const y = cy + A * Math.sin(2 * Math.PI * (x - x1) / P + off); x === x1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      ctx.fillText("한 바퀴 ≈ 3.4 nm (약 10염기쌍)", x1, cy - A - 12);
      const leg = [["A", "A"], ["T", "T"], ["G", "G"], ["C", "C"]];
      let lx = x1;
      for (const [b] of leg) { ctx.fillStyle = BASE[b]; ctx.fillRect(lx, cy + A + 16, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText(b, lx + 13, cy + A + 25); lx += 30; }
      scaleBar(x1, y0 + ph - 8, 2 * A, "2 nm");
    } else if (i === 1) {
      const r = Math.min(ph * .11, pw * .055), nmpx = r / 5.5;
      const gap = r * 3.6;
      const n = Math.floor((pw - 20) / gap);
      const pts = [];
      for (let j = 0; j < n; j++) pts.push([x0 + 16 + r + j * gap, cy + Math.sin(j * 1.3) * r * 1.1]);
      ctx.strokeStyle = C.forest; ctx.lineWidth = Math.max(1.2, r * .22);
      ctx.beginPath(); ctx.moveTo(x0 + 4, cy);
      pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(x0 + pw - 4, cy); ctx.stroke();
      pts.forEach(([x, y], j) => nucleosome(x, y, r, Math.sin(j * 2.1) * .3));
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      ctx.fillText("히스톤 단백질 8개를 DNA 약 147염기쌍이 감음", x0 + 6, y0 + 14);
      ctx.fillText("↑ 뉴클레오솜 (지름 약 11 nm)", pts[1][0] - r, pts[1][1] + r * 1.9);
      scaleBar(x0 + 6, y0 + ph - 8, 10 * nmpx, "10 nm");
    } else if (i === 2) {
      const tube = Math.min(ph * .42, pw * .2), nmpx = tube / 30, r = 5.5 * nmpx * 1.05;
      const x1 = x0 + 10, x2 = x0 + pw - 10;
      ctx.fillStyle = "rgba(116,171,102,.08)"; ctx.fillRect(x1, cy - tube / 2, x2 - x1, tube);
      const step = r * 1.15;
      for (let x = x1 + r, j = 0; x < x2 - r; x += step, j++) {
        const back = j % 2 === 0;
        const y = cy + (back ? -1 : 1) * (tube / 2 - r) * Math.cos(j * .55);
        ctx.globalAlpha = back ? .55 : 1;
        nucleosome(x, y, r, back ? .5 : -.5);
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.strokeRect(x1, cy - tube / 2, x2 - x1, tube); ctx.setLineDash([]);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      ctx.fillText("뉴클레오솜이 지그재그로 쌓인 굵기 약 30 nm의 섬유", x0 + 6, y0 + 14);
      scaleBar(x0 + 6, y0 + ph - 8, 30 * nmpx, "30 nm");
    } else if (i === 3) {
      const len = pw - 40, nmpx = Math.min(ph * .42, 180) / 300;
      const ax1 = x0 + 20, ax2 = ax1 + len;
      ctx.strokeStyle = "#c9a45c"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(ax1, cy); ctx.lineTo(ax2, cy); ctx.stroke();
      ctx.strokeStyle = C.forest; ctx.lineWidth = Math.max(1.5, 30 * nmpx);
      const lw = 10 + 30 * nmpx * 1.4;
      let j = 0;
      for (let x = ax1 + 6; x < ax2 - lw; x += lw * .55, j++) {
        const up = j % 2 ? -1 : 1, H = (140 * nmpx) * (0.8 + 0.4 * Math.abs(Math.sin(j * 1.7)));
        ctx.beginPath(); ctx.moveTo(x, cy);
        ctx.bezierCurveTo(x - lw * .4, cy + up * H, x + lw * 1.4, cy + up * H, x + lw, cy);
        ctx.stroke();
      }
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      ctx.fillText("염색사가 단백질 뼈대(노란 선)에 고리로 붙어 접힘", x0 + 6, y0 + 14);
      scaleBar(x0 + 6, y0 + ph - 8, 200 * nmpx, "200 nm");
    } else {
      const H = ph * .78, nmpx = H / 8500, cw = 700 * nmpx;
      const cyc = cy + 6, cen = cyc - H * .12;
      const chromatid = (x) => {
        ctx.fillStyle = "#6f9f60"; ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2;
        const top = cyc - H / 2, bot = cyc + H / 2;
        ctx.beginPath();
        ctx.moveTo(x - cw / 2, top + cw / 2);
        ctx.arc(x, top + cw / 2, cw / 2, Math.PI, 0);
        ctx.lineTo(x + cw / 2, cen - 4); ctx.quadraticCurveTo(x + cw * .3, cen, x + cw / 2, cen + 4);
        ctx.lineTo(x + cw / 2, bot - cw / 2);
        ctx.arc(x, bot - cw / 2, cw / 2, 0, Math.PI);
        ctx.lineTo(x - cw / 2, cen + 4); ctx.quadraticCurveTo(x - cw * .3, cen, x - cw / 2, cen - 4);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(28,30,27,.28)";
        [0.12, 0.2, 0.31, 0.47, 0.58, 0.66, 0.78, 0.88].forEach((f, k) => {
          const y = top + f * H; if (Math.abs(y - cen) < 8) return;
          ctx.fillRect(x - cw / 2 + 1, y, cw - 2, (k % 3 + 1) * H * .012);
        });
      };
      const mx = x0 + pw * .42;
      chromatid(mx - cw / 2 - 1); chromatid(mx + cw / 2 + 1);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(mx, cen, 3, 0, Math.PI * 2); ctx.fill();
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      const lx = mx + cw + 14;
      ctx.fillText("← 동원체", lx, cen + 4);
      ctx.fillText("염색 분체 2개", lx, cyc + H * .3);
      ctx.fillText("(복제된 DNA)", lx, cyc + H * .3 + 14);
      ctx.fillText("복제 후 응축한 염색체 1개", x0 + 6, y0 + 14);
      scaleBar(x0 + 6, y0 + ph - 8, 1000 * nmpx, "1 μm");
    }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    const i = +sL.value, L = LV[i];
    ctx.clearRect(0, 0, w, h);
    const split = Math.round(w * .6);
    ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`${i + 1}단계 · ${L.name}`, 4, 16);
    drawLevel(i, 4, 26, split - 18, h - 30);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(split + .5, 6); ctx.lineTo(split + .5, h - 6); ctx.stroke();

    // 오른쪽: 길이 비교 (로그 눈금)
    const x0 = split + 46, y0 = 30, pw = w - x0 - 8, ph = h - y0 - 30;
    const lo = -7, hi = 1; // 10^-7 m ~ 10 m
    const Y = (m) => y0 + (1 - (Math.log10(m) - lo) / (hi - lo)) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X: () => 0, Y: (v) => Y(v),
      yt: [[1e-6, "1μm"], [1e-4, "0.1mm"], [1e-2, "1cm"], [1, "1m"]], ylabel: "길이 (로그 눈금)" });
    const lenC = CHR[chr].bp * RISE / L.k, lenA = ALL_BP * RISE / L.k;
    const yN = Y(NUC);
    ctx.fillStyle = "rgba(224,160,42,.14)"; ctx.fillRect(x0, yN, pw, y0 + ph - yN);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(x0, yN); ctx.lineTo(x0 + pw, yN); ctx.stroke(); ctx.setLineDash([]);
    const bw = Math.min(26, pw * .22);
    const bars = [[lenC, CHR[chr].short, C.forest, x0 + pw * .28], [lenA, "46개", C.ink, x0 + pw * .72]];
    for (const [v, lab, col, bx] of bars) {
      const yv = Y(v);
      ctx.fillStyle = col; ctx.globalAlpha = .85;
      ctx.fillRect(bx - bw / 2, yv, bw, y0 + ph - yv); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.textAlign = "center"; ctx.font = `500 11px ${F.mono}`;
      ctx.fillText(fmtLen(v), bx, Math.max(yv - 5, y0 - 4));
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`;
      ctx.fillText(lab, bx, y0 + ph + 16);
    }
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    const tw = ctx.measureText("핵 지름 6 μm").width;
    ctx.fillStyle = "rgba(251,251,248,.9)"; ctx.fillRect(x0 + 1, yN - 15, tw + 6, 13);
    ctx.fillStyle = "#a8781c"; ctx.fillText("핵 지름 6 μm", x0 + 4, yN - 5);
  }

  function update() {
    const i = +sL.value, L = LV[i];
    oL.textContent = `${i + 1}단계`;
    nW.textContent = fmtW(L.w);
    nK.textContent = L.kTxt;
    const lenC = CHR[chr].bp * RISE / L.k, lenA = ALL_BP * RISE / L.k;
    nLen.textContent = fmtLen(lenC);
    nAll.textContent = fmtLen(lenA);
    const r = lenC / NUC;
    msg.textContent = r > 2
      ? `${CHR[chr].name}의 길이가 핵 지름의 약 ${r >= 100 ? Math.round(r).toLocaleString() : r.toFixed(0)}배입니다.`
      : `${CHR[chr].name}가 핵 지름과 비슷한 크기가 되었습니다. 이 정도면 세포 안에서 옮기고 나눌 수 있습니다.`;
    draw();
  }
  sL.addEventListener("input", update);
  root.querySelectorAll("[data-chr]").forEach((b) => b.addEventListener("click", () => {
    chr = b.dataset.chr;
    root.querySelectorAll("[data-chr]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  update();
})();
