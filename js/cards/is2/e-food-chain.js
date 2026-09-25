/* 카드: 먹이 사슬의 한 단계가 흔들리면? — 생산자·1차 소비자·2차 소비자 모형 (모식) */
(() => {
  const root = document.getElementById("card-is2-food-chain");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const nP = $(".np"), nH = $(".nh"), nC = $(".nc"), msg = $(".e-msg");

  // 모식 모형: 생산자는 로지스틱 성장, 소비자는 먹은 에너지의 10%를 자기 몸으로 바꾼다
  const p = { r: 1, a: 4, e: 0.1, m: 0.12, b: 6, f: 0.1, n: 0.06 };
  const EQ = [0.6, 0.1, 0.02];           // K = 1일 때의 평형
  let K = 1, s = EQ.slice(), t = 0;
  const hist = [];
  const WIN = 160;
  const d = ([P, H, Cc]) => [
    p.r * P * (1 - P / K) - p.a * P * H,
    p.e * p.a * P * H - p.m * H - p.b * H * Cc,
    p.f * p.b * H * Cc - p.n * Cc,
  ];
  function step(dt) {
    const k1 = d(s), a = s.map((v, i) => v + dt / 2 * k1[i]);
    const k2 = d(a), b = s.map((v, i) => v + dt / 2 * k2[i]);
    const k3 = d(b), c = s.map((v, i) => v + dt * k3[i]);
    const k4 = d(c);
    s = s.map((v, i) => Math.max(0, v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])));
    if (s[2] < 1e-4) s[2] = 0;           // 너무 적으면 사라진 것으로 본다
    t += dt;
  }
  for (let i = 0; i <= WIN * 10; i++) { hist.push([t, ...s]); t += 0.1; }
  let lastEvent = "평형 상태입니다. 세 단계 모두 크게 변하지 않습니다.";

  const { ctx, size } = fit(cv, () => draw());
  const COL = [C.forest, C.amber, C.warn];
  const NAME = ["생산자 (풀)", "1차 소비자 (토끼)", "2차 소비자 (여우)"];

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const stack = w / h < 1.3;
    const gw0 = stack ? w : w * 0.7;
    const padL = 38, padR = 10, padT = 22, padB = 30;
    const gh0 = stack ? h * 0.62 : h;
    const pw = gw0 - padL - padR, ph = gh0 - padT - padB;
    const t1 = t, t0 = t - WIN;
    const X = (tt) => padL + (tt - t0) / WIN * pw, Y = (v) => padT + (1 - v / 250) * ph;
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      yt: [[0, "0"], [100, "100"], [200, "200"]], ylabel: "처음 평형 = 100 (%)", xlabel: "시간 →" });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(padL, Y(100) + .5); ctx.lineTo(padL + pw, Y(100) + .5); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.beginPath(); ctx.rect(padL, padT - 2, pw, ph + 4); ctx.clip();
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      let first = true;
      for (const row of hist) {
        if (row[0] < t0) continue;
        const x = X(row[0]), y = Y(clamp(row[k + 1] / EQ[k] * 100, 0, 260));
        first ? ctx.moveTo(x, y) : ctx.lineTo(x, y); first = false;
      }
      ctx.strokeStyle = COL[k]; ctx.lineWidth = 2.2; ctx.stroke();
    }
    ctx.restore();
    // 범례
    ctx.font = `10.5px ${F.mono}`;
    NAME.forEach((nm, k) => { const y = padT + 10 + k * 14; ctx.fillStyle = COL[k]; ctx.fillRect(padL + 8, y - 6, 12, 3); ctx.fillText(nm, padL + 25, y); });

    // 생물량 피라미드 (지금)
    const bx = stack ? 0 : gw0, by = stack ? gh0 : 0, bw = stack ? w : w - gw0, bh = stack ? h - gh0 : h;
    ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("지금의 생물량 (상대값)", bx + bw / 2, by + 16);
    const rowH = Math.min(30, (bh - 34) / 3), maxW = bw - 24;
    for (let k = 0; k < 3; k++) {
      const v = s[k], ww = Math.max(1.5, v / 0.75 * maxW), y = by + bh - 8 - (k + 1) * rowH;
      ctx.fillStyle = COL[k]; ctx.fillRect(bx + bw / 2 - ww / 2, y + 3, ww, rowH - 6);
      ctx.fillStyle = C.ink; ctx.textAlign = "left";
      const lab = (v * 100).toFixed(v * 100 < 10 ? 1 : 0);
      ctx.fillText(lab, bx + bw / 2 + ww / 2 + 5, y + rowH / 2 + 4);
    }
    ctx.textAlign = "left";
  }

  function update() {
    nP.textContent = `${Math.round(s[0] / EQ[0] * 100)}%`;
    nH.textContent = `${Math.round(s[1] / EQ[1] * 100)}%`;
    nC.textContent = s[2] === 0 ? "사라짐" : `${Math.round(s[2] / EQ[2] * 100)}%`;
    nC.classList.toggle("bad", s[2] === 0 || s[2] / EQ[2] < 0.3);
    msg.textContent = lastEvent;
  }

  let acc = 0;
  NM.loop(cv, (dt) => {
    acc += dt * 10;                       // 1초에 10 시간 단위
    while (acc > 0.05) { step(0.05); acc -= 0.05; if (t - hist[hist.length - 1][0] >= 0.25) hist.push([t, ...s]); }
    while (hist.length && hist[0][0] < t - WIN - 1) hist.shift();
    draw(); update();
  });

  const ACT = {
    boom: () => { s[1] *= 2; lastEvent = "1차 소비자가 갑자기 2배가 되었습니다. 생산자와 2차 소비자가 어떻게 반응하는지, 결국 어디로 돌아가는지 보세요."; },
    cull: () => { s[2] = 0; lastEvent = "2차 소비자를 모두 없앴습니다. 1차 소비자를 누르던 힘이 사라지면 생산자에게 무슨 일이 생길까요?"; },
    back: () => { if (s[2] === 0) s[2] = 0.004; lastEvent = "2차 소비자를 조금 다시 풀어 주었습니다."; },
    habitat: () => { K = K === 1 ? 0.6 : 1; root.querySelector("[data-act=habitat]").setAttribute("aria-pressed", K < 1);
      lastEvent = K < 1 ? "서식지가 줄어 생산자가 자랄 수 있는 최대량이 60%가 되었습니다. 어느 단계가 가장 크게 줄어드나요?" : "서식지를 되돌렸습니다."; },
    reset: () => { K = 1; s = EQ.slice(); root.querySelector("[data-act=habitat]").setAttribute("aria-pressed", false); lastEvent = "처음 평형으로 되돌렸습니다."; },
  };
  root.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => { ACT[b.dataset.act](); update(); draw(); }));
  update();
})();
