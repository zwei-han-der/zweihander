/**
 * Cliente Supabase Simplificado
 * Implementa as funcionalidades básicas necessárias para o blog
 */

class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.authToken = this.getStoredToken();
    }

    // Gerenciamento de Token
    getStoredToken() {
        try {
            return localStorage.getItem('sb-auth-token');
        } catch (error) {
            console.warn('LocalStorage não disponível:', error);
            return null;
        }
    }

    setStoredToken(token) {
        try {
            if (token) {
                localStorage.setItem('sb-auth-token', token);
            } else {
                localStorage.removeItem('sb-auth-token');
            }
        } catch (error) {
            console.warn('Erro ao armazenar token:', error);
        }
    }

    // Requisições HTTP
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            ...options.headers
        };

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        try {
            const response = await fetch(`${this.url}/rest/v1${endpoint}`, {
                headers,
                ...options
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return null;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // Autenticação
    async signIn(email, password) {
        try {
            const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.key
                },
                body: JSON.stringify({ 
                    email, 
                    password 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error_description || 'Credenciais inválidas');
            }

            const data = await response.json();
            this.authToken = data.access_token;
            this.setStoredToken(this.authToken);
            
            return {
                user: data.user,
                session: data,
                error: null
            };
        } catch (error) {
            return {
                user: null,
                session: null,
                error: error.message
            };
        }
    }

    async signOut() {
        try {
            if (this.authToken) {
                await fetch(`${this.url}/auth/v1/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.key,
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });
            }
        } catch (error) {
            console.warn('Erro ao fazer logout no servidor:', error);
        } finally {
            this.authToken = null;
            this.setStoredToken(null);
        }
    }

    // Verificar se está autenticado
    isAuthenticated() {
        return !!this.authToken;
    }

    // Query Builder para Posts
    from(table) {
        return new SupabaseQueryBuilder(this, table);
    }
}

class SupabaseQueryBuilder {
    constructor(client, table) {
        this.client = client;
        this.table = table;
        this.query = {
            select: '*',
            filters: [],
            order: null,
            limit: null
        };
    }

    select(columns = '*') {
        this.query.select = columns;
        return this;
    }

    eq(column, value) {
        this.query.filters.push(`${column}=eq.${encodeURIComponent(value)}`);
        return this;
    }

    order(column, options = {}) {
        const direction = options.ascending ? 'asc' : 'desc';
        this.query.order = `${column}.${direction}`;
        return this;
    }

    limit(count) {
        this.query.limit = count;
        return this;
    }

    async execute() {
        let endpoint = `/${this.table}`;
        const params = [];

        // Select
        if (this.query.select !== '*') {
            params.push(`select=${this.query.select}`);
        }

        // Filters
        if (this.query.filters.length > 0) {
            params.push(...this.query.filters);
        }

        // Order
        if (this.query.order) {
            params.push(`order=${this.query.order}`);
        }

        // Limit
        if (this.query.limit) {
            params.push(`limit=${this.query.limit}`);
        }

        if (params.length > 0) {
            endpoint += '?' + params.join('&');
        }

        try {
            const data = await this.client.request(endpoint);
            return { data: data || [], error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }

    async insert(data) {
        try {
            const result = await this.client.request(`/${this.table}`, {
                method: 'POST',
                body: JSON.stringify(Array.isArray(data) ? data : [data])
            });
            return { data: result, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }

    async update(data) {
        try {
            let endpoint = `/${this.table}`;
            if (this.query.filters.length > 0) {
                endpoint += '?' + this.query.filters.join('&');
            }

            const result = await this.client.request(endpoint, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
            return { data: result, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }

    async delete() {
        try {
            let endpoint = `/${this.table}`;
            if (this.query.filters.length > 0) {
                endpoint += '?' + this.query.filters.join('&');
            }

            await this.client.request(endpoint, {
                method: 'DELETE'
            });
            return { data: null, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }
}

// Inicializar cliente Supabase
const supabase = isSupabaseConfigured() 
    ? new SupabaseClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.ANON_KEY)
    : null;