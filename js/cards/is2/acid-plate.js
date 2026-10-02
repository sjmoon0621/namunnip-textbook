/* 카드: 이름표가 떨어진 용액 여섯 개 — 홈판에서 지시약·전도성·Mg·CaCO₃ 시험으로 산·염기·중성 분류 */
(() => {
  const root = document.getElementById("card-is2-acid-plate");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  // kind: a 산, b 염기, n 중성 · ion: 전도 세기 0~1 · h: H⁺ 반응 세기
  const SOL = [
    { name: "묽은 염산", kind: "a", ion: 1, h: 1 }, { name: "식초", kind: "a", ion: 0.25, h: 0.3 },
    { name: "묽은 수산화 나트륨", kind: "b", ion: 1, h: 0 }, { name: "암모니아수", kind: "b", ion: 0.2, h: 0 },
    { name: "소금물", kind: "n", ion: 0.9, h: 0 }, { name: "설탕물", kind: "n", ion: 0, h: 0 },
  ];
  const TESTS = ["lit", "btb", "cond", "mg", "caco3"], TN = { lit: "리트머스", btb: "BTB", cond: "전도성", mg: "Mg", caco3: "CaCO₃" };
  let order = [], done = new Set(), guess = [];
  function shuffle() { order = SOL.map((_, i) => i).sort(() => Math.random() - 0.5); done = new Set(); guess = order.map(() => null); renderCls(); $(".verdict").textContent = ""; draw(); }
  const { ctx, size } = fit($("canvas"), () => draw());
  function cell(t, s, x, y, r) {
    ctx.fillStyle = "rgba(230,236,240,.9)"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.rule; ctx.stroke();
    if (!done.has(t)) return;
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
    if (t === "lit") { // 왼쪽 푸른 종이, 오른쪽 붉은 종이
      const blue = s.kind === "a" ? "#d9534f" : "#4a78c2", red = s.kind === "b" ? "#4a78c2" : "#d9534f";
      ctx.fillStyle = blue; ctx.fillRect(x - r * 0.7, y - r * 0.5, r * 0.6, r); ctx.fillStyle = red; ctx.fillRect(x + r * 0.1, y - r * 0.5, r * 0.6, r);
    } else if (t === "btb") { ctx.fillStyle = s.kind === "a" ? "#e8d23a" : s.kind === "b" ? "#3a6fc2" : "#4caf6a"; ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, Math.PI * 2); ctx.fill(); }
    else if (t === "cond") { ctx.fillStyle = `rgba(255,200,40,${0.08 + 0.9 * s.ion})`; ctx.beginPath(); ctx.arc(x, y, r * 0.75, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.arc(x, y, r * 0.75, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = C.ink2; ctx.fillText(s.ion > 0.6 ? "밝음" : s.ion > 0.1 ? "흐림" : "꺼짐", x, y + r + 11); }
    else { const n = Math.round(s.h * 14); ctx.fillStyle = t === "mg" ? "#b9b9c1" : "#efe9dc"; ctx.fillRect(x - 6, y + 2, 12, 6); ctx.strokeStyle = C.ink2; for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(x - 8 + (i * 7) % 16, y - 2 - (i * 5) % (r), 2, 0, Math.PI * 2); ctx.stroke(); } ctx.fillStyle = C.ink2; ctx.fillText(s.h > 0.6 ? "기포 많음" : s.h > 0 ? "기포 조금" : "변화 없음", x, y + r + 11); }
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 64, cw = (w - x0 - 10) / 6, rh = (h - 26) / 5, r = Math.min(cw, rh) * 0.34;
    ctx.fillStyle = "#f7f8f6"; ctx.fillRect(x0 - 4, 18, w - x0 - 6, h - 20);
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "center";
    order.forEach((_, j) => ctx.fillText(String.fromCharCode(65 + j), x0 + cw * (j + 0.5), 13));
    TESTS.forEach((t, i) => {
      ctx.fillStyle = done.has(t) ? C.ink : C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(TN[t], x0 - 8, 22 + rh * (i + 0.5));
      order.forEach((si, j) => cell(t, SOL[si], x0 + cw * (j + 0.5), 20 + rh * (i + 0.5) - 4, r));
    });
  }
  function renderCls() {
    $(".cls").innerHTML = order.map((_, j) => `<div class="presets" role="group" aria-label="용액 ${String.fromCharCode(65 + j)} 분류"><span class="mono small">${String.fromCharCode(65 + j)}</span>${[["a", "산"], ["b", "염기"], ["n", "중성"]].map(([k, t]) => `<button class="chip" data-j="${j}" data-k="${k}" aria-pressed="${guess[j] === k}">${t}</button>`).join("")}</div>`).join("");
  }
  root.addEventListener("click", (e) => {
    const t = e.target.closest("[data-t]"), g = e.target.closest("[data-j]");
    if (t) { done.add(t.dataset.t); t.setAttribute("aria-pressed", "true"); draw(); }
    if (g) { guess[+g.dataset.j] = g.dataset.k; renderCls(); }
  });
  $(".check").addEventListener("click", () => {
    const ok = order.filter((si, j) => guess[j] === SOL[si].kind).length;
    const v = $(".verdict");
    v.innerHTML = `${ok} / 6 맞음 · 시험 ${done.size}가지 사용. ` + (ok === 6 ? `정답: ${order.map((si, j) => `${String.fromCharCode(65 + j)} ${SOL[si].name}`).join(", ")}` : "다른 시험 결과도 비교해 보세요.");
    v.className = "verdict small " + (ok === 6 ? "good" : "bad");
  });
  $(".reset").addEventListener("click", () => { root.querySelectorAll("[data-t]").forEach((x) => x.setAttribute("aria-pressed", "false")); shuffle(); });
  shuffle();
  if (/[?&]demo\b/.test(location.search)) TESTS.forEach((t) => root.querySelector(`[data-t="${t}"]`).click());
})();
