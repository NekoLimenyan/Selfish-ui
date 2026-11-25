Selfish.State = (() => {
    const STORAGE_KEYS = {
        bgMode: "selfishBgMode",
        colorMode: "selfishColorMode",
        savedColor: "selfishThemeColor",
        savedColor2: "selfishThemeColor2",
        gradientAngle: "selfishGradientAngle",
        blurPercent: "selfishGlassBlurPercent",
        refractionPercent: "selfishGlassRefractionPercent",
        currentBgId: "selfishCurrentBgId",
        bgHistoryIds: "selfishBgHistoryIds"
    };

    const data = {
        bgMode: localStorage.getItem(STORAGE_KEYS.bgMode) || "custom",
        colorMode: localStorage.getItem(STORAGE_KEYS.colorMode) || "fixed",
        savedColor: localStorage.getItem(STORAGE_KEYS.savedColor) || "#b026ff",
        savedColor2: localStorage.getItem(STORAGE_KEYS.savedColor2) || "#ff2a85",
        gradientAngle: localStorage.getItem(STORAGE_KEYS.gradientAngle) || "135",
        blurPercent: localStorage.getItem(STORAGE_KEYS.blurPercent) || "33",
        refractionPercent: localStorage.getItem(STORAGE_KEYS.refractionPercent) || "0",
        currentBgId: localStorage.getItem(STORAGE_KEYS.currentBgId) || null,
        bgHistoryIds: JSON.parse(localStorage.getItem(STORAGE_KEYS.bgHistoryIds) || "[]")
    };

    function set(key, value) {
        data[key] = value;
        const storageKey = STORAGE_KEYS[key];
        if (!storageKey) return;

        if (value === null || value === undefined) {
            localStorage.removeItem(storageKey);
        } else if (Array.isArray(value)) {
            localStorage.setItem(storageKey, JSON.stringify(value));
        } else {
            localStorage.setItem(storageKey, String(value));
        }
    }

    return { data, set };
})();