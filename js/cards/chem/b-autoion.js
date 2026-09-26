/* 카드: 순수한 물에도 이온이 있을까? — 25 °C 순수한 물을 확대하며 H₃O⁺ 세기 */
(() => {
  const root = document.getElementById("card-chem-autoion");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sL = $(".len"), oL = $(".len-out");
  const dW = $(".n-w"), dH = $(".n-h"), dO = $(".n-oh"), msg = $(".msg");
  const NA = 6.022e23, CW = 55.5, CH = 1.0e-7;
  // 한 변의 길이(로그, m)와 비교 대상
  const REF = [[-2, "각설탕 한 개"], [-3, "모래알 한 개"], [-4, "머리카락 굵기"], [-5, "적혈구 하나"], [-6, "세균 하나"], [-7, "바이러스 하나"], [-8, "단백질 분자 하나"]];

  const sup = (e) => String(e).split("").map((c) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]).join("");
  const sci = (v) => {
    if (v < 1e-3) return v.toExponential(1).replace(/e([+-]\d+)/, (_, e) => `×10${sup(+e)}`);
    if (v < 10) return v.toFixed(v < 1 ? 2 : 1);
    if (v < 1e5) return Math.round(v).toLocaleString("en-US");
    const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(1)}×10${sup(e)}`;
  };
  const pr = (v) => String(+v.toPrecision(2));
  const lenTxt = (l) => { const m = 10 ** l; return m >= 0.99e-2 ? `${pr(m * 100)} cm` : m >= 0.99e-3 ? `${pr(m * 1000)} mm` : m >= 0.99e-6 ? `${pr(m * 1e6)} μm` : `${pr(m * 1e9)} nm`; };

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const l = +sL.value, V = (10 * 10 ** l) ** 3; // L
    const nW = CW * NA * V, nI = CH * NA * V;
    const split = Math.round(w * 0.36);
    // ── 정육면체
    const s = Math.min(split - 50, h - 90), cx = split / 2 - 8, cy = h / 2 + 4, d = s * 0.28;
    ctx.fillStyle = "rgba(90,150,210,.16)"; ctx.strokeStyle = "#5a96d2"; ctx.lineWidth = 1.3;
    const x0 = cx - s / 2, y0 = cy - s / 2 + d / 2;
    ctx.beginPath(); ctx.rect(x0, y0, s, s); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + d, y0 - d); ctx.lineTo(x0 + s + d, y0 - d); ctx.lineTo(x0 + s, y0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 + s, y0); ctx.lineTo(x0 + s + d, y0 - d); ctx.lineTo(x0 + s + d, y0 + s - d); ctx.lineTo(x0 + s, y0 + s); ctx.closePath(); ctx.fill(); ctx.stroke();
    // 이온: 기대 개수가 적을 때만 점으로 그린다
    if (nI < 60) {
      let seed = Math.round(-l * 1000) + 11; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const k = Math.floor(nI) + (r() < nI - Math.floor(nI) ? 1 : 0);
      for (let i = 0; i < k; i++) {
        ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(x0 + 6 + r() * (s - 12), y0 + 6 + r() * (s - 12), 3, 0, 7); ctx.fill();
        ctx.fillStyle = "#3d6fb6"; ctx.beginPath(); ctx.arc(x0 + 6 + r() * (s - 12), y0 + 6 + r() * (s - 12), 3, 0, 7); ctx.fill();
      }
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText(`한 변 ${lenTxt(l)}`, x0 + s / 2, y0 + s + 16);
    const ref = REF.reduce((a, b) => Math.abs(b[0] - l) < Math.abs(a[0] - l) ? b : a);
    ctx.fillStyle = C.ink3; ctx.fillText(Math.abs(ref[0] - l) < 0.35 ? `≈ ${ref[1]} 크기` : " ", x0 + s / 2, y0 + s + 31);
    if (nI < 60) { ctx.fillText("빨강 H₃O⁺ · 파랑 OH⁻ (한 순간의 예)", x0 + s / 2, 14); }

    // ── 로그 막대: 개수
    const gx = split + 70, gy = 26, gw = w - gx - 14, rows = [["H₂O", nW, "#5a96d2"], ["H₃O⁺", nI, C.apple], ["OH⁻", nI, "#3d6fb6"]];
    const E0 = -2, E1 = 24, X = (v) => gx + (Math.log10(Math.max(v, 10 ** E0)) - E0) / (E1 - E0) * gw;
    const rh = (h - gy - 40) / 3;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: rh * 3, X: (e) => gx + (e - E0) / (E1 - E0) * gw, Y: (v) => v, xt: [0, 6, 12, 18, 24].map((e) => [e, e === 0 ? "1" : `10${sup(e)}`]), yt: [], xlabel: "개수 (로그 눈금)" });
    rows.forEach(([name, v, col], i) => {
      const y = gy + i * rh + rh * 0.25, bh = rh * 0.5;
      ctx.fillStyle = col; ctx.fillRect(gx, y, Math.max(0, X(v) - gx), bh);
      ctx.fillStyle = C.ink; ctx.textAlign = "right"; ctx.font = `12px ${F.mono}`; ctx.fillText(name, gx - 8, y + bh / 2 + 4);
      ctx.textAlign = X(v) > gx + gw - 80 ? "right" : "left"; ctx.fillStyle = X(v) > gx + gw - 80 ? "#fff" : C.ink2; ctx.font = `10.5px ${F.mono}`;
      ctx.fillText(sci(v), X(v) > gx + gw - 80 ? X(v) - 6 : Math.max(X(v), gx) + 6, y + bh / 2 + 4);
    });
    ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("1 기준선 왼쪽 = 평균 1개 미만", gx, gy - 8);
  }

  function update() {
    const l = +sL.value, V = (10 * 10 ** l) ** 3, nW = CW * NA * V, nI = CH * NA * V;
    oL.textContent = lenTxt(l);
    dW.textContent = sci(nW); dH.textContent = sci(nI); dO.textContent = sci(nI);
    msg.textContent = nI >= 1e4 ? "이온은 분명히 있지만, 물 분자 약 5억 5천만 개 가운데 H₃O⁺는 1개꼴입니다."
      : nI >= 1 ? `이 작은 물방울 속 이온은 ${nI < 10 ? "몇" : "수십"} 개뿐입니다. 이온은 생겼다 사라지기를 끊임없이 되풀이하므로, 개수는 순간마다 조금씩 달라집니다.`
      : `평균 ${nI.toFixed(nI < 0.01 ? 4 : 2)}개. 대부분의 순간에 이 상자 속에는 이온이 하나도 없습니다.`;
    draw();
  }
  sL.addEventListener("input", update);
  root.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => { sL.value = b.dataset.l; update(); }));
  update();
})();
