const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const loadingText = document.querySelector('.loading-text');
const loadingPercentage = document.querySelector('.loading-percentage');

let currentPercent = 1;

function getLoadingText(percent) {
    if (percent < 20) return 'BOOTING SYSTEM...';
    if (percent >= 20 && percent < 40) return 'LOADING NEURAL CORE...';
    if (percent >= 40 && percent < 60) return 'ESTABLISHING CONNECTION...';
    if (percent >= 60 && percent < 80) return 'SYNCHRONIZING DATA...';
    if (percent >= 80 && percent < 100) return 'FINALIZING PROTOCOL...';
    if (percent == 100) return 'SYSTEM ONLINE';
}

function simulateLoading() {
    loadingText.textContent = getLoadingText(currentPercent);
    if (loadingPercentage) {
        loadingPercentage.textContent = currentPercent + '%';
    }
    if (currentPercent < 100) {
        currentPercent++;
        setTimeout(simulateLoading, 30);
    } else {
        setTimeout(showHomepage, 500);
    }
}

function showHomepage() {
    loadingScreen.classList.add('fade-out');
    
    mainContent.classList.remove('hidden');
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 800);
    
}

function startLoading() {
    simulateLoading();
}

function init() {
    startLoading();
}

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 