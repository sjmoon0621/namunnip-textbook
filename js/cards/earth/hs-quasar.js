/* 카드: 퀘이사는 왜 특이 은하일까? — 거리로 광도를, 밝기 변화로 크기를 추론하기 */
(() => {
  const root = document.getElementById("card-earth-quasar");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".var"), oV = $(".var-out");
  const nLum = $(".lum"), nSize = $(".size"), nCmp = $(".cmp"), msg = $(".qs-msg");
  // 3C 273: 가장 밝게 보이는 퀘이사. 거리 약 24억 광년, 광도 약 4×10¹² L☉ (대표 추정값)
  const Q_L = 4e12, MW_L = 5e10, LY_AU = 63241;
  // 밝기 변화 시간(일) 슬라이더는 로그 눈금
  const days = () => 10 ** +sV.value;

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    // 위: 광도 비교 막대 (로그)
    const x0 = 16, pw = w - 32, y0 = 30;
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("① 광도 비교 (로그 눈금, 태양 = 1)", x0, y0 - 10);
    const lx = (L) => x0 + Math.log10(L) / 13.5 * pw;
    const rows = [["태양", 1, "#e0a02a"], ["우리은하 전체 (별 수천억 개)", MW_L, "#8d8d92"], ["퀘이사 3C 273", Q_L, "#c9463d"]];
    rows.forEach(([n, L, col], i) => {
      const y = y0 + i * 30;
      ctx.fillStyle = "#eceae4"; ctx.fillRect(x0, y, pw, 16);
      ctx.fillStyle = col; ctx.fillRect(x0, y, Math.max(3, lx(L) - x0), 16);
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = L > 1e6 ? "#fff" : C.ink; ctx.fillText(n, x0 + 6, y + 12);
    });
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let e = 0; e <= 12; e += 3) ctx.fillText(`10${["⁰", "", "", "³", "", "", "⁶", "", "", "⁹", "", "", "¹²"][e]}`, lx(10 ** e), y0 + 104);
    ctx.textAlign = "left";

    // 아래: 크기 비교 (로그)
    const sy = Math.max(y0 + 140, h * 0.62);
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("② 밝기가 변하는 시간으로 본 크기의 상한 (로그 눈금)", x0, sy - 10);
    const D = days(), sizeLY = D / 365.25, sizeAU = sizeLY * LY_AU;
    const refs = [["지구–태양 거리", 1], ["태양계 (해왕성 궤도)", 60], ["가장 가까운 별까지", 4.24 * LY_AU], ["우리은하 지름", 1e5 * LY_AU]];
    const ax = (au) => x0 + (Math.log10(au) + 1) / 12 * pw;   // 0.1 AU ~ 10¹¹ AU
    const by = sy + 22;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, by); ctx.lineTo(x0 + pw, by); ctx.stroke();
    refs.forEach(([n, au], i) => {
      const x = ax(au); ctx.fillStyle = C.ink3; ctx.beginPath(); ctx.arc(x, by, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.font = `10px ${F.sans}`; ctx.textAlign = i === refs.length - 1 ? "right" : "center"; ctx.fillText(n, x, by + 18 + (i % 2) * 13);
    });
    const qx = ax(sizeAU);
    ctx.fillStyle = "rgba(201,70,61,.18)"; ctx.fillRect(x0, by - 12, Math.max(2, qx - x0), 24);
    ctx.strokeStyle = "#c9463d"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(qx, by - 16); ctx.lineTo(qx, by + 10); ctx.stroke();
    ctx.fillStyle = "#c9463d"; ctx.font = `600 10.5px ${F.sans}`; ctx.textAlign = qx > x0 + pw * 0.7 ? "right" : "left";
    ctx.fillText("빛을 내는 곳은 이보다 작아야 함", qx + (qx > x0 + pw * 0.7 ? -6 : 6), by - 20);
    ctx.textAlign = "left";
  }

  function update() {
    const D = days();
    oV.textContent = D < 1 ? `${Math.round(D * 24)}시간` : D < 60 ? `${D.toFixed(D < 10 ? 1 : 0)}일` : D < 730 ? `${(D / 30.4).toFixed(0)}개월` : `${(D / 365.25).toFixed(1)}년`;
    nLum.textContent = `우리은하의 약 ${Math.round(Q_L / MW_L)}배`;
    const au = D / 365.25 * LY_AU;
    nSize.textContent = au < 1000 ? `${Math.round(au)} AU 이하` : `${(D / 365.25).toFixed(2)}광년 이하`;
    nCmp.textContent = au < 60 * 3 ? "태양계만 한 크기" : au < 4.24 * LY_AU ? "가장 가까운 별까지보다 작음" : "은하보다는 훨씬 작음";
    msg.textContent = `밝기가 ${oV.textContent} 만에 바뀐다면, 빛을 내는 곳 전체가 그 시간 안에 서로 ‘소식’을 주고받을 수 있어야 합니다. 빛도 ${oV.textContent} 동안 ${au < 1000 ? `${Math.round(au)} AU` : `${(D / 365.25).toFixed(2)}광년`}밖에 못 갑니다.`;
    draw();
  }
  sV.addEventListener("input", update);
  root.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", () => { sV.value = b.dataset.v; update(); }));
  update();
})();
