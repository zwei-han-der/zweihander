/**
 * Inicialização Principal da Aplicação
 */

class ZweihanderBlog {
    constructor() {
        this.isInitialized = false;
        this.initPromise = null;
    }

    // Inicialização principal
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._performInit();
        return this.initPromise;
    }

    async _performInit() {
        try {
            console.log('🚀 Inicializando Zweihander Blog...');
            
            // 1. Mostrar instruções de configuração
            if (typeof showConfigurationInstructions === 'function') {
                showConfigurationInstructions();
            } else {
                // Fallback - mostrar instruções inline
                this.showConfigInstructions();
            }
            
            // 2. Inicializar gerenciadores
            this.initializeManagers();
            
            // 3. Configurar listeners globais
            this.setupGlobalListeners();
            
            // 4. Iniciar sistema de loading
            await this.startLoadingSystem();
            
            // 5. Finalizar inicialização
            this.finalize();
            
            console.log('✅ Blog inicializado com sucesso!');
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.handleInitError(error);
        }
    }

    // Inicializar gerenciadores
    initializeManagers() {
        console.log('📦 Inicializando gerenciadores...');
        
        // Inicializar navegação
        if (typeof NavigationManager !== 'undefined') {
            NavigationManager.init();
        }
        
        // Inicializar event handlers
        if (typeof EventHandlers !== 'undefined') {
            EventHandlers.init();
        }
        
        // Inicializar painel admin
        if (typeof AdminPanel !== 'undefined') {
            AdminPanel.init();
        }
    }

    // Configurar listeners globais
    setupGlobalListeners() {
        console.log('🎧 Configurando listeners globais...');
        
        // Listener para erros não capturados
        window.addEventListener('error', (event) => {
            console.error('Erro não capturado:', event.error);
            this.handleGlobalError(event.error);
        });

        // Listener para promises rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejeitada:', event.reason);
            this.handleGlobalError(event.reason);
        });

        // Listener para visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.onPageVisible();
            } else {
                this.onPageHidden();
            }
        });

        // Listener para conexão online/offline
        window.addEventListener('online', () => {
            console.log('🌐 Conexão restaurada');
            this.onConnectionRestored();
        });

        window.addEventListener('offline', () => {
            console.log('📡 Conexão perdida');
            this.onConnectionLost();
        });
    }

    // Iniciar sistema de loading
    async startLoadingSystem() {
        console.log('⏳ Iniciando sistema de loading...');
        
        return new Promise((resolve) => {
            LoadingSystem.start(
                // onComplete
                () => {
                    console.log('✨ Loading completo!');
                    resolve();
                },
                // onProgress
                (percent, message) => {
                    console.log(`📊 Loading: ${percent}% - ${message}`);
                }
            );
        });
    }

    // Finalizar inicialização
    finalize() {
        console.log('🎯 Finalizando inicialização...');
        
        // Adicionar informações de debug ao window (apenas em desenvolvimento)
        if (this.isDevelopment()) {
            this.setupDebugTools();
        }
        
        // Disparar evento de inicialização completa
        document.dispatchEvent(new CustomEvent('blogInitialized', {
            detail: {
                timestamp: Date.now(),
                version: this.getVersion(),
                config: this.getPublicConfig()
            }
        }));
    }

    // Verificar se está em desenvolvimento
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('local');
    }

    // Configurar ferramentas de debug
    setupDebugTools() {
        window.BlogApp = this;
        window.debugBlog = {
            state: () => AppState.serialize(),
            stats: () => AdminPanel.getStats(),
            config: () => this.getPublicConfig(),
            reset: () => this.reset(),
            reload: () => this.reload()
        };
        
        console.log('🔧 Ferramentas de debug disponíveis em window.debugBlog');
    }

    // Obter versão da aplicação
    getVersion() {
        return '1.0.0';
    }

    // Obter configurações públicas
    getPublicConfig() {
        return {
            version: this.getVersion(),
            hasSupabase: isSupabaseConfigured(),
            isDevelopment: this.isDevelopment(),
            timestamp: Date.now()
        };
    }

    // Handlers de eventos
    onPageVisible() {
        // Página ficou visível - verificar se precisa atualizar dados
        if (this.isInitialized && AppState.getState('isAuthenticated')) {
            // Verificar se precisa recarregar posts
            const lastUpdate = AppState.getCache('posts-last-update');
            if (!lastUpdate || Date.now() - lastUpdate > 300000) { // 5 minutos
                PostManager.loadPosts();
            }
        }
    }

    onPageHidden() {
        // Página ficou oculta - pode pausar operações não essenciais
        console.log('📱 Página oculta');
    }

    onConnectionRestored() {
        // Tentar recarregar dados quando conexão voltar
        if (this.isInitialized) {
            PostManager.loadPosts();
        }
    }

    onConnectionLost() {
        // Informar usuário sobre perda de conexão
        console.warn('Conexão perdida - algumas funcionalidades podem não funcionar');
    }

    // Tratamento de erros
    handleInitError(error) {
        console.error('Erro crítico na inicialização:', error);
        
        // Tentar recuperação básica
        try {
            // Mostrar conteúdo mesmo com erro
            const mainContent = document.getElementById('main-content');
            const loadingScreen = document.getElementById('loading-screen');
            
            if (mainContent) mainContent.classList.remove('hidden');
            if (loadingScreen) loadingScreen.style.display = 'none';
            
            // Mostrar mensagem de erro
            this.showErrorMessage('Erro na inicialização. Algumas funcionalidades podem não funcionar corretamente.');
            
        } catch (recoveryError) {
            console.error('Falha na recuperação:', recoveryError);
        }
    }

    handleGlobalError(error) {
        console.error('Erro global capturado:', error);
        
        // Log do erro (em produção, enviaria para serviço de monitoramento)
        if (!this.isDevelopment()) {
            // this.logErrorToService(error);
        }
    }

    // Utilitários
    showErrorMessage(message) {
        // Criar ou atualizar mensagem de erro global
        let errorDiv = document.getElementById('global-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'global-error';
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--ErrorColor);
                color: white;
                padding: 1rem;
                border-radius: 4px;
                font-family: var(--JetBrains);
                font-size: 0.9rem;
                z-index: 10001;
                max-width: 300px;
            `;
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        
        // Auto-remover após 10 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 10000);
    }

    // Reset da aplicação
    async reset() {
        console.log('🔄 Resetando aplicação...');
        
        // Reset do estado
        AppState.reset();
        
        // Limpar cache
        AppState.clearCache();
        
        // Limpar localStorage
        try {
            localStorage.removeItem('blog-draft');
            localStorage.removeItem('sb-auth-token');
        } catch (error) {
            console.warn('Erro ao limpar localStorage:', error);
        }
        
        // Voltar para home
        NavigationManager.showSection('home-section');
        
        console.log('✅ Reset completo');
    }

    // Recarregar aplicação
    reload() {
        window.location.reload();
    }

    // Mostrar instruções de configuração (fallback)
    showConfigInstructions() {
        if (!isSupabaseConfigured || !isSupabaseConfigured()) {
            console.log(`
🚀 CONFIGURAÇÃO DO BLOG ZWEIHANDER

Para configurar o Supabase e ter funcionalidade completa:

1. Acesse https://supabase.com e crie uma conta
2. Crie um novo projeto
3. Vá em Settings > API para obter suas chaves
4. Substitua no arquivo config.js:
   - SUPABASE.URL: sua URL do projeto
   - SUPABASE.ANON_KEY: sua chave anônima

5. Execute este SQL no Editor SQL do Supabase:

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts são visíveis publicamente" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Apenas admin pode modificar posts" ON posts
    FOR ALL USING (auth.email() = 'seu-email@exemplo.com');

6. Configure a autenticação:
   - Vá em Authentication > Settings
   - Configure seu email como admin
   - Desabilite "Enable signup" se quiser apenas você como admin

7. Atualize o código com suas credenciais e recarregue a página!

📋 CREDENCIAIS DE DEMONSTRAÇÃO:
- Email: admin@zweihander.com
- Senha: admin123

⚠️  Modo atual: DEMONSTRAÇÃO (dados mock)
        `);
        }
    }

    // Informações sobre o sistema
    getSystemInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            online: navigator.onLine,
            cookieEnabled: navigator.cookieEnabled,
            localStorage: !!window.localStorage,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString()
        };
    }
}

// Instância global da aplicação
const BlogApp = new ZweihanderBlog();

// Função de inicialização principal
async function initializeApp() {
    try {
        await BlogApp.init();
    } catch (error) {
        console.error('Falha crítica na inicialização:', error);
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Expor globalmente para debug
window.BlogApp = BlogApp;