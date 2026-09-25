/* 카드 1.2.1: 모든 단위는 7개로 만들어질까? — 기본 단위의 지수로 단위 조립 */
(() => {
  const root = document.getElementById("card-is1-units");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), box = $(".steppers");
  const dExpr = $(".expr"), dName = $(".uname"), dQty = $(".qty");

  // 순서: s, m, kg, A, K, mol, cd
  const BASE = [
    { u: "s", q: "시간", k: "ΔνCs" },
    { u: "m", q: "길이", k: "c" },
    { u: "kg", q: "질량", k: "h" },
    { u: "A", q: "전류", k: "e" },
    { u: "K", q: "온도", k: "k" },
    { u: "mol", q: "물질량", k: "NA" },
    { u: "cd", q: "광도", k: "Kcd" },
  ];
  // [키, 이름, 양, 지수(s,m,kg,A,K,mol,cd)]
  const NAMED = [
    ["v", "(이름 없음) m/s", "속력", [-1, 1, 0, 0, 0, 0, 0]],
    ["a", "(이름 없음) m/s²", "가속도", [-2, 1, 0, 0, 0, 0, 0]],
    ["N", "뉴턴 N", "힘", [-2, 1, 1, 0, 0, 0, 0]],
    ["J", "줄 J", "에너지, 일", [-2, 2, 1, 0, 0, 0, 0]],
    ["W", "와트 W", "일률, 전력", [-3, 2, 1, 0, 0, 0, 0]],
    ["Pa", "파스칼 Pa", "압력", [-2, -1, 1, 0, 0, 0, 0]],
    ["Hz", "헤르츠 Hz", "진동수", [-1, 0, 0, 0, 0, 0, 0]],
    ["C", "쿨롬 C", "전하량", [1, 0, 0, 1, 0, 0, 0]],
    ["V", "볼트 V", "전압", [-3, 2, 1, -1, 0, 0, 0]],
    ["ohm", "옴 Ω", "전기 저항", [-3, 2, 1, -2, 0, 0, 0]],
    ["rho", "(이름 없음) kg/m³", "밀도", [0, -3, 1, 0, 0, 0, 0]],
    ["p", "(이름 없음) kg·m/s", "운동량", [-1, 1, 1, 0, 0, 0, 0]],
    ["area", "(이름 없음) m²", "넓이", [0, 2, 0, 0, 0, 0, 0]],
    ["vol", "(이름 없음) m³", "부피", [0, 3, 0, 0, 0, 0, 0]],
    ["c", "(이름 없음) J/(kg·K)", "비열", [-2, 2, 0, 0, -1, 0, 0]],
    ["hc", "(이름 없음) J/K", "열용량", [-2, 2, 1, 0, -1, 0, 0]],
    ["M", "(이름 없음) kg/mol", "몰 질량", [0, 0, 1, 0, 0, -1, 0]],
    ["conc", "(이름 없음) mol/m³", "몰 농도", [0, -3, 0, 0, 0, 1, 0]],
    ["lx", "럭스 lx", "조도", [0, -2, 0, 0, 0, 0, 1]],
  ];
  const ex = [-2, 1, 1, 0, 0, 0, 0];

  const SUP = { "-": "⁻", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "0": "⁰" };
  const sup = (n) => n === 1 ? "" : String(n).split("").map((c) => SUP[c]).join("");
  function expr(e) {
    const order = [2, 1, 0, 3, 4, 5, 6]; // kg·m·s·A… 순서로 적는다
    const num = order.filter((i) => e[i] > 0).map((i) => BASE[i].u + sup(e[i]));
    const den = order.filter((i) => e[i] < 0).map((i) => BASE[i].u + sup(-e[i]));
    if (!num.length && !den.length) return "1 (단위 없음)";
    const n = num.length ? num.join("·") : "1";
    if (!den.length) return n;
    return `${n}/${den.length > 1 ? "(" + den.join("·") + ")" : den[0]}`;
  }

  // 지수 조절 버튼
  BASE.forEach((b, i) => {
    const d = document.createElement("div");
    d.className = "st";
    d.innerHTML = `<b>${b.u}</b><button type="button" aria-label="${b.u} 지수 줄이기">−</button><span>0</span><button type="button" aria-label="${b.u} 지수 늘리기">+</button><small>${b.q}</small>`;
    const [m, p] = d.querySelectorAll("button");
    m.addEventListener("click", () => { ex[i] = Math.max(-4, ex[i] - 1); update(); });
    p.addEventListener("click", () => { ex[i] = Math.min(4, ex[i] + 1); update(); });
    box.appendChild(d);
  });
  const spans = box.querySelectorAll("span");

  const { ctx, size } = fit(cv, () => draw());

  function match() { return NAMED.find((n) => n[3].every((v, i) => v === ex[i])); }

  function update() {
    ex.forEach((v, i) => { spans[i].textContent = v > 0 ? "+" + v : v; });
    const m = match();
    dExpr.textContent = expr(ex);
    dExpr.style.fontSize = dExpr.textContent.length > 12 ? "13px" : "";
    dName.textContent = m ? m[1].replace("(이름 없음) ", "") + (m[1].startsWith("(") ? " (고유 이름 없음)" : "") : "—";
    dName.style.fontSize = dName.textContent.length > 10 ? "13px" : "";
    dQty.textContent = m ? m[2] : "아는 양이 아님";
    root.querySelectorAll("[data-u]").forEach((b) => b.setAttribute("aria-pressed", m && m[0] === b.dataset.u ? "true" : "false"));
    draw();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 520;
    const cx = w / 2, cy = h / 2 + 4, R = Math.min(w * 0.40, h * 0.30);
    const nodes = BASE.map((b, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 7;
      return { ...b, x: cx + R * Math.cos(a) * (narrow ? 1.05 : 1.45), y: cy + R * Math.sin(a) };
    });
    const m = match();
    // 연결선
    nodes.forEach((n, i) => {
      const e = ex[i]; if (!e) return;
      const col = e > 0 ? C.forest : C.warn;
      ctx.strokeStyle = col; ctx.lineWidth = 1.5 + Math.abs(e) * 1.6;
      ctx.setLineDash(e > 0 ? [] : [6, 4]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(n.x, n.y); ctx.stroke(); ctx.setLineDash([]);
      const mx = cx + (n.x - cx) * 0.52, my = cy + (n.y - cy) * 0.52;
      ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(mx, my, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = col; ctx.font = `500 12px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(e > 0 ? "+" + e : String(e), mx, my + 4);
    });
    // 기본 단위 노드
    nodes.forEach((n, i) => {
      const on = ex[i] !== 0;
      ctx.fillStyle = on ? C.ink : C.card; ctx.strokeStyle = on ? C.ink : C.rule; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(n.x, n.y, narrow ? 17 : 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = on ? C.paper : C.ink2; ctx.font = `600 ${narrow ? 12 : 13.5}px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(n.u, n.x, n.y + 4.5);
      ctx.font = `${narrow ? 10 : 11}px ${F.sans}`; ctx.fillStyle = C.ink2;
      const below = n.y > cy - 5;
      ctx.fillText(n.q, n.x, below ? n.y + (narrow ? 31 : 35) : n.y - (narrow ? 24 : 28));
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
      ctx.fillText(`정의: ${n.k}`, n.x, below ? n.y + (narrow ? 44 : 49) : n.y - (narrow ? 37 : 41));
    });
    // 가운데
    const label = m ? m[2] : "?";
    ctx.font = `700 ${narrow ? 13 : 15}px ${F.sans}`;
    const tw = Math.max(ctx.measureText(label).width, 40) + 22;
    ctx.fillStyle = m ? "#eef5eb" : C.card; ctx.strokeStyle = m ? C.forest : C.ink3; ctx.lineWidth = 1.5;
    ctx.fillRect(cx - tw / 2, cy - 16, tw, 32); ctx.strokeRect(cx - tw / 2, cy - 16, tw, 32);
    ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.fillText(label, cx, cy + 5);
  }

  root.querySelectorAll("[data-u]").forEach((b) => b.addEventListener("click", () => {
    const n = NAMED.find((x) => x[0] === b.dataset.u);
    n[3].forEach((v, i) => { ex[i] = v; });
    update();
  }));
  update();
})();
