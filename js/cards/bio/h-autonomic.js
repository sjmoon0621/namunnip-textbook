/* 카드: 교감 신경과 부교감 신경은 어떻게 반대로 일할까? — 길항 작용 (모식 모형, 수치는 어림) */
(() => {
  const root = document.getElementById("card-bio-autonomic");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sS = $(".sym"), sP = $(".para"), oS = $(".sym-out"), oP = $(".para-out");
  const nHR = $(".hr"), nPu = $(".pupil"), nGut = $(".gut"), msg = $(".an-msg");
  const SYM = "#d0782a", PAR = "#3b7c2a";

  const model = (s, p) => ({
    hr: 100 * (1 + 0.9 * s) * (1 - 0.5 * p),       // 신경을 모두 끊은 심장은 분당 약 100회
    pupil: clamp(4.5 + 3.3 * s - 2.5 * p, 2, 8),   // mm (보통 밝기)
    bron: 1 + 0.5 * s - 0.3 * p,                    // 기관지 지름 (상대값)
    gut: clamp(0.5 + 0.6 * p - 0.5 * s, 0.05, 1.2), // 소화관 운동 (상대값)
    bladder: clamp(0.2 + 0.8 * p - 0.3 * s, 0, 1),  // 방광 수축 (상대값)
  });

  let beat = 0, wave = 0;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = +sS.value / 100, p = +sP.value / 100, m = model(s, p);
    const cx = Math.max(46, w * 0.13), top = 18, bot = h - 14;
    ctx.font = `10.5px ${F.mono}`;
    // 중추: 뇌줄기, 척수(가슴·허리 / 엉치)
    ctx.fillStyle = "#efe7f3"; ctx.strokeStyle = "#7a5aa6"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, top + 16, 34, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(cx - 9, top + 32, 18, bot - top - 32, 8); ctx.fill(); ctx.stroke();
    const yT0 = top + (bot - top) * 0.3, yT1 = top + (bot - top) * 0.72, yS = top + (bot - top) * 0.9;
    ctx.fillStyle = "rgba(208,120,42,.25)"; ctx.fillRect(cx - 9, yT0, 18, yT1 - yT0);
    ctx.fillStyle = "rgba(59,124,42,.25)"; ctx.fillRect(cx - 9, yS - 12, 18, 24);
    ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "#7a5aa6";
    ctx.fillText("뇌줄기", cx, top + 20);
    ctx.translate(cx - 16, (yT0 + yT1) / 2); ctx.rotate(-Math.PI / 2); ctx.fillStyle = SYM; ctx.fillText("척수 가슴·허리", 0, 0); ctx.restore();
    ctx.save(); ctx.translate(cx - 16, yS); ctx.rotate(-Math.PI / 2); ctx.fillStyle = PAR; ctx.textAlign = "center"; ctx.fillText("엉치", 0, 0); ctx.restore();

    const organs = ["eye", "heart", "lung", "gut", "bladder"];
    const ox = w * 0.72, rowH = (bot - top) / organs.length;
    organs.forEach((o, i) => {
      const oy = top + rowH * (i + 0.5);
      // 교감: 척수 가슴·허리 → 신경절(척수 가까이) → 긴 절후 뉴런
      const sy0 = yT0 + (yT1 - yT0) * (i / 4), gx1 = cx + 30;
      nerve([[cx + 9, sy0], [gx1, sy0 + 2]], [[gx1, sy0 + 2], [ox - 40, oy - 5]], SYM, s);
      // 부교감: 뇌줄기(또는 엉치) → 긴 절전 뉴런 → 신경절(기관 가까이) → 짧은 절후
      const py0 = i < 4 ? top + 22 : yS, px0 = i < 4 ? cx + 30 : cx + 9, gx2 = ox - 62;
      nerve([[px0, py0], [gx2, oy + 6]], [[gx2, oy + 6], [ox - 40, oy + 5]], PAR, p);
      drawOrgan(o, ox, oy, rowH, m);
    });
    ctx.textAlign = "left"; ctx.font = `10px ${F.mono}`;
    ctx.fillStyle = SYM; ctx.fillText("— 교감", cx + 44, h - 4);
    ctx.fillStyle = PAR; ctx.fillText("— 부교감", cx + 104, h - 4);
    ctx.fillStyle = C.ink3; ctx.fillText("● 신경절", cx + 174, h - 4);
  }

  function nerve(pre, post, col, a) {
    ctx.strokeStyle = col; ctx.globalAlpha = 0.25 + 0.75 * a; ctx.lineWidth = 0.8 + 3 * a;
    for (const seg of [pre, post]) { ctx.beginPath(); ctx.moveTo(seg[0][0], seg[0][1]); ctx.lineTo(seg[1][0], seg[1][1]); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(pre[1][0], pre[1][1], 3.5, 0, Math.PI * 2); ctx.fill();
  }

  function drawOrgan(o, x, y, rh, m) {
    const r = Math.min(rh * 0.34, 20);
    ctx.save(); ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2;
    const lab = (t, v) => { ctx.fillStyle = C.ink2; ctx.fillText(t, x + r + 10, y - 2); ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.fillText(v, x + r + 10, y + 12); ctx.font = `10.5px ${F.mono}`; };
    if (o === "eye") {
      ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.3, r * 0.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#6b8fa8"; ctx.beginPath(); ctx.arc(x, y, r * 0.72, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(x, y, r * 0.72 * m.pupil / 9, 0, Math.PI * 2); ctx.fill();
      lab("동공", `${m.pupil.toFixed(1)} mm`);
    } else if (o === "heart") {
      const k = 1 + 0.12 * Math.max(0, Math.sin(beat * Math.PI * 2)) ** 8;
      ctx.fillStyle = C.apple; ctx.beginPath();
      const rr = r * 0.55 * k;
      ctx.arc(x - rr * 0.55, y - rr * 0.2, rr * 0.62, Math.PI, 0); ctx.arc(x + rr * 0.55, y - rr * 0.2, rr * 0.62, Math.PI, 0);
      ctx.lineTo(x, y + rr * 1.1); ctx.closePath(); ctx.fill();
      lab("심장 박동", `${Math.round(m.hr)}회/분`);
    } else if (o === "lung") {
      ctx.strokeStyle = "#8a6b8f"; ctx.lineCap = "round";
      ctx.lineWidth = 3 * m.bron; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x, y); ctx.stroke();
      ctx.lineWidth = 2.2 * m.bron; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - r * 0.7, y + r * 0.6); ctx.moveTo(x, y); ctx.lineTo(x + r * 0.7, y + r * 0.6); ctx.stroke();
      ctx.lineCap = "butt";
      lab("기관지", m.bron > 1.15 ? "확장" : m.bron < 0.8 ? "수축" : "보통");
    } else if (o === "gut") {
      ctx.strokeStyle = "#b08a5a"; ctx.lineWidth = 5; ctx.beginPath();
      for (let i = 0; i <= 30; i++) { const xx = x - r * 1.2 + i / 30 * r * 2.4, yy = y + Math.sin(i / 30 * Math.PI * 3 - wave) * r * 0.45 * m.gut; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.stroke();
      lab("소화관 운동", m.gut > 0.8 ? "활발" : m.gut < 0.3 ? "억제" : "보통");
    } else {
      const k = 1 - 0.25 * m.bladder;
      ctx.fillStyle = "#e8d9a6"; ctx.strokeStyle = "#b09a50"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x, y, r * 0.8 * k, r * 0.7 * k, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      lab("방광", m.bladder > 0.6 ? "수축 (배뇨)" : "이완 (저장)");
    }
    ctx.restore();
  }

  function update() {
    oS.textContent = sS.value; oP.textContent = sP.value;
    const s = +sS.value / 100, p = +sP.value / 100, m = model(s, p);
    nHR.textContent = `${Math.round(m.hr)}회/분`;
    nPu.textContent = `${m.pupil.toFixed(1)} mm`;
    nGut.textContent = m.gut > 0.8 ? "활발" : m.gut < 0.3 ? "억제" : "보통";
    msg.textContent = s < 0.05 && p < 0.05
      ? "두 신경을 모두 막아도 심장은 멈추지 않습니다. 심장 스스로 분당 약 100회로 뜁니다. 평소 70회 안팎인 것은 부교감 신경이 늘 브레이크를 걸고 있기 때문입니다."
      : s > p + 0.3 ? "교감 신경이 우세합니다. 몸이 움직일 준비를 합니다: 심장이 빨라지고, 동공과 기관지가 넓어지고, 소화는 미뤄집니다."
      : p > s + 0.3 ? "부교감 신경이 우세합니다. 심장이 느려지고 소화관이 활발해집니다. 쉬면서 에너지를 모으는 상태입니다."
      : "두 신경이 비슷하게 작용하고 있습니다.";
    draw();
  }
  [sS, sP].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-sp]").forEach((b) => b.addEventListener("click", () => {
    const [a, c] = b.dataset.sp.split(","); sS.value = a; sP.value = c; update();
  }));
  update();
  loop(cv, (dt) => {
    const m = model(+sS.value / 100, +sP.value / 100);
    beat = (beat + dt * m.hr / 60) % 1; wave += dt * 3 * m.gut;
    draw();
  });
})();
