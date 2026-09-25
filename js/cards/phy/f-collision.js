/* 카드: 부딪칠 때 무엇이 보존될까? — 1차원 충돌, 반발 계수 e로 탄성~완전 비탄성 */
(() => {
  const root = document.getElementById("card-phy-collision");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const s = { m1: $(".m1"), m2: $(".m2"), v1: $(".v1"), v2: $(".v2"), e: $(".e") };
  const o = { m1: $(".m1-out"), m2: $(".m2-out"), v1: $(".v1-out"), v2: $(".v2-out"), e: $(".e-out") };
  const nP = $(".p-cons"), nK = $(".k-cons"), nV = $(".v-after");

  const WC = 0.3, TC = 1.4, AFTER = 2.2; // 수레 길이(m), 충돌 시각, 충돌 뒤 보여 줄 시간
  const COL1 = C.forest, COL2 = C.amber;
  let clock = 0;

  function calc() {
    const m1 = +s.m1.value, m2 = +s.m2.value, v1 = +s.v1.value, v2 = +s.v2.value, e = +s.e.value;
    const hit = v1 > v2;
    const P = m1 * v1 + m2 * v2, M = m1 + m2;
    const u1 = hit ? (P - m2 * e * (v1 - v2)) / M : v1;
    const u2 = hit ? (P + m1 * e * (v1 - v2)) / M : v2;
    const K0 = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2, K1 = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
    return { m1, m2, v1, v2, e, hit, u1, u2, P, M, K0, K1, vcm: P / M };
  }

  function update() {
    const r = calc();
    o.m1.textContent = r.m1.toFixed(1); o.m2.textContent = r.m2.toFixed(1);
    o.v1.textContent = r.v1.toFixed(1); o.v2.textContent = r.v2.toFixed(1); o.e.textContent = r.e.toFixed(2);
    const P1 = r.m1 * r.u1 + r.m2 * r.u2;
    nP.textContent = `${r.P.toFixed(2)} → ${P1.toFixed(2)}`;
    nK.textContent = `${r.K0.toFixed(2)} → ${r.K1.toFixed(2)} J`;
    nK.classList.toggle("bad", r.K1 < r.K0 - 1e-9);
    nV.textContent = r.hit ? `${r.u1.toFixed(2)} · ${r.u2.toFixed(2)}` : "충돌 없음";
    clock = 0; draw();
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    const r = calc();
    ctx.clearRect(0, 0, w, h);
    const u = w / 4.6, cx = w / 2, ty = h * 0.34;
    const after = clock > TC && r.hit, dt = clock - TC;
    const x1 = after ? -WC / 2 + r.u1 * dt : -WC / 2 + r.v1 * dt;
    const x2 = after ? WC / 2 + r.u2 * dt : WC / 2 + r.v2 * dt;
    // 레일
    ctx.fillStyle = "#e6e6df"; ctx.fillRect(0, ty + 2, w, 6);
    const cart = (xc, m, col, lab) => {
      const px = cx + xc * u, cw = WC * u, chh = 12 + 10 * Math.sqrt(m);
      if (px < -cw || px > w + cw) return;
      ctx.fillStyle = col; ctx.fillRect(px - cw / 2, ty - chh, cw, chh);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px - cw * 0.28, ty, 4, 0, Math.PI * 2); ctx.arc(px + cw * 0.28, ty, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.paper; ctx.font = `500 10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab, px, ty - chh / 2 + 4);
    };
    // 두 수레가 맞닿을 때 경계가 겹치지 않도록 중심 위치로 그림
    cart(x1, r.m1, COL1, `${r.m1}`);
    cart(x2, r.m2, COL2, `${r.m2}`);
    // 질량 중심: 충돌 전후 같은 속도로 움직임
    const xcm = (r.m1 * x1 + r.m2 * x2) / r.M, pcm = cx + xcm * u;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(pcm, ty + 10); ctx.lineTo(pcm - 6, ty + 20); ctx.lineTo(pcm + 6, ty + 20); ctx.closePath(); ctx.fill();
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink2;
    ctx.fillText(`질량 중심 ${r.vcm.toFixed(2)} m/s`, pcm, ty + 34);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText(clock < TC ? "충돌 전" : r.hit ? "충돌 후" : "앞 수레가 더 빨라 만나지 않음", 8, 16);
    ctx.textAlign = "right"; ctx.fillText("질량 kg · 마찰 없음", w - 8, 16);

    // ── 막대: 운동량과 운동 에너지 (전 · 후)
    const by = ty + 56, bh = 14, colW = (w - 24) / 2;
    const bars = (x0, title, vals, unit, vmax) => {
      ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText(title, x0, by);
      const sc = (colW - 70) / vmax, zero = x0 + 36;
      vals.forEach(([lab, parts], i) => {
        const y = by + 12 + i * (bh + 10);
        ctx.globalAlpha = i === 1 && clock < TC ? 0.25 : 1;
        ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(lab, zero - 6, y + 11);
        let pos = zero, neg = zero;
        for (const [v, col] of parts) {
          ctx.fillStyle = col;
          if (v >= 0) { ctx.fillRect(pos, y, v * sc, bh); pos += v * sc; } else { ctx.fillRect(neg + v * sc, y, -v * sc, bh); neg += v * sc; }
        }
        const tot = parts.reduce((a, p) => a + p[0], 0);
        ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(`${tot.toFixed(2)}${unit}`, Math.max(pos, zero) + 5, y + 11);
        ctx.globalAlpha = 1;
      });
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(zero + .5, by + 6); ctx.lineTo(zero + .5, by + 12 + 2 * (bh + 10)); ctx.stroke();
    };
    const pmax = Math.max(Math.abs(r.m1 * r.v1) + Math.abs(r.m2 * r.v2), 0.5);
    ctx.font = `10.5px ${F.mono}`;
    bars(12, "운동량 (kg·m/s)", [["전", [[r.m1 * r.v1, COL1], [r.m2 * r.v2, COL2]]], ["후", [[r.m1 * r.u1, COL1], [r.m2 * r.u2, COL2]]]], "", pmax);
    bars(12 + colW, "운동 에너지 (J)", [["전", [[0.5 * r.m1 * r.v1 ** 2, COL1], [0.5 * r.m2 * r.v2 ** 2, COL2]]], ["후", [[0.5 * r.m1 * r.u1 ** 2, COL1], [0.5 * r.m2 * r.u2 ** 2, COL2]]]], "", Math.max(r.K0, 0.05));
  }

  Object.values(s).forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [m1, m2, v1, v2, e] = b.dataset.set.split(",").map(Number);
    s.m1.value = m1; s.m2.value = m2; s.v1.value = v1; s.v2.value = v2; s.e.value = e; update();
  }));
  update();
  loop(cv, (dt) => {
    if (NM.reduce) { if (clock !== TC + 1) { clock = TC + 1; draw(); } return; }
    clock += dt; if (clock > TC + AFTER) clock = 0;
    draw();
  });
})();
