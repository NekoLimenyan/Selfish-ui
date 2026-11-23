Selfish.Engine = (() => {
    const state = {
        colorMode: localStorage.getItem("selfishColorMode") || "fixed",
        savedColor: localStorage.getItem("selfishThemeColor") || "#b026ff",
        blurPercent: localStorage.getItem("selfishGlassBlurPercent") || "33",
        currentBgId: localStorage.getItem("selfishCurrentBgId") || null,
        bgHistoryIds: JSON.parse(localStorage.getItem("selfishBgHistoryIds") || "[]")
    };

    function hexToRgb(hex) {
        let clean = hex.replace("#", "").trim();
        if (clean.length === 3) clean = clean.split("").map(c => c + c).join("");
        const num = parseInt(clean, 16);
        return isNaN(num) ? [176, 38, 255] : [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    function applyColor(hex, persist = true) {
        const [r, g, b] = hexToRgb(hex);
        const root = document.documentElement;
        root.style.setProperty("--selfish-accent", hex);
        root.style.setProperty("--selfish-accent-rgb", `${r}, ${g}, ${b}`);
        root.style.setProperty("--selfish-accent-glow", `0 0 15px rgba(${r}, ${g}, ${b}, 0.6)`);

        if (persist && state.colorMode === "fixed") {
            state.savedColor = hex;
            localStorage.setItem("selfishThemeColor", hex);
        }
    }

    function applyBlur(percent) {
        const val = Math.max(0, Math.min(100, Number(percent)));
        const px = ((val / 100) * 60).toFixed(1);
        document.documentElement.style.setProperty("--selfish-blur", `${px}px`);
        state.blurPercent = String(val);
        localStorage.setItem("selfishGlassBlurPercent", state.blurPercent);
    }

    function getCoverUrl() {
        const raw = Spicetify.Player.data?.item?.metadata?.image_xlarge_url
            || Spicetify.Player.data?.item?.metadata?.image_large_url
            || Spicetify.Player.data?.item?.metadata?.image_url
            || "";
        return raw.startsWith("spotify:image:") ? raw.replace("spotify:image:", "https://i.scdn.co/image/") : raw;
    }

    function extractDominantColor(src, callback) {
        if (!src) return;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, 1, 1);
                let [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

                if (r < 40 && g < 40 && b < 40) {
                    r = Math.min(255, r + 80);
                    g = Math.min(255, g + 80);
                    b = Math.min(255, b + 80);
                }
                const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
                if (isGray) return callback("#d8b4fe");

                const max = Math.max(r, g, b);
                if (max === r) r = Math.min(255, r + 45);
                if (max === g) g = Math.min(255, g + 45);
                if (max === b) b = Math.min(255, b + 45);

                callback("#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join(""));
            } catch (e) {}
        };
        img.src = src;
    }

    function syncAdaptive(bgDataUrl = null) {
        if (state.colorMode !== "adaptive") return applyColor(state.savedColor, false);
        if (bgDataUrl) return extractDominantColor(bgDataUrl, hex => applyColor(hex, false));
        if (state.currentBgId) {
            return Selfish.DB.get(state.currentBgId).then(data => {
                if (data) extractDominantColor(data, hex => applyColor(hex, false));
            });
        }
        const cover = getCoverUrl();
        if (cover) extractDominantColor(cover, hex => applyColor(hex, false));
    }

    async function applyBackground(dataUrl, id = null, onUpdate = null) {
        let container = document.querySelector(".Root__top-container");
        while (!container) {
            await new Promise(r => setTimeout(r, 100));
            container = document.querySelector(".Root__top-container");
        }

        if (dataUrl) {
            container.classList.add("has-custom-bg");
            container.style.setProperty("background-image", `url("${dataUrl}")`, "important");
            if (id) {
                state.currentBgId = id;
                localStorage.setItem("selfishCurrentBgId", id);
                state.bgHistoryIds = [id, ...state.bgHistoryIds.filter(i => i !== id)].slice(0, 10);
                localStorage.setItem("selfishBgHistoryIds", JSON.stringify(state.bgHistoryIds));
            }
            if (state.colorMode === "adaptive") syncAdaptive(dataUrl);
        } else {
            container.classList.remove("has-custom-bg");
            container.style.removeProperty("background-image");
            state.currentBgId = null;
            localStorage.removeItem("selfishCurrentBgId");
            syncAdaptive();
        }
        if (typeof onUpdate === "function") onUpdate();
    }

    async function init() {
        applyBlur(state.blurPercent);
        applyColor(state.savedColor, false);
        if (state.currentBgId) {
            const data = await Selfish.DB.get(state.currentBgId);
            if (data) await applyBackground(data, state.currentBgId);
            else syncAdaptive();
        } else {
            syncAdaptive();
        }
        Spicetify.Player.addEventListener("songchange", () => {
            if (state.colorMode === "adaptive" && !state.currentBgId) syncAdaptive();
        });
    }

    return { state, init, applyColor, applyBlur, applyBackground, syncAdaptive, getCoverUrl, extractDominantColor };
})();