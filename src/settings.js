Selfish.Settings = (() => {
    function drawColorSpectrum(canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const gradH = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradH.addColorStop(0, "rgb(255,0,0)");
        gradH.addColorStop(0.16, "rgb(255,0,255)");
        gradH.addColorStop(0.33, "rgb(0,0,255)");
        gradH.addColorStop(0.5, "rgb(0,255,255)");
        gradH.addColorStop(0.66, "rgb(0,255,0)");
        gradH.addColorStop(0.83, "rgb(255,255,0)");
        gradH.addColorStop(1, "rgb(255,0,0)");
        ctx.fillStyle = gradH;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradV = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradV.addColorStop(0, "rgba(255,255,255,1)");
        gradV.addColorStop(0.5, "rgba(255,255,255,0)");
        gradV.addColorStop(0.5, "rgba(0,0,0,0)");
        gradV.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = gradV;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return ctx;
    }

    function open() {
        const { state, applyBackground, applyBlur, applyColor, syncAdaptive } = Selfish.Engine;
        const wrap = document.createElement("div");
        wrap.className = "selfish-settings-wrap";

        wrap.innerHTML = `
            <div class="selfish-card">
                <h3 class="selfish-card-title">Задній фон та Вікна</h3>
                <div class="selfish-row">
                    <span class="selfish-label">Власне фото або GIF для фону</span>
                    <div class="selfish-btn-group">
                        <input type="file" id="selfish-bg-input" accept="image/*" style="display:none">
                        <button class="selfish-btn primary" id="selfish-bg-upload-btn">Завантажити</button>
                        <button class="selfish-btn" id="selfish-bg-reset-btn">Скинути</button>
                    </div>
                </div>
                <div style="margin-top: 10px;">
                    <span class="selfish-label" style="display:block; margin-bottom: 4px;">Історія фонів:</span>
                    <div class="selfish-bg-history" id="selfish-bg-history"></div>
                </div>
                <div style="margin-top: 14px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                        <span class="selfish-label">Матовість вікон (Blur)</span>
                        <span id="selfish-blur-label" style="font-size:13px; font-weight:700; color:var(--selfish-accent);">${state.blurPercent}%</span>
                    </div>
                    <input type="range" id="selfish-blur-range" class="selfish-range" min="0" max="100" value="${state.blurPercent}">
                </div>
            </div>

            <div class="selfish-card">
                <h3 class="selfish-card-title">Акцентний колір</h3>
                <div class="selfish-row">
                    <span class="selfish-label">Режим кольору</span>
                    <div class="selfish-btn-group">
                        <div class="selfish-radio ${state.colorMode === "fixed" ? "active" : ""}" data-mode="fixed">Постійний</div>
                        <div class="selfish-radio ${state.colorMode === "adaptive" ? "active" : ""}" data-mode="adaptive">Адаптивний</div>
                    </div>
                </div>
                <div class="selfish-picker-box" id="selfish-picker-box" style="${state.colorMode === "adaptive" ? "opacity:0.35; pointer-events:none;" : ""}">
                    <canvas id="selfish-color-canvas" width="420" height="110" style="width:100%; height:110px; border-radius:10px; cursor:crosshair; border:1px solid rgba(255,255,255,0.15);"></canvas>
                    <div class="selfish-picker-controls">
                        <div id="selfish-color-dot" style="width:28px; height:28px; border-radius:50%; background:${state.savedColor}; box-shadow:0 0 12px ${state.savedColor}; border:2px solid #fff; flex-shrink:0;"></div>
                        <input type="text" id="selfish-hex-input" class="selfish-hex-input" value="${state.savedColor}" maxlength="7">
                        <button class="selfish-btn primary" id="selfish-apply-color-btn" style="margin-left:auto;">Застосувати</button>
                    </div>
                </div>
            </div>
        `;

        const historyEl = wrap.querySelector("#selfish-bg-history");
        async function renderHistory() {
            if (!state.bgHistoryIds.length) {
                historyEl.innerHTML = `<span style="font-size:12px; color:#888; font-style:italic;">Тут будуть ваші попередні фони</span>`;
                return;
            }
            historyEl.innerHTML = "";
            for (const id of [...state.bgHistoryIds]) {
                const dataUrl = await Selfish.DB.get(id);
                if (!dataUrl) continue;

                const item = document.createElement("div");
                item.className = "selfish-bg-item";
                item.innerHTML = `<img src="${dataUrl}" title="Застосувати фон"><div class="selfish-bg-del" title="Видалити">&#10005;</div>`;

                item.querySelector("img").onclick = () => {
                    applyBackground(dataUrl, id, renderHistory);
                    Spicetify.showNotification("Фон оновлено");
                };
                item.querySelector(".selfish-bg-del").onclick = async e => {
                    e.stopPropagation();
                    await Selfish.DB.remove(id);
                    state.bgHistoryIds = state.bgHistoryIds.filter(i => i !== id);
                    localStorage.setItem("selfishBgHistoryIds", JSON.stringify(state.bgHistoryIds));
                    if (state.currentBgId === id) await applyBackground(null);
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
                await applyBackground(ev.target.result, newId, renderHistory);
                Spicetify.showNotification("Новий фон збережено!");
            };
            reader.readAsDataURL(file);
        };

        wrap.querySelector("#selfish-bg-reset-btn").onclick = () => {
            applyBackground(null);
            Spicetify.showNotification("Повернуто стандартний градієнт");
        };

        const blurRange = wrap.querySelector("#selfish-blur-range");
        const blurLabel = wrap.querySelector("#selfish-blur-label");
        blurRange.oninput = e => {
            blurLabel.textContent = `${e.target.value}%`;
            applyBlur(e.target.value);
        };

        const pickerBox = wrap.querySelector("#selfish-picker-box");
        wrap.querySelectorAll(".selfish-radio").forEach(btn => {
            btn.onclick = () => {
                wrap.querySelectorAll(".selfish-radio").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                state.colorMode = btn.dataset.mode;
                localStorage.setItem("selfishColorMode", state.colorMode);

                pickerBox.style.opacity = state.colorMode === "adaptive" ? "0.35" : "1";
                pickerBox.style.pointerEvents = state.colorMode === "adaptive" ? "none" : "auto";
                state.colorMode === "adaptive" ? syncAdaptive() : applyColor(state.savedColor, true);
            };
        });

        const canvas = wrap.querySelector("#selfish-color-canvas");
        const ctx = drawColorSpectrum(canvas);
        const dot = wrap.querySelector("#selfish-color-dot");
        const hexInput = wrap.querySelector("#selfish-hex-input");

        let picking = false;
        const pick = e => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.max(0, Math.min(rect.width - 1, e.clientX - rect.left));
            const y = Math.max(0, Math.min(rect.height - 1, e.clientY - rect.top));
            const px = ctx.getImageData((x / rect.width) * canvas.width, (y / rect.height) * canvas.height, 1, 1).data;
            const hex = "#" + [px[0], px[1], px[2]].map(v => v.toString(16).padStart(2, "0")).join("");
            dot.style.background = hex;
            dot.style.boxShadow = `0 0 12px ${hex}`;
            hexInput.value = hex;
        };

        canvas.onmousedown = e => { picking = true; pick(e); };
        canvas.onmousemove = e => { if (picking) pick(e); };
        window.addEventListener("mouseup", () => { picking = false; });

        hexInput.oninput = e => {
            const val = e.target.value.trim();
            if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
                dot.style.background = val;
                dot.style.boxShadow = `0 0 12px ${val}`;
            }
        };

        wrap.querySelector("#selfish-apply-color-btn").onclick = () => {
            const val = hexInput.value.trim();
            if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
                applyColor(val, true);
                Spicetify.showNotification(`Колір ${val} застосовано`);
            }
        };

        Spicetify.PopupModal.display({ title: "Налаштування Selfish UI", content: wrap, isLarge: true });
    }

    return { open };
})();