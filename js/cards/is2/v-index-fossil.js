/* 카드: 화석으로 어떻게 시간을 읽을까? — 화석 산출 범위를 겹쳐 지층의 나이 좁히기 */
(() => {
  const root = document.getElementById("card-is2-index-fossil");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const nAge = $(".age"), nPer = $(".per"), nWid = $(".wid"), msg = $(".msg");

  // 기(紀) 경계: ICS 연대표, 백만 년 전
  const PER = [
    ["캄브리아기", "캄", 538.8, 485.4], ["오르도비스기", "오", 485.4, 443.8], ["실루리아기", "실", 443.8, 419.2],
    ["데본기", "데", 419.2, 358.9], ["석탄기", "석", 358.9, 298.9], ["페름기", "페", 298.9, 251.9],
    ["트라이아스기", "트", 251.9, 201.4], ["쥐라기", "쥐", 201.4, 145.0], ["백악기", "백", 145.0, 66.0],
    ["팔레오기", "팔", 66.0, 23.03], ["네오기", "네", 23.03, 2.58], ["제4기", "", 2.58, 0],
  ];
  const ERA = [["고생대", 538.8, 251.9, "#9dbfd3"], ["중생대", 251.9, 66.0, "#b3d5a1"], ["신생대", 66.0, 0, "#ebc987"]];
  // 산출 범위(대략): 화석 기록의 처음과 끝, 백만 년 전
  const FOS = [
    { id: "tri", name: "삼엽충", a: 521, b: 251.9, col: "#6f7f95" },
    { id: "fus", name: "방추충", a: 335, b: 251.9, col: "#a0795a" },
    { id: "amm", name: "암모나이트", a: 409, b: 66.0, col: "#b5532f" },
    { id: "din", name: "공룡(새 제외)", a: 233, b: 66.0, col: "#3b7c2a" },
    { id: "cor", name: "산호류", a: 485, b: 0, col: "#d08aa0" },
  ];
  const found = new Set(["tri", "fus"]);
  const TMAX = 560;

  const fmt = (ma) => ma >= 100 ? `${(ma / 100).toFixed(2).replace(/0$/, "")}억` : `${Math.round(ma * 100).toLocaleString()}만`;

  function overlap() {
    const fs = FOS.filter((f) => found.has(f.id));
    if (!fs.length) return null;
    const a = Math.min(...fs.map((f) => f.a)), b = Math.max(...fs.map((f) => f.b));
    return { a, b, ok: a > b, n: fs.length };
  }

  const { ctx, size } = fit(cv, () => draw());

  function icon(id, x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.2;
    if (id === "tri") {
      ctx.beginPath(); ctx.ellipse(0, 0, s * .55, s * .8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.card; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(-s * .45, k * s * .22); ctx.lineTo(s * .45, k * s * .22); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-s * .15, -s * .75); ctx.lineTo(-s * .15, s * .75); ctx.moveTo(s * .15, -s * .75); ctx.lineTo(s * .15, s * .75); ctx.stroke();
    } else if (id === "fus") {
      ctx.beginPath(); ctx.ellipse(0, 0, s * .95, s * .38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.card; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * s * .3, -s * .3); ctx.lineTo(k * s * .3, s * .3); ctx.stroke(); }
    } else if (id === "amm") {
      ctx.lineWidth = 1.6; ctx.beginPath();
      for (let t = 0; t < 14; t += 0.1) { const r = s * .9 * Math.exp(-0.2 * (14 - t)) * 4.2; const px = Math.cos(t) * Math.min(r, s * .9), py = Math.sin(t) * Math.min(r, s * .9); t ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    } else if (id === "din") {
      // 세 발가락 발자국
      ctx.beginPath(); ctx.ellipse(0, s * .35, s * .32, s * .3, 0, 0, Math.PI * 2); ctx.fill();
      for (const t of [-0.5, 0, 0.5]) { ctx.beginPath(); ctx.ellipse(Math.sin(t) * s * .55, -Math.cos(t) * s * .45 + s * .1, s * .13, s * .38, t, 0, Math.PI * 2); ctx.fill(); }
    } else {
      ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.beginPath();
      ctx.moveTo(0, s * .9); ctx.lineTo(0, -s * .1); ctx.lineTo(-s * .5, -s * .7); ctx.moveTo(0, -s * .1); ctx.lineTo(s * .45, -s * .8);
      ctx.moveTo(0, s * .3); ctx.lineTo(s * .55, -s * .05); ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const labW = w < 420 ? 86 : 112;
    const x0 = labW, x1 = w - 12, top = 8;
    const X = (ma) => x0 + (1 - ma / TMAX) * (x1 - x0);
    // 대(代)와 기(紀) 띠
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    for (const [n, a, b, col] of ERA) {
      ctx.fillStyle = col; ctx.fillRect(X(a), top, X(b) - X(a), 16);
      ctx.fillStyle = C.ink; if (X(b) - X(a) > 40) ctx.fillText(n, (X(a) + X(b)) / 2, top + 12);
    }
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("선캄브리아", X(538.8) - 3, top + 12);
    const py = top + 20;
    ctx.font = `10.5px ${F.sans}`;
    PER.forEach(([, s, a, b], i) => {
      ctx.fillStyle = i % 2 ? "#e6e7df" : "#eeefe8"; ctx.fillRect(X(a), py, X(b) - X(a), 16);
      ctx.fillStyle = C.ink2; ctx.textAlign = "center"; if (s && X(b) - X(a) > 11) ctx.fillText(s, (X(a) + X(b)) / 2, py + 12);
    });
    // 행
    const rTop = py + 26, axY = h - 16, rowH = Math.min(38, (axY - 14 - rTop) / FOS.length);
    // 겹치는 구간
    const o = overlap();
    if (o && o.ok) {
      ctx.fillStyle = "rgba(116,171,102,.16)"; ctx.fillRect(X(o.a), py, X(o.b) - X(o.a), axY - 10 - py);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
      for (const v of [o.a, o.b]) { ctx.beginPath(); ctx.moveTo(X(v) + .5, py); ctx.lineTo(X(v) + .5, axY - 10); ctx.stroke(); }
      ctx.setLineDash([]);
    }
    FOS.forEach((f, i) => {
      const y = rTop + i * rowH + rowH / 2, on = found.has(f.id);
      icon(f.id, 14, y, 8, on ? f.col : C.ink3);
      ctx.font = `${on ? 700 : 400} 12px ${F.sans}`; ctx.fillStyle = on ? C.ink : C.ink3; ctx.textAlign = "left";
      ctx.fillText(f.name, 28, y + 4);
      ctx.fillStyle = on ? f.col : "rgba(141,141,146,.35)";
      ctx.fillRect(X(f.a), y - (on ? 5 : 3), X(f.b) - X(f.a) + (f.b === 0 ? 0 : 0), on ? 10 : 6);
    });
    // 눈금
    ctx.strokeStyle = C.rule; ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.lineWidth = 1;
    for (let v = 500; v >= 0; v -= 100) {
      const x = Math.round(X(v)) + .5; ctx.beginPath(); ctx.moveTo(x, axY - 10); ctx.lineTo(x, axY - 6); ctx.stroke();
      ctx.textAlign = "center"; ctx.fillText(v ? `${v / 100}억` : "지금", x, axY + 4);
    }
    ctx.textAlign = "left"; ctx.fillText("년 전", x0 - 36, axY + 4);
    if (o && !o.ok) {
      ctx.font = `700 13px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "center";
      ctx.fillText("겹치는 시기가 없습니다", (x0 + x1) / 2, rTop - 8 + rowH * FOS.length / 2);
    }
  }

  function update() {
    root.querySelectorAll("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(found.has(b.dataset.f))));
    const o = overlap();
    nAge.classList.remove("bad"); nWid.classList.remove("bad");
    if (!o) { nAge.textContent = "—"; nPer.textContent = "—"; nWid.textContent = "—"; msg.textContent = "지층에서 나온 화석을 눌러 고르세요."; }
    else if (!o.ok) {
      nAge.textContent = "없음"; nAge.classList.add("bad"); nPer.textContent = "—"; nWid.textContent = "—";
      msg.textContent = "두 화석이 살았던 시기가 겹치지 않습니다. 한 지층에서 함께 나왔다면 한쪽이 다른 층에서 쓸려 들어왔거나, 층이 뒤섞였거나, 감정이 잘못된 것입니다.";
    } else {
      nAge.textContent = `${fmt(o.a)}–${o.b ? fmt(o.b) : "지금"}`;
      const ps = PER.filter(([, , a, b]) => a > o.b && b < o.a).map((p) => p[0]);
      nPer.textContent = ps.length > 2 ? `${ps[0]}–${ps.at(-1)}` : ps.join(", ");
      { const d = o.a - o.b; nWid.textContent = d >= 100 ? `${(d / 100).toFixed(1)}억 년` : `${(Math.round(d) * 100).toLocaleString()}만 년`; }
      msg.textContent = o.n === 1
        ? (o.a - o.b > 300 ? "이 화석 하나로는 범위가 너무 넓습니다. 오래 살아남은 무리는 시대를 가리는 데 쓰기 어렵습니다." : "화석을 하나 더 골라 겹치는 구간을 좁혀 보세요.")
        : "초록 띠가 두 화석이 함께 살 수 있었던 시기, 곧 이 지층이 쌓였을 수 있는 시기입니다.";
    }
    draw();
  }

  root.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.f; found.has(id) ? found.delete(id) : found.add(id); update();
  }));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    found.clear(); b.dataset.set.split(",").forEach((x) => found.add(x)); update();
  }));
  update();
})();
