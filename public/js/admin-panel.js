/**
 * Painel Administrativo
 */

const AdminPanel = {
    // Carregar posts no painel admin
    loadAdminPosts() {
        const adminPostsList = document.getElementById('admin-posts-list');
        
        if (!adminPostsList) {
            console.error('Element admin-posts-list não encontrado');
            return;
        }

        const posts = AppState.getState('posts');
        
        if (posts.length === 0) {
            adminPostsList.innerHTML = `
                <p style="color: #666; text-align: center; padding: 2rem; font-style: italic;">
                    Nenhum post encontrado. Crie o primeiro post acima.
                </p>
            `;
            return;
        }

        adminPostsList.innerHTML = posts.map(post => this.renderAdminPost(post)).join('');
    },

    // Renderizar um post no painel admin
    renderAdminPost(post) {
        return `
            <div class="admin-post-item">
                <div class="admin-post-header">
                    <h4 class="admin-post-title">${PostManager.escapeHtml(post.title)}</h4>
                    <button onclick="AdminPanel.deletePost('${post.id}')" class="delete-btn">
                        DELETAR
                    </button>
                </div>
                <div class="admin-post-meta">
                    ${PostManager.formatDate(post.created_at)} • ${PostManager.formatTime(post.created_at)}
                    ${post.updated_at && post.updated_at !== post.created_at ? 
                        ` • Editado: ${PostManager.formatDate(post.updated_at)}` : ''}
                </div>
                <p class="admin-post-content">
                    ${PostManager.escapeHtml(this.truncateContent(post.content, 150))}
                </p>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button onclick="AdminPanel.editPost('${post.id}')" 
                            style="padding: 0.3rem 0.8rem; background: none; border: 1px solid var(--BorderColor); font-family: var(--JetBrains); font-size: 0.8rem; cursor: pointer;">
                        EDITAR
                    </button>
                    <button onclick="AdminPanel.viewPost('${post.id}')" 
                            style="padding: 0.3rem 0.8rem; background: none; border: 1px solid var(--BorderColor); font-family: var(--JetBrains); font-size: 0.8rem; cursor: pointer;">
                        VER COMPLETO
                    </button>
                </div>
            </div>
        `;
    },

    // Deletar post
    async deletePost(postId) {
        if (!confirm('Tem certeza que deseja deletar este post?')) {
            return;
        }

        try {
            showLoading('DELETANDO POST...');
            
            const result = await PostManager.deletePost(postId);
            
            if (result.success) {
                this.loadAdminPosts();
                this.showMessage('post-message', 'Post deletado com sucesso!', 'success');
            } else {
                this.showMessage('post-message', result.error || 'Erro ao deletar post', 'error');
            }
            
        } catch (error) {
            console.error('Erro ao deletar post:', error);
            this.showMessage('post-message', 'Erro inesperado ao deletar post', 'error');
        } finally {
            hideLoading();
        }
    },

    // Visualizar post completo
    viewPost(postId) {
        const post = AppState.getPostById(parseInt(postId));
        
        if (!post) {
            console.error('Post não encontrado:', postId);
            return;
        }

        // Criar modal ou usar alert
        this.showPostModal(post);
    },

    // Editar post (implementação futura)
    editPost(postId) {
        const post = AppState.getPostById(parseInt(postId));
        
        if (!post) {
            console.error('Post não encontrado:', postId);
            return;
        }

        // Por enquanto, preencher o formulário de novo post com os dados existentes
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-content').value = post.content;
        
        // Scroll para o formulário
        document.getElementById('new-post-form').scrollIntoView({ behavior: 'smooth' });
        
        this.showMessage('post-message', 'Dados carregados para edição. Modifique e publique.', 'success');
    },

    // Mostrar modal de post (implementação simples)
    showPostModal(post) {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
        `;

        // Criar modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border: 2px solid var(--BorderColor);
            padding: 2rem;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            font-family: var(--JetBrains);
        `;

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <h2 style="font-size: 1.4rem; font-weight: 700; margin: 0;">${PostManager.escapeHtml(post.title)}</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 0; margin-left: 1rem;">✕</button>
            </div>
            <div style="color: #666; font-size: 0.9rem; margin-bottom: 1.5rem;">
                ${PostManager.formatDate(post.created_at)} • ${PostManager.formatTime(post.created_at)}
            </div>
            <div style="line-height: 1.6; white-space: pre-wrap;">
                ${PostManager.escapeHtml(post.content)}
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Fechar ao clicar no overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        // Fechar com ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    // Limpar formulário de novo post
    clearNewPostForm() {
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-message').textContent = '';
        document.getElementById('post-message').className = '';
    },

    // Validar formulário
    validatePostForm(title, content) {
        const errors = [];
        
        if (!title.trim()) {
            errors.push('Título é obrigatório');
        }
        
        if (!content.trim()) {
            errors.push('Conteúdo é obrigatório');
        }
        
        if (title.length > 255) {
            errors.push('Título muito longo (máximo 255 caracteres)');
        }
        
        return errors;
    },

    // Mostrar mensagem
    showMessage(elementId, message, type) {
        const messageElement = document.getElementById(elementId);
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = type === 'error' ? 'error-message' : 'success-message';
            
            // Auto-limpar mensagem após 5 segundos
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = '';
            }, CONFIG.UI.MESSAGE_TIMEOUT);
        }
    },

    // Truncar conteúdo para exibição
    truncateContent(content, maxLength) {
        if (content.length <= maxLength) {
            return content;
        }
        
        const truncated = content.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        
        return lastSpaceIndex > 0 
            ? truncated.substring(0, lastSpaceIndex) + '...'
            : truncated + '...';
    },

    // Estatísticas do blog
    getStats() {
        const posts = AppState.getState('posts');
        
        return {
            totalPosts: posts.length,
            totalWords: posts.reduce((total, post) => total + post.content.split(' ').length, 0),
            avgWordsPerPost: posts.length > 0 ? Math.round(posts.reduce((total, post) => total + post.content.split(' ').length, 0) / posts.length) : 0,
            lastPostDate: posts.length > 0 ? posts[0].created_at : null
        };
    },

    // Renderizar estatísticas (implementação futura)
    renderStats() {
        const stats = this.getStats();
        
        return `
            <div style="border: 1px solid var(--BorderColor); padding: 1rem; margin-bottom: 2rem; background: #f9f9f9;">
                <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">ESTATÍSTICAS</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div><strong>Posts:</strong> ${stats.totalPosts}</div>
                    <div><strong>Palavras:</strong> ${stats.totalWords}</div>
                    <div><strong>Média/Post:</strong> ${stats.avgWordsPerPost}</div>
                    ${stats.lastPostDate ? `<div><strong>Último:</strong> ${PostManager.formatDate(stats.lastPostDate)}</div>` : ''}
                </div>
            </div>
        `;
    },

    // Export de posts (implementação futura)
    exportPosts(format = 'json') {
        const posts = AppState.getState('posts');
        
        try {
            let exportData;
            let filename;
            let mimeType;
            
            switch (format) {
                case 'json':
                    exportData = JSON.stringify(posts, null, 2);
                    filename = `blog-posts-${new Date().toISOString().split('T')[0]}.json`;
                    mimeType = 'application/json';
                    break;
                    
                case 'csv':
                    const csvHeader = 'ID,Título,Conteúdo,Data de Criação\n';
                    const csvRows = posts.map(post => 
                        `${post.id},"${post.title.replace(/"/g, '""')}","${post.content.replace(/"/g, '""')}",${post.created_at}`
                    ).join('\n');
                    exportData = csvHeader + csvRows;
                    filename = `blog-posts-${new Date().toISOString().split('T')[0]}.csv`;
                    mimeType = 'text/csv';
                    break;
                    
                default:
                    throw new Error('Formato não suportado');
            }
            
            // Criar e download do arquivo
            const blob = new Blob([exportData], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('post-message', `Posts exportados em ${format.toUpperCase()}!`, 'success');
            
        } catch (error) {
            console.error('Erro ao exportar posts:', error);
            this.showMessage('post-message', 'Erro ao exportar posts', 'error');
        }
    },

    // Backup automático (implementação futura)
    createBackup() {
        const backupData = {
            posts: AppState.getState('posts'),
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        try {
            const backupJson = JSON.stringify(backupData, null, 2);
            const filename = `blog-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            const blob = new Blob([backupJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('post-message', 'Backup criado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            this.showMessage('post-message', 'Erro ao criar backup', 'error');
        }
    },

    // Importar posts (implementação futura)
    importPosts(file) {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                let postsToImport = [];
                
                // Verificar formato
                if (Array.isArray(data)) {
                    postsToImport = data;
                } else if (data.posts && Array.isArray(data.posts)) {
                    postsToImport = data.posts;
                } else {
                    throw new Error('Formato de arquivo inválido');
                }
                
                // Validar e importar posts
                let importedCount = 0;
                
                for (const post of postsToImport) {
                    if (post.title && post.content) {
                        const result = await PostManager.createPost(post.title, post.content);
                        if (result.success) {
                            importedCount++;
                        }
                    }
                }
                
                this.loadAdminPosts();
                this.showMessage('post-message', `${importedCount} posts importados com sucesso!`, 'success');
                
            } catch (error) {
                console.error('Erro ao importar posts:', error);
                this.showMessage('post-message', 'Erro ao importar posts: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    },

    // Inicializar painel admin
    init() {
        // Adicionar botões de funcionalidades extras se necessário
        this.addExtraFeatures();
    },

    // Adicionar funcionalidades extras ao painel
    addExtraFeatures() {
        const adminSection = document.getElementById('admin-section');
        if (!adminSection) return;
        
        // Adicionar botões de export/backup após a lista de posts
        const adminPosts = document.getElementById('admin-posts');
        if (adminPosts && !document.getElementById('admin-tools')) {
            const toolsDiv = document.createElement('div');
            toolsDiv.id = 'admin-tools';
            toolsDiv.style.cssText = 'margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--BorderColor);';
            
            toolsDiv.innerHTML = `
                <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem;">FERRAMENTAS</h3>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button onclick="AdminPanel.exportPosts('json')" 
                            style="padding: 0.5rem 1rem; background: none; border: 1px solid var(--BorderColor); font-family: var(--JetBrains); cursor: pointer;">
                        EXPORTAR JSON
                    </button>
                    <button onclick="AdminPanel.exportPosts('csv')" 
                            style="padding: 0.5rem 1rem; background: none; border: 1px solid var(--BorderColor); font-family: var(--JetBrains); cursor: pointer;">
                        EXPORTAR CSV
                    </button>
                    <button onclick="AdminPanel.createBackup()" 
                            style="padding: 0.5rem 1rem; background: none; border: 1px solid var(--BorderColor); font-family: var(--JetBrains); cursor: pointer;">
                        CRIAR BACKUP
                    </button>
                    <label style="padding: 0.5rem 1rem; background: none; border: 1px solid var(--BorderColor); font-family: var(--JetBrains); cursor: pointer;">
                        IMPORTAR
                        <input type="file" accept=".json" onchange="AdminPanel.handleFileImport(this)" style="display: none;">
                    </label>
                </div>
            `;
            
            adminPosts.appendChild(toolsDiv);
        }
    },

    // Handler para import de arquivo
    handleFileImport(input) {
        const file = input.files[0];
        if (file) {
            if (confirm('Tem certeza que deseja importar posts? Isso pode adicionar posts duplicados.')) {
                this.importPosts(file);
            }
        }
        // Limpar input
        input.value = '';
    }
};