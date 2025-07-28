/**
 * Gerenciador de Navegação
 */

const NavigationManager = {
    // Seções disponíveis
    sections: ['home', 'about', 'login', 'admin'],
    
    // Seção atual
    currentSection: 'home',

    // Inicialização
    init() {
        this.updateNavigation();
        this.bindEvents();
    },

    // Mostrar seção específica
    showSection(sectionId) {
        // Validar seção
        const section = sectionId.replace('-section', '');
        if (!this.sections.includes(section)) {
            console.error('Seção inválida:', section);
            return;
        }

        // Esconder todas as seções
        document.querySelectorAll('section').forEach(sectionEl => {
            sectionEl.classList.add('hidden');
        });

        // Mostrar seção alvo
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Atualizar estado
        this.currentSection = section;
        AppState.setCurrentSection(section);

        // Atualizar navegação
        this.updateNavigation();

        // Executar ações específicas da seção
        this.onSectionChange(section);
    },

    // Atualizar estado da navegação
    updateNavigation() {
        // Remover classe ativa de todos os links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Atualizar link de login/admin
        const loginNav = document.getElementById('login-nav');
        if (loginNav) {
            if (AppState.getState('isAuthenticated')) {
                loginNav.textContent = 'Admin';
                loginNav.onclick = () => this.showSection('admin-section');
            } else {
                loginNav.textContent = 'Login';
                loginNav.onclick = () => this.showSection('login-section');
            }
        }

        // Marcar link ativo baseado na seção atual
        this.setActiveLink();
    },

    // Marcar link ativo
    setActiveLink() {
        const activeSection = this.currentSection;
        
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkText = link.textContent.toLowerCase();
            
            if ((linkText === 'home' && activeSection === 'home') ||
                (linkText === 'sobre' && activeSection === 'about') ||
                (linkText === 'login' && activeSection === 'login') ||
                (linkText === 'admin' && activeSection === 'admin')) {
                link.classList.add('active');
            }
        });
    },

    // Ações específicas quando seção muda
    onSectionChange(section) {
        switch (section) {
            case 'home':
                // Garantir que posts estejam carregados
                if (AppState.getState('posts').length === 0) {
                    PostManager.loadPosts();
                }
                break;
                
            case 'admin':
                // Verificar autenticação
                if (!AppState.getState('isAuthenticated')) {
                    this.showSection('login-section');
                    return;
                }
                // Carregar posts do admin
                if (window.AdminPanel) {
                    AdminPanel.loadAdminPosts();
                }
                break;
                
            case 'login':
                // Se já estiver autenticado, ir para admin
                if (AppState.getState('isAuthenticated')) {
                    this.showSection('admin-section');
                    return;
                }
                // Limpar formulário
                this.clearLoginForm();
                break;
        }
    },

    // Navegar para home
    goHome() {
        this.showSection('home-section');
    },

    // Navegar para sobre
    goAbout() {
        this.showSection('about-section');
    },

    // Navegar para login ou admin
    goLoginOrAdmin() {
        if (AppState.getState('isAuthenticated')) {
            this.showSection('admin-section');
        } else {
            this.showSection('login-section');
        }
    },

    // Limpar formulário de login
    clearLoginForm() {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const messageDiv = document.getElementById('login-message');
        
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (messageDiv) {
            messageDiv.textContent = '';
            messageDiv.className = '';
        }
    },

    // Bind de eventos
    bindEvents() {
        // Listener para mudanças de autenticação
        AppState.addListener('isAuthenticated', (isAuthenticated) => {
            this.updateNavigation();
            
            // Se perdeu autenticação e está na área admin, voltar para home
            if (!isAuthenticated && this.currentSection === 'admin') {
                this.showSection('home-section');
            }
        });

        // Navegação via teclado (opcional)
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + número para navegação rápida
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case '1':
                        event.preventDefault();
                        this.goHome();
                        break;
                    case '2':
                        event.preventDefault();
                        this.goAbout();
                        break;
                    case '3':
                        event.preventDefault();
                        this.goLoginOrAdmin();
                        break;
                }
            }
        });
    },

    // Histórico de navegação (implementação simples)
    history: [],
    maxHistorySize: 10,

    // Adicionar à história
    addToHistory(section) {
        this.history.push({
            section,
            timestamp: Date.now()
        });

        // Limitar tamanho do histórico
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    },

    // Voltar na navegação
    goBack() {
        if (this.history.length > 1) {
            // Remove a seção atual
            this.history.pop();
            // Pega a anterior
            const previous = this.history[this.history.length - 1];
            if (previous) {
                this.showSection(previous.section + '-section');
            }
        }
    },

    // Obter breadcrumb (para implementação futura)
    getBreadcrumb() {
        const breadcrumbMap = {
            'home': 'Home',
            'about': 'Sobre',
            'login': 'Login',
            'admin': 'Administração'
        };

        return breadcrumbMap[this.currentSection] || 'Desconhecido';
    },

    // Verificar se pode navegar para seção
    canNavigateTo(section) {
        switch (section) {
            case 'admin':
                return AppState.getState('isAuthenticated');
            default:
                return true;
        }
    },

    // Navegação programática com validação
    navigateTo(section) {
        if (this.canNavigateTo(section)) {
            this.addToHistory(this.currentSection);
            this.showSection(section + '-section');
            return true;
        } else {
            console.warn('Navegação não permitida para:', section);
            return false;
        }
    },

    // URL handling (para implementação futura de routing)
    handleURLChange() {
        // Implementar routing baseado em hash se necessário
        const hash = window.location.hash.replace('#', '');
        if (hash && this.sections.includes(hash)) {
            this.showSection(hash + '-section');
        }
    },

    // Atualizar URL (para implementação futura)
    updateURL(section) {
        if (window.history && window.history.pushState) {
            window.history.pushState({}, '', `#${section}`);
        } else {
            window.location.hash = section;
        }
    }
};

// Funções globais para uso no HTML
window.showHome = () => NavigationManager.goHome();
window.showAbout = () => NavigationManager.goAbout();
window.showLogin = () => NavigationManager.goLoginOrAdmin();