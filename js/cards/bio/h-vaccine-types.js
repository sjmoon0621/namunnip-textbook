/* 카드: 백신 종류는 무엇이 다를까? — 몸에 넣는 것과 그다음에 일어나는 일 (모식 그림) */
(() => {
  const root = document.getElementById("card-bio-vtypes");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), msg = $(".vt-msg"), nRep = $(".rep"), nMake = $(".make"), nWho = $(".who");

  const V = {
    live: { name: "약독화 생백신", ex: "홍역·볼거리·풍진(MMR), 수두, 결핵(BCG)", rep: "한다 (아주 약하게)", make: "병원체가 늘어나며 만든다", who: "면역이 약한 사람·임신부는 대개 맞지 않는다",
      note: "병을 일으키는 힘을 약하게 만든 살아 있는 병원체를 넣습니다. 몸속에서 조금 늘어나므로 실제 감염과 비슷한 강한 면역이 생기지만, 면역이 약한 사람에게는 위험할 수 있습니다." },
    dead: { name: "불활성화 백신", ex: "일본뇌염(불활성화), 소아마비(IPV), A형 간염", rep: "하지 않는다", make: "넣어 준 병원체 자체가 항원", who: "대부분 맞을 수 있다",
      note: "열이나 약품으로 죽인 병원체를 통째로 넣습니다. 늘어나지 않아 안전하지만 면역이 약하게 생겨, 여러 번 맞거나 추가 접종이 필요한 경우가 많습니다." },
    sub: { name: "단백질(재조합) 백신", ex: "B형 간염, 사람유두종바이러스(HPV)", rep: "하지 않는다", make: "넣어 준 단백질 조각이 항원", who: "대부분 맞을 수 있다",
      note: "병원체 전체가 아니라 항체가 알아볼 표면 단백질 조각만 넣습니다. 유전 물질이 없어 감염될 수 없고, 면역을 돕는 물질(면역 증강제)을 함께 넣는 경우가 많습니다." },
    mrna: { name: "mRNA 백신", ex: "코로나19 백신 일부 (2020년 첫 승인)", rep: "하지 않는다", make: "내 세포가 mRNA를 읽어 만든다", who: "대부분 맞을 수 있다",
      note: "항원 단백질의 설계도(mRNA)를 지질 막에 싸서 넣습니다. 내 세포가 이 설계도로 항원 단백질을 잠깐 만들고, mRNA는 며칠 안에 분해됩니다. 세포핵으로 들어가 DNA를 바꾸지 않습니다." },
  };
  let key = "live", t = 0;

  const { ctx, size } = fit(cv, () => draw());

  const virus = (x, y, r, alive, alpha = 1) => {
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = alive ? "#c9463d" : "#9a9a9a";
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25, r * 0.22, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    if (!alive) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - r * .5, y - r * .5); ctx.lineTo(x + r * .5, y + r * .5); ctx.moveTo(x + r * .5, y - r * .5); ctx.lineTo(x - r * .5, y + r * .5); ctx.stroke(); }
    ctx.restore();
  };
  const spike = (x, y, r, col = "#c9463d") => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - r * .25, y + r * .6, r * .5, r * 1.2); };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = V[key];
    // 네 단계: 넣는 것 → 몸속에서 → 면역 세포가 항원을 봄 → 기억 세포
    const cols = 4, cw = (w - 16) / cols, top = 30, midY = h * 0.48;
    const heads = ["① 넣는 것", "② 몸속에서", "③ 면역 세포", "④ 기억 세포"];
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center";
    heads.forEach((s, i) => { ctx.fillStyle = C.ink2; ctx.fillText(s, 8 + cw * (i + .5), top - 10); });
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let i = 1; i < cols; i++) { const x = 8 + cw * i; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, h - 40); ctx.stroke(); }
    const r = Math.min(cw * 0.12, 14), ph = (t % 4) / 4;
    // ① 넣는 것
    const c1 = 8 + cw * .5;
    if (key === "live") { virus(c1 - r * 1.6, midY - r, r, true); virus(c1 + r * 1.4, midY + r * 1.2, r * .9, true); }
    if (key === "dead") { virus(c1 - r * 1.6, midY - r, r, false); virus(c1 + r * 1.4, midY + r * 1.2, r * .9, false); }
    if (key === "sub") for (let k = 0; k < 5; k++) spike(c1 - r * 2 + k * r, midY + (k % 2 ? r : -r), r * .45);
    if (key === "mrna") {
      ctx.strokeStyle = "#e0a02a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c1, midY, r * 2.2, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#3f7fc4"; ctx.lineWidth = 2; ctx.beginPath();
      for (let k = 0; k <= 40; k++) { const x = c1 - r * 1.5 + k / 40 * r * 3, y = midY + Math.sin(k * .7) * r * .5; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText("지질 막 + mRNA", c1, midY + r * 3.4);
    }
    // ② 몸속에서
    const c2 = 8 + cw * 1.5;
    if (key === "live") { const n = 2 + Math.floor(ph * 5); for (let k = 0; k < n; k++) virus(c2 + Math.cos(k * 2.3) * r * 2.2, midY + Math.sin(k * 2.3) * r * 2.2, r * .7, true); ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.fillText("조금 늘어남", c2, h - 50); }
    else if (key === "mrna") {
      ctx.fillStyle = "rgba(90,140,200,.15)"; ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.ellipse(c2, midY, cw * .38, r * 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(141,141,146,.35)"; ctx.beginPath(); ctx.arc(c2 + cw * .2, midY, r * 1.1, 0, Math.PI * 2); ctx.fill();
      ctx.font = `9.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText("핵", c2 + cw * .2, midY + 3);
      const n = 1 + Math.floor(ph * 4); for (let k = 0; k < n; k++) spike(c2 - cw * .22 + k * r * .9, midY - r * 1.2 + (k % 2) * r * 1.4, r * .4);
      ctx.fillStyle = C.forest; ctx.font = `10px ${F.sans}`; ctx.fillText("세포가 항원을 만듦", c2, h - 50);
    } else {
      if (key === "dead") virus(c2, midY, r, false, 0.8); else for (let k = 0; k < 3; k++) spike(c2 - r + k * r, midY, r * .45);
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText("늘어나지 않음", c2, h - 50);
    }
    // ③ 면역 세포 (대식세포 → 보조 T 세포 → B 세포)
    const c3 = 8 + cw * 2.5;
    ctx.fillStyle = "rgba(59,124,42,.18)"; ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(c3, midY, r * 2.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    spike(c3 + r * 2.2 * Math.cos(ph * 6.28), midY + r * 2.2 * Math.sin(ph * 6.28), r * .45);
    ctx.fillStyle = C.forest; ctx.font = `10px ${F.sans}`; ctx.fillText("B 세포·T 세포", c3, h - 50);
    // ④ 기억 세포
    const c4 = 8 + cw * 3.5;
    for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28 + t * .3; ctx.fillStyle = "rgba(59,124,42,.55)"; ctx.beginPath(); ctx.arc(c4 + Math.cos(a) * r * 1.8, midY + Math.sin(a) * r * 1.8, r * .7, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.forest; ctx.fillText("기억 세포", c4, h - 50);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText("모든 백신이 같은 목표", c4, h - 36);
    // 화살표
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    for (let i = 1; i < cols; i++) { const x = 8 + cw * i; ctx.beginPath(); ctx.moveTo(x - 6, h - 22); ctx.lineTo(x + 6, h - 22); ctx.lineTo(x + 2, h - 26); ctx.moveTo(x + 6, h - 22); ctx.lineTo(x + 2, h - 18); ctx.stroke(); }
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(v.name, 12, h - 6);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(`예: ${v.ex}`, w - 10, h - 6);
    ctx.textAlign = "left";
  }

  function update() {
    const v = V[key];
    nRep.textContent = v.rep; nMake.textContent = v.make; nWho.textContent = v.who; msg.textContent = v.note;
    root.querySelectorAll("[data-v]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === key)));
    draw();
  }
  root.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.v; update(); }));
  update();
  loop(cv, (dt) => { if (NM.reduce) return; t += dt; draw(); });
})();
