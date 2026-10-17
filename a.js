(() => {
  const board = [
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
  ];
  const rows = board.length;
  const cols = board[0].length;
  const cellSize = 38;
  const gap = 4;
  const canvasSize = cols * cellSize + (cols - 1) * gap;
  const colors = {
    0: "#e8edf5",
    1: "#26334a",
    filled: "#42c7a5",
    current: "#ffc857",
    queued: "#8c7cf5",
    stroke: "#ffffff",
  };

  document.head.insertAdjacentHTML(
    "beforeend",
    `<style>
      .floodfill-app {
        --ink: #182338;
        --muted: #68758a;
        --accent: #42c7a5;
        box-sizing: border-box;
        min-height: 100vh;
        padding: 36px 20px;
        display: grid;
        place-items: center;
        color: var(--ink);
        background: radial-gradient(ellipse at top, #f8fbff 0%, #eef2f8 65%, #e9eef6 100%);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .floodfill-app *, .floodfill-app *::before, .floodfill-app *::after { box-sizing: border-box; }
      .floodfill-card {
        width: min(100%, 760px);
        padding: clamp(22px, 5vw, 42px);
        border: 1px solid #ffffff;
        border-radius: 24px;
        background: rgba(255, 255, 255, .86);
        box-shadow: 0 24px 70px rgba(34, 50, 80, .12);
      }
      .floodfill-eyebrow {
        margin: 0 0 8px;
        color: #3a9f88;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: .14em;
        text-transform: uppercase;
      }
      .floodfill-title { margin: 0; font-size: clamp(28px, 5vw, 40px); letter-spacing: -.04em; }
      .floodfill-intro { margin: 10px 0 24px; color: var(--muted); line-height: 1.55; }
      .floodfill-algorithms { display: flex; gap: 9px; margin: 0 0 16px; }
      .floodfill-algorithm {
        min-height: 40px;
        padding: 0 15px;
        border: 1px solid #dce3ed;
        border-radius: 10px;
        color: #536178;
        background: #fff;
        font: inherit;
        font-size: 13px;
        font-weight: 750;
        cursor: pointer;
      }
      .floodfill-algorithm[aria-pressed="true"] {
        border-color: #42c7a5;
        color: #102d29;
        background: #dff8f0;
      }
      .floodfill-stage {
        display: grid;
        place-items: center;
        padding: 18px 12px;
        border: 1px solid #e9edf4;
        border-radius: 18px;
        background: #f7f9fc;
        overflow: auto;
      }
      .floodfill-canvas {
        display: block;
        width: min(${canvasSize}px, 100%);
        height: auto;
        cursor: crosshair;
        touch-action: manipulation;
      }
      .floodfill-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-top: 18px;
      }
      .floodfill-button {
        min-height: 42px;
        padding: 0 16px;
        border: 1px solid #dce3ed;
        border-radius: 11px;
        color: #344159;
        background: #fff;
        font: inherit;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
      }
      .floodfill-button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 14px #26334a18; }
      .floodfill-button:disabled { cursor: not-allowed; opacity: .45; }
      .floodfill-button-primary { border-color: #42c7a5; color: #102d29; background: #42c7a5; }
      .floodfill-speed { display: flex; align-items: center; gap: 9px; margin-left: auto; color: var(--muted); font-size: 13px; }
      .floodfill-speed input { width: 100px; accent-color: #42c7a5; }
      .floodfill-status {
        min-height: 48px;
        margin: 16px 0 0;
        padding: 13px 15px;
        border-radius: 12px;
        color: #48566d;
        background: #f1f5f9;
        font-size: 14px;
        line-height: 1.5;
      }
      .floodfill-legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 17px; color: var(--muted); font-size: 12px; }
      .floodfill-legend span { display: inline-flex; align-items: center; gap: 7px; }
      .floodfill-swatch { width: 12px; height: 12px; border-radius: 4px; }
      .floodfill-note { margin: 18px 0 0; color: #8792a3; font-size: 12px; line-height: 1.5; }
      .floodfill-explanations { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 24px; }
      .floodfill-explanation {
        padding: 17px;
        border: 1px solid #e5eaf1;
        border-radius: 14px;
        background: #fff;
        transition: border-color .15s ease, box-shadow .15s ease;
      }
      .floodfill-explanation.active { border-color: #42c7a5; box-shadow: 0 0 0 2px #42c7a51c; }
      .floodfill-explanation h2 { margin: 0 0 8px; font-size: 16px; }
      .floodfill-explanation p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.55; }
      .floodfill-explanation p + p { margin-top: 9px; }
      .floodfill-explanation code {
        display: block;
        margin-top: 11px;
        padding: 10px;
        border-radius: 9px;
        color: #344159;
        background: #f3f6fa;
        font: 12px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace;
        white-space: pre-wrap;
      }
      @media (max-width: 520px) {
        .floodfill-app { padding: 18px 10px; }
        .floodfill-card { padding: 20px 15px; border-radius: 18px; }
        .floodfill-speed { width: 100%; margin: 4px 0 0; }
        .floodfill-speed input { flex: 1; }
        .floodfill-explanations { grid-template-columns: 1fr; }
      }
    </style>`,
  );

  document.body.innerHTML = `
    <main class="floodfill-app">
      <section class="floodfill-card" aria-labelledby="floodfill-title">
        <p class="floodfill-eyebrow">Algorithm playground</p>
        <h1 class="floodfill-title" id="floodfill-title">Flood fill, visualized</h1>
        <p class="floodfill-intro">Compare two ways to explore the same connected region. Click any cell to choose a starting point.</p>
        <div class="floodfill-algorithms" role="group" aria-label="Choose flood fill algorithm">
          <button class="floodfill-algorithm" data-mode="bfs" aria-pressed="true">Breadth-first (BFS)</button>
          <button class="floodfill-algorithm" data-mode="dfs" aria-pressed="false">Depth-first (DFS)</button>
        </div>
        <div class="floodfill-stage">
          <canvas class="floodfill-canvas" aria-label="Flood fill grid. Click a cell to choose the start."></canvas>
        </div>
        <div class="floodfill-controls">
          <button class="floodfill-button floodfill-button-primary" data-action="play">▶ Play</button>
          <button class="floodfill-button" data-action="step">Step</button>
          <button class="floodfill-button" data-action="reset">Reset</button>
          <label class="floodfill-speed">Speed <input type="range" min="1" max="10" value="5"><span>5×</span></label>
        </div>
        <p class="floodfill-status" aria-live="polite"></p>
        <div class="floodfill-legend" aria-label="Grid legend">
          <span><i class="floodfill-swatch" style="background:${colors[0]}"></i>Other color</span>
          <span><i class="floodfill-swatch" style="background:${colors.queued}"></i>Waiting in frontier</span>
          <span><i class="floodfill-swatch" style="background:${colors.current}"></i>Current cell</span>
          <span><i class="floodfill-swatch" style="background:${colors.filled}"></i>Filled</span>
          <span><i class="floodfill-swatch" style="background:${colors[1]}"></i>Dark cells</span>
        </div>
        <p class="floodfill-note">The fill targets the starting cell's color. Cells of the other color act as barriers; neighbors are checked up, right, down, and left.</p>
        <section class="floodfill-explanations" aria-label="How the algorithms work">
          <article class="floodfill-explanation active" data-explanation="bfs">
            <h2>Breadth-first search</h2>
            <p>BFS uses a first-in, first-out (FIFO) queue. It visits cells in waves: first the start, then its neighbors, then cells two steps away, and so on.</p>
            <p>This is useful for finding the shortest path in an unweighted grid. Flood fill itself still colors the same connected region.</p>
            <code>add start to queue
while queue is not empty:
  cell = remove from front
  fill cell; add matching neighbors to back</code>
          </article>
          <article class="floodfill-explanation" data-explanation="dfs">
            <h2>Depth-first search</h2>
            <p>DFS uses a last-in, first-out (LIFO) stack. It follows one branch as far as it can, then backtracks to explore remaining neighbors.</p>
            <p>DFS is useful for exploring connected components and maze traversal. It does not guarantee a shortest path.</p>
            <code>add start to stack
while stack is not empty:
  cell = remove from top
  fill cell; add matching neighbors to top</code>
          </article>
        </section>
        <p class="floodfill-note">Both methods take O(R × C) time in the worst case and use up to O(R × C) extra space, where R × C is the grid size. Their visit order differs, but the filled region is identical.</p>
      </section>
    </main>`;

  const canvas = document.querySelector(".floodfill-canvas");
  const context = canvas.getContext("2d");
  const status = document.querySelector(".floodfill-status");
  const playButton = document.querySelector('[data-action="play"]');
  const stepButton = document.querySelector('[data-action="step"]');
  const resetButton = document.querySelector('[data-action="reset"]');
  const speedInput = document.querySelector(".floodfill-speed input");
  const speedLabel = document.querySelector(".floodfill-speed span");
  const algorithmButtons = [...document.querySelectorAll(".floodfill-algorithm")];
  const explanationCards = [...document.querySelectorAll(".floodfill-explanation")];

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  let start = { row: 1, col: 1 };
  let mode = "bfs";
  let targetColor;
  let frontier;
  let frontierHead;
  let queued;
  let visited;
  let current;
  let filledCount;
  let timer;
  let complete;

  function reset() {
    stop();
    targetColor = board[start.row][start.col];
    frontier = [{ ...start }];
    frontierHead = 0;
    queued = new Set([key(start.row, start.col)]);
    visited = new Set();
    current = null;
    filledCount = 0;
    complete = false;
    render();
    updateStatus(`${mode === "bfs" ? "BFS queue" : "DFS stack"} ready. Starting at row ${start.row + 1}, column ${start.col + 1}; target color is ${targetColor === 0 ? "light" : "dark"}.`);
    updateButtons();
  }

  function key(row, col) {
    return `${row},${col}`;
  }

  function pendingCount() {
    return mode === "bfs" ? frontier.length - frontierHead : frontier.length;
  }

  function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const cellKey = key(row, col);
        const x = col * (cellSize + gap);
        const y = row * (cellSize + gap);
        let color = colors[board[row][col]];

        if (visited.has(cellKey)) color = colors.filled;
        else if (current && current.row === row && current.col === col) color = colors.current;
        else if (queued.has(cellKey)) color = colors.queued;

        context.fillStyle = color;
        context.beginPath();
        context.roundRect(x, y, cellSize, cellSize, 9);
        context.fill();

        if (start.row === row && start.col === col) {
          context.strokeStyle = "#172238";
          context.lineWidth = 2;
          context.stroke();
          context.fillStyle = color === colors[1] ? "#ffffff" : "#172238";
          context.font = "700 11px system-ui, sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText("S", x + cellSize / 2, y + cellSize / 2);
        }
      }
    }
  }

  function updateStatus(message) {
    status.textContent = message;
  }

  function updateButtons() {
    stepButton.disabled = complete;
    playButton.textContent = timer ? "⏸ Pause" : "▶ Play";
    playButton.setAttribute("aria-pressed", String(Boolean(timer)));
    for (const button of algorithmButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
    }
    for (const card of explanationCards) {
      card.classList.toggle("active", card.dataset.explanation === mode);
    }
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    updateButtons();
  }

  function step() {
    current = (mode === "bfs" ? frontier[frontierHead++] : frontier.pop()) || null;
    if (!current) {
      complete = true;
      stop();
      render();
      updateStatus(`Flood fill complete: ${filledCount} cell${filledCount === 1 ? "" : "s"} filled.`);
      updateButtons();
      return;
    }

    const currentKey = key(current.row, current.col);
    visited.add(currentKey);
    filledCount += 1;
    const neighbors = [
      [current.row - 1, current.col],
      [current.row, current.col + 1],
      [current.row + 1, current.col],
      [current.row, current.col - 1],
    ];

    for (const [row, col] of neighbors) {
      if (row < 0 || row >= rows || col < 0 || col >= cols) continue;
      const neighborKey = key(row, col);
      if (board[row][col] === targetColor && !queued.has(neighborKey)) {
        queued.add(neighborKey);
        frontier.push({ row, col });
      }
    }
    const waiting = pendingCount();
    updateStatus(`Filled cell ${filledCount}. ${waiting} cell${waiting === 1 ? "" : "s"} waiting in the ${mode === "bfs" ? "queue" : "stack"}.`);

    render();
    if (pendingCount() === 0) {
      current = null;
      complete = true;
      stop();
      render();
      updateStatus(`${mode === "bfs" ? "BFS" : "DFS"} complete: ${filledCount} cell${filledCount === 1 ? "" : "s"} filled.`);
    }
    updateButtons();
  }

  function play() {
    if (timer) {
      stop();
      return;
    }
    if (complete) return;
    const interval = Math.max(90, 650 - Number(speedInput.value) * 55);
    timer = window.setInterval(step, interval);
    updateButtons();
  }

  canvas.addEventListener("click", (event) => {
    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;
    const x = (event.clientX - bounds.left) * scaleX;
    const y = (event.clientY - bounds.top) * scaleY;
    const col = Math.floor(x / (cellSize + gap));
    const row = Math.floor(y / (cellSize + gap));
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    if (x % (cellSize + gap) >= cellSize || y % (cellSize + gap) >= cellSize) return;
    start = { row, col };
    reset();
  });

  playButton.addEventListener("click", play);
  stepButton.addEventListener("click", step);
  resetButton.addEventListener("click", reset);
  for (const button of algorithmButtons) {
    button.addEventListener("click", () => {
      if (button.dataset.mode === mode) return;
      mode = button.dataset.mode;
      reset();
    });
  }
  speedInput.addEventListener("input", () => {
    speedLabel.textContent = `${speedInput.value}×`;
    if (timer) {
      stop();
      play();
    }
  });

  reset();
})();