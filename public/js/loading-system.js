/**
 * Sistema de Loading com animação cyberpunk
 */

const LoadingSystem = {
    // Elementos DOM
    screen: null,
    mainContent: null,
    loadingText: null,
    loadingPercentage: null,
    
    // Estado
    currentPercent: 1,
    isLoading: false,
    
    // Callbacks
    onComplete: null,
    onProgress: null,

    // Inicialização
    init() {
        this.screen = document.getElementById('loading-screen');
        this.mainContent = document.getElementById('main-content');
        this.loadingText = document.querySelector('.loading-text');
        this.loadingPercentage = document.querySelector('.loading-percentage');
        
        if (!this.screen || !this.mainContent || !this.loadingText || !this.loadingPercentage) {
            console.error('Elementos de loading não encontrados');
            return false;
        }
        
        return true;
    },

    // Obter texto de loading baseado na porcentagem
    getLoadingText(percent) {
        const messages = CONFIG.LOADING.MESSAGES;
        
        // Encontrar a mensagem apropriada
        let currentMessage = messages[0];
        
        Object.keys(messages).forEach(threshold => {
            if (percent >= parseInt(threshold)) {
                currentMessage = messages[threshold];
            }
        });
        
        return currentMessage;
    },

    // Atualizar interface de loading
    updateLoadingUI() {
        if (!this.loadingText || !this.loadingPercentage) return;
        
        const loadingText = this.getLoadingText(this.currentPercent);
        
        this.loadingText.textContent = loadingText;
        this.loadingPercentage.textContent = this.currentPercent + '%';
        
        // Callback de progresso
        if (this.onProgress) {
            this.onProgress(this.currentPercent, loadingText);
        }
    },

    // Simular loading
    async simulateLoading() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        AppState.setLoading(true);
        
        return new Promise((resolve) => {
            const loadingStep = () => {
                this.updateLoadingUI();
                
                if (this.currentPercent < 100) {
                    this.currentPercent++;
                    setTimeout(loadingStep, CONFIG.LOADING.SPEED);
                } else {
                    this.isLoading = false;
                    AppState.setLoading(false);
                    resolve();
                }
            };
            
            loadingStep();
        });
    },

    // Carregar dados iniciais durante o loading
    async loadInitialData() {
        try {
            // Simular carregamento de dados
            const loadPromises = [];
            
            // Carregar posts
            if (window.PostManager) {
                loadPromises.push(PostManager.loadPosts());
            }
            
            // Verificar autenticação persistente
            if (window.AuthManager) {
                loadPromises.push(AuthManager.checkStoredAuth());
            }
            
            // Aguardar todos os carregamentos
            await Promise.allSettled(loadPromises);
            
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            // Não impedir o loading de completar em caso de erro
        }
    },

    // Mostrar conteúdo principal
    showMainContent() {
        if (!this.screen || !this.mainContent) return;
        
        // Fade out da tela de loading
        this.screen.classList.add('fade-out');
        
        // Mostrar conteúdo principal
        this.mainContent.classList.remove('hidden');
        
        // Remover tela de loading do DOM após animação
        setTimeout(() => {
            if (this.screen) {
                this.screen.style.display = 'none';
            }
        }, CONFIG.UI.FADE_OUT_DURATION);
        
        // Callback de conclusão
        if (this.onComplete) {
            this.onComplete();
        }
    },

    // Processo completo de loading
    async start(onComplete = null, onProgress = null) {
        this.onComplete = onComplete;
        this.onProgress = onProgress;
        
        if (!this.init()) {
            console.error('Falha na inicialização do sistema de loading');
            return;
        }
        
        try {
            // Executar loading e carregamento de dados em paralelo
            const [loadingComplete] = await Promise.allSettled([
                this.simulateLoading(),
                this.loadInitialData()
            ]);
            
            if (loadingComplete.status === 'fulfilled') {
                // Aguardar um pouco para mostrar 100%
                setTimeout(() => {
                    this.showMainContent();
                }, 500);
            } else {
                throw new Error('Falha no processo de loading');
            }
            
        } catch (error) {
            console.error('Erro durante o loading:', error);
            
            // Mostrar conteúdo mesmo com erro
            setTimeout(() => {
                this.showMainContent();
            }, 1000);
        }
    },

    // Reset para reiniciar loading
    reset() {
        this.currentPercent = 1;
        this.isLoading = false;
        this.onComplete = null;
        this.onProgress = null;
        
        if (this.screen) {
            this.screen.classList.remove('fade-out');
            this.screen.style.display = 'flex';
        }
        
        if (this.mainContent) {
            this.mainContent.classList.add('hidden');
        }
        
        AppState.setLoading(false);
    },

    // Mostrar loading manual (para outras operações)
    showLoading(message = 'CARREGANDO...') {
        if (!this.screen) return;
        
        this.screen.style.display = 'flex';
        this.screen.classList.remove('fade-out');
        
        if (this.loadingText) {
            this.loadingText.textContent = message;
        }
        
        if (this.loadingPercentage) {
            this.loadingPercentage.textContent = '';
        }
    },

    // Esconder loading manual
    hideLoading() {
        if (!this.screen) return;
        
        this.screen.classList.add('fade-out');
        
        setTimeout(() => {
            this.screen.style.display = 'none';
        }, CONFIG.UI.FADE_OUT_DURATION);
    }
};

// Adicionar métodos utilitários globais
window.showLoading = (message) => LoadingSystem.showLoading(message);
window.hideLoading = () => LoadingSystem.hideLoading();