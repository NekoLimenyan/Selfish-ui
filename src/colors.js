Selfish.Colors = (() => {
    const state = Selfish.State.data;

    function hexToRgb(hex) {
        let clean = hex.replace("#", "").trim();
        if (clean.length === 3) clean = clean.split("").map(c => c + c).join("");
        const num = parseInt(clean, 16);
        return isNaN(num) ? [176, 38, 255] : [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    function rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
    }

    function applyColor(hex, persist = true) {
        const [r, g, b] = hexToRgb(hex);
        const root = document.documentElement;
        root.classList.remove("selfish-gradient-mode");
        root.style.setProperty("--selfish-accent", hex);
        root.style.setProperty("--selfish-accent-2", hex);
        root.style.setProperty("--selfish-accent-bg", hex);
        root.style.setProperty("--selfish-accent-rgb", `${r}, ${g}, ${b}`);
        root.style.setProperty("--selfish-accent-2-rgb", `${r}, ${g}, ${b}`);
        root.style.setProperty("--selfish-accent-glow", `0 0 15px rgba(${r}, ${g}, ${b}, 0.6)`);

        if (persist && state.colorMode === "fixed") {
            Selfish.State.set("savedColor", hex);
        }
    }

    function applyGradient(hex1, hex2, angle = state.gradientAngle, persist = true) {
        const [r1, g1, b1] = hexToRgb(hex1);
        const [r2, g2, b2] = hexToRgb(hex2);
        const deg = Math.max(0, Math.min(360, Number(angle) || 135));
        const grad = `linear-gradient(${deg}deg, ${hex1}, ${hex2})`;

        const root = document.documentElement;
        root.classList.add("selfish-gradient-mode");
        root.style.setProperty("--selfish-accent", hex1);
        root.style.setProperty("--selfish-accent-2", hex2);
        root.style.setProperty("--selfish-accent-bg", grad);
        root.style.setProperty("--selfish-accent-rgb", `${r1}, ${g1}, ${b1}`);
        root.style.setProperty("--selfish-accent-2-rgb", `${r2}, ${g2}, ${b2}`);
        root.style.setProperty(
            "--selfish-accent-glow",
            `0 0 14px rgba(${r1}, ${g1}, ${b1}, 0.55), 0 0 22px rgba(${r2}, ${g2}, ${b2}, 0.35)`
        );

        if (persist) {
            Selfish.State.set("savedColor", hex1);
            Selfish.State.set("savedColor2", hex2);
            Selfish.State.set("gradientAngle", String(deg));
        }
    }

    function extractDominantColor(src, callback) {
        if (!src) return;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            try {
                const size = 16;
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, size, size);
                const pixels = ctx.getImageData(0, 0, size, size).data;

                let bestScore = -1;
                let bestRgb = [176, 38, 255];
                let bestDiff = 0;

                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    if (pixels[i + 3] < 128) continue;

                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const diff = max - min;
                    const lum = (max + min) / 2;

                    if (max < 35 || min > 238) continue;

                    const score = diff * 2.2 + (lum >= 50 && lum <= 215 ? 45 : 0);
                    if (score > bestScore) {
                        bestScore = score;
                        bestRgb = [r, g, b];
                        bestDiff = diff;
                    }
                }

                if (bestScore < 0 || bestDiff < 18) return callback("#c084fc");

                let [r, g, b] = bestRgb;
                const max = Math.max(r, g, b);
                if (max < 145) {
                    const boost = 145 - max;
                    r = Math.min(255, r + boost);
                    g = Math.min(255, g + boost);
                    b = Math.min(255, b + boost);
                }

                callback(rgbToHex(r, g, b));
            } catch (e) {}
        };
        img.src = src;
    }

    function syncAdaptive(bgDataUrl = null) {
        if (state.colorMode === "gradient") {
            return applyGradient(state.savedColor, state.savedColor2, state.gradientAngle, false);
        }
        if (state.colorMode !== "adaptive") {
            return applyColor(state.savedColor, false);
        }
        if (bgDataUrl) {
            return extractDominantColor(bgDataUrl, hex => applyColor(hex, false));
        }
        if (state.bgMode === "cover") {
            const cover = Selfish.Background.getCoverUrl();
            if (cover) return extractDominantColor(cover, hex => applyColor(hex, false));
        }
        if (state.currentBgId) {
            return Selfish.DB.get(state.currentBgId).then(data => {
                if (data) extractDominantColor(data, hex => applyColor(hex, false));
            });
        }
        const cover = Selfish.Background.getCoverUrl();
        if (cover) extractDominantColor(cover, hex => applyColor(hex, false));
    }

    function init() {
        if (state.colorMode === "gradient") {
            applyGradient(state.savedColor, state.savedColor2, state.gradientAngle, false);
        } else {
            applyColor(state.savedColor, false);
        }
    }

    return { init, applyColor, applyGradient, extractDominantColor, syncAdaptive };
})();