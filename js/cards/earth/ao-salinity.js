/* 카드: 짠 바다와 싱거운 바다, 성분 비율도 다를까? — 염분과 염분비 일정 법칙 */
(() => {
  const root = document.getElementById("card-earth-salinity");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sE = $(".ev"), sR = $(".rn"), sI = $(".ic");
  const oE = $(".ev-out"), oR = $(".rn-out"), oI = $(".ic-out");
  const nS = $(".n-s"), nCl = $(".n-cl"), nPct = $(".n-pct");

  // 해수 염류의 질량 조성 (표준 해수의 주요 이온, 질량 분율)
  const IONS = [
    { n: "Cl⁻", k: "염화 이온", f: 0.5503, c: "#3f6fa3" },
    { n: "Na⁺", k: "나트륨 이온", f: 0.3065, c: "#74ab66" },
    { n: "SO₄²⁻", k: "황산 이온", f: 0.0771, c: "#e0a02a" },
    { n: "Mg²⁺", k: "마그네슘 이온", f: 0.0365, c: "#b5532f" },
    { n: "Ca²⁺", k: "칼슘 이온", f: 0.0117, c: "#8d8d92" },
    { n: "K⁺", k: "칼륨 이온", f: 0.0113, c: "#5d5d61" },
  ];
  IONS.push({ n: "기타", k: "기타", f: 1 - IONS.reduce((a, b) => a + b.f, 0), c: "#d9dad2" });
  const SALT = 35; // g, 처음 1 kg 속 염류

  // 염류 알갱이 위치 (고정 난수)
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const GRAINS = Array.from({ length: 70 }, (_, i) => ({ x: rnd(), y: rnd(), ion: i < 38 ? 0 : i < 60 ? 1 : i < 65 ? 2 : i < 68 ? 3 : 4 }));

  const { ctx, size } = fit(cv, () => draw());

  function state() {
    const E = +sE.value, P = +sR.value, I = +sI.value;
    const M = 1000 - E + P - I;
    return { E, P, I, M, S: SALT * 1000 / M };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    const st = state();
    const small = w < 480;
    ctx.clearRect(0, 0, w, h);

    // ── 왼쪽: 비커 (해수 질량) ──
    const bx = 10, bw = Math.round(w * .24), btop = 26, bbot = h - 22;
    const bh = bbot - btop, MMAX = 1800;
    const lvl = bbot - st.M / MMAX * bh;
    ctx.fillStyle = "rgba(63,111,163,.16)"; ctx.fillRect(bx, lvl, bw, bbot - lvl);
    // 알갱이: 개수는 그대로, 물이 적으면 촘촘하게
    GRAINS.forEach((g) => {
      const x = bx + 5 + g.x * (bw - 10), y = lvl + 4 + g.y * (bbot - lvl - 8);
      ctx.fillStyle = IONS[g.ion].c; ctx.beginPath(); ctx.arc(x, y, 1.9, 0, Math.PI * 2); ctx.fill();
    });
    if (st.I > 0) { // 떠 있는 해빙
      const ih = Math.max(4, st.I / MMAX * bh * 1.1);
      ctx.fillStyle = "#f4f8fb"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.fillRect(bx + bw * .15, lvl - ih * .15, bw * .7, ih); ctx.strokeRect(bx + bw * .15 + .5, lvl - ih * .15 + .5, bw * .7 - 1, ih - 1);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bx, btop - 6); ctx.lineTo(bx, bbot); ctx.lineTo(bx + bw, bbot); ctx.lineTo(bx + bw, btop - 6); ctx.stroke();
    // 처음 1 kg 눈금
    const y1k = bbot - 1000 / MMAX * bh;
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, y1k); ctx.lineTo(bx + bw, y1k); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("처음 1 kg", bx + 3, y1k - 4);
    ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText(`해수 ${Math.round(st.M)} g`, bx + bw / 2, 14);
    ctx.fillText(`염류는 늘 ${SALT} g`, bx + bw / 2, h - 7);

    // ── 오른쪽: 막대 두 개 ──
    const gx = bx + bw + (small ? 18 : 30), gw = w - gx - 10;
    const rowH = small ? 26 : 34;
    const y1 = small ? 40 : 50, y2 = y1 + rowH + (small ? 50 : 64);
    const SMAX = 45;
    ctx.textAlign = "left"; ctx.font = `${small ? 11 : 12}px ${F.sans}`; ctx.fillStyle = C.ink;
    ctx.fillText("해수 1 kg 속 이온의 양 (g/kg)", gx, y1 - 10);
    ctx.fillText("녹아 있는 염류 중 각 이온의 비율 (%)", gx, y2 - 10);
    // 눈금
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let v = 0; v <= SMAX; v += small ? 15 : 5) {
      const x = gx + v / SMAX * gw;
      ctx.beginPath(); ctx.moveTo(x + .5, y1); ctx.lineTo(x + .5, y1 + rowH + 4); ctx.stroke();
      ctx.textAlign = "center"; ctx.fillText(String(v), x, y1 + rowH + 16);
    }
    // 35 기준선
    const x35 = gx + 35 / SMAX * gw;
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x35 + .5, y1 - 4); ctx.lineTo(x35 + .5, y1 + rowH + 4); ctx.stroke(); ctx.setLineDash([]);

    let x = gx;
    IONS.forEach((ion) => {
      const ww = st.S * ion.f / SMAX * gw;
      ctx.fillStyle = ion.c; ctx.fillRect(x, y1, ww, rowH); x += ww;
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(gx + .5, y1 + .5, x - gx, rowH - 1);
    ctx.font = `600 12px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = x > gx + gw - 60 ? "right" : "left";
    ctx.fillText(`${st.S.toFixed(1)}`, x > gx + gw - 60 ? x - 4 : x + 6, y1 + rowH / 2 + 4);

    // 비율 막대: 항상 같은 모양
    x = gx;
    ctx.font = `${small ? 10 : 11}px ${F.mono}`;
    IONS.forEach((ion) => {
      const ww = ion.f * gw;
      ctx.fillStyle = ion.c; ctx.fillRect(x, y2, ww, rowH);
      if (ww > (small ? 34 : 44)) {
        ctx.fillStyle = "#fff"; ctx.textAlign = "center";
        ctx.fillText(ion.n, x + ww / 2, y2 + rowH / 2 - (small ? 1 : 2));
        ctx.fillText(`${(ion.f * 100).toFixed(1)}`, x + ww / 2, y2 + rowH / 2 + (small ? 10 : 11));
      }
      x += ww;
    });
    ctx.strokeStyle = C.ink; ctx.strokeRect(gx + .5, y2 + .5, gw - 1, rowH - 1);
    // 작은 성분 범례
    const ly = y2 + rowH + 18;
    ctx.textAlign = "left"; ctx.font = `10px ${F.mono}`;
    let lx = gx;
    IONS.slice(3).forEach((ion) => {
      const t = `${ion.n} ${(ion.f * 100).toFixed(1)}`;
      const tw = ctx.measureText(t).width;
      if (lx + tw + 14 > gx + gw) return;
      ctx.fillStyle = ion.c; ctx.fillRect(lx, ly - 8, 8, 8);
      ctx.fillStyle = C.ink2; ctx.fillText(t, lx + 11, ly);
      lx += tw + 22;
    });
  }

  function update() {
    const st = state();
    oE.textContent = st.E; oR.textContent = st.P; oI.textContent = st.I;
    nS.textContent = `${st.S.toFixed(1)} psu`;
    nCl.textContent = (st.S * IONS[0].f).toFixed(2);
    nPct.textContent = `${(IONS[0].f * 100).toFixed(1)} %`;
    draw();
  }
  [sE, sR, sI].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [e, r, i] = b.dataset.set.split(",");
    sE.value = e; sR.value = r; sI.value = i; update();
  }));
  update();
})();
