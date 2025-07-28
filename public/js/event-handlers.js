/**
 * Gerenciador de Eventos
 */

const EventHandlers = {
    // Inicializar todos os event handlers
    init() {
        this.bindFormEvents();
        this.bindNavigationEvents();
        this.bindKeyboardEvents();
        this.bindUtilityEvents();
    },

    // Event handlers para formulários
    bindFormEvents() {
        // Login Form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLoginSubmit.bind(this));
        }

        // New Post Form
        const newPostForm = document.getElementById('new-post-form');
        if (newPostForm) {
            newPostForm.addEventListener('submit', this.handlePostSubmit.bind(this));
        }

        // Auto-save do formulário de post (implementação futura)
        this.bindAutoSave();
    },

    // Handler para submit do login
    async handleLoginSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = form.querySelector('.form-button');
        
        // Validação básica
        if (!email || !password) {
            this.showMessage('login-message', 'Email e senha são obrigatórios', 'error');
            return;
        }

        // Desabilitar botão e mostrar loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'ENTRANDO...';
        form.classList.add('loading');
        
        try {
            const result = await AuthManager.login(email, password);
            
            if (result.success) {
                this.showMessage('login-message', 'Login realizado com sucesso!', 'success');
                
                // Aguardar um pouco antes de redirecionar
                setTimeout(() => {
                    NavigationManager.showSection('admin-section');
                }, 1000);
            } else {
                this.showMessage('login-message', result.error || 'Erro ao fazer login', 'error');
            }
            
        } catch (error) {
            console.error('Erro no login:', error);
            this.showMessage('login-message', 'Erro inesperado no login', 'error');
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            submitBtn.textContent = 'ENTRAR';
            form.classList.remove('loading');
        }
    },

    // Handler para submit de novo post
    async handlePostSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const submitBtn = form.querySelector('.form-button');
        
        // Validação
        const errors = AdminPanel.validatePostForm(title, content);
        if (errors.length > 0) {
            this.showMessage('post-message', errors.join(', '), 'error');
            return;
        }
        
        // Desabilitar botão e mostrar loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'PUBLICANDO...';
        form.classList.add('loading');
        
        try {
            const result = await PostManager.createPost(title.trim(), content.trim());
            
            if (result.success) {
                this.showMessage('post-message', 'Post publicado com sucesso!', 'success');
                
                // Limpar formulário
                AdminPanel.clearNewPostForm();
                
                // Recarregar lista de posts do admin
                AdminPanel.loadAdminPosts();
                
                // Scroll para o topo da lista
                document.getElementById('admin-posts').scrollIntoView({ behavior: 'smooth' });
                
            } else {
                this.showMessage('post-message', result.error || 'Erro ao publicar post', 'error');
            }
            
        } catch (error) {
            console.error('Erro ao criar post:', error);
            this.showMessage('post-message', 'Erro inesperado ao publicar post', 'error');
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            submitBtn.textContent = 'PUBLICAR POST';
            form.classList.remove('loading');
        }
    },

    // Auto-save para formulário de post
    bindAutoSave() {
        const titleInput = document.getElementById('post-title');
        const contentInput = document.getElementById('post-content');
        
        if (titleInput && contentInput) {
            let autoSaveTimeout;
            
            const autoSave = () => {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    const title = titleInput.value;
                    const content = contentInput.value;
                    
                    if (title || content) {
                        try {
                            localStorage.setItem('blog-draft', JSON.stringify({
                                title,
                                content,
                                timestamp: Date.now()
                            }));
                        } catch (error) {
                            console.warn('Erro ao salvar rascunho:', error);
                        }
                    }
                }, 2000); // Auto-save após 2 segundos de inatividade
            };
            
            titleInput.addEventListener('input', autoSave);
            contentInput.addEventListener('input', autoSave);
            
            // Carregar rascunho ao inicializar
            this.loadDraft();
        }
    },

    // Carregar rascunho salvo
    loadDraft() {
        try {
            const draft = localStorage.getItem('blog-draft');
            if (draft) {
                const draftData = JSON.parse(draft);
                const ageInHours = (Date.now() - draftData.timestamp) / (1000 * 60 * 60);
                
                // Só carregar rascunhos de até 24 horas
                if (ageInHours < 24 && (draftData.title || draftData.content)) {
                    const titleInput = document.getElementById('post-title');
                    const contentInput = document.getElementById('post-content');
                    
                    if (titleInput && contentInput && 
                        !titleInput.value && !contentInput.value) {
                        
                        if (confirm('Rascunho encontrado. Deseja carregá-lo?')) {
                            titleInput.value = draftData.title || '';
                            contentInput.value = draftData.content || '';
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Erro ao carregar rascunho:', error);
        }
    },

    // Limpar rascunho
    clearDraft() {
        try {
            localStorage.removeItem('blog-draft');
        } catch (error) {
            console.warn('Erro ao limpar rascunho:', error);
        }
    },

    // Event handlers para navegação
    bindNavigationEvents() {
        // Confirmar saída se há dados não salvos
        window.addEventListener('beforeunload', (event) => {
            const titleInput = document.getElementById('post-title');
            const contentInput = document.getElementById('post-content');
            
            if (titleInput && contentInput && 
                (titleInput.value.trim() || contentInput.value.trim())) {
                event.preventDefault();
                event.returnValue = '';
            }
        });
    },

    // Event handlers para teclado
    bindKeyboardEvents() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + S para salvar (prevenir comportamento padrão)
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                
                // Se estiver no formulário de post, tentar publicar
                const activeElement = document.activeElement;
                if (activeElement && 
                    (activeElement.id === 'post-title' || activeElement.id === 'post-content')) {
                    
                    const form = document.getElementById('new-post-form');
                    if (form) {
                        form.dispatchEvent(new Event('submit'));
                    }
                }
            }
            
            // Escape para cancelar ações
            if (event.key === 'Escape') {
                // Fechar modais, limpar mensagens, etc.
                this.handleEscapeKey();
            }
        });
    },

    // Handler para tecla Escape
    handleEscapeKey() {
        // Limpar mensagens de erro/sucesso
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => {
            msg.textContent = '';
            msg.className = '';
        });
        
        // Fechar modais (se houver)
        const modals = document.querySelectorAll('[style*="position: fixed"]');
        modals.forEach(modal => {
            if (modal.style.zIndex > 1000) {
                modal.remove();
            }
        });
    },

    // Event handlers utilitários
    bindUtilityEvents() {
        // Melhorar UX dos inputs
        this.enhanceInputs();
        
        // Bind de eventos customizados
        this.bindCustomEvents();
    },

    // Melhorar UX dos inputs
    enhanceInputs() {
        // Auto-resize para textareas
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        });
        
        // Placeholder dinâmico para inputs
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.style.borderColor = 'var(--PrimaryColor)';
            });
            
            input.addEventListener('blur', function() {
                this.style.borderColor = 'var(--BorderColor)';
            });
        });
    },

    // Eventos customizados
    bindCustomEvents() {
        // Evento personalizado para quando posts são carregados
        document.addEventListener('postsLoaded', (event) => {
            console.log('Posts carregados:', event.detail);
        });
        
        // Evento para mudança de autenticação
        AppState.addListener('isAuthenticated', (isAuthenticated) => {
            document.dispatchEvent(new CustomEvent('authChanged', {
                detail: { isAuthenticated }
            }));
        });
    },

    // Mostrar mensagem
    showMessage(elementId, message, type) {
        const messageElement = document.getElementById(elementId);
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = type === 'error' ? 'error-message' : 'success-message';
            
            // Auto-limpar mensagem
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = '';
            }, CONFIG.UI.MESSAGE_TIMEOUT);
        }
    }
};

// Funções globais para uso no HTML
window.logout = async function() {
    try {
        const result = await AuthManager.logout();
        if (result.success) {
            NavigationManager.showSection('home-section');
            EventHandlers.showMessage('login-message', 'Logout realizado com sucesso!', 'success');
            EventHandlers.clearDraft(); // Limpar rascunho ao fazer logout
        }
    } catch (error) {
        console.error('Erro no logout:', error);
    }
};

// Função global para expandir post
window.expandPost = function(postId) {
    PostManager.expandPost(postId);
};

// Função global para deletar post (usada no HTML gerado dinamicamente)
window.deletePost = function(postId) {
    AdminPanel.deletePost(postId);
};