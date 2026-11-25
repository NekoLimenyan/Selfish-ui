Selfish.Picker = (() => {
    const GRADIENT_PRESETS = [
        { c1: "#b026ff", c2: "#ff2a85", angle: 135, title: "Cyber Violet" },
        { c1: "#00f5d4", c2: "#4361ee", angle: 135, title: "Ocean Neon" },
        { c1: "#ff6b6b", c2: "#feca57", angle: 120, title: "Sunset Glow" },
        { c1: "#f72585", c2: "#7209b7", angle: 135, title: "Synthwave" },
        { c1: "#38ef7d", c2: "#11998e", angle: 135, title: "Emerald Mint" }
    ];

    const SOLID_PRESETS = ["#b026ff", "#ff2a85", "#00f5d4", "#4361ee", "#feca57", "#38ef7d"];

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

    function create(setRangeFill) {
        const state = Selfish.State.data;
        const { applyColor, applyGradient, syncAdaptive } = Selfish.Colors;
        let draftC1 = state.savedColor;
        let draftC2 = state.savedColor2;
        let draftAngle = Number(state.gradientAngle) || 135;
        let activeStop = 1;

        const box = document.createElement("div");
        box.className = "selfish-picker-box";

        const gradPresetsHtml = GRADIENT_PRESETS.map((p, idx) =>
            `<div class="selfish-grad-preset" data-idx="${idx}" title="${p.title}" style="background:linear-gradient(${p.angle}deg, ${p.c1}, ${p.c2});"></div>`
        ).join("");

        const solidPresetsHtml = SOLID_PRESETS.map(hex =>
            `<div class="selfish-grad-preset selfish-solid-preset" data-hex="${hex}" title="${hex}" style="background:${hex};"></div>`
        ).join("");

        const isAdaptive = state.colorMode === "adaptive";

        box.innerHTML = `
            <div class="selfish-adaptive-card" id="selfish-adaptive-card" style="display:${isAdaptive ? "flex" : "none"};">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="selfish-adaptive-orb"></div>
                    <div>
                        <div style="font-size:13px; font-weight:700; color:#fff;">Автоматичний підбір палітри</div>
                        <div style="font-size:11.5px; color:rgba(255,255,255,0.65);">Акцент береться з обкладинки треку або активного фону</div>
                    </div>
                </div>
                <button type="button" class="selfish-btn" id="selfish-resync-adaptive-btn">Оновити</button>
            </div>

            <div id="selfish-manual-picker" style="display:${isAdaptive ? "none" : "flex"}; flex-direction:column; gap:10px;">
                <div class="selfish-grad-panel" id="selfish-grad-panel" style="display:${state.colorMode === "gradient" ? "flex" : "none"};">
                    <div class="selfish-grad-preview" id="selfish-grad-preview" style="background:linear-gradient(${draftAngle}deg, ${draftC1}, ${draftC2});"></div>
                    <div class="selfish-grad-stops">
                        <div style="display:flex; gap:8px;">
                            <button type="button" class="selfish-stop-btn active" id="selfish-stop-1">
                                <span class="selfish-stop-swatch" id="selfish-swatch-1" style="background:${draftC1};"></span>
                                Колір 1
                            </button>
                            <button type="button" class="selfish-stop-btn" id="selfish-stop-2">
                                <span class="selfish-stop-swatch" id="selfish-swatch-2" style="background:${draftC2};"></span>
                                Колір 2
                            </button>
                        </div>
                        <div class="selfish-grad-presets">${gradPresetsHtml}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="selfish-label" style="white-space:nowrap;">Кут: <strong id="selfish-angle-label" style="color:#fff;">${draftAngle}°</strong></span>
                        <input type="range" id="selfish-angle-range" class="selfish-range" min="0" max="360" value="${draftAngle}">
                    </div>
                </div>

                <canvas id="selfish-color-canvas" width="460" height="84" style="width:100%; height:84px; border-radius:13px; cursor:crosshair; border:1px solid rgba(255,255,255,0.16);"></canvas>
                <div class="selfish-picker-controls">
                    <div id="selfish-color-dot" style="width:26px; height:26px; border-radius:50%; background:${draftC1}; box-shadow:0 0 12px ${draftC1}; border:2px solid #fff; flex-shrink:0;"></div>
                    <input type="text" id="selfish-hex-input" class="selfish-hex-input" value="${draftC1}" maxlength="7">
                    <div id="selfish-solid-presets" class="selfish-grad-presets" style="display:${state.colorMode === "fixed" ? "flex" : "none"};">${solidPresetsHtml}</div>
                    <button type="button" class="selfish-btn primary" id="selfish-apply-color-btn" style="margin-left:auto;">Застосувати</button>
                </div>
            </div>
        `;

        const adaptiveCard = box.querySelector("#selfish-adaptive-card");
        const manualPicker = box.querySelector("#selfish-manual-picker");
        const gradPanel = box.querySelector("#selfish-grad-panel");
        const solidPresetsBox = box.querySelector("#selfish-solid-presets");
        const gradPreview = box.querySelector("#selfish-grad-preview");
        const stop1Btn = box.querySelector("#selfish-stop-1");
        const stop2Btn = box.querySelector("#selfish-stop-2");
        const swatch1 = box.querySelector("#selfish-swatch-1");
        const swatch2 = box.querySelector("#selfish-swatch-2");
        const angleRange = box.querySelector("#selfish-angle-range");
        const angleLabel = box.querySelector("#selfish-angle-label");
        const dot = box.querySelector("#selfish-color-dot");
        const hexInput = box.querySelector("#selfish-hex-input");

        function refreshGradientUi() {
            swatch1.style.background = draftC1;
            swatch2.style.background = draftC2;
            gradPreview.style.background = `linear-gradient(${draftAngle}deg, ${draftC1}, ${draftC2})`;
            angleRange.value = draftAngle;
            angleLabel.textContent = `${draftAngle}°`;
            setRangeFill(angleRange, 360);
        }

        function setActiveStop(stopNum) {
            activeStop = stopNum;
            stop1Btn.classList.toggle("active", stopNum === 1);
            stop2Btn.classList.toggle("active", stopNum === 2);
            const hex = stopNum === 1 ? draftC1 : draftC2;
            dot.style.background = hex;
            dot.style.boxShadow = `0 0 12px ${hex}`;
            hexInput.value = hex;
        }

        function updateDraftColor(hex, liveApply = true) {
            if (state.colorMode === "gradient" && activeStop === 2) draftC2 = hex;
            else draftC1 = hex;

            dot.style.background = hex;
            dot.style.boxShadow = `0 0 12px ${hex}`;
            hexInput.value = hex;
            refreshGradientUi();

            if (liveApply) {
                if (state.colorMode === "gradient") applyGradient(draftC1, draftC2, draftAngle, true);
                else if (state.colorMode === "fixed") applyColor(draftC1, true);
            }
        }

        function setMode(mode) {
            const adaptive = mode === "adaptive";
            adaptiveCard.style.display = adaptive ? "flex" : "none";
            manualPicker.style.display = adaptive ? "none" : "flex";
            gradPanel.style.display = mode === "gradient" ? "flex" : "none";
            solidPresetsBox.style.display = mode === "fixed" ? "flex" : "none";

            if (mode === "gradient") {
                setActiveStop(1);
                refreshGradientUi();
                applyGradient(draftC1, draftC2, draftAngle, true);
            } else if (adaptive) {
                syncAdaptive();
            } else {
                setActiveStop(1);
                applyColor(draftC1, true);
            }
        }

        box.querySelector("#selfish-resync-adaptive-btn").onclick = () => {
            syncAdaptive();
            Spicetify.showNotification("Адаптивний колір оновлено");
        };

        setRangeFill(angleRange, 360);
        stop1Btn.onclick = () => setActiveStop(1);
        stop2Btn.onclick = () => setActiveStop(2);

        angleRange.oninput = e => {
            draftAngle = Number(e.target.value);
            refreshGradientUi();
            if (state.colorMode === "gradient") applyGradient(draftC1, draftC2, draftAngle, true);
        };

        box.querySelectorAll(".selfish-grad-preset:not(.selfish-solid-preset)").forEach(el => {
            el.onclick = () => {
                const preset = GRADIENT_PRESETS[Number(el.dataset.idx)];
                if (!preset) return;
                draftC1 = preset.c1;
                draftC2 = preset.c2;
                draftAngle = preset.angle;
                refreshGradientUi();
                setActiveStop(activeStop);
                applyGradient(draftC1, draftC2, draftAngle, true);
                Spicetify.showNotification(`Градієнт «${preset.title}» застосовано`);
            };
        });

        box.querySelectorAll(".selfish-solid-preset").forEach(el => {
            el.onclick = () => updateDraftColor(el.dataset.hex, true);
        });

        const canvas = box.querySelector("#selfish-color-canvas");
        const ctx = drawColorSpectrum(canvas);
        const pick = e => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.max(0, Math.min(rect.width - 1, e.clientX - rect.left));
            const y = Math.max(0, Math.min(rect.height - 1, e.clientY - rect.top));
            const px = ctx.getImageData((x / rect.width) * canvas.width, (y / rect.height) * canvas.height, 1, 1).data;
            const hex = "#" + [px[0], px[1], px[2]].map(v => v.toString(16).padStart(2, "0")).join("");
            updateDraftColor(hex, true);
        };

        canvas.onpointerdown = e => { canvas.setPointerCapture(e.pointerId); pick(e); };
        canvas.onpointermove = e => { if (canvas.hasPointerCapture(e.pointerId)) pick(e); };

        hexInput.oninput = e => {
            const val = e.target.value.trim();
            if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) updateDraftColor(val, true);
        };

        box.querySelector("#selfish-apply-color-btn").onclick = () => {
            const val = hexInput.value.trim();
            if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) updateDraftColor(val, true);
            if (state.colorMode === "gradient") {
                applyGradient(draftC1, draftC2, draftAngle, true);
                Spicetify.showNotification(`Градієнт ${draftC1} → ${draftC2} застосовано`);
            } else {
                applyColor(draftC1, true);
                Spicetify.showNotification(`Колір ${draftC1} застосовано`);
            }
        };

        return { element: box, setMode };
    }

    return { create };
})();