/* 카드: 색이 바뀌었다 되돌아오는 반응 — 염화 코발트 수화, 황산 구리 수화열, 시온 안료 */
(() => {
  const root = document.getElementById("card-chem-color-rev");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  let sys = "co", frac = 1, water = 0, flips = 0, lastSide = null, warm = 0;
  const mix = (a, b, u) => `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * u)).join(",")})`;
  const EQ = { co: "CoCl₂ (파랑) + 6H₂O ⇌ CoCl₂·6H₂O (분홍)", cu: "CuSO₄ (흰색) + 5H₂O ⇌ CuSO₄·5H₂O (파랑) + 열", leuco: "염료 + 현색제 (색) ⇌ 염료 + 현색제 떨어짐 (무색)" };
  // 평형에서 '수화(색 있음)' 쪽 비율
  function target() {
    const T = +$(".t").value, RH = +$(".h").value / 100;
    if (sys === "co") return 1 / (1 + Math.exp((T - 25) / 9 - (RH - 0.35) * 8));
    if (sys === "cu") return water > 0 ? 1 / (1 + Math.exp((T - 100) / 6)) : Math.min(frac, 1 / (1 + Math.exp((T - 100) / 6)));
    return 1 / (1 + Math.exp((T - 31) / 1.5));
  }
  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const u = frac;
    const col = sys === "co" ? mix([60, 110, 200], [230, 140, 170], u) : sys === "cu" ? mix([245, 245, 240], [60, 130, 210], u) : mix([250, 250, 250], [40, 40, 120], u);
    const cx = w * 0.3, cy = h * 0.5;
    if (sys === "co") { ctx.fillStyle = col; ctx.fillRect(cx - 70, cy - 40, 140, 80); ctx.strokeStyle = C.rule; ctx.strokeRect(cx - 70, cy - 40, 140, 80); }
    else if (sys === "cu") { ctx.fillStyle = "#ddd"; ctx.beginPath(); ctx.ellipse(cx, cy + 30, 80, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = col; for (let k = 0; k < 40; k++) { const a = k * 2.4, r = 50 * Math.sqrt(k / 40); ctx.fillRect(cx + Math.cos(a) * r - 4, cy + 26 + Math.sin(a) * r * 0.25 - 4, 8, 6); } if (warm > 0.05) { ctx.fillStyle = `rgba(214,80,40,${warm})`; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("따뜻해짐 (발열)", cx, cy - 20); } }
    else { ctx.fillStyle = "#f4f4f6"; ctx.beginPath(); ctx.moveTo(cx - 45, cy - 50); ctx.lineTo(cx + 45, cy - 50); ctx.lineTo(cx + 36, cy + 50); ctx.lineTo(cx - 36, cy + 50); ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.ink3; ctx.stroke(); ctx.fillStyle = col; ctx.font = `600 22px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("★ 나뭇잎 ★", cx, cy + 6); }
    ctx.fillStyle = C.ink; ctx.font = `12px ${F.sans}`; ctx.textAlign = "left";
    const tx = w * 0.55; ctx.fillText(EQ[sys], tx, 30, w - tx - 8);
    // 막대: 두 상태 비율
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText(sys === "leuco" ? "색 있음" : "수화물", tx, 60); ctx.fillStyle = col; ctx.fillRect(tx, 66, (w - tx - 16) * u, 14); ctx.strokeStyle = C.rule; ctx.strokeRect(tx, 66, w - tx - 16, 14);
    ctx.fillStyle = C.ink3; ctx.fillText(`${Math.round(u * 100)}%`, tx, 96);
  }
  function stateName() { const u = frac; if (sys === "co") return u > 0.6 ? "분홍 (수화)" : u < 0.4 ? "파랑 (무수)" : "보라 (중간)"; if (sys === "cu") return u > 0.6 ? "파랑 (오수화물)" : u < 0.4 ? "흰색 (무수)" : "연한 파랑"; return u > 0.5 ? "그림 보임" : "그림 사라짐"; }
  loop($("canvas"), (dt) => {
    const tg = target(); frac += (tg - frac) * Math.min(1, dt * 1.5);
    if (sys === "cu" && water > 0) { water -= dt * 0.1; }
    warm *= 0.97;
    const side = frac > 0.6 ? 1 : frac < 0.4 ? 0 : lastSide;
    if (side !== null && lastSide !== null && side !== lastSide) flips++;
    if (side !== null) lastSide = side;
    $(".n-s").textContent = stateName(); $(".n-c").textContent = flips;
    $(".n-d").textContent = Math.abs(tg - frac) < 0.02 ? "평형 (양쪽 속도 같음)" : tg > frac ? (sys === "leuco" ? "결합 (색 생김)" : "정반응 (수화)") : (sys === "leuco" ? "분리 (색 사라짐)" : "역반응 (탈수)");
    draw();
  });
  const upd = () => { $(".t-out").textContent = $(".t").value; $(".h-out").textContent = $(".h").value; };
  root.querySelectorAll("input").forEach((el) => el.addEventListener("input", upd));
  $(".drop").addEventListener("click", () => { if (sys === "cu") { if (frac < 0.5) warm = 0.9; water = 1; } else if (sys === "co") { $(".h").value = 95; upd(); } });
  $(".sys").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; sys = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); $(".hum-wrap").hidden = sys !== "co"; $(".drop").hidden = sys === "leuco"; flips = 0; lastSide = null; frac = sys === "cu" ? 1 : target(); water = sys === "cu" ? 1 : 0; });
  upd();
})();
