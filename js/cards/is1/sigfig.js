/* 카드 1.3.2: 계산기에 나온 숫자를 다 적어도 될까? — 눈금 읽기와 곱셈의 유효숫자 */
(() => {
  const root = document.getElementById("card-is1-sigfig");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), ia = $(".ia"), ib = $(".ib");
  const dRaw = $(".raw"), dSf = $(".sf"), dRep = $(".rep");

  const A = 8.560, B = 5.398; // cm, 표준 카드(ID-1) 85.60 mm × 53.98 mm
  const TOOL = { 1: "1 cm 눈금 자", 2: "1 mm 눈금 자", 3: "디지털 캘리퍼스" };

  function calc() {
    const da = +ia.value, db = +ib.value;
    const ra = +A.toFixed(da), rb = +B.toFixed(db), ua = 10 ** -da, ub = 10 ** -db;
    const raw = parseFloat((ra * rb).toFixed(8)).toString();
    const sf = Math.min(da, db) + 1; // 정수 부분이 한 자리이므로 유효숫자 = 소수 자릿수 + 1
    return { da, db, ra, rb, sa: A.toFixed(da), sb: B.toFixed(db), raw, sf, rep: (ra * rb).toPrecision(sf),
      lo: (ra - ua) * (rb - ub), hi: (ra + ua) * (rb + ub) };
  }

  const { ctx, size } = fit(cv, () => draw());

  function update() {
    const r = calc();
    dRaw.textContent = r.raw; dSf.textContent = `${r.sf}개`; dRep.textContent = r.rep;
    draw();
  }

  // 확대한 눈금 띠: 물체 끝(edge, mm) 근처 10 mm
  function strip(y, hh, edgeMm, dec, label, reading) {
    const { w } = size;
    const x0 = 12, x1 = w - 12, m0 = Math.floor(edgeMm) - 5, m1 = m0 + 10;
    const X = (mm) => x0 + (mm - m0) / (m1 - m0) * (x1 - x0);
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(label, x0, y - 6);
    ctx.font = `500 12.5px ${F.mono}`; ctx.fillStyle = C.forest; ctx.textAlign = "right";
    ctx.fillText(`읽은 값 ${reading} cm`, x1, y - 6);
    // 물체
    ctx.fillStyle = "#cfe0f0"; ctx.fillRect(x0, y, X(edgeMm) - x0, hh * 0.45);
    ctx.strokeStyle = "#2f5f8a"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(X(edgeMm), y); ctx.lineTo(X(edgeMm), y + hh * 0.45); ctx.stroke();
    // 자
    const ry = y + hh * 0.45;
    ctx.fillStyle = dec === 3 ? "#e6e7e2" : "#f1e3b6"; ctx.fillRect(x0, ry, x1 - x0, hh * 0.55);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    if (dec === 3) {
      // 캘리퍼스: 디지털 표시
      ctx.fillStyle = "#26302a"; const bw = 118, bx = (x0 + x1) / 2 - bw / 2;
      ctx.fillRect(bx, ry + 4, bw, hh * 0.55 - 8);
      ctx.fillStyle = "#b8e0a8"; ctx.font = `500 15px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(`${edgeMm.toFixed(2)} mm`, bx + bw / 2, ry + hh * 0.55 / 2 + 5);
    } else {
      ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink;
      for (let mm = m0; mm <= m1; mm++) {
        const major = mm % 10 === 0, mid = mm % 5 === 0;
        if (dec === 1 && !major) continue;
        const L = major ? hh * 0.3 : mid ? hh * 0.2 : hh * 0.12;
        const x = Math.round(X(mm)) + .5;
        ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x, ry + L); ctx.stroke();
        if (major) ctx.fillText(`${mm / 10}`, x, ry + L + 11);
      }
      // 어림: 끝이 눈금 사이 어디쯤인지
      const step = dec === 1 ? 10 : 1, lo = Math.floor(edgeMm / step) * step;
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(X(lo), ry + hh * 0.5); ctx.lineTo(X(lo + step), ry + hh * 0.5); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
      if (dec === 2) ctx.fillText("이 사이를 눈으로 10등분", Math.min(X(lo + step) + 4, x1 - 110), ry + hh * 0.5 + 3);
    }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = calc();
    const sh = Math.min(64, h * 0.2);
    strip(22, sh, A * 10, r.da, `가로 · ${TOOL[r.da]}`, r.sa);
    strip(22 + sh + 30, sh, B * 10, r.db, `세로 · ${TOOL[r.db]}`, r.sb);

    // 계산기 표시와 자리 색
    const cy = 22 + 2 * sh + 58;
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`넓이 = ${r.sa} × ${r.sb}`, 12, cy);
    ctx.font = `500 ${w < 420 ? 19 : 22}px ${F.mono}`;
    let x = 12, seen = 0;
    for (const ch of r.raw) {
      let col = C.ink;
      if (/\d/.test(ch)) { seen++; col = seen < r.sf ? C.ink : seen === r.sf ? C.amber : "#b9b9bb"; }
      const cw = ctx.measureText(ch).width;
      ctx.fillStyle = col; ctx.fillText(ch, x, cy + 28);
      if (/\d/.test(ch) && seen > r.sf) { ctx.strokeStyle = "#b9b9bb"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, cy + 21); ctx.lineTo(x + cw, cy + 21); ctx.stroke(); }
      x += cw;
    }
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    const kx = Math.max(x + 14, w * 0.45);
    ctx.fillText("검정: 확실함", kx, cy + 12);
    ctx.fillStyle = C.amber; ctx.fillText("주황: 어림한 자리", kx, cy + 26);
    ctx.fillStyle = "#9d9da0"; ctx.fillText("회색: 의미 없음", kx, cy + 40);

    // 범위 수직선
    const ly = cy + 72, x0 = 16, x1 = w - 16;
    const span = r.hi - r.lo, a = r.lo - span * 0.35, b = r.hi + span * 0.35;
    const X = (v) => x0 + (v - a) / (b - a) * (x1 - x0);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, ly); ctx.lineTo(x1, ly); ctx.stroke();
    const p = 10 ** Math.floor(Math.log10(span / 2)), st = [1, 2, 5, 10].map((k) => k * p).find((k) => (b - a) / k <= 7);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    const dp = Math.max(0, -Math.floor(Math.log10(st) + 1e-9));
    for (let v = Math.ceil(a / st) * st; v <= b; v += st) {
      ctx.beginPath(); ctx.moveTo(X(v), ly - 3); ctx.lineTo(X(v), ly + 3); ctx.stroke();
      ctx.fillText(v.toFixed(dp), X(v), ly + 15);
    }
    ctx.fillStyle = "rgba(224,160,42,.35)"; ctx.fillRect(X(r.lo), ly - 9, X(r.hi) - X(r.lo), 18);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(+r.raw), ly, 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`넓이가 될 수 있는 범위: ${r.lo.toFixed(r.sf)} ~ ${r.hi.toFixed(r.sf)} cm²`, x0, ly - 16);
  }

  [ia, ib].forEach((el) => el.addEventListener("input", update));
  update();
})();
