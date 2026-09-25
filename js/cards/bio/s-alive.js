/* 카드: 바이러스는 생물일까? — 생물의 특성 여섯 가지로 여러 대상을 따져 보기 */
(() => {
  const root = document.getElementById("card-bio-alive");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");

  const LAB = [["세포"], ["물질대사"], ["자극 반응", "항상성"], ["발생", "생장"], ["생식", "유전"], ["적응", "진화"]];
  const PN = ["세포로 이루어짐", "물질대사", "자극에 대한 반응과 항상성", "발생과 생장", "생식과 유전", "적응과 진화"];
  const ST = ["없음", "조건부·일부", "있음"];
  // v: 0 없음, 1 조건부·일부, 2 있음
  const D = {
    ecoli: { name: ["대장균"], v: [2, 2, 2, 2, 2, 2], t: [
      "세포 하나로 된 단세포 생물입니다. 세포막 안에 DNA와 리보솜이 있습니다.",
      "스스로 효소를 만들어 양분을 분해하고, 그 에너지로 ATP를 만듭니다.",
      "양분이 많은 쪽으로 헤엄쳐 가고, 해로운 물질에서는 멀어집니다.",
      "세포가 자라 일정한 크기가 되면 둘로 나뉩니다. 다세포 생물 같은 발생 과정은 없지만 생장은 합니다.",
      "분열할 때 DNA를 복제해 두 딸세포에 물려줍니다. 조건이 좋으면 약 20분마다 한 번씩 분열합니다.",
      "항생제를 쓰면 우연히 내성을 가진 균이 살아남아 늘어납니다. 세대를 거치며 집단의 성질이 바뀝니다."] },
    mule: { name: ["노새"], v: [2, 2, 2, 2, 1, 0], t: [
      "수많은 세포로 된 다세포 생물입니다.",
      "먹은 양분을 소화하고 세포 호흡으로 에너지를 얻습니다.",
      "체온과 혈당을 일정하게 유지하고, 소리와 통증에 반응합니다.",
      "수정란에서 발생해 새끼로 태어나고 자랍니다.",
      "말(염색체 64개)과 당나귀(62개) 사이에서 태어나 염색체가 63개입니다. 생식세포를 제대로 만들지 못해 거의 모두 새끼를 낳지 못합니다. 유전 정보는 부모에게서 받았지만 물려주지는 못합니다.",
      "진화는 개체가 아니라 개체군이 세대를 거치며 겪는 변화입니다. 자손을 남기지 못하는 노새는 그 흐름에 참여하지 못합니다. 그래도 노새는 분명히 살아 있습니다."] },
    vout: { name: ["바이러스", "세포 밖"], v: [0, 0, 0, 0, 1, 1], t: [
      "단백질 껍질 안에 핵산이 든 입자입니다. 세포막도, 세포질도 없습니다.",
      "효소와 리보솜이 없어 스스로 물질을 합성하거나 분해하지 못합니다. 1935년에는 담배 모자이크 바이러스를 결정으로 만들기도 했습니다.",
      "주변 환경에 반응하거나 내부 상태를 조절하지 않습니다.",
      "입자의 크기가 자라지 않습니다.",
      "유전 물질(DNA 또는 RNA)은 가지고 있습니다. 하지만 세포 밖에서는 복제되지 않습니다.",
      "세포 밖에서는 변하지 않습니다. 변이는 숙주 세포 안에서 복제될 때 생깁니다."] },
    vin: { name: ["바이러스", "숙주 세포 안"], v: [0, 1, 0, 0, 2, 2], t: [
      "여전히 세포가 아닙니다. 숙주 세포 안에서 핵산과 단백질이 부품 상태로 흩어져 있습니다.",
      "바이러스 단백질이 합성되지만, 그 일을 하는 리보솜과 효소, 에너지(ATP)는 모두 숙주 세포의 것입니다.",
      "스스로 상태를 조절하는 장치가 없습니다.",
      "부품을 따로 만들어 조립합니다. 작게 생겨나 자라는 과정이 아닙니다.",
      "핵산을 복제해 한 세포에서 수십~수천 개의 새 바이러스를 만들고, 유전 정보를 그대로 물려줍니다.",
      "복제할 때 돌연변이가 생기고, 면역이나 약을 피하는 변이가 살아남아 늘어납니다. 독감 백신을 해마다 새로 만드는 까닭입니다."] },
    rock: { name: ["종유석"], v: [0, 0, 0, 1, 0, 0], t: [
      "탄산 칼슘 결정이 쌓인 암석입니다.",
      "스스로 물질을 분해하거나 합성하지 않습니다. 물에 녹아 있던 탄산 칼슘이 저절로 가라앉을 뿐입니다.",
      "환경에 반응하거나 상태를 유지하는 조절이 없습니다.",
      "커지기는 하지만 바깥에 광물이 덧붙는 것입니다. 생물은 흡수한 물질로 제 몸을 만들어 안에서부터 자랍니다.",
      "스스로 복제하지 않고, 물려줄 유전 정보도 없습니다.",
      "유전 정보가 없으니 세대를 거쳐 변해 갈 것도 없습니다."] },
    fire: { name: ["촛불"], v: [0, 1, 0, 1, 1, 0], t: [
      "타고 있는 기체와 그을음 입자일 뿐, 세포 구조가 없습니다.",
      "산소를 쓰고 이산화 탄소와 물, 열을 내놓습니다. 세포 호흡과 전체 반응은 비슷하지만 효소 없이 한꺼번에 타고, 조절되지 않습니다.",
      "바람에 흔들리지만, 흔들린 상태를 스스로 되돌리는 조절은 없습니다.",
      "연료가 충분하면 커지지만, 제 몸을 이루는 물질을 스스로 만들지는 않습니다.",
      "불똥이 튀어 다른 곳에 불을 붙일 수 있습니다. 하지만 물려줄 유전 정보가 없습니다.",
      "유전 정보가 없으니 세대를 거쳐 변해 갈 것도 없습니다."] },
  };
  let cur = "vout", sel = 1;

  const VW = 400, VH = 300, CX = 200, CY = 152, R = 140, R0 = 46;
  const ang = (i) => -Math.PI / 2 + i * Math.PI / 3;
  const { ctx, size } = fit(cv, () => draw());

  let hatch = null;
  function pattern() {
    if (hatch) return hatch;
    const p = document.createElement("canvas"); p.width = p.height = 8;
    const g = p.getContext("2d");
    g.fillStyle = "#f6e7c4"; g.fillRect(0, 0, 8, 8);
    g.strokeStyle = C.amber; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-2, 10); g.lineTo(10, -2); g.moveTo(-2, 2); g.lineTo(2, -2); g.moveTo(6, 10); g.lineTo(10, 6); g.stroke();
    return (hatch = ctx.createPattern(p, "repeat"));
  }

  function draw() {
    const { w, h } = size;
    if (!w) return;
    const s = Math.min(w / VW, h / VH);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dpr = cv.width / w;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (w - VW * s) / 2, dpr * (h - VH * s) / 2);
    const d = D[cur];
    for (let i = 0; i < 6; i++) {
      const a0 = ang(i) - Math.PI / 6 + 0.025, a1 = ang(i) + Math.PI / 6 - 0.025;
      ctx.beginPath(); ctx.arc(CX, CY, R, a0, a1); ctx.arc(CX, CY, R0, a1, a0, true); ctx.closePath();
      const v = d.v[i];
      ctx.fillStyle = v === 2 ? C.forest : v === 1 ? pattern() : C.card;
      ctx.fill();
      ctx.lineWidth = i === sel ? 2.5 : 1;
      ctx.strokeStyle = i === sel ? C.ink : v ? "rgba(35,35,38,.25)" : C.rule;
      if (!v && i !== sel) ctx.setLineDash([4, 3]);
      ctx.stroke(); ctx.setLineDash([]);
      const mr = (R + R0) / 2 + 4, x = CX + mr * Math.cos(ang(i)), y = CY + mr * Math.sin(ang(i));
      ctx.fillStyle = v === 2 ? "#fff" : v === 1 ? "#6b4a0c" : C.ink3;
      ctx.font = `600 15px ${F.sans}`; ctx.textAlign = "center";
      const L = LAB[i];
      L.forEach((t, k) => ctx.fillText(t, x, y + 5 + (k - (L.length - 1) / 2) * 17));
    }
    // 가운데 이름
    ctx.beginPath(); ctx.arc(CX, CY, R0 - 4, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill();
    ctx.fillStyle = C.ink; ctx.textAlign = "center";
    const n = d.name;
    ctx.font = `700 ${n.length > 1 ? 12 : 14}px ${F.sans}`;
    ctx.fillText(n[0], CX, CY + (n.length > 1 ? -2 : 5));
    if (n.length > 1) { ctx.font = `500 9.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText(n[1], CX, CY + 12); }
    // 범례
    ctx.textAlign = "left"; ctx.font = `11px ${F.mono}`;
    const leg = [[C.forest, "있음"], [pattern(), "조건부·일부"], [C.card, "없음"]];
    leg.forEach(([c, t], k) => {
      const y = 16 + k * 17;
      ctx.fillStyle = c; ctx.fillRect(4, y - 9, 12, 12);
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(4.5, y - 8.5, 11, 11);
      ctx.fillStyle = C.ink2; ctx.fillText(t, 21, y + 1);
    });
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
    ctx.fillText("부채꼴을 누르면", VW - 4, VH - 22); ctx.fillText("근거가 나옵니다", VW - 4, VH - 7);
    ctx.textAlign = "left";
  }

  function update() {
    const d = D[cur];
    root.querySelectorAll("[data-obj]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.obj === cur));
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.p === sel));
    [0, 1, 2].forEach((k) => ($(`.n${k}`).textContent = d.v.filter((v) => v === k).length));
    $(".note").innerHTML = `<b>${d.name.join(" · ")} — ${PN[sel]}: ${ST[d.v[sel]]}</b>${d.t[sel]}`;
    draw();
  }
  root.querySelectorAll("[data-obj]").forEach((b) => b.addEventListener("click", () => { cur = b.dataset.obj; update(); }));
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { sel = +b.dataset.p; update(); }));
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), { w, h } = size;
    const s = Math.min(w / VW, h / VH);
    const x = (e.clientX - r.left - (w - VW * s) / 2) / s - CX, y = (e.clientY - r.top - (h - VH * s) / 2) / s - CY;
    const rr = Math.hypot(x, y);
    if (rr < R0 || rr > R + 6) return;
    let a = Math.atan2(y, x) + Math.PI / 2 + Math.PI / 6;
    a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    sel = Math.floor(a / (Math.PI / 3)) % 6; update();
  });
  update();
})();
