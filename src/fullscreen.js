Selfish.Fullscreen = (() => {
    const BAR_COUNT = 36;
    const smoothBars = new Float32Array(BAR_COUNT).fill(0.08);
    let overlay, fsBg, fsCover, fsTitle, fsArtist, canvas, ctx, progress, timeCur, timeTot, playIcon;
    let fsAccent = "#b026ff";
    let audioData = null;
    let hideTimer = null;
    let isSeeking = false;

    const formatMs = ms => {
        const sec = Math.max(0, Math.floor(ms / 1000));
        return `${Math.floor(sec / 60)}:${sec % 60 < 10 ? "0" : ""}${sec % 60}`;
    };

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = canvas.offsetWidth || 500;
        canvas.height = canvas.offsetHeight || 74;
    }

    function resetUiTimer() {
        overlay.classList.remove("fs-hide-ui");
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            if (Spicetify.Player.isPlaying() && !overlay.classList.contains("hidden")) {
                overlay.classList.add("fs-hide-ui");
            }
        }, 3000);
    }

    function syncPlayIcon() {
        const playing = Spicetify.Player.isPlaying();
        playIcon.innerHTML = playing
            ? `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`
            : `<path d="M8 5v14l11-7z"/>`;
        playing ? resetUiTimer() : (overlay.classList.remove("fs-hide-ui"), clearTimeout(hideTimer));
    }

    async function loadAudioAnalysis() {
        audioData = null;
        try {
            if (typeof Spicetify.getAudioData === "function") audioData = await Spicetify.getAudioData();
        } catch (e) {}
    }

    function syncTrack() {
        const item = Spicetify.Player.data?.item;
        if (!item) return;
        fsTitle.textContent = item.name || item.metadata?.title || "Невідомий трек";
        fsArtist.textContent = item.artists?.map(a => a.name).join(", ") || item.metadata?.artist_name || "Невідомий виконавець";

        const cover = Selfish.Background.getCoverUrl();
        if (cover) {
            fsCover.src = cover;
            fsBg.style.backgroundImage = `url("${cover}")`;
            Selfish.Colors.extractDominantColor(cover, hex => {
                fsAccent = hex;
                overlay.style.setProperty("--fs-accent", hex);
            });
        }
        syncPlayIcon();
        loadAudioAnalysis();
    }

    function open() {
        syncTrack();
        overlay.classList.remove("hidden");
        resizeCanvas();
        resetUiTimer();
    }

    function close() {
        overlay.classList.add("hidden");
        clearTimeout(hideTimer);
    }

    function renderLoop() {
        requestAnimationFrame(renderLoop);
        if (!overlay || overlay.classList.contains("hidden")) return;

        const posMs = Spicetify.Player.getProgress();
        const durMs = Spicetify.Player.getDuration() || 1;
        const playing = Spicetify.Player.isPlaying();

        if (!isSeeking) {
            const pct = Math.min(100, (posMs / durMs) * 100);
            progress.value = pct;
            progress.style.setProperty("--progress", `${pct}%`);
            timeCur.textContent = formatMs(posMs);
            timeTot.textContent = formatMs(durMs);
        }

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        let seg = null;
        if (audioData?.segments?.length) {
            const posSec = posMs / 1000;
            const segs = audioData.segments;
            let lo = 0, hi = segs.length - 1;
            while (lo <= hi) {
                const mid = (lo + hi) >> 1;
                if (segs[mid].start <= posSec) { seg = segs[mid]; lo = mid + 1; }
                else hi = mid - 1;
            }
        }

        const centerY = h / 2;
        const gap = 3;
        const barW = Math.max(3, (w - gap * (BAR_COUNT - 1)) / BAR_COUNT);
        const now = performance.now() / 1000;

        for (let i = 0; i < BAR_COUNT; i++) {
            let target = 0.06;
            if (playing) {
                if (seg?.pitches) {
                    const pIdx = Math.floor((i / BAR_COUNT) * 12);
                    const frac = ((i / BAR_COUNT) * 12) - pIdx;
                    const pitch = seg.pitches[pIdx] * (1 - frac) + seg.pitches[(pIdx + 1) % 12] * frac;
                    const loud = Math.max(0.15, Math.min(1, ((seg.loudness_max ?? -15) + 45) / 42));
                    target = Math.min(1, pitch * loud * (0.85 + 0.15 * Math.sin(now * 8 + i * 0.6)));
                } else {
                    target = 0.25 + 0.45 * Math.abs(Math.sin(now * 4 + i * 0.45) * Math.cos(now * 2.3 - i * 0.2));
                }
            }

            smoothBars[i] = smoothBars[i] * 0.68 + target * 0.32;
            const barH = Math.max(3, smoothBars[i] * (h / 2) * 0.9);
            const x = i * (barW + gap);

            ctx.fillStyle = fsAccent;
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.roundRect(x, centerY - barH, barW, barH, [3, 3, 0, 0]);
            ctx.fill();

            ctx.globalAlpha = 0.28;
            ctx.beginPath();
            ctx.roundRect(x, centerY, barW, barH * 0.6, [0, 0, 3, 3]);
            ctx.fill();
        }
    }

    function init() {
        overlay = document.createElement("div");
        overlay.id = "selfish-fs-overlay";
        overlay.className = "hidden";
        overlay.innerHTML = `
            <div id="selfish-fs-bg"></div>
            <button id="selfish-fs-close" title="Закрити (Esc)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            <div class="selfish-fs-container">
                <div class="selfish-fs-cover-wrap"><img id="selfish-fs-cover" src="" alt="Cover"></div>
                <div class="selfish-fs-info">
                    <h1 id="selfish-fs-title">Назва треку</h1>
                    <p id="selfish-fs-artist">Виконавець</p>
                    <div id="selfish-fs-vis-wrap"><canvas id="selfish-fs-visualizer"></canvas></div>
                    <div class="selfish-fs-progress-wrap">
                        <div class="selfish-fs-time-row"><span id="selfish-fs-time-cur">0:00</span><span id="selfish-fs-time-tot">0:00</span></div>
                        <input type="range" id="selfish-fs-progress" min="0" max="100" step="0.1" value="0">
                    </div>
                    <div class="selfish-fs-controls">
                        <button class="selfish-fs-ctrl-btn" id="selfish-fs-prev"><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                        <button class="selfish-fs-play-btn" id="selfish-fs-play"><svg id="selfish-fs-play-icon" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
                        <button class="selfish-fs-ctrl-btn" id="selfish-fs-next"><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        fsBg = overlay.querySelector("#selfish-fs-bg");
        fsCover = overlay.querySelector("#selfish-fs-cover");
        fsTitle = overlay.querySelector("#selfish-fs-title");
        fsArtist = overlay.querySelector("#selfish-fs-artist");
        canvas = overlay.querySelector("#selfish-fs-visualizer");
        ctx = canvas.getContext("2d");
        progress = overlay.querySelector("#selfish-fs-progress");
        timeCur = overlay.querySelector("#selfish-fs-time-cur");
        timeTot = overlay.querySelector("#selfish-fs-time-tot");
        playIcon = overlay.querySelector("#selfish-fs-play-icon");

        window.addEventListener("resize", resizeCanvas);
        overlay.addEventListener("mousemove", e => {
            if (overlay.classList.contains("hidden")) return;
            fsCover.style.transform = `perspective(1000px) rotateY(${(window.innerWidth / 2 - e.pageX) / 25}deg) rotateX(${(window.innerHeight / 2 - e.pageY) / 25}deg)`;
            resetUiTimer();
        });
        overlay.addEventListener("mouseleave", () => { fsCover.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)"; });
        overlay.addEventListener("click", resetUiTimer);

        overlay.querySelector("#selfish-fs-close").onclick = close;
        overlay.querySelector("#selfish-fs-prev").onclick = () => Spicetify.Player.back();
        overlay.querySelector("#selfish-fs-next").onclick = () => Spicetify.Player.next();
        overlay.querySelector("#selfish-fs-play").onclick = () => Spicetify.Player.togglePlay();

        progress.oninput = e => {
            isSeeking = true;
            progress.style.setProperty("--progress", `${e.target.value}%`);
            timeCur.textContent = formatMs((Number(e.target.value) / 100) * Spicetify.Player.getDuration());
        };
        progress.onchange = e => { Spicetify.Player.seek(Number(e.target.value) / 100); isSeeking = false; };

        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && !overlay.classList.contains("hidden")) close();
            if (e.altKey && e.code === "KeyF") { e.preventDefault(); overlay.classList.contains("hidden") ? open() : close(); }
        });

        Spicetify.Player.addEventListener("songchange", () => { if (!overlay.classList.contains("hidden")) syncTrack(); });
        Spicetify.Player.addEventListener("onplaypause", syncPlayIcon);
        renderLoop();
    }

    return { init, open, close };
})();