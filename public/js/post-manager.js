/**
 * Gerenciador de Posts
 */

const PostManager = {
    // Carregar posts do banco de dados
    async loadPosts() {
        try {
            let posts = [];
            
            if (supabase) {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    throw new Error(error);
                }
                
                posts = data || [];
            } else {
                // Dados mock para demonstração
                posts = this.getMockPosts();
            }
            
            // Processar posts (adicionar excerpt se não existir)
            posts = posts.map(post => ({
                ...post,
                excerpt: post.excerpt || this.generateExcerpt(post.content)
            }));
            
            AppState.setPosts(posts);
            this.renderPosts();
            
            return { success: true, data: posts };
            
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            this.renderError('Erro ao carregar posts: ' + error.message);
            return { success: false, error: error.message };
        }
    },

    // Criar novo post
    async createPost(title, content) {
        try {
            if (!title.trim() || !content.trim()) {
                throw new Error('Título e conteúdo são obrigatórios');
            }

            const postData = {
                title: title.trim(),
                content: content.trim(),
                excerpt: this.generateExcerpt(content.trim()),
                created_at: new Date().toISOString()
            };

            let newPost;

            if (supabase) {
                const { data, error } = await supabase
                    .from('posts')
                    .insert([postData]);

                if (error) {
                    throw new Error(error);
                }
                
                newPost = data?.[0] || { ...postData, id: Date.now() };
            } else {
                // Mock para demonstração
                newPost = {
                    ...postData,
                    id: Date.now()
                };
            }

            // Atualizar estado
            AppState.addPost(newPost);
            this.renderPosts();

            return { success: true, data: newPost };

        } catch (error) {
            console.error('Erro ao criar post:', error);
            return { success: false, error: error.message };
        }
    },

    // Deletar post
    async deletePost(postId) {
        try {
            if (supabase) {
                const { error } = await supabase
                    .from('posts')
                    .delete()
                    .eq('id', postId);

                if (error) {
                    throw new Error(error);
                }
            }

            // Atualizar estado
            AppState.removePost(postId);
            this.renderPosts();

            return { success: true };

        } catch (error) {
            console.error('Erro ao deletar post:', error);
            return { success: false, error: error.message };
        }
    },

    // Atualizar post
    async updatePost(postId, updateData) {
        try {
            const updatedData = {
                ...updateData,
                updated_at: new Date().toISOString()
            };

            if (updatedData.content) {
                updatedData.excerpt = this.generateExcerpt(updatedData.content);
            }

            if (supabase) {
                const { data, error } = await supabase
                    .from('posts')
                    .update(updatedData)
                    .eq('id', postId);

                if (error) {
                    throw new Error(error);
                }
            }

            // Atualizar estado
            AppState.updatePost(postId, updatedData);
            this.renderPosts();

            return { success: true };

        } catch (error) {
            console.error('Erro ao atualizar post:', error);
            return { success: false, error: error.message };
        }
    },

    // Renderizar posts na página inicial
    renderPosts() {
        const postsGrid = document.getElementById('posts-grid');
        
        if (!postsGrid) {
            console.error('Element posts-grid não encontrado');
            return;
        }

        const posts = AppState.getState('posts');
        
        if (posts.length === 0) {
            postsGrid.innerHTML = `
                <div class="no-posts">
                    <p>NENHUM POST ENCONTRADO</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.7;">
                        ${supabase ? 'Faça login para criar o primeiro post.' : 'Configure o Supabase para funcionalidade completa.'}
                    </p>
                </div>
            `;
            return;
        }

        postsGrid.innerHTML = posts.map(post => `
            <article class="post-card" onclick="PostManager.expandPost('${post.id}')">
                <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    ${this.formatDate(post.created_at)} • ${this.formatTime(post.created_at)}
                </div>
                <p class="post-excerpt">${this.escapeHtml(post.excerpt)}</p>
            </article>
        `).join('');
    },

    // Renderizar erro
    renderError(message) {
        const postsGrid = document.getElementById('posts-grid');
        
        if (postsGrid) {
            postsGrid.innerHTML = `
                <div class="no-posts">
                    <p>⚠️ ${message}</p>
                </div>
            `;
        }
    },

    // Expandir post (modal ou nova página)
    expandPost(postId) {
        const post = AppState.getPostById(parseInt(postId));
        
        if (!post) {
            console.error('Post não encontrado:', postId);
            return;
        }

        // Por enquanto, usar alert (pode ser substituído por modal)
        const content = `${post.title}\n\n${post.content}\n\n---\nPublicado em: ${this.formatDate(post.created_at)} às ${this.formatTime(post.created_at)}`;
        alert(content);
    },

    // Utilitários
    generateExcerpt(content, length = CONFIG.BLOG.EXCERPT_LENGTH) {
        if (content.length <= length) {
            return content;
        }
        
        const excerpt = content.substring(0, length);
        const lastSpaceIndex = excerpt.lastIndexOf(' ');
        
        return lastSpaceIndex > 0 
            ? excerpt.substring(0, lastSpaceIndex) + '...'
            : excerpt + '...';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch (error) {
            return 'Data inválida';
        }
    },

    formatTime(dateString) {
        try {
            return new Date(dateString).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (error) {
            return 'Hora inválida';
        }
    },

    // Validar dados do post
    validatePost(title, content) {
        const errors = [];
        
        if (!title || typeof title !== 'string' || !title.trim()) {
            errors.push('Título é obrigatório');
        }
        
        if (!content || typeof content !== 'string' || !content.trim()) {
            errors.push('Conteúdo é obrigatório');
        }
        
        if (title && title.length > 255) {
            errors.push('Título muito longo (máximo 255 caracteres)');
        }
        
        return errors;
    }
};