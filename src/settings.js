Selfish.Settings = (() => {
    function setRangeFill(el, max = 100) {
        const pct = Math.max(0, Math.min(100, (Number(el.value) / max) * 100));
        el.style.setProperty("--range-pct", `${pct}%`);
    }

    function open() {
        const state = Selfish.State.data;
        const { applyBackground, setBgMode } = Selfish.Background;
        const { applyBlur, applyRefraction } = Selfish.Optics;

        const wrap = document.createElement("div");
        wrap.className = "selfish-settings-wrap";

        wrap.innerHTML = `
            <div class="selfish-card">
                <div class="selfish-card-header">
                    <h3 class="selfish-card-title">
                        <span class="selfish-title-badge">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                        </span>
                        Задній фон та Оптика скла
                    </h3>
                </div>

                <div class="selfish-mode-cards">
                    <div class="selfish-mode-card selfish-bg-mode ${state.bgMode === "custom" ? "active" : ""}" data-bgmode="custom">
                        <div class="selfish-mode-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/></svg>
                        </div>
                        <div class="selfish-mode-text">
                            <span class="selfish-mode-name">Свій фон</span>
                            <span class="selfish-mode-desc">Власне фото або GIF</span>
                        </div>
                    </div>

                    <div class="selfish-mode-card selfish-bg-mode ${state.bgMode === "cover" ? "active" : ""}" data-bgmode="cover">
                        <div class="selfish-mode-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                        </div>
                        <div class="selfish-mode-text">
                            <span class="selfish-mode-name">Обкладинка треку</span>
                            <span class="selfish-mode-desc">Жива зміна під музику</span>
                        </div>
                    </div>
                </div>

                <div class="selfish-bg-drawer" id="selfish-custom-bg-controls" style="${state.bgMode === "cover" ? "opacity:0.45;" : ""}">
                    <div class="selfish-row">
                        <span class="selfish-label">Галерея власних фонів</span>
                        <div class="selfish-btn-group">
                            <input type="file" id="selfish-bg-input" accept="image/*" style="display:none">
                            <button type="button" class="selfish-btn primary" id="selfish-bg-upload-btn">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
                                Завантажити
                            </button>
                            <button type="button" class="selfish-btn" id="selfish-bg-reset-btn">Скинути</button>
                        </div>
                    </div>
                    <div class="selfish-bg-history" id="selfish-bg-history"></div>
                </div>

                <div class="selfish-sliders-grid">
                    <div class="selfish-slider-box">
                        <div style="display:flex; justify-content:space-between; margin-bottom:7px;">
                            <span class="selfish-label">Матовість (Blur)</span>
                            <span id="selfish-blur-label" style="font-size:12px; font-weight:700; color:var(--selfish-accent);">${state.blurPercent}%</span>
                        </div>
                        <input type="range" id="selfish-blur-range" class="selfish-range" min="0" max="100" value="${state.blurPercent}">
                    </div>
                    <div class="selfish-slider-box">
                        <div style="display:flex; justify-content:space-between; margin-bottom:7px;">
                            <span class="selfish-label">Оптика плівки</span>
                            <span id="selfish-refraction-label" style="font-size:12px; font-weight:700; color:var(--selfish-accent);">${state.refractionPercent}%</span>
                        </div>
                        <input type="range" id="selfish-refraction-range" class="selfish-range" min="0" max="100" value="${state.refractionPercent}">
                    </div>
                </div>
            </div>

            <div class="selfish-card" id="selfish-color-card">
                <div class="selfish-card-header">
                    <h3 class="selfish-card-title">
                        <span class="selfish-title-badge">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                        </span>
                        Акцентний колір та Градієнт
                    </h3>
                </div>
                <div class="selfish-segmented">
                    <div class="selfish-radio selfish-color-mode ${state.colorMode === "fixed" ? "active" : ""}" data-mode="fixed">Постійний</div>
                    <div class="selfish-radio selfish-color-mode ${state.colorMode === "gradient" ? "active" : ""}" data-mode="gradient">Градієнт</div>
                    <div class="selfish-radio selfish-color-mode ${state.colorMode === "adaptive" ? "active" : ""}" data-mode="adaptive">Адаптивний</div>
                </div>
            </div>
        `;

        const picker = Selfish.Picker.create(setRangeFill);
        wrap.querySelector("#selfish-color-card").appendChild(picker.element);

        const customBgControls = wrap.querySelector("#selfish-custom-bg-controls");
        const bgModeBtns = wrap.querySelectorAll(".selfish-bg-mode");
        const colorModeBtns = wrap.querySelectorAll(".selfish-color-mode");

        function syncBgModeUi(mode) {
            bgModeBtns.forEach(b => b.classList.toggle("active", b.dataset.bgmode === mode));
            customBgControls.style.opacity = mode === "cover" ? "0.45" : "1";
        }

        function setColorMode(mode) {
            colorModeBtns.forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
            Selfish.State.set("colorMode", mode);
            picker.setMode(mode);
        }

        colorModeBtns.forEach(btn => {
            btn.onclick = () => setColorMode(btn.dataset.mode);
        });

        bgModeBtns.forEach(btn => {
            btn.onclick = async () => {
                const mode = btn.dataset.bgmode;
                syncBgModeUi(mode);
                if (mode === "cover" && state.colorMode !== "adaptive") setColorMode("adaptive");
                await setBgMode(mode);
                Spicetify.showNotification(mode === "cover" ? "Фон та палітра за обкладинкою треку" : "Режим власного фону");
            };
        });

        const historyEl = wrap.querySelector("#selfish-bg-history");
        async function renderHistory() {
            if (!state.bgHistoryIds.length) {
                historyEl.innerHTML = `<span style="font-size:11.5px; color:rgba(255,255,255,0.45); font-style:italic;">Завантажте фото або GIF — воно з'явиться тут</span>`;
                return;
            }
            historyEl.innerHTML = "";
            for (const id of [...state.bgHistoryIds]) {
                const dataUrl = await Selfish.DB.get(id);
                if (!dataUrl) continue;

                const item = document.createElement("div");
                item.className = `selfish-bg-item ${state.currentBgId === id && state.bgMode === "custom" ? "active" : ""}`;
                item.innerHTML = `<img src="${dataUrl}" title="Застосувати фон"><div class="selfish-bg-del" title="Видалити">&#10005;</div>`;

                item.querySelector("img").onclick = () => {
                    Selfish.State.set("bgMode", "custom");
                    syncBgModeUi("custom");
                    applyBackground(dataUrl, id, renderHistory);
                    Spicetify.showNotification("Фон оновлено");
                };
                item.querySelector(".selfish-bg-del").onclick = async e => {
                    e.stopPropagation();
                    await Selfish.DB.remove(id);
                    Selfish.State.set("bgHistoryIds", state.bgHistoryIds.filter(i => i !== id));
                    if (state.currentBgId === id && state.bgMode === "custom") await applyBackground(null);
                    renderHistory();
                };
                historyEl.appendChild(item);
            }
        }
        renderHistory();

        const fileInput = wrap.querySelector("#selfish-bg-input");
        wrap.querySelector("#selfish-bg-upload-btn").onclick = () => fileInput.click();
        fileInput.onchange = function () {
            const file = this.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async ev => {
                const newId = "bg_" + Date.now();
                await Selfish.DB.save(newId, ev.target.result);
                Selfish.State.set("bgMode", "custom");
                syncBgModeUi("custom");
                await applyBackground(ev.target.result, newId, renderHistory);
                Spicetify.showNotification("Новий фон збережено!");
            };
            reader.readAsDataURL(file);
        };

        wrap.querySelector("#selfish-bg-reset-btn").onclick = () => {
            Selfish.State.set("bgMode", "custom");
            syncBgModeUi("custom");
            applyBackground(null, null, renderHistory);
            Spicetify.showNotification("Повернуто стандартний градієнт");
        };

        const blurRange = wrap.querySelector("#selfish-blur-range");
        const blurLabel = wrap.querySelector("#selfish-blur-label");
        setRangeFill(blurRange, 100);
        blurRange.oninput = e => {
            blurLabel.textContent = `${e.target.value}%`;
            setRangeFill(blurRange, 100);
            applyBlur(e.target.value);
        };

        const refRange = wrap.querySelector("#selfish-refraction-range");
        const refLabel = wrap.querySelector("#selfish-refraction-label");
        setRangeFill(refRange, 100);
        refRange.oninput = e => {
            refLabel.textContent = `${e.target.value}%`;
            setRangeFill(refRange, 100);
            applyRefraction(e.target.value);
        };

        Spicetify.PopupModal.display({ title: "Налаштування Selfish UI", content: wrap, isLarge: true });
    }

    return { open };
})();