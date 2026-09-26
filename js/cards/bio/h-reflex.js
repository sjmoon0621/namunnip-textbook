/* 카드: 뜨거운 것에 닿으면 왜 생각보다 손이 먼저 움직일까? — 척수 반사와 의식적 반응의 경로·시간 (어림값) */
(() => {
  const root = document.getElementById("card-bio-reflex");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const cutA = $(".cut-a"), cutB = $(".cut-b"), cutC = $(".cut-c");
  const nRef = $(".t-ref"), nBrain = $(".t-brain"), nVol = $(".t-vol"), msg = $(".rf-msg");
  const SEN = "#3f6f9f", MOT = "#c9542f", CNS = "#7a5aa6";

  // 어림값 (ms): 손–척수 0.8 m, 척수–대뇌 0.45 m
  const T = {
    sens: 0.8 / 20 * 1000,     // 감각 뉴런 (Aδ 섬유, 약 20 m/s) → 40
    syn: 1,                    // 시냅스 한 번
    motor: 0.8 / 60 * 1000,    // 운동 뉴런 (약 60 m/s) → 13
    muscle: 20,                // 근육이 힘을 내기까지
    up: 0.45 / 20 * 1000,      // 척수 → 대뇌
    decide: 120,               // 대뇌에서 알아차리고 명령을 내리기까지 (어림)
    down: 0.45 / 60 * 1000,    // 대뇌 → 척수
  };

  function plan() {
    const a = cutA.checked, b = cutB.checked, c = cutC.checked;
    const ev = { segs: [] };
    if (a) return ev;
    const t1 = T.sens;
    ev.segs.push(["sens", 0, t1]);
    // 반사 경로: 연합 뉴런 → 운동 뉴런
    const t2 = t1 + 2 * T.syn;
    ev.segs.push(["inter", t1, t2]);
    if (!b) {
      ev.segs.push(["motor", t2, t2 + T.motor]);
      ev.reflex = t2 + T.motor + T.muscle;
    }
    if (!c) {
      const tb = t1 + T.syn + T.up + 2 * T.syn;
      ev.segs.push(["up", t1 + T.syn, tb]);
      ev.brain = tb;
      const td = tb + T.decide;
      ev.segs.push(["down", td, td + T.down]);
      if (!b) {
        const tm = td + T.down + T.syn;
        ev.segs.push(["motor2", tm, tm + T.motor]);
        ev.vol = tm + T.motor + T.muscle;
      }
    }
    return ev;
  }

  let ev = plan(), tau = 0, playing = true;
  const { ctx, size } = fit(cv, () => draw());

  function paths(w, h) {
    const sx = w * 0.2, P = (fx, fy) => [fx * w, fy * h];
    const top = h * 0.72; // 아래쪽은 시간 막대
    const Y = (f) => f * top;
    return {
      sens: [[w * 0.86, Y(0.74)], [w * 0.55, Y(0.6)], [sx + 22, Y(0.56)], [sx + 6, Y(0.6)]],
      inter: [[sx + 6, Y(0.6)], [sx - 4, Y(0.66)]],
      motor: [[sx - 4, Y(0.66)], [sx + 22, Y(0.72)], [w * 0.44, Y(0.73)]],
      motor2: [[sx - 4, Y(0.66)], [sx + 22, Y(0.72)], [w * 0.44, Y(0.73)]],
      up: [[sx + 4, Y(0.6)], [sx + 4, Y(0.2)]],
      down: [[sx - 6, Y(0.2)], [sx - 6, Y(0.64)]],
      top, sx, Y, P,
    };
  }
  const along = (pts, f) => {
    const L = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let s = f * tot;
    for (let i = 0; i < L.length; i++) { if (s <= L[i]) { const k = s / L[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } s -= L[i]; }
    return pts.at(-1);
  };

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = paths(w, h), { sx, Y } = p;
    ctx.font = `10.5px ${F.mono}`;
    // 대뇌
    ctx.fillStyle = "#efe7f3"; ctx.strokeStyle = CNS; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(sx, Y(0.12), Math.min(70, w * 0.14), Y(0.1), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = CNS; ctx.textAlign = "center"; ctx.fillText("대뇌", sx, Y(0.13));
    // 척수
    ctx.fillStyle = "#efe7f3"; ctx.beginPath(); ctx.roundRect(sx - 14, Y(0.22), 28, Y(0.94) - Y(0.22), 12); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(sx - 22, Y(0.86)); ctx.rotate(-Math.PI / 2); ctx.fillStyle = CNS; ctx.textAlign = "left"; ctx.fillText("척수", 0, 0); ctx.restore();
    // 팔과 손, 냄비
    ctx.strokeStyle = "#d8cbb4"; ctx.lineWidth = Math.max(16, p.top * 0.09); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(sx + 30, Y(0.7)); ctx.lineTo(w * 0.84, Y(0.76)); ctx.stroke(); ctx.lineCap = "butt";
    const hot = !ev.reflex && !ev.vol ? 1 : 0;
    const lift = ev.reflex && tau > ev.reflex ? 1 : ev.vol && tau > ev.vol ? 1 : 0;
    ctx.fillStyle = "#555"; ctx.fillRect(w * 0.8, Y(0.8) + 4, w * 0.16, 7);
    ctx.strokeStyle = "#e0a02a"; ctx.lineWidth = 2; ctx.globalAlpha = 0.8;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(w * (0.83 + i * 0.045), Y(0.8) + 18); ctx.quadraticCurveTo(w * (0.84 + i * 0.045), Y(0.8) + 24, w * (0.83 + i * 0.045), Y(0.8) + 30); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#d8cbb4"; ctx.beginPath(); ctx.ellipse(w * 0.87, Y(0.76) - lift * 14, 13, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText(lift ? "손을 뗌" : hot && tau > 60 ? "계속 닿아 있음" : "뜨거운 냄비", w * 0.88, Y(0.8) + 44 > p.top - 2 ? p.top - 2 : Y(0.8) + 44);
    // 근육
    ctx.fillStyle = lift ? MOT : "#c9a58f"; ctx.beginPath(); ctx.ellipse(w * 0.5, Y(0.72), w * 0.07, 7, 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.fillText("근육", w * 0.5, Y(0.72) - 12);
    // 경로
    const seg = (key, col, label, lx, ly, cut) => {
      const pts = p[key];
      ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.setLineDash(key === "motor2" ? [] : []);
      ctx.globalAlpha = 0.35; ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); ctx.globalAlpha = 1;
      const s = ev.segs.find((x) => x[0] === key);
      if (s && tau > s[1]) {
        const f = clamp((tau - s[1]) / (s[2] - s[1]), 0, 1);
        ctx.lineWidth = 2.6; ctx.beginPath();
        const n = 30; for (let i = 0; i <= n; i++) { const q = along(pts, f * i / n); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
        ctx.stroke();
        if (f < 1) { const q = along(pts, f); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(q[0], q[1], 4.5, 0, Math.PI * 2); ctx.fill(); }
      }
      if (label) { ctx.fillStyle = col; ctx.textAlign = "left"; ctx.fillText(label, lx, ly); }
      if (cut) { const q = along(pts, 0.5); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(q[0] - 7, q[1] - 7); ctx.lineTo(q[0] + 7, q[1] + 7); ctx.moveTo(q[0] + 7, q[1] - 7); ctx.lineTo(q[0] - 7, q[1] + 7); ctx.stroke(); }
    };
    seg("sens", SEN, "A 감각 뉴런", w * 0.55, Y(0.6) - 8, cutA.checked);
    seg("inter", CNS, "", 0, 0, false);
    seg("motor", MOT, "B 운동 뉴런", w * 0.3, Y(0.84) + 6, cutB.checked);
    if (!cutB.checked && ev.segs.find((x) => x[0] === "motor2")) seg("motor2", MOT, "", 0, 0, false);
    seg("up", CNS, "C 올라가는 길", sx + 12, Y(0.36), cutC.checked);
    seg("down", CNS, "", 0, 0, false);
    // 시간 막대
    const tx = 16, tw = w - 32, ty = p.top + 22, TM = 300, XT = (t) => tx + clamp(t, 0, TM) / TM * tw;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + tw, ty); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let t = 0; t <= TM; t += 50) { ctx.fillRect(XT(t), ty - 3, 1, 6); ctx.fillText(`${t}`, XT(t), ty + 15); }
    ctx.textAlign = "right"; ctx.fillText("ms", tx + tw, ty - 6);
    ctx.fillStyle = C.forest; ctx.fillRect(tx, ty - 2, XT(tau) - tx, 4);
    const mark = (t, lab, col, row) => {
      if (t == null) return;
      const x = XT(t), yy = ty + 30 + row * 14;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, ty, 4, 0, Math.PI * 2); ctx.fill();
      ctx.textAlign = x > w * 0.7 ? "right" : "left"; ctx.globalAlpha = tau >= t ? 1 : 0.45;
      ctx.fillText(lab, x, yy); ctx.globalAlpha = 1;
    };
    mark(ev.reflex, `반사로 손 뗌 ${Math.round(ev.reflex)}`, MOT, 0);
    mark(ev.brain, `대뇌에 도착 ${Math.round(ev.brain)}`, CNS, 1);
    mark(ev.vol, `의식적 명령으로 움직임 ${Math.round(ev.vol)}`, C.ink2, 2);
  }

  function update() {
    ev = plan(); tau = 0; playing = true;
    const f = (t) => t == null ? "없음" : `${Math.round(t)} ms`;
    nRef.textContent = f(ev.reflex); nBrain.textContent = ev.brain == null ? "못 느낌" : f(ev.brain); nVol.textContent = f(ev.vol);
    nRef.className = "t-ref" + (ev.reflex == null ? " bad" : " good");
    nBrain.className = "t-brain" + (ev.brain == null ? " bad" : "");
    const a = cutA.checked, b = cutB.checked, c = cutC.checked;
    msg.textContent = a ? "감각 신호가 척수에 가지 못합니다. 반사도, 뜨겁다는 느낌도 없습니다. 손을 떼지 못해 다칠 수 있습니다."
      : b ? "뜨거운 것은 느끼지만 근육으로 가는 마지막 길이 끊겨 반사도, 의식적인 움직임도 일어나지 않습니다."
      : c ? "척수가 스스로 반사를 일으켜 손을 뗍니다. 그러나 신호가 대뇌에 닿지 않아 뜨겁다는 것을 느끼지 못합니다."
      : "척수의 반사가 먼저 손을 떼게 하고, 뜨겁다는 신호는 거의 같은 무렵 대뇌에 닿습니다. 대뇌가 판단해 내린 명령은 그보다 한참 늦습니다.";
  }
  [cutA, cutB, cutC].forEach((el) => el.addEventListener("change", update));
  $(".touch").addEventListener("click", update);
  update();
  loop(cv, (dt) => {
    if (playing) { tau += dt * 45; if (tau > 300) { tau = 300; playing = false; } }
    draw();
  });
})();
