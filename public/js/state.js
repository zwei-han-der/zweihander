/**
 * Gerenciamento de Estado Global da Aplicação
 */

const AppState = {
    // Estado da aplicação
    currentSection: 'home',
    isAuthenticated: false,
    isLoading: false,
    
    // Dados
    posts: [],
    user: null,
    
    // Cache
    _cache: new Map(),
    
    // Listeners para mudanças de estado
    _listeners: new Map(),

    // Métodos para gerenciar estado
    setState(key, value) {
        const oldValue = this[key];
        this[key] = value;
        
        // Notificar listeners
        if (this._listeners.has(key)) {
            this._listeners.get(key).forEach(callback => {
                callback(value, oldValue);
            });
        }
        
        // Log para desenvolvimento
        if (CONFIG.DEBUG) {
            console.log(`Estado alterado - ${key}:`, value);
        }
    },

    getState(key) {
        return this[key];
    },

    // Sistema de listeners para mudanças de estado
    addListener(key, callback) {
        if (!this._listeners.has(key)) {
            this._listeners.set(key, []);
        }
        this._listeners.get(key).push(callback);
    },

    removeListener(key, callback) {
        if (this._listeners.has(key)) {
            const listeners = this._listeners.get(key);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    },

    // Cache management
    setCache(key, value, ttl = 300000) { // TTL padrão: 5 minutos
        this._cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    },

    getCache(key) {
        const item = this._cache.get(key);
        if (!item) return null;
        
        // Verificar se expirou
        if (Date.now() - item.timestamp > item.ttl) {
            this._cache.delete(key);
            return null;
        }
        
        return item.value;
    },

    clearCache(key = null) {
        if (key) {
            this._cache.delete(key);
        } else {
            this._cache.clear();
        }
    },

    // Métodos de conveniência
    setLoading(isLoading) {
        this.setState('isLoading', isLoading);
    },

    setAuthenticated(isAuthenticated, user = null) {
        this.setState('isAuthenticated', isAuthenticated);
        this.setState('user', user);
    },

    setCurrentSection(section) {
        this.setState('currentSection', section);
    },

    setPosts(posts) {
        this.setState('posts', posts);
        this.setCache('posts', posts);
    },

    addPost(post) {
        const currentPosts = [...this.posts];
        currentPosts.unshift(post); // Adicionar no início
        this.setPosts(currentPosts);
    },

    removePost(postId) {
        const currentPosts = this.posts.filter(post => post.id !== postId);
        this.setPosts(currentPosts);
    },

    updatePost(postId, updatedData) {
        const currentPosts = this.posts.map(post => 
            post.id === postId ? { ...post, ...updatedData } : post
        );
        this.setPosts(currentPosts);
    },

    getPostById(postId) {
        return this.posts.find(post => post.id === postId);
    },

    // Reset do estado (útil para logout)
    reset() {
        this.currentSection = 'home';
        this.isAuthenticated = false;
        this.isLoading = false;
        this.posts = [];
        this.user = null;
        this.clearCache();
    },

    // Serialização do estado (para debug/desenvolvimento)
    serialize() {
        return {
            currentSection: this.currentSection,
            isAuthenticated: this.isAuthenticated,
            isLoading: this.isLoading,
            postsCount: this.posts.length,
            user: this.user ? { email: this.user.email } : null
        };
    },

    // Validação do estado
    validate() {
        const errors = [];
        
        if (typeof this.isAuthenticated !== 'boolean') {
            errors.push('isAuthenticated deve ser boolean');
        }
        
        if (!Array.isArray(this.posts)) {
            errors.push('posts deve ser um array');
        }
        
        if (this.currentSection && !['home', 'about', 'login', 'admin'].includes(this.currentSection)) {
            errors.push('currentSection deve ser uma seção válida');
        }
        
        return errors;
    }
};

// Adicionar listeners para desenvolvimento
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    AppState.addListener('isAuthenticated', (newValue) => {
        console.log('🔐 Autenticação alterada:', newValue);
    });
    
    AppState.addListener('currentSection', (newValue) => {
        console.log('📍 Seção alterada:', newValue);
    });
    
    AppState.addListener('posts', (newValue) => {
        console.log('📝 Posts alterados:', newValue.length, 'posts');
    });
}

// Expor estado globalmente para debug (apenas em desenvolvimento)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.AppState = AppState;
}