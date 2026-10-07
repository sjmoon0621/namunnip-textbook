/* 카드: 에피네프린은 몇 초, 에스트로젠은 몇 시간 — 수용성·지용성 호르몬의 작용 경로 (시간 경과는 모식 상대값) */
(() => {
  const root = document.getElementById("card-adbio-hormone-path");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const ck = { ant: $(".t-ant"), bsa: $(".t-bsa"), actd: $(".t-actd"), chx: $(".t-chx"), pde: $(".t-pde") };
  const nHalf = $(".n-half"), n1h = $(".n-1h"), nWhy = $(".n-why");

  const H = {
    epi: { name: "에피네프린", kind: "w", rec: "β 아드레날린 수용체", out: "간·근육: 글리코젠 분해" },
    glu: { name: "글루카곤", kind: "w", rec: "글루카곤 수용체", out: "간: 글리코젠 분해" },
    est: { name: "에스트로젠", kind: "l", rec: "에스트로젠 수용체(ER)", out: "표적 유전자 단백질 합성" },
    t3: { name: "타이록신(T₃)", kind: "l", rec: "갑상샘 호르몬 수용체(TR)", out: "대사 효소 단백질 합성" },
  };
  let hk = "epi";

  /* 시간 경과 계산 (초 단위, 0~24 시간) */
  const TEND = 86400;
  function course() {
    const h = H[hk], T = (k) => ck[k].checked;
    const ts = [], a = [], b = [];
    if (h.kind === "w") {
      const R = T("ant") ? 0 : 1, tc = T("pde") ? 120 : 20;
      let c = 0, y = 0;
      for (let t = 0; t <= TEND; t += 1) {
        /* 합성 속도 R/20, 분해 속도 c/tc. 반응은 cAMP에 대해 포화된다 */
        c += R / 20 - c / tc; y += (1.5 * c / (c + 0.5) - y) / 60;
        if (t < 60 || t % 30 === 0) { ts.push(t); a.push(c); b.push(y); }
      }
    } else {
      const S0 = (T("ant") || T("bsa")) ? 0 : 1, tm = 3600, tp = 6 * 3600;
      let s = 0, m = 0, p = 0;
      for (let t = 0; t <= TEND; t += 1) {
        s += (S0 - s) / 300; m += ((T("actd") ? 0 : s) - m) / tm; p += ((T("chx") ? 0 : m) - p) / tp;
        if (t < 60 || t % 30 === 0) { ts.push(t); a.push(m); b.push(p); }
      }
    }
    return { ts, a, b };
  }
  /* 정상(처치 없음) 조건의 최종값으로 나누어 상대값으로 */
  function normFactor() {
    const save = {}; Object.keys(ck).forEach((k) => { save[k] = ck[k].checked; ck[k].checked = false; });
    const r = course(); Object.keys(ck).forEach((k) => { ck[k].checked = save[k]; });
    return [Math.max(...r.a), Math.max(...r.b)];
  }

  const { ctx, size } = fit(cv, () => draw());
  let cur = null, nf = [1, 1];

  function box(x, y, w, h, txt, col, blocked) {
    ctx.fillStyle = blocked ? "rgba(0,0,0,.04)" : "#fff"; ctx.strokeStyle = blocked ? C.ink3 : col; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h / 2, w, h, 5) : ctx.rect(x - w / 2, y - h / 2, w, h); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = blocked ? C.ink3 : C.ink; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(txt, x, y + 4);
  }
  function arr(x0, y0, x1, y1, col, blocked) {
    ctx.strokeStyle = blocked ? C.ink3 : col; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 1.5;
    if (blocked) ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
    const ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 7 * Math.cos(ang - 0.4), y1 - 7 * Math.sin(ang - 0.4)); ctx.lineTo(x1 - 7 * Math.cos(ang + 0.4), y1 - 7 * Math.sin(ang + 0.4)); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 1;
    if (blocked) { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2; ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(mx - 6, my - 6); ctx.lineTo(mx + 6, my + 6); ctx.moveTo(mx + 6, my - 6); ctx.lineTo(mx - 6, my + 6); ctx.stroke(); ctx.lineWidth = 1; }
  }
  function drawCell(w, top, ch) {
    const h = H[hk], T = (k) => ck[k].checked, col = h.kind === "w" ? "#c0504d" : "#7a5ca8";
    const memY = top + ch * 0.2;
    /* 세포막 */
    ctx.fillStyle = "rgba(224,160,42,.2)"; ctx.fillRect(8, memY - 6, w - 16, 12);
    ctx.strokeStyle = C.amber; ctx.strokeRect(8, memY - 6, w - 16, 12);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("세포 밖 (혈액·조직액)", 10, top + 10); ctx.fillText("세포막 (인지질 이중층)", 10, memY + 20);
    /* 호르몬 */
    const hx = w * 0.5, hy = top + ch * 0.07;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, Math.PI * 2); ctx.fill();
    if (T("bsa")) { ctx.fillStyle = "rgba(120,120,120,.5)"; ctx.beginPath(); ctx.arc(hx + 12, hy, 9, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.ink; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(h.name + (T("bsa") ? " + 큰 단백질(BSA)" : ""), hx + (T("bsa") ? 26 : 12), hy + 4);
    if (h.kind === "w") {
      const y1 = memY, y2 = top + ch * 0.42, y3 = top + ch * 0.62, y4 = top + ch * 0.82, rb = T("ant");
      box(hx, y1, 118, 20, h.rec, col, rb);
      arr(hx, hy + 8, hx, y1 - 11, col, rb);
      box(w * 0.22, y2, 108, 20, "G 단백질 → 효소", col, rb);
      box(w * 0.55, y2, 76, 20, "ATP → cAMP", col, rb);
      box(w * 0.84, y2, 70, 20, T("pde") ? "분해 억제" : "PDE 분해", T("pde") ? C.warn : C.ink3, false);
      arr(hx - 20, y1 + 11, w * 0.22 + 10, y2 - 11, col, rb);
      arr(w * 0.22 + 55, y2, w * 0.55 - 39, y2, col, rb);
      arr(w * 0.55 + 39, y2, w * 0.84 - 36, y2, C.ink3, false);
      box(w * 0.3, y3, 140, 20, "단백질 인산화 효소 A", col, rb);
      arr(w * 0.55, y2 + 11, w * 0.3 + 30, y3 - 11, col, rb);
      box(w * 0.66, y4, 170, 20, "글리코젠 인산화 효소 활성화", col, rb);
      arr(w * 0.3, y3 + 11, w * 0.66 - 50, y4 - 11, col, rb);
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText("이미 있던 효소를 인산화해 켬 → 핵을 거치지 않음", 10, top + ch - 2);
    } else {
      const blockEnter = T("bsa"), blockRec = T("ant") || blockEnter;
      arr(hx, hy + 8, hx, memY + 30, col, blockEnter);
      const nx = w * 0.62, ny = top + ch * 0.66, nr = Math.min(w * 0.3, ch * 0.3);
      ctx.fillStyle = "rgba(122,92,168,.07)"; ctx.strokeStyle = "#7a5ca8"; ctx.beginPath(); ctx.ellipse(nx, ny, nr * 1.25, nr * 0.95, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#7a5ca8"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("핵", nx + nr * 0.95, ny - nr * 0.7);
      box(hx, memY + 42, 168, 20, h.rec + "와 결합", col, blockRec);
      box(nx, ny - nr * 0.45, 150, 20, "DNA에 붙어 전사 조절", col, blockRec || T("actd"));
      arr(hx, memY + 53, nx - 10, ny - nr * 0.45 - 11, col, blockRec);
      box(nx, ny + nr * 0.25, 70, 20, "mRNA", col, blockRec || T("actd"));
      arr(nx, ny - nr * 0.45 + 11, nx, ny + nr * 0.25 - 11, col, T("actd") && !blockRec);
      box(w * 0.17, ny + nr * 0.6, 110, 20, "리보솜: 새 단백질", col, blockRec || T("actd") || T("chx"));
      arr(nx - 36, ny + nr * 0.25 + 4, w * 0.17 + 56, ny + nr * 0.6 - 4, col, T("chx") && !blockRec && !T("actd"));
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText("막을 통과해 세포 안 수용체에 결합", 10, memY + 70 > ny - nr ? top + ch - 2 : memY + 70);
    }
  }
  function draw() {
    const { w, h } = size; if (!w || !cur) return;
    ctx.clearRect(0, 0, w, h);
    const ch = h * 0.52;
    drawCell(w, 4, ch);
    /* 시간 경과 그래프 (로그 시간) */
    const x0 = 40, x1 = w - 12, g0 = ch + 34, gh = h - g0 - 32;
    const L0 = 0, L1 = Math.log10(TEND), X = (t) => x0 + (Math.log10(Math.max(1, t)) - L0) / (L1 - L0) * (x1 - x0), Y = (v) => g0 + gh - Math.min(1.6, v) / 1.6 * gh;
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0, g0); ctx.lineTo(x0, g0 + gh); ctx.lineTo(x1, g0 + gh); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    [[1, "1초"], [10, "10초"], [60, "1분"], [600, "10분"], [3600, "1시간"], [21600, "6시간"], [86400, "24시간"]].forEach(([t, l], i, arrT) => {
      const x = X(t); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x, g0); ctx.lineTo(x, g0 + gh); ctx.stroke();
      ctx.textAlign = i === arrT.length - 1 ? "right" : "center"; ctx.fillText(l, i === arrT.length - 1 ? x1 : x, g0 + gh + 13);
    });
    ctx.textAlign = "right"; for (const v of [0, 0.5, 1, 1.5]) ctx.fillText(v.toFixed(1), x0 - 4, Y(v) + 3);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`;
    ctx.fillText("호르몬을 넣은 뒤의 시간 (로그 눈금) · 세로: 처치 없을 때의 최댓값 = 1", x0, g0 + gh + 27);
    const isW = H[hk].kind === "w";
    const lab = isW ? ["cAMP 농도", "포도당 방출 속도"] : ["표적 mRNA", "새 단백질"];
    const cols = isW ? ["#e0a02a", "#c0504d"] : ["#e0a02a", "#7a5ca8"];
    [cur.a, cur.b].forEach((arrV, j) => {
      ctx.strokeStyle = cols[j]; ctx.lineWidth = 2.2; ctx.beginPath();
      arrV.forEach((v, i) => { const x = X(cur.ts[i]), y = Y(v / nf[j]); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = cols[j]; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("— " + lab[j], x0 + 6 + j * 110, g0 + 4);
    });
  }
  function fmtT(s) { if (s < 90) return `${s.toFixed(0)}초`; if (s < 5400) return `${(s / 60).toFixed(0)}분`; return `${(s / 3600).toFixed(1)}시간`; }
  function update() {
    root.querySelectorAll("[data-h]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.h === hk)));
    nf = normFactor(); cur = course();
    const out = cur.b.map((v) => v / nf[1]);
    const iH = out.findIndex((v) => v >= 0.5);
    nHalf.textContent = iH >= 0 ? fmtT(cur.ts[iH]) : "도달 못 함";
    const i1 = cur.ts.findIndex((t) => t >= 3600);
    n1h.textContent = out[i1].toFixed(2);
    const h = H[hk];
    nWhy.textContent = h.kind === "w" ? "세포 표면 수용체 → 2차 전달자" : "세포 안 수용체 → 전사 조절";
    draw();
  }
  root.querySelectorAll("[data-h]").forEach((b) => b.addEventListener("click", () => { hk = b.dataset.h; update(); }));
  Object.values(ck).forEach((c) => c.addEventListener("change", update));
  update();
})();
