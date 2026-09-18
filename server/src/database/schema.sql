-- ==============================================================================
-- Long-Term Memory AI Chatbot Database Schema
-- Compatible with Supabase & PostgreSQL with pgvector extension
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. User Profiles / Preferences
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    memory_enabled BOOLEAN DEFAULT true,
    custom_instructions TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    memories_used JSONB DEFAULT '[]'::jsonb,
    memories_extracted JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Long-Term Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    memory_type TEXT NOT NULL CHECK (memory_type IN ('fact', 'preference', 'project', 'relationship', 'event', 'skill', 'instruction')),
    importance INTEGER NOT NULL DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
    confidence FLOAT NOT NULL DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'outdated', 'archived')),
    embedding VECTOR(768), -- Dimensions for Gemini text-embedding-004
    source_conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    source_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    access_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_memories_user_status ON public.memories(user_id, status);
CREATE INDEX IF NOT EXISTS idx_memories_type ON public.memories(memory_type);

-- HNSW Vector Index for Cosine Distance (Super fast semantic similarity lookup)
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON public.memories 
USING hnsw (embedding vector_cosine_ops);

-- 7. Semantic Memory Matching RPC Function
CREATE OR REPLACE FUNCTION public.match_memories(
    query_embedding VECTOR(768),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 10,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    content TEXT,
    memory_type TEXT,
    importance INT,
    confidence FLOAT,
    status TEXT,
    similarity FLOAT,
    access_count INT,
    last_used_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.user_id,
        m.content,
        m.memory_type,
        m.importance,
        m.confidence,
        m.status,
        -- Cosine similarity: 1 - cosine distance
        (1 - (m.embedding <=> query_embedding))::FLOAT AS similarity,
        m.access_count,
        m.last_used_at,
        m.metadata,
        m.created_at,
        m.updated_at
    FROM public.memories m
    WHERE
        m.status = 'active'
        AND (p_user_id IS NULL OR m.user_id = p_user_id)
        AND (1 - (m.embedding <=> query_embedding)) >= match_threshold
    ORDER BY (1 - (m.embedding <=> query_embedding)) DESC
    LIMIT match_count;
END;
$$;

-- 8. Auto-update updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_memories_updated_at ON public.memories;
CREATE TRIGGER update_memories_updated_at
    BEFORE UPDATE ON public.memories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Automatically create profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, memory_enabled)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- User Profile Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Conversation Policies
CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Message Policies
CREATE POLICY "Users can view own messages" ON public.messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.messages
    FOR DELETE USING (auth.uid() = user_id);

-- Memory Policies
CREATE POLICY "Users can view own memories" ON public.memories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" ON public.memories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" ON public.memories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON public.memories
    FOR DELETE USING (auth.uid() = user_id);
