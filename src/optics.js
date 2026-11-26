Selfish.Optics = (() => {
    const state = Selfish.State.data;

    function update() {
        const blurVal = Math.max(0, Math.min(100, Number(state.blurPercent)));
        const refVal = Math.max(0, Math.min(100, Number(state.refractionPercent)));
        const refRatio = refVal / 100;

        const px = ((blurVal / 100) * 60).toFixed(1);
        const sat = (115 + refRatio * 60).toFixed(0);
        const rimAlpha = (0.08 + refRatio * 0.26).toFixed(3);
        const causticAlpha = (refRatio * 0.22).toFixed(3);
        const dispersionAlpha = (refRatio * 0.16).toFixed(3);

        const root = document.documentElement;
        root.style.setProperty("--selfish-blur", `${px}px`);
        root.style.setProperty("--selfish-glass-sat", `${sat}%`);
        root.style.setProperty("--selfish-refraction-rim", `rgba(255, 255, 255, ${rimAlpha})`);
        root.style.setProperty("--selfish-refraction-caustic", causticAlpha);
        root.style.setProperty("--selfish-refraction-dispersion", dispersionAlpha);
    }

    function applyBlur(percent) {
        const val = Math.max(0, Math.min(100, Number(percent)));
        Selfish.State.set("blurPercent", String(val));
        update();
    }

    function applyRefraction(percent) {
        const val = Math.max(0, Math.min(100, Number(percent)));
        Selfish.State.set("refractionPercent", String(val));
        update();
    }

    return { init: update, applyBlur, applyRefraction };
})();