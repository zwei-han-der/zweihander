const CONFIG = {
    SUPABASE: {
        URL: 'https://sahqzuwrkuhiftvtwney.supabase.co',
        ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhaHF6dXdya3VoaWZ0dnR3bmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTA1ODQsImV4cCI6MjA2OTIyNjU4NH0.dYyzdCMGDXGsZraEcakdgKoEZgo7ZRLGt0IHp_et-m4'
    },
    
    BLOG: {
        TITLE: 'Zweihander',
        AUTHOR: 'Admin',
        POSTS_PER_PAGE: 10,
        EXCERPT_LENGTH: 200
    },
    
    DEMO_AUTH: {
        EMAIL: 'admin@zweihander.com',
        PASSWORD: 'admin123'
    },
    
    LOADING: {
        SPEED: 30,
        MESSAGES: {
            0: 'BOOTING SYSTEM...',
            20: 'LOADING NEURAL CORE...',
            40: 'ESTABLISHING CONNECTION...',
            60: 'SYNCHRONIZING DATA...',
            80: 'FINALIZING PROTOCOL...',
            100: 'SYSTEM ONLINE'
        }
    },
    
    UI: {
        ANIMATION_DURATION: 300,
        MESSAGE_TIMEOUT: 5000,
        FADE_OUT_DURATION: 800
    }
};

function isSupabaseConfigured() {
    return CONFIG.SUPABASE.URL !== 'YOUR_SUPABASE_URL' && 
           CONFIG.SUPABASE.ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

window.showConfigurationInstructions = showConfigurationInstructions;