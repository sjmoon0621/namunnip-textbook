/* 카드: 길이·시간·질량·온도 중 가장 정밀하게 잴 수 있는 것은? — 네 도구 반복 측정, 상대 표준편차 비교, 스마트폰 센서 */
(() => {
  const root = document.getElementById("card-is1-four-measure");
  if (!root) return;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const T = {
    len: { name: "길이", unit: "cm", truth: 17.43, hand: { sd: 0.04, res: 0.1 }, app: { sd: 0.03, res: 0.01 } },
    time: { name: "시간", unit: "s", truth: 0.452, hand: { sd: 0.07, bias: 0.02, res: 0.01 }, app: { sd: 0.004, res: 0.001 } },
    mass: { name: "질량", unit: "g", truth: 5.42, hand: { sd: 0.004, res: 0.01 }, app: { sd: 0.004, res: 0.01 } },
    temp: { name: "온도", unit: "°C", truth: 21.37, hand: { sd: 0.06, res: 0.1 }, app: { sd: 0.06, res: 0.1 } },
  };
  const rec = { len: [], time: [], mass: [], temp: [] };
  let cur = "len";
  const tbl = L.table($(".tbl-host"), [{ key: "i", label: "도구" }, { key: "v", label: "측정값" }], () => {});
  const sum = $(".sum");
  function render() {
    tbl.clear();
    rec[cur].forEach((r) => tbl.add({ i: r.app ? "앱" : "도구", v: `${r.v.toFixed(Math.max(0, -Math.round(Math.log10(r.res))))} ${T[cur].unit}` }));
    sum.innerHTML = `<table><thead><tr><th>대상</th><th>n</th><th>평균</th><th>표준편차</th><th>상대 표준편차</th></tr></thead><tbody>${
      Object.entries(rec).map(([k, a]) => { const s = L.stats(a.map((r) => r.v)), res = a.length ? a[a.length - 1].res : 0, flat = s.n > 1 && s.sd === 0;
        const sd = flat ? res / Math.sqrt(12) : s.sd;   // 값이 모두 같으면 분해능이 정밀도를 정한다
        return `<tr><td>${T[k].name}</td><td>${s.n}</td><td>${s.n ? s.mean.toFixed(3) + " " + T[k].unit : "—"}</td><td>${s.n > 1 ? (flat ? "&lt; 분해능 " + res : s.sd.toFixed(3)) : "—"}</td><td>${s.n > 1 ? (flat ? "약 " : "") + (sd / s.mean * 100).toFixed(2) + "%" : "—"}</td></tr>`; }).join("")
    }</tbody></table>`;
  }
  sum.classList.add("lab-tbl");
  function one() { const t = T[cur], app = $(".phone").checked, o = app ? t.app : t.hand; rec[cur].push({ v: L.measure(t.truth, o), res: o.res, app }); }
  $(".tool").addEventListener("click", (e) => { const b = e.target.closest("[data-t]"); if (!b) return; cur = b.dataset.t; root.querySelectorAll("[data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); render(); });
  $(".one").addEventListener("click", () => { one(); render(); });
  $(".five").addEventListener("click", () => { for (let i = 0; i < 5; i++) one(); render(); });
  $(".clear").addEventListener("click", () => { rec[cur] = []; render(); });
  render();
  if (L.demo) { ["len", "time", "mass", "temp"].forEach((k) => { cur = k; for (let i = 0; i < 5; i++) one(); }); cur = "time"; root.querySelector('[data-t="time"]').click(); }
})();
