// 判断方法: https://stackoverflow.com/questions/41742390/javascript-to-check-if-pwa-or-mobile-web
export function isPwa() {
    let displayMode = 'browser';
    const mqStandAlone = '(display-mode: standalone)';
    if ((navigator as any).standalone || window.matchMedia(mqStandAlone).matches) {
        displayMode = 'standalone';
    }
    return displayMode === 'standalone';
}
