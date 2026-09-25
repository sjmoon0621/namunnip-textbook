/* 카드: 우주정거장에는 중력이 없을까? — 거리에 따른 중력 가속도 (로그–로그) */
(() => {
  const root = document.getElementById("card-inverse-square");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), s = $(".r"), o = $(".r-out");
  const nA = $(".acc"), nP = $(".pct"), nV = $(".vorb"), nD = $(".drop1");

  const g0 = 9.81, RE = 6371; // km
  const acc = (r) => g0 / (r * r); // r: 지구 반지름 단위
  // 실제 관측·궤도 값 (반지름은 지구 중심에서의 거리)
  const MARKS = [
    { key: "surface", name: "지표의 사과", r: 1, a: 9.81 },
    { key: "iss", name: "국제우주정거장", r: (RE + 420) / RE },
    { key: "gps", name: "GPS 위성", r: 26560 / RE },
    { key: "geo", name: "정지궤도 위성", r: 42164 / RE },
    { key: "moon", name: "달 (관측: v²/r)", r: 384400 / RE, a: (() => { const T = 27.32 * 86400, R = 3.844e8; return (2 * Math.PI / T) ** 2 * R; })() },
  ];
  MARKS.forEach((m) => { if (m.a == null) m.a = acc(m.r); });

  const { ctx, size } = fit(cv, () => draw());
  const lx = (r) => Math.log10(r), LX0 = 0, LX1 = 2, LY0 = -3, LY1 = Math.log10(20);

  function draw() {
    const { w, h } = size; if (!w) return;
    const r = Math.pow(10, +s.value);
    const padL = 44, padR = 12, padT = 22, padB = 34, pw = w - padL - padR, ph = h - padT - padB;
    const X = (r) => padL + (lx(r) - LX0) / (LX1 - LX0) * pw, Y = (a) => padT + (1 - (Math.log10(a) - LY0) / (LY1 - LY0)) * ph;
    ctx.clearRect(0, 0, w, h);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [[1, "1"], [2, "2"], [5, "5"], [10, "10"], [20, "20"], [50, "50"], [100, "100"]],
      yt: [[0.001, "0.001"], [0.01, "0.01"], [0.1, "0.1"], [1, "1"], [10, "10"]],
      ylabel: "중력 가속도 (m/s², 로그 눈금)", xlabel: "지구 중심에서의 거리 (지구 반지름 R 단위, 로그 눈금)" });
    // 1/r² 직선
    ctx.beginPath(); ctx.moveTo(X(1), Y(acc(1))); ctx.lineTo(X(100), Y(acc(100)));
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(X(8), Y(acc(8)) - 8); ctx.rotate(Math.atan2(Y(acc(100)) - Y(acc(1)), X(100) - X(1)));
    ctx.font = `italic 15px ${F.serif}`; ctx.fillStyle = C.forest; ctx.fillText("a = g₀ (R / r)²", 0, 0); ctx.restore();

    ctx.font = `10.5px ${F.mono}`;
    MARKS.forEach((m, i) => {
      const x = X(m.r), y = Y(m.a);
      ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = C.ink2;
      const right = x > padL + pw - 90;
      ctx.textAlign = right ? "right" : "left";
      const dy = m.key === "iss" ? 16 : m.key === "surface" ? -8 : -9;
      ctx.fillText(m.name, x + (right ? -8 : 8), y + dy);
    });
    ctx.textAlign = "left";
    // 탐침
    const x = X(r), y = Y(acc(r));
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, padT + ph); ctx.lineTo(x, y); ctx.lineTo(padL, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
  }

  function update() {
    const r = Math.pow(10, +s.value), a = acc(r);
    o.textContent = `${r < 10 ? r.toFixed(2) : r.toFixed(1)} R · ${Math.round(r * RE).toLocaleString("ko-KR")} km`;
    nA.textContent = a >= 0.1 ? a.toFixed(2) : a.toPrecision(3);
    nP.textContent = `${(a / g0 * 100).toPrecision(3)}%`;
    nV.textContent = `${(Math.sqrt(a * r * RE * 1000) / 1000).toFixed(2)} km/s`;
    const d = a / 2; // 1초 동안 떨어지는 거리
    nD.textContent = d >= 1 ? `${d.toFixed(2)} m` : d >= 0.01 ? `${(d * 100).toFixed(1)} cm` : `${(d * 1000).toFixed(2)} mm`;
    draw();
  }
  s.addEventListener("input", update);
  root.querySelectorAll("[data-mark]").forEach((b) => b.addEventListener("click", () => {
    const m = MARKS.find((k) => k.key === b.dataset.mark); s.value = Math.log10(m.r); update();
  }));
  update();
})();
