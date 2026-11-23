(async function Bootstrap() {
    while (!Spicetify?.Player || !Spicetify?.Platform || !Spicetify?.Topbar?.Button || !Spicetify?.PopupModal) {
        await new Promise(r => setTimeout(r, 100));
    }

    await Selfish.Engine.init();
    Selfish.Fullscreen.init();

    const paletteIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`;
    const fsIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;

    new Spicetify.Topbar.Button("Налаштування Selfish UI", paletteIcon, Selfish.Settings.open, false, true);
    new Spicetify.Topbar.Button("Selfish 3D Повноекранний режим (Alt+F)", fsIcon, Selfish.Fullscreen.open, false, true);

    console.log("[Selfish UI] Modular architecture loaded!");
})();