/* 카드 1.2.2: 단위만 보고 공식을 맞힐 수 있을까? — 차원 분석과 그래프 검증 */
(() => {
  const root = document.getElementById("card-is1-dimension");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), box = $(".steppers"), guessEl = $(".guess");
  const dBal = $(".bal"), dK = $(".kfit"), dEx = $(".exact");
  const g = 9.81;

  // 차원 벡터 [L, M, T]
  const P = {
    pend: {
      out: { s: "T", name: "주기", unit: "s", d: [0, 0, 1] },
      vars: [
        { s: "L", name: "실 길이", unit: "m", d: [1, 0, 0] },
        { s: "m", name: "추 질량", unit: "kg", d: [0, 1, 0], two: [0.2, 1.0] },
        { s: "g", name: "중력 가속도", unit: "m/s²", d: [1, 0, -2], fixed: g },
      ],
      x: [0.1, 2], xlab: "실 길이 L (m)",
      exact: (x) => 2 * Math.PI * Math.sqrt(x / g), exactTxt: "T = 2π √(L/g)", kTrue: 2 * Math.PI, start: [1, 0, 0],
    },
    fall: {
      out: { s: "v", name: "속력", unit: "m/s", d: [1, 0, -1] },
      vars: [
        { s: "h", name: "떨어진 높이", unit: "m", d: [1, 0, 0] },
        { s: "m", name: "물체 질량", unit: "kg", d: [0, 1, 0], two: [0.1, 5] },
        { s: "g", name: "중력 가속도", unit: "m/s²", d: [1, 0, -2], fixed: g },
      ],
      x: [0.5, 20], xlab: "높이 h (m)",
      exact: (x) => Math.sqrt(2 * g * x), exactTxt: "v = √(2gh)", kTrue: Math.SQRT2, start: [1, 0, 1],
    },
    wave: {
      out: { s: "v", name: "물결 속력", unit: "m/s", d: [1, 0, -1] },
      vars: [
        { s: "λ", name: "파장", unit: "m", d: [1, 0, 0] },
        { s: "ρ", name: "액체 밀도", unit: "kg/m³", d: [-3, 1, 0], two: [1000, 13534] },
        { s: "g", name: "중력 가속도", unit: "m/s²", d: [1, 0, -2], fixed: g },
      ],
      x: [1, 100], xlab: "파장 λ (m)",
      exact: (x) => Math.sqrt(g * x / (2 * Math.PI)), exactTxt: "v = √(gλ/2π)", kTrue: 1 / Math.sqrt(2 * Math.PI), start: [0.5, 0.5, 0],
    },
  };
  let key = "pend", ex = [...P.pend.start];

  const SUPS = { "-": "⁻", "1": "¹", "2": "²", "3": "³", "0": "⁰", ".": "·", "/": "ᐟ" };
  const frac = (v) => v === 0 ? "0" : Number.isInteger(v) ? String(v) : `${v < 0 ? "−" : ""}${Math.abs(v * 2)}/2`;
  const supf = (v) => v === 1 ? "" : frac(v).replace("−", "-").split("").map((c) => SUPS[c] || c).join("");

  function buildSteppers() {
    box.innerHTML = "";
    P[key].vars.forEach((v, i) => {
      const d = document.createElement("div");
      d.className = "st";
      d.innerHTML = `<b>${v.s}</b><button type="button" aria-label="${v.name} 지수 줄이기">−</button><span></span><button type="button" aria-label="${v.name} 지수 늘리기">+</button><small>${v.s}의 지수 · ${v.name} [${v.unit}]</small>`;
      const [m, p] = d.querySelectorAll("button");
      m.addEventListener("click", () => { ex[i] = Math.max(-2, ex[i] - 0.5); update(); });
      p.addEventListener("click", () => { ex[i] = Math.min(2, ex[i] + 0.5); update(); });
      box.appendChild(d);
    });
  }

  const dimOf = () => [0, 1, 2].map((k) => P[key].vars.reduce((s, v, i) => s + v.d[k] * ex[i], 0));
  const shape = (x, second) => {
    const pr = P[key];
    return pr.vars.reduce((s, v, i) => {
      const val = i === 0 ? x : v.fixed != null ? v.fixed : v.two[second ? 1 : 0];
      return s * Math.pow(val, ex[i]);
    }, 1);
  };
  function fitK() { // 로그 평균으로 k를 맞춘다 (첫 번째 값의 점들로)
    const pr = P[key]; let s = 0, n = 0;
    for (let i = 0; i <= 20; i++) { const x = pr.x[0] + (pr.x[1] - pr.x[0]) * i / 20; s += Math.log(pr.exact(x) / shape(x, false)); n++; }
    return Math.exp(s / n);
  }

  const { ctx, size } = fit(cv, () => draw());

  function update() {
    const pr = P[key];
    box.querySelectorAll("span").forEach((sp, i) => { sp.textContent = frac(ex[i]); });
    const d = dimOf(), ok = d.every((v, k) => Math.abs(v - pr.out.d[k]) < 1e-9);
    guessEl.textContent = `추측: ${pr.out.s} = k · ` + pr.vars.map((v, i) => ex[i] === 0 ? "" : v.s + supf(ex[i])).filter(Boolean).join(" ");
    dBal.textContent = ok ? "모두 맞음" : "안 맞음";
    dBal.className = "bal " + (ok ? "good" : "bad");
    const k = fitK();
    dK.textContent = ok ? k.toFixed(3) : "—";
    dEx.textContent = ok ? `${pr.exactTxt}` : "차원부터 맞추기";
    dEx.style.fontSize = "14px";
    draw();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    const pr = P[key];
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 520;
    const split = Math.round(w * (narrow ? 0.40 : 0.36));
    const d = dimOf();

    // ── 왼쪽: 차원 균형표
    const rows = [["길이 m", 0], ["질량 kg", 1], ["시간 s", 2]];
    const tx = 6, colL = split * (narrow ? 0.55 : 0.52), colR = split * 0.84, top = 34, rh = (h - top - 30) / 3;
    ctx.font = `${narrow ? 10 : 11}px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText(`${pr.out.s}`, colL, 18); ctx.fillText("추측", colR, 18);
    ctx.fillText("좌변", colL, 30); ctx.fillText("우변", colR, 30);
    rows.forEach(([nm, k], i) => {
      const y = top + i * rh + rh / 2;
      const ok = Math.abs(d[k] - pr.out.d[k]) < 1e-9;
      ctx.fillStyle = ok ? "rgba(116,171,102,.14)" : "rgba(181,83,47,.10)";
      ctx.fillRect(2, top + i * rh + 3, split - 12, rh - 6);
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `${narrow ? 11 : 12.5}px ${F.sans}`;
      ctx.fillText(nm, tx, y + 4);
      ctx.textAlign = "center"; ctx.font = `500 ${narrow ? 14 : 17}px ${F.mono}`; ctx.fillStyle = C.ink;
      ctx.fillText(frac(pr.out.d[k]), colL, y + 6);
      ctx.fillStyle = ok ? C.forest : C.warn;
      ctx.fillText(frac(d[k]), colR, y + 6);
    });
    const allOk = d.every((v, k) => Math.abs(v - pr.out.d[k]) < 1e-9);
    ctx.font = `600 ${narrow ? 11 : 12.5}px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = allOk ? C.forest : C.warn;
    ctx.fillText(allOk ? "차원이 모두 맞습니다" : "지수를 맞춰 보세요", tx, h - 10);

    // ── 오른쪽: 그래프
    const x0 = split + 30, y0 = 22, pw = w - x0 - 10, ph = h - y0 - 34;
    const [xa, xb] = pr.x;
    const k = fitK();
    let yMax = pr.exact(xb) * 1.25;
    const X = (x) => x0 + (x - 0) / xb * pw, Y = (v) => y0 + (1 - v / yMax) * ph;
    const nice = (m) => { const s = m / 4, p = 10 ** Math.floor(Math.log10(s)); return [1, 2, 5, 10].map((q) => q * p).find((q) => q >= s); };
    const xs = nice(xb), ys = nice(yMax), xt = [], yt = [];
    for (let v = 0; v <= xb + 1e-9; v += xs) xt.push([v, String(+v.toFixed(2))]);
    for (let v = 0; v <= yMax + 1e-9; v += ys) yt.push([v, String(+v.toFixed(2))]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt, yt, ylabel: `${pr.out.name} ${pr.out.s} (${pr.out.unit})`, xlabel: pr.xlab });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, pw, ph); ctx.clip();
    // 추측 곡선 (두 번째 값은 점선)
    [false, true].forEach((second) => {
      ctx.strokeStyle = second ? C.amber : C.forest; ctx.lineWidth = second ? 1.6 : 2.2;
      ctx.setLineDash(second ? [5, 4] : []);
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) { const x = xa + (xb - xa) * i / 120, v = k * shape(x, second); i ? ctx.lineTo(X(x), Y(v)) : ctx.moveTo(X(x), Y(v)); }
      ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.restore();
    // 정확한 값의 점 (둘째 변수를 바꿔도 똑같다)
    for (let i = 0; i <= 10; i++) {
      const x = xa + (xb - xa) * i / 10;
      ctx.beginPath(); ctx.arc(X(x), Y(pr.exact(x)), 3.6, 0, Math.PI * 2);
      ctx.fillStyle = C.ink; ctx.fill();
    }
    // 범례
    const v2 = pr.vars[1];
    ctx.font = `${narrow ? 10 : 11}px ${F.sans}`; ctx.textAlign = "left";
    const ly = y0 + 16, lx = x0 + 8;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(lx + 4, ly - 3, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillText(`실제 값 (${v2.s}와 무관)`, lx + 12, ly);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(lx, ly + 13); ctx.lineTo(lx + 9, ly + 13); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillText(`추측, ${v2.s} = ${v2.two[0].toLocaleString("ko-KR")} ${v2.unit}`, lx + 12, ly + 17);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(lx, ly + 29); ctx.lineTo(lx + 9, ly + 29); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillText(`추측, ${v2.s} = ${v2.two[1].toLocaleString("ko-KR")} ${v2.unit}`, lx + 12, ly + 33);
  }

  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    key = b.dataset.p; ex = [...P[key].start];
    root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    buildSteppers(); update();
  }));
  buildSteppers(); update();
})();
