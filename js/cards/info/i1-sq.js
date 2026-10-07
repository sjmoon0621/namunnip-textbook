/* 카드: 스택과 큐를 리스트로 만들면 무엇이 다를까? — 리스트 스택, pop(0) 큐, 원형 큐, 연결 리스트 큐 */
(() => {
  const root = document.getElementById("card-info-sq");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const { code, rrect, arrow } = I1;

  const SRC = {
    stack: ["class Stack:", "    def __init__(self):", "        self.items = []", "    def push(self, x):", "        self.items.append(x)    # 맨 뒤(top)에 넣기", "    def pop(self):", "        return self.items.pop() # 맨 뒤에서 꺼내기", "    def is_empty(self):", "        return not self.items"],
    listq: ["class ListQueue:", "    def __init__(self):", "        self.items = []", "    def enqueue(self, x):", "        self.items.append(x)    # 뒤(rear)에 넣기", "    def dequeue(self):", "        return self.items.pop(0)  # 앞에서 꺼내고 나머지를 당김"],
    circ: ["class CircularQueue:", "    def __init__(self, cap):", "        self.a = [None] * cap", "        self.front = self.size = 0", "    def enqueue(self, x):", "        if self.size == len(self.a):", "            raise OverflowError('가득 참')", "        rear = (self.front + self.size) % len(self.a)", "        self.a[rear] = x", "        self.size += 1", "    def dequeue(self):", "        x = self.a[self.front]", "        self.front = (self.front + 1) % len(self.a)", "        self.size -= 1", "        return x"],
    link: ["class Node:", "    def __init__(self, v):", "        self.v, self.next = v, None", "", "class LinkedQueue:", "    def __init__(self):", "        self.head = self.tail = None", "    def enqueue(self, x):", "        node = Node(x)", "        if self.tail:", "            self.tail.next = node", "        else:", "            self.head = node", "        self.tail = node", "    def dequeue(self):", "        x = self.head.v", "        self.head = self.head.next", "        if self.head is None:", "            self.tail = None", "        return x"],
  };
  const PUSHL = { stack: [4, 5], listq: [4, 5], circ: [5, 6, 8, 9, 10], link: [8, 9, 10, 11, 12, 13, 14] };
  const POPL = { stack: [6, 7], listq: [6, 7], circ: [11, 12, 13, 14, 15], link: [15, 16, 17, 18, 19, 20] };
  const CAP = 8, MAXV = 11;

  let mode = "stack", items = [], ring = new Array(CAP).fill(null), front = 0, nextV = 1, last = 0, total = 0, flash = null, ops = 0;
  let cv = code($(".code"), SRC.stack);
  const view = fit($("canvas"), () => draw());

  const size = () => items.length;
  function reset() {
    items = []; ring = new Array(CAP).fill(null); front = 0; nextV = 1; last = 0; total = 0; flash = null; ops = 0;
    cv = code($(".code"), SRC[mode]); cv.set([]);
    $(".push").textContent = mode === "stack" ? "push (넣기)" : "enqueue (넣기)";
    $(".pop").textContent = mode === "stack" ? "pop (꺼내기)" : "dequeue (꺼내기)";
    say(mode === "stack" ? "스택은 넣은 곳(top)에서 꺼냅니다. 나중에 넣은 것이 먼저 나옵니다(후입선출, LIFO)." : "큐는 뒤(rear)에 넣고 앞(front)에서 꺼냅니다. 먼저 넣은 것이 먼저 나옵니다(선입선출, FIFO).");
    upd();
  }
  const say = (t) => { $(".note").textContent = t; };
  function upd() {
    $(".r-size").textContent = size();
    $(".r-last").textContent = last;
    $(".r-total").textContent = total;
    $(".r-ops").textContent = ops;
    draw();
  }

  function push() {
    const cap = mode === "circ" ? CAP : MAXV;
    cv.set(PUSHL[mode]);
    if (items.length >= cap) {
      if (mode === "circ") { cv.set([5, 6, 7]); say(`배열 칸 ${CAP}개가 모두 찼습니다. 원형 큐는 크기가 고정되어 있어 더 넣으려면 큰 배열을 새로 만들어 옮겨야 합니다.`); }
      else say("그림에 그릴 칸이 다 찼습니다. 실제 파이썬 리스트는 필요하면 저절로 커집니다.");
      return;
    }
    const v = nextV++; ops++; last = 0; flash = null;
    if (mode === "circ") { ring[(front + items.length) % CAP] = v; }
    items.push(v);
    say(mode === "stack" ? `push ${v}: 리스트 맨 뒤(top)에 붙입니다. 다른 원소는 움직이지 않습니다.`
      : mode === "circ" ? `enqueue ${v}: rear = (front + size) % ${CAP} 칸에 넣습니다. 마지막 칸 다음은 0번 칸입니다.`
      : `enqueue ${v}: 맨 뒤에 붙입니다. 다른 원소는 움직이지 않습니다.`);
    upd();
  }
  function pop() {
    cv.set(POPL[mode]);
    if (!items.length) {
      say(mode === "stack" || mode === "listq" ? (mode === "stack" ? "빈 리스트에서 pop()하면 IndexError: pop from empty list가 납니다. 꺼내기 전에 is_empty()로 확인해야 합니다." : "빈 리스트에서 pop(0)하면 IndexError가 납니다. 꺼내기 전에 비었는지 확인해야 합니다.") : "큐가 비어 있습니다. 비었는지 먼저 확인해야 합니다.");
      return;
    }
    ops++;
    if (mode === "stack") { const v = items.pop(); last = 0; flash = null; say(`pop → ${v}: 가장 나중에 넣은 원소가 나옵니다. 다른 원소는 움직이지 않습니다.`); }
    else if (mode === "listq") {
      const v = items.shift(); last = items.length; total += last; flash = "shift";
      say(`dequeue → ${v}: 0번 칸이 비면 남은 ${last}개를 모두 한 칸씩 앞으로 옮깁니다. 큐가 길수록 꺼낼 때마다 더 많이 옮깁니다.`);
    } else if (mode === "circ") {
      const v = ring[front]; ring[front] = null; front = (front + 1) % CAP; items.shift(); last = 0; flash = null;
      say(`dequeue → ${v}: 원소는 그대로 두고 front 번호만 한 칸 옮깁니다(끝에서는 0으로).`);
    } else {
      const v = items.shift(); last = 0; flash = null;
      say(`dequeue → ${v}: head가 다음 노드를 가리키게 바꾸면 끝입니다. 옮기는 원소가 없습니다.`);
    }
    upd();
  }

  function cell(ctx, x, y, s, v, hi, col) {
    ctx.fillStyle = v == null ? C.card : hi ? "#dcebd6" : "#fff"; ctx.strokeStyle = col || C.ink2; ctx.lineWidth = 1;
    ctx.fillRect(x, y, s, s); ctx.strokeRect(x + .5, y + .5, s - 1, s - 1);
    if (v != null) { ctx.fillStyle = C.ink; ctx.font = `600 ${Math.round(s * 0.38)}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(v), x + s / 2, y + s / 2 + 1); ctx.textBaseline = "alphabetic"; }
  }
  function tag(ctx, t, x, y, col) { ctx.fillStyle = col; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(t, x, y); }

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    if (mode === "stack") {
      const s = Math.min(34, (h - 40) / MAXV), x = w / 2 - s / 2;
      ctx.fillText("리스트 items (아래가 0번)", 8, 14);
      for (let i = 0; i < MAXV; i++) {
        const y = h - 12 - (i + 1) * s;
        cell(ctx, x, y, s, items[i], i === items.length - 1);
        ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(String(i), x - 6, y + s / 2 + 3);
      }
      if (items.length) { const y = h - 12 - items.length * s + s / 2; arrow(ctx, x + s + 46, y, x + s + 6, y, C.forest); ctx.textAlign = "left"; ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.mono}`; ctx.fillText("top", x + s + 50, y + 4); }
      return;
    }
    if (mode === "listq") {
      const s = Math.min(40, (w - 30) / MAXV), x0 = 14, y = h * 0.42;
      ctx.fillText("리스트 items (왼쪽이 0번 = front)", 8, 14);
      for (let i = 0; i < MAXV; i++) {
        cell(ctx, x0 + i * s, y, s, items[i], false);
        ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(String(i), x0 + i * s + s / 2, y + s + 13);
        if (flash === "shift" && i < items.length) { arrow(ctx, x0 + (i + 1) * s + s * 0.3, y - 10, x0 + i * s + s * 0.7, y - 10, C.warn); }
      }
      if (items.length) { tag(ctx, "front", x0 + s / 2, y + s + 30, C.forest); tag(ctx, "rear", x0 + (items.length - 1) * s + s / 2, y + s + (items.length === 1 ? 44 : 30), C.warn); }
      if (flash === "shift" && last) { ctx.fillStyle = C.warn; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`원소 ${last}개를 한 칸씩 앞으로 옮김`, x0, y - 22); }
      return;
    }
    if (mode === "circ") {
      const cx = w / 2, cy = h / 2 + 6, R = Math.min(w, h) * 0.32, s = Math.min(38, R * 0.62);
      ctx.fillText(`크기 ${CAP}로 고정된 배열을 원처럼 이어 씀`, 8, 14);
      for (let i = 0; i < CAP; i++) {
        const a = -Math.PI / 2 + i * 2 * Math.PI / CAP, x = cx + R * Math.cos(a) - s / 2, y = cy + R * Math.sin(a) - s / 2;
        cell(ctx, x, y, s, ring[i], false);
        ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
        ctx.fillText(String(i), cx + (R - s * 0.95) * Math.cos(a), cy + (R - s * 0.95) * Math.sin(a) + 3);
      }
      const mark = (i, t, col, off) => {
        const a = -Math.PI / 2 + i * 2 * Math.PI / CAP, r2 = R + s * 0.55 + 6 + off;
        const ex = cx + (R + s * 0.55) * Math.cos(a), ey = cy + (R + s * 0.55) * Math.sin(a);
        const tx = cx + (r2 + 16) * Math.cos(a), ty = cy + (r2 + 16) * Math.sin(a);
        arrow(ctx, cx + r2 * Math.cos(a), cy + r2 * Math.sin(a), ex, ey, col);
        ctx.fillStyle = col; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(t, tx, ty + 4);
      };
      mark(front, "front", C.forest, 0);
      const rear = (front + items.length) % CAP;
      mark(rear, "다음 rear", C.warn, rear === front ? 22 : 0);
      ctx.fillStyle = C.ink2; ctx.font = `12px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(`size = ${items.length}`, cx, cy + 4);
      return;
    }
    /* 연결 리스트 */
    ctx.fillText("노드(값 | 다음 노드 참조)를 화살표로 이음. 빗금 = None", 8, 14);
    const n = items.length, per = Math.max(1, Math.min(6, Math.floor((w - 20) / 70)));
    const bw = Math.min(56, (w - 20) / per - 18), bh = 30;
    items.forEach((v, i) => {
      const row = Math.floor(i / per), col = i % per;
      const x = 12 + col * (bw + 18), y = 44 + row * (bh + 46);
      ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; rrect(ctx, x, y, bw, bh); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + bw * 0.62, y); ctx.lineTo(x + bw * 0.62, y + bh); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(String(v), x + bw * 0.31, y + bh / 2 + 5);
      const px = x + bw * 0.81, py = y + bh / 2;
      if (i < n - 1) {
        if (col < per - 1) arrow(ctx, px, py, x + bw + 18, py, C.ink2);
        else {
          const my = y + bh + 20, nx = 12 + bw * 0.31;
          ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, my); ctx.lineTo(nx, my); ctx.stroke();
          arrow(ctx, nx, my, nx, y + bh + 46, C.ink2);
        }
      } else { ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + bw * 0.62, y + bh); ctx.lineTo(x + bw, y); ctx.stroke(); }
      if (i === 0) tag(ctx, "head", x + bw / 2, y - 8, C.forest);
      if (i === n - 1) tag(ctx, "tail", x + bw / 2, y + bh + 14, C.warn);
    });
    if (!n) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("head = tail = None", 12, 60); }
  }

  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".presets .chip").forEach((q) => q.setAttribute("aria-pressed", String(q === b)));
    mode = b.dataset.m; reset();
  }));
  $(".push").addEventListener("click", push);
  $(".pop").addEventListener("click", pop);
  $(".clr").addEventListener("click", reset);
  reset();
  if (I1.demo) { root.querySelector(".chip[data-m=listq]").click(); for (let k = 0; k < 7; k++) push(); pop(); }
})();
