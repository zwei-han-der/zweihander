import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sahqzuwrkuhiftvtwney.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function getPosts() {
    const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

    if (error) {
        console.error('❌ Error fetching posts:', error)
        return []
    }
    return data
}

export async function addPost(post) {
    const { data, error } = await supabase
    .from('posts')
    .insert([post])

    if (error) {
        console.error('❌ Error adding post:', error)
        
        return null
    }
    return data
}