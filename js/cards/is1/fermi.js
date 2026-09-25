/* 카드 1.3.3: 운동장의 모래알은 몇 개일까? — 페르미 추정과 요소별 민감도 (모식) */
(() => {
  const root = document.getElementById("card-is1-fermi");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sA = $(".a"), sD = $(".d"), sS = $(".s"), sF = $(".f");
  const oA = $(".aO"), oD = $(".dO"), oS = $(".sO"), oF = $(".fO");
  const dN = $(".nOut"), dO = $(".oom"), dTop = $(".topf");

  // 그럴듯한 범위 [낮게, 높게]와 결과에 들어가는 지수
  const RANGE = [
    { name: "운동장 넓이", lo: 5000, hi: 10000, p: 1 },
    { name: "모래층 깊이", lo: 5, hi: 20, p: 1 },
    { name: "알갱이 비율", lo: 0.55, hi: 0.65, p: 1 },
    { name: "모래알 지름", lo: 0.25, hi: 1, p: -3 },
  ];
  const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const pow = (n) => "10" + String(n).split("").map((c) => SUP[c]).join("");
  const sci = (v) => { const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(1)} × ${pow(e)}`; };

  const count = (A, dcm, dmm, f) => A * (dcm / 100) * f / (Math.PI / 6 * (dmm / 1000) ** 3);
  const vals = () => ({ A: +sA.value, d: +sD.value, s: 10 ** +sS.value, f: +sF.value });

  const { ctx, size } = fit(cv, () => draw());

  function update() {
    const v = vals();
    oA.textContent = v.A.toLocaleString("ko-KR"); oD.textContent = v.d;
    oS.textContent = v.s < 1 ? v.s.toFixed(2) : v.s.toFixed(1); oF.textContent = v.f.toFixed(2);
    const N = count(v.A, v.d, v.s, v.f);
    dN.textContent = sci(N) + "개";
    dO.textContent = pow(Math.round(Math.log10(N))) + "개 정도";
    dTop.textContent = "모래알 지름";
    draw();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = vals(), N = count(v.A, v.d, v.s, v.f);
    const narrow = w < 480;

    // ── 위: 로그 수직선 (10⁹ ~ 10¹⁶)
    const L0 = 9, L1 = 16, x0 = 16, x1 = w - 16, ay = Math.round(h * 0.2);
    const X = (l) => x0 + (l - L0) / (L1 - L0) * (x1 - x0);
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText("어림한 모래알 수", x0, 18);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, ay + .5); ctx.lineTo(x1, ay + .5); ctx.stroke();
    ctx.font = `${narrow ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let k = L0; k <= L1; k++) {
      ctx.beginPath(); ctx.moveTo(X(k) + .5, ay - 5); ctx.lineTo(X(k) + .5, ay + 5); ctx.stroke();
      ctx.fillText(pow(k), X(k), ay + 19);
    }
    // 범위 띠: 모든 요소를 범위 양 끝으로 (가장 적게 ~ 가장 많게)
    const nLo = count(5000, 5, 1, 0.55), nHi = count(10000, 20, 0.25, 0.65);
    ctx.fillStyle = "rgba(116,171,102,.28)";
    ctx.fillRect(X(Math.log10(nLo)), ay - 8, X(Math.log10(nHi)) - X(Math.log10(nLo)), 16);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.forest; ctx.textAlign = "center";
    ctx.fillText("모든 요소를 범위 양 끝으로 바꿨을 때", (X(Math.log10(nLo)) + X(Math.log10(nHi))) / 2, ay + 36);
    const lx = X(Math.max(L0, Math.min(L1, Math.log10(N))));
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(lx, ay - 3); ctx.lineTo(lx - 6, ay - 14); ctx.lineTo(lx + 6, ay - 14); ctx.closePath(); ctx.fill();
    ctx.font = `600 11.5px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(sci(N), Math.min(Math.max(lx, x0 + 44), x1 - 44), ay - 19);

    // ── 아래: 요소별로 결과가 몇 배 흔들리는지
    const by = ay + 62;
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText("각 요소가 결과를 몇 배 흔드는가", x0, by);
    const fac = RANGE.map((r) => ({ ...r, k: (r.hi / r.lo) ** Math.abs(r.p) }));
    const maxL = Math.log10(64) * 1.08, lab = narrow ? 76 : 92, bx = x0 + lab, bw = x1 - bx - 64;
    const rh = Math.min(30, (h - by - 16) / 4);
    fac.forEach((r, i) => {
      const y = by + 12 + i * rh;
      ctx.font = `${narrow ? 11 : 12}px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      ctx.fillText(r.name, x0, y + rh * 0.5 + 4);
      const len = Math.max(2, Math.log10(r.k) / maxL * bw);
      ctx.fillStyle = r.p === -3 ? C.warn : "rgba(35,35,38,.55)";
      ctx.fillRect(bx, y + rh * 0.2, len, rh * 0.6);
      ctx.font = `500 11.5px ${F.mono}`; ctx.fillStyle = C.ink;
      const rng = r.name === "모래알 지름" ? `${r.lo}~${r.hi} mm, 세제곱` : r.name === "운동장 넓이" ? "5천~1만 m²" : r.name === "모래층 깊이" ? "5~20 cm" : "0.55~0.65";
      ctx.fillText(`${r.k < 1.5 ? r.k.toFixed(2) : Math.round(r.k)}배`, bx + len + 6, y + rh * 0.5 + 4);
      if (!narrow) { ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(rng, x1, y + rh * 0.5 + 4); }
    });
  }

  [sA, sD, sS, sF].forEach((el) => el.addEventListener("input", update));
  update();
})();
