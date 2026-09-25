/* 카드 1.1.2: 1초는 누가, 어떻게 정할까? — 시계 종류별 누적 오차 (로그–로그) */
(() => {
  const root = document.getElementById("card-is1-clock");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sl = $(".t"), tOut = $(".t-out");
  const dCnt = $(".cnt"), dErr = $(".err"), dOne = $(".one");

  const YEAR = 3.156e7, DAY = 86400;
  // y: 오차율(대표값), n: 1초 동안 세는 횟수
  const CLK = {
    earth: { name: "지구 자전", y: 2e-8, lt: 6, dy: 15, n: "1/86,400 바퀴", color: "#2f5f8a" },
    pend: { name: "진자시계", y: 3e-5, lt: 0.4, dy: -7, n: "1번 (초진자 한 번 흔들림)", color: "#8a6b4e" },
    quartz: { name: "수정 시계", y: 6e-6, lt: 0.9, dy: 15, n: "32,768번", color: C.amber },
    cs: { name: "세슘 원자시계", y: 1e-16, lt: 3.2, dy: -7, n: "9,192,631,770번", color: C.forest },
    opt: { name: "광 시계", y: 1e-18, lt: 8.5, dy: 15, n: "약 429조 번 (스트론튬)", color: C.warn },
  };
  let sel = "quartz";

  const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const pow = (n) => "10" + String(n).split("").map((c) => SUP[c]).join("");
  function dur(s) { // 사람이 읽기 쉬운 기간
    if (s < 60) return `${s < 10 ? s.toFixed(1) : Math.round(s)}초`;
    if (s < 3600) return `${Math.round(s / 60)}분`;
    if (s < DAY) return `${(s / 3600).toFixed(s < 36000 ? 1 : 0)}시간`;
    if (s < YEAR) return `${(s / DAY).toFixed(s < 10 * DAY ? 1 : 0)}일`;
    const y = s / YEAR;
    if (y < 1e4) return `${y < 10 ? y.toFixed(1) : Math.round(y).toLocaleString("ko-KR")}년`;
    if (y < 1e8) return `${(+(y / 1e4).toPrecision(2)).toLocaleString("ko-KR")}만 년`;
    return `${(+(y / 1e8).toPrecision(2)).toLocaleString("ko-KR")}억 년`;
  }
  function small(s) {
    if (s >= 1) return dur(s);
    if (s >= 1e-3) return `${(+(s * 1e3).toPrecision(2))} ms`;
    if (s >= 1e-6) return `${(+(s * 1e6).toPrecision(2))} μs`;
    if (s >= 1e-9) return `${(+(s * 1e9).toPrecision(2))} ns`;
    return `${(+(s * 1e12).toPrecision(2))} ps`;
  }

  const { ctx, size } = fit(cv, () => draw());
  const LX0 = 0, LX1 = 17.64, LY0 = -14, LY1 = 12;

  function update() {
    const t = 10 ** +sl.value, c = CLK[sel];
    tOut.textContent = dur(t);
    dCnt.textContent = c.n;
    dCnt.style.fontSize = c.n.length > 12 ? "13px" : "";
    const e = c.y * t;
    dErr.textContent = small(e);
    dErr.classList.toggle("bad", e >= 1);
    dOne.textContent = dur(1 / c.y);
    draw();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 520;
    const padL = narrow ? 40 : 48, padR = narrow ? 8 : 12, padT = 22, padB = 34;
    const pw = w - padL - padR, ph = h - padT - padB;
    const X = (lt) => padL + (lt - LX0) / (LX1 - LX0) * pw;
    const Y = (le) => padT + (1 - (le - LY0) / (LY1 - LY0)) * ph;
    const xt = narrow
      ? [[0, "1초"], [Math.log10(DAY), "1일"], [Math.log10(YEAR * 1e3), "천 년"], [Math.log10(YEAR * 1e8), "1억 년"]]
      : [[0, "1초"], [Math.log10(DAY), "1일"], [Math.log10(YEAR), "1년"], [Math.log10(YEAR * 1e3), "천 년"], [Math.log10(YEAR * 1e6), "백만 년"], [Math.log10(YEAR * 1e9), "10억 년"]];
    const yt = [];
    for (let k = LY0; k <= LY1; k += narrow ? 4 : 2) yt.push([k, k === 0 ? "1 s" : pow(k)]);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y, xt, yt, ylabel: "쌓인 오차 (s)", xlabel: "흐른 시간" });

    // 우주의 나이
    const xu = X(Math.log10(4.35e17));
    ctx.fillStyle = "rgba(35,35,38,.05)"; ctx.fillRect(xu, padT, padL + pw - xu, ph);
    ctx.save(); ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("우주의 나이", xu - 3, padT + ph - 6); ctx.restore();

    // 1초 선
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(padL, Y(0) + .5); ctx.lineTo(padL + pw, Y(0) + .5); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText("1초 틀어짐", padL + 4, Y(0) - 5);

    // 시계별 직선: log e = log y + log t
    ctx.save(); ctx.beginPath(); ctx.rect(padL, padT, pw, ph); ctx.clip();
    for (const [k, c] of Object.entries(CLK)) {
      const on = k === sel, ly = Math.log10(c.y);
      ctx.strokeStyle = c.color; ctx.lineWidth = on ? 2.6 : 1.3; ctx.globalAlpha = on ? 1 : .45;
      ctx.beginPath(); ctx.moveTo(X(LX0), Y(ly + LX0)); ctx.lineTo(X(LX1), Y(ly + LX1)); ctx.stroke();
      // 이름: 겹치지 않게 시계마다 정한 자리에
      ctx.globalAlpha = on ? 1 : .75;
      ctx.font = `${on ? 700 : 400} 11.5px ${F.sans}`; ctx.fillStyle = c.color; ctx.textAlign = "left";
      ctx.fillText(c.name, X(c.lt) + 4, Y(ly + c.lt) + c.dy);
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    // 커서와 현재 점
    const lt = +sl.value, c = CLK[sel], le = Math.log10(c.y) + lt;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(lt) + .5, padT); ctx.lineTo(X(lt) + .5, padT + ph); ctx.stroke();
    if (le >= LY0 && le <= LY1) {
      ctx.beginPath(); ctx.arc(X(lt), Y(le), 5.5, 0, Math.PI * 2);
      ctx.fillStyle = c.color; ctx.fill(); ctx.strokeStyle = C.card; ctx.lineWidth = 2; ctx.stroke();
    }
    // 1초를 넘는 지점
    const cross = -Math.log10(c.y);
    if (cross <= LX1) {
      ctx.beginPath(); ctx.arc(X(cross), Y(0), 4, 0, Math.PI * 2);
      ctx.strokeStyle = c.color; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => {
    sel = b.dataset.k;
    root.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  sl.addEventListener("input", update);
  update();
})();
