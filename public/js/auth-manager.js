const AuthManager = {
    // Fazer login
    async login(email, password) {
        try {
            // Validar inputs
            if (!email || !password) {
                throw new Error('Email e senha são obrigatórios');
            }

            if (!this.isValidEmail(email)) {
                throw new Error('Email inválido');
            }

            let result;

            if (supabase) {
                // Login com Supabase
                result = await supabase.signIn(email, password);
                
                if (result.error) {
                    throw new Error(result.error);
                }

                // Atualizar estado
                AppState.setAuthenticated(true, result.user);
                
            } else {
                // Login mock para demonstração
                if (email === CONFIG.DEMO_AUTH.EMAIL && password === CONFIG.DEMO_AUTH.PASSWORD) {
                    const mockUser = {
                        id: 'demo-user',
                        email: email,
                        name: 'Admin Demo'
                    };
                    
                    AppState.setAuthenticated(true, mockUser);
                    result = { user: mockUser };
                } else {
                    throw new Error('Credenciais inválidas');
                }
            }

            // Log da ação
            console.log('✅ Login realizado com sucesso:', result.user?.email);

            return { success: true, user: result.user };

        } catch (error) {
            console.error('❌ Erro no login:', error);
            return { success: false, error: error.message };
        }
    },

    // Fazer logout
    async logout() {
        try {
            if (supabase && supabase.isAuthenticated()) {
                await supabase.signOut();
            }

            // Limpar estado
            AppState.setAuthenticated(false, null);
            
            // Log da ação
            console.log('✅ Logout realizado com sucesso');
            
            return { success: true };

        } catch (error) {
            console.error('❌ Erro no logout:', error);
            
            // Mesmo com erro, limpar estado local
            AppState.setAuthenticated(false, null);
            return { success: true, error: error.message };
        }
    },

    // Verificar autenticação armazenada
    async checkStoredAuth() {
        try {
            if (!supabase) {
                return { success: false, error: 'Supabase não configurado' };
            }

            // Verificar se há token armazenado
            if (supabase.isAuthenticated()) {
                // Tentar validar o token fazendo uma requisição simples
                try {
                    const { data, error } = await supabase
                        .from('posts')
                        .select('id')
                        .limit(1);

                    if (!error) {
                        // Token válido, manter autenticação
                        const storedUser = {
                            email: 'stored-user',
                            id: 'stored-user-id'
                        };
                        
                        AppState.setAuthenticated(true, storedUser);
                        console.log('✅ Autenticação restaurada do armazenamento');
                        return { success: true, authenticated: true };
                    }
                } catch (tokenError) {
                    console.warn('⚠️ Token inválido, fazendo logout:', tokenError);
                    // Token inválido, fazer logout
                    await this.logout();
                }
            }

            return { success: true, authenticated: false };

        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            return { success: false, error: error.message };
        }
    },

    // Verificar se usuário está autenticado
    isAuthenticated() {
        return AppState.getState('isAuthenticated');
    },

    // Obter usuário atual
    getCurrentUser() {
        return AppState.getState('user');
    },

    // Validar email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validar senha (critérios básicos)
    isValidPassword(password) {
        return password && password.length >= 6;
    },

    // Gerar hash simples (não usar em produção real)
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    },

    // Middleware para verificar autenticação
    requireAuth(callback) {
        if (this.isAuthenticated()) {
            callback();
        } else {
            console.warn('⚠️ Ação requer autenticação');
            // Redirecionar para login
            if (window.NavigationManager) {
                NavigationManager.showSection('login-section');
            }
        }
    },

    // Renovar token (para implementação futura)
    async refreshToken() {
        try {
            if (!supabase || !supabase.isAuthenticated()) {
                return { success: false, error: 'Não autenticado' };
            }

            // Implementar renovação de token se necessário
            // Por enquanto, apenas verificar se o token ainda é válido
            return await this.checkStoredAuth();

        } catch (error) {
            console.error('❌ Erro ao renovar token:', error);
            return { success: false, error: error.message };
        }
    },

    // Listeners de mudança de autenticação
    onAuthChange(callback) {
        AppState.addListener('isAuthenticated', callback);
    },

    // Remover listener de autenticação
    offAuthChange(callback) {
        AppState.removeListener('isAuthenticated', callback);
    },

    // Método para implementação futura: mudança de senha
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('Usuário não autenticado');
            }

            if (!this.isValidPassword(newPassword)) {
                throw new Error('Nova senha deve ter pelo menos 6 caracteres');
            }

            // Implementar mudança de senha com Supabase
            if (supabase) {
                // Implementação futura com Supabase Auth
                console.log('🚧 Mudança de senha não implementada ainda');
                return { success: false, error: 'Funcionalidade não implementada' };
            }

            return { success: false, error: 'Supabase não configurado' };

        } catch (error) {
            console.error('❌ Erro ao alterar senha:', error);
            return { success: false, error: error.message };
        }
    },

    // Reset de senha (implementação futura)
    async resetPassword(email) {
        try {
            if (!this.isValidEmail(email)) {
                throw new Error('Email inválido');
            }

            if (supabase) {
                // Implementação futura com Supabase Auth
                console.log('🚧 Reset de senha não implementado ainda');
                return { success: false, error: 'Funcionalidade não implementada' };
            }

            return { success: false, error: 'Supabase não configurado' };

        } catch (error) {
            console.error('❌ Erro ao resetar senha:', error);
            return { success: false, error: error.message };
        }
    },

    // Verificar força da senha
    checkPasswordStrength(password) {
        const strength = {
            score: 0,
            feedback: []
        };

        if (!password) {
            strength.feedback.push('Senha é obrigatória');
            return strength;
        }

        // Comprimento mínimo
        if (password.length >= 6) {
            strength.score += 1;
        } else {
            strength.feedback.push('Senha deve ter pelo menos 6 caracteres');
        }

        // Contém números
        if (/\d/.test(password)) {
            strength.score += 1;
        } else {
            strength.feedback.push('Adicione números para mais segurança');
        }

        // Contém letras maiúsculas
        if (/[A-Z]/.test(password)) {
            strength.score += 1;
        } else {
            strength.feedback.push('Adicione letras maiúsculas');
        }

        // Contém caracteres especiais
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            strength.score += 1;
        } else {
            strength.feedback.push('Adicione caracteres especiais');
        }

        // Comprimento ideal
        if (password.length >= 12) {
            strength.score += 1;
        }

        return strength;
    },

    // Gerar senha aleatória
    generateRandomPassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        return password;
    },

    // Verificar se sessão expirou
    isSessionExpired() {
        if (!supabase || !supabase.isAuthenticated()) {
            return true;
        }

        // Implementar verificação de expiração se necessário
        // Por enquanto, assumir que não expirou
        return false;
    },

    // Login com lembrar de mim
    async loginWithRemember(email, password, remember = false) {
        try {
            const result = await this.login(email, password);
            
            if (result.success && remember) {
                // Implementar "lembrar de mim" se necessário
                try {
                    localStorage.setItem('blog-remember-user', email);
                } catch (error) {
                    console.warn('⚠️ Não foi possível salvar "lembrar de mim":', error);
                }
            }
            
            return result;
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Obter usuário lembrado
    getRememberedUser() {
        try {
            return localStorage.getItem('blog-remember-user');
        } catch (error) {
            console.warn('⚠️ Erro ao obter usuário lembrado:', error);
            return null;
        }
    },

    // Limpar usuário lembrado
    clearRememberedUser() {
        try {
            localStorage.removeItem('blog-remember-user');
        } catch (error) {
            console.warn('⚠️ Erro ao limpar usuário lembrado:', error);
        }
    },

    // Validar sessão periodicamente
    startSessionValidation(intervalMinutes = 30) {
        if (this.sessionValidationInterval) {
            clearInterval(this.sessionValidationInterval);
        }

        this.sessionValidationInterval = setInterval(async () => {
            if (this.isAuthenticated()) {
                const result = await this.checkStoredAuth();
                if (!result.authenticated) {
                    console.log('🔄 Sessão inválida, fazendo logout automático');
                    await this.logout();
                    
                    // Notificar usuário
                    if (window.EventHandlers) {
                        EventHandlers.showMessage('login-message', 'Sessão expirada. Faça login novamente.', 'error');
                    }
                }
            }
        }, intervalMinutes * 60 * 1000);
    },

    // Parar validação de sessão
    stopSessionValidation() {
        if (this.sessionValidationInterval) {
            clearInterval(this.sessionValidationInterval);
            this.sessionValidationInterval = null;
        }
    },

    // Obter informações de debug sobre autenticação
    getAuthInfo() {
        return {
            isAuthenticated: this.isAuthenticated(),
            user: this.getCurrentUser(),
            hasSupabase: !!supabase,
            hasStoredToken: supabase ? supabase.isAuthenticated() : false,
            rememberedUser: this.getRememberedUser(),
            sessionValidationActive: !!this.sessionValidationInterval
        };
    },

    // Limpar todos os dados de autenticação
    clearAllAuthData() {
        try {
            // Limpar localStorage
            localStorage.removeItem('sb-auth-token');
            localStorage.removeItem('blog-remember-user');
            
            // Limpar estado
            AppState.setAuthenticated(false, null);
            
            // Parar validação de sessão
            this.stopSessionValidation();
            
            console.log('🧹 Dados de autenticação limpos');
            
        } catch (error) {
            console.warn('⚠️ Erro ao limpar dados de autenticação:', error);
        }
    },

    // Inicializar gerenciador de autenticação
    init() {
        console.log('🔐 Inicializando AuthManager...');
        
        // Verificar autenticação armazenada
        this.checkStoredAuth();
        
        // Iniciar validação de sessão se autenticado
        if (this.isAuthenticated()) {
            this.startSessionValidation();
        }
        
        // Listener para mudanças de autenticação
        this.onAuthChange((isAuthenticated) => {
            if (isAuthenticated) {
                this.startSessionValidation();
            } else {
                this.stopSessionValidation();
            }
        });
    },

    // Destruir gerenciador (cleanup)
    destroy() {
        this.stopSessionValidation();
        this.clearAllAuthData();
        console.log('🔐 AuthManager destruído');
    }
};