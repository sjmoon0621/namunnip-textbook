/* 카드: 세 시험관의 평형 이동 — 크로뮴산/다이크로뮴산(H⁺, OH⁻), NO₂/N₂O₄(온도, 압력), 코발트 착이온(온도, Cl⁻, 물) */
(() => {
  const root = document.getElementById("card-chem-shift-lab");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  // 각 반응계: 반응식, 반응물 색, 생성물 색, 조작 [이름, 방향(+1 정반응, -1 역반응), 설명, 일시적 효과]
  const SYS = {
    cr: { eq: "2CrO₄²⁻ (노랑) + 2H⁺ ⇌ Cr₂O₇²⁻ (주황) + H₂O", a: [245, 210, 40], b: [235, 120, 30], safe: "크로뮴(VI): 발암성 · 장갑", waste: "중금속 폐액",
      acts: [["묽은 염산 몇 방울", 1, "H⁺가 늘어 이를 소비하는 정반응 쪽으로 이동해 주황이 됩니다."], ["묽은 NaOH 몇 방울", -1, "OH⁻가 H⁺와 중화해 H⁺가 줄어드니 역반응 쪽으로 이동해 노랑이 됩니다."], ["물을 조금 더 넣기", 0, "묽은 용액에서 물의 양 변화는 평형을 거의 움직이지 않습니다. 색이 조금 옅어지는 것은 묽어졌기 때문입니다."]] },
    no2: { eq: "2NO₂ (적갈색) ⇌ N₂O₄ (무색),  ΔH < 0", a: [150, 60, 30], b: [245, 240, 230], safe: "NO₂: 독성 기체 · 밀봉", waste: "밀봉 시료 반납",
      acts: [["얼음물에 담그기", 1, "온도가 내려가면 발열 반응인 정반응 쪽으로 이동해 색이 옅어집니다."], ["뜨거운 물에 담그기", -1, "온도가 오르면 흡열 쪽인 역반응으로 이동해 색이 진해집니다."], ["주사기를 눌러 압력 높이기", 1, "기체 분자 수가 줄어드는 정반응 쪽으로 이동합니다. 누르는 순간에는 농도가 높아져 잠깐 진해졌다가 옅어집니다.", "press"]] },
    co: { eq: "[Co(H₂O)₆]²⁺ (분홍) + 4Cl⁻ ⇌ [CoCl₄]²⁻ (파랑) + 6H₂O,  ΔH > 0", a: [235, 140, 170], b: [40, 80, 190], safe: "코발트: 발암 가능 · 장갑", waste: "중금속 폐액",
      acts: [["뜨거운 물에 담그기", 1, "흡열 반응인 정반응 쪽으로 이동해 파래집니다."], ["얼음물에 담그기", -1, "발열 쪽인 역반응으로 이동해 분홍이 됩니다."], ["진한 염산(Cl⁻) 넣기", 1, "Cl⁻가 늘어 이를 소비하는 정반응 쪽으로 이동해 파래집니다."], ["물 많이 넣기", -1, "물이 늘어 역반응 쪽으로 이동해 분홍이 됩니다."]] },
  };
  let sys = "cr", x = { cr: 0.3, no2: 0.5, co: 0.3 }, target = { ...x }, pending = null, pred = null, right = 0, tried = 0, flash = 0;
  const mix = (a, b, u, alpha) => `rgba(${a.map((v, i) => Math.round(v + (b[i] - v) * u)).join(",")},${alpha ?? 0.9})`;
  function renderActs() {
    const s = SYS[sys]; $(".eq-line").textContent = s.eq;
    $(".acts").innerHTML = '<span class="mono small dim">조작</span>' + s.acts.map((a, i) => `<button class="chip" data-a="${i}">${a[0]}</button>`).join("");
    $(".n-safe").textContent = s.safe; $(".n-w").textContent = s.waste;
  }
  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = SYS[sys];
    [["처음 (대조)", 0.5 === 0.5 ? (sys === "no2" ? 0.5 : 0.3) : 0], ["조작한 시험관", x[sys]]].forEach(([n, u], i) => {
      const cx = w * (0.3 + i * 0.35), top = 20, bot = h - 30, tw = 54;
      const alpha = sys === "no2" ? 0.15 + 0.75 * (1 - u) * (i === 1 ? 1 + flash : 1) : 0.9;
      ctx.fillStyle = sys === "no2" ? `rgba(150,60,30,${Math.min(0.95, alpha)})` : mix(s.a, s.b, u);
      ctx.fillRect(cx - tw / 2, top + 30, tw, bot - top - 30);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - tw / 2, top); ctx.lineTo(cx - tw / 2, bot - 10); ctx.quadraticCurveTo(cx, bot + 12, cx + tw / 2, bot - 10); ctx.lineTo(cx + tw / 2, top); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(n, cx, bot + 22);
    });
  }
  loop($("canvas"), (dt) => { x[sys] += (target[sys] - x[sys]) * Math.min(1, dt * 1.2); flash *= 0.95; draw(); });
  root.addEventListener("click", (e) => {
    const s = e.target.closest("[data-s]"), a = e.target.closest("[data-a]"), p = e.target.closest("[data-p]");
    if (s) { sys = s.dataset.s; root.querySelectorAll("[data-s]").forEach((y) => y.setAttribute("aria-pressed", String(y === s))); renderActs(); $(".verdict").textContent = ""; pending = null; }
    if (a) { pending = +a.dataset.a; root.querySelectorAll("[data-a]").forEach((y) => y.setAttribute("aria-pressed", String(y === a))); $(".verdict").textContent = "결과를 먼저 예측해 보세요 (정반응/역반응/변화 없음)."; $(".verdict").className = "verdict small"; }
    if (p && pending !== null) {
      const act = SYS[sys].acts[pending], dir = act[1], guess = { f: 1, r: -1, n: 0 }[p.dataset.p];
      tried++; if (guess === dir) right++;
      target[sys] = Math.max(0.05, Math.min(0.95, (sys === "no2" ? 0.5 : 0.3) + dir * 0.4));
      if (act[3] === "press") flash = 0.6;
      $(".verdict").textContent = `${guess === dir ? "예측이 맞았습니다." : "예측과 달랐습니다."} ${act[2]}`; $(".verdict").className = "verdict small " + (guess === dir ? "good" : "bad");
      $(".n-s").textContent = `${right} / ${tried}`; pending = null;
    }
  });
  renderActs(); draw();
})();
