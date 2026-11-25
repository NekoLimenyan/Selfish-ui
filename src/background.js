Selfish.Background = (() => {
    const state = Selfish.State.data;
    let activeBgUrl = "";
    let activeSlideIdx = 0;
    let transitionToken = 0;

    function getCoverUrl() {
        const raw = Spicetify.Player.data?.item?.metadata?.image_xlarge_url
            || Spicetify.Player.data?.item?.metadata?.image_large_url
            || Spicetify.Player.data?.item?.metadata?.image_url
            || "";
        return raw.startsWith("spotify:image:") ? raw.replace("spotify:image:", "https://i.scdn.co/image/") : raw;
    }

    async function getContainer() {
        let container = document.querySelector(".Root__top-container");
        while (!container) {
            await new Promise(r => setTimeout(r, 100));
            container = document.querySelector(".Root__top-container");
        }
        return container;
    }

    function ensureBgStage(container) {
        let stage = document.getElementById("selfish-bg-stage");
        if (!stage) {
            stage = document.createElement("div");
            stage.id = "selfish-bg-stage";
            stage.innerHTML = `<div class="selfish-bg-slide"></div><div class="selfish-bg-slide"></div>`;
            container.prepend(stage);
        }
        return stage.querySelectorAll(".selfish-bg-slide");
    }

    function preloadImage(src) {
        return new Promise(resolve => {
            if (!src) return resolve(false);
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }

    async function transitionTo(newUrl, onSwap = null) {
        const container = await getContainer();
        const slides = ensureBgStage(container);
        const token = ++transitionToken;

        if (!newUrl) {
            slides.forEach(s => {
                s.style.transition = "opacity 0.22s ease-out";
                s.style.opacity = "0";
            });
            activeBgUrl = "";
            if (typeof onSwap === "function") onSwap();
            setTimeout(() => {
                if (token === transitionToken) container.classList.remove("has-custom-bg");
            }, 230);
            return;
        }

        if (activeBgUrl === newUrl && container.classList.contains("has-custom-bg")) {
            if (typeof onSwap === "function") onSwap();
            return;
        }

        await preloadImage(newUrl);
        if (token !== transitionToken) return;

        const prevSlide = slides[activeSlideIdx];
        const nextIdx = 1 - activeSlideIdx;
        const nextSlide = slides[nextIdx];
        const hadBg = container.classList.contains("has-custom-bg") && Boolean(activeBgUrl);

        container.classList.add("has-custom-bg");
        activeBgUrl = newUrl;
        activeSlideIdx = nextIdx;

        nextSlide.style.transition = "none";
        nextSlide.style.opacity = "0";
        nextSlide.style.backgroundImage = `url("${newUrl}")`;
        void nextSlide.offsetWidth;

        if (typeof onSwap === "function") onSwap();

        if (hadBg) {
            prevSlide.style.transition = "opacity 0.2s ease-out";
            prevSlide.style.opacity = "0";
            nextSlide.style.transition = "opacity 0.25s ease-in 0.07s";
            nextSlide.style.opacity = "1";
        } else {
            nextSlide.style.transition = "opacity 0.28s ease-out";
            nextSlide.style.opacity = "1";
        }
    }

    async function applyCoverBackground() {
        const cover = getCoverUrl();
        await transitionTo(cover || null, () => {
            if (state.colorMode === "adaptive") Selfish.Colors.syncAdaptive(cover || null);
        });
    }

    async function applyBackground(dataUrl, id = null, onUpdate = null) {
        if (dataUrl) {
            if (id) {
                Selfish.State.set("currentBgId", id);
                const nextHistory = [id, ...state.bgHistoryIds.filter(i => i !== id)].slice(0, 10);
                Selfish.State.set("bgHistoryIds", nextHistory);
            }
            await transitionTo(dataUrl, () => {
                if (state.colorMode === "adaptive") Selfish.Colors.syncAdaptive(dataUrl);
            });
        } else {
            Selfish.State.set("currentBgId", null);
            await transitionTo(null, () => Selfish.Colors.syncAdaptive(null));
        }
        if (typeof onUpdate === "function") onUpdate();
    }

    async function setBgMode(mode) {
        const nextMode = mode === "cover" ? "cover" : "custom";
        Selfish.State.set("bgMode", nextMode);

        if (nextMode === "cover") {
            await applyCoverBackground();
        } else if (state.currentBgId) {
            const data = await Selfish.DB.get(state.currentBgId);
            await applyBackground(data || null, data ? state.currentBgId : null);
        } else {
            await applyBackground(null);
        }
    }

    async function init() {
        if (state.bgMode === "cover") {
            await applyCoverBackground();
        } else if (state.currentBgId) {
            const data = await Selfish.DB.get(state.currentBgId);
            if (data) await applyBackground(data, state.currentBgId);
            else Selfish.Colors.syncAdaptive(null);
        } else {
            Selfish.Colors.syncAdaptive(null);
        }
    }

    return { init, getCoverUrl, applyCoverBackground, applyBackground, setBgMode };
})();