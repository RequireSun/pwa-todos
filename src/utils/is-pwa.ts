export function isPwa() {
    let displayMode = 'browser';
    const mqStandAlone = '(display-mode: standalone)';
    if ((navigator as any).standalone || window.matchMedia(mqStandAlone).matches) {
        displayMode = 'standalone';
    }
    return displayMode === 'standalone';
}
