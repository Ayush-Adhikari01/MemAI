# MemAI — AI Chatbot with Persistent Long-Term Vector Memory

A production-grade AI Chatbot application with **Long-Term Vector Memory**, built with **Google Gemini (`gemini-2.5-flash` & `text-embedding-004`)**, **Node.js/Express**, **PostgreSQL/Supabase (`pgvector`)**, and **React + Vite + Tailwind CSS**.

Unlike standard chatbots that lose context once a conversation ends or overload the prompt with raw chat history, **MemAI** extracts enduring facts, user preferences, technical skills, and project contexts, saves them as 768-dimensional semantic embeddings, and dynamically retrieves only relevant memories into future conversations.

---

## 🌟 Key Architecture & Memory Features

```
                                  ┌────────────────────────┐
                                  │   User Sends Message   │
                                  └───────────┬────────────┘
                                              │
                         ┌────────────────────▼────────────────────┐
                         │ 1. Vector Embedding (text-embedding-004)│
                         └────────────────────┬────────────────────┘
                                              │
                   ┌──────────────────────────▼──────────────────────────┐
                   │ 2. pgvector Cosine Search + Hybrid Ranking Formula   │
                   │    (Similarity + Importance + Recency + Confidence) │
                   └──────────────────────────┬──────────────────────────┘
                                              │
                         ┌────────────────────▼────────────────────┐
                         │ 3. Dynamic Gemini Prompt Injection     │
                         │    (Short-term context + Stored memories)│
                         └────────────────────┬────────────────────┘
                                              │
                         ┌────────────────────▼────────────────────┐
                         │ 4. Gemini Response (gemini-2.5-flash)   │
                         └────────────────────┬────────────────────┘
                                              │
                         ┌────────────────────▼────────────────────┐
                         │ 5. Background Memory Extraction &       │
                         │    Conflict Resolution Engine           │
                         │    (Outdates old conflicting facts)     │
                         └─────────────────────────────────────────┘
```

### 1. Multi-Tiered Cognitive Memory
* **Short-Term Memory**: The ongoing conversation history turns.
* **Long-Term Fact & Preference Memory**: Persistent details (name, college, preferred language, favorite games).
* **Episodic & Project Memory**: Tracking ongoing projects (e.g. *StudyMate* React app), goals, and events.
* **Instructional Memory**: Permanent user directives (e.g. "Always explain code with C and user input").

### 2. Multi-Factor Hybrid Ranking Formula
Retrieved memories are ranked using a hybrid scoring algorithm:
$$\text{Score} = (0.45 \times \text{Similarity}) + (0.20 \times \text{Importance}) + (0.15 \times \text{Recency}) + (0.10 \times \text{Confidence}) + (0.10 \times \text{Usage Frequency})$$

### 3. Conflict Resolution & Superseding
If a user previously liked Python and later announces `Actually, C is my main language now`, the AI automatically detects the conflict, marks the older memory as `outdated`, and vectorizes the new `active` memory.

### 4. Full User Memory Controls
* Real-time search and category filtering (`fact`, `preference`, `project`, `relationship`, `event`, `skill`, `instruction`).
* View confidence scores, access frequency counters, and importance levels.
* Manually add, edit, or delete memories.
* Toggle long-term memory on or off anytime.
* Clear all stored memory with one click.

---

## 📁 Project Structure

```text
C:\BKK/
├── client/                     # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/          # ChatArea, MessageItem, MessageInput, CodeBlock, MemoryBadge
│   │   │   ├── Memory/        # MemoryList, MemoryCard, MemoryModal, MemoryStats
│   │   │   ├── Auth/          # AuthModal (Login/Signup)
│   │   │   ├── Settings/      # SettingsModal (Memory toggle, directives)
│   │   │   ├── Layout.jsx     # Responsive App Layout
│   │   │   └── Sidebar.jsx    # Conversations & Navigation
│   │   ├── context/           # AuthContext & ChatContext
│   │   ├── services/          # API Client & Supabase Client
│   │   ├── pages/             # ChatPage & MemoriesPage
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/            # Environment & Supabase initialization
│   │   ├── controllers/       # Chat, Conversation, Memory, Auth controllers
│   │   ├── database/
│   │   │   ├── dbAdapter.js       # Abstract Database Interface
│   │   │   ├── supabaseAdapter.js # Supabase Implementation
│   │   │   └── schema.sql         # PostgreSQL + pgvector Schema & RPC
│   │   ├── middleware/        # JWT Auth, Rate Limiter, Error Handler
│   │   ├── routes/            # Chat, Conversation, Memory, Auth endpoints
│   │   ├── services/
│   │   │   ├── gemini.js          # Gemini Chat & JSON extraction
│   │   │   ├── embeddings.js      # Gemini text-embedding-004
│   │   │   ├── memoryRetrieval.js # Vector search + Hybrid scoring
│   │   │   ├── memoryExtraction.js# Extraction & Conflict resolution
│   │   │   └── chatService.js     # Chat pipeline coordinator
│   │   └── index.js           # Server entry point
│   ├── .env.example
│   └── package.json
│
├── package.json               # Root scripts (runs both client & server)
└── README.md
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Database Setup (Supabase)

1. Create a free project at [Supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase Dashboard.
3. Open `server/src/database/schema.sql` and paste the entire script into the SQL Editor.
4. Click **Run**. This will:
   - Enable the `vector` (pgvector) and `uuid-ossp` extensions.
   - Create tables: `user_profiles`, `conversations`, `messages`, and `memories`.
   - Create the HNSW index for ultra-fast vector searches.
   - Create the `match_memories` RPC stored procedure for cosine similarity lookup.
   - Enable Row Level Security (RLS) policies.

---

### Step 2: Configure Environment Variables

#### 1. Backend (`server/.env`):
Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
Fill in the credentials:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# 1. Google Gemini API Key (https://aistudio.google.com/)
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004

# 2. Supabase API Credentials (Project Settings -> API)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (Use Service Role Key for backend)
SUPABASE_ANON_KEY=eyJhbGciOi...

# 3. Memory Search Tuning
MEMORY_SIMILARITY_THRESHOLD=0.45
MEMORY_MAX_RETRIEVED=5
MEMORY_AUTO_EXTRACT=true
```

#### 2. Frontend (`client/.env`):
Copy `client/.env.example` to `client/.env`:
```bash
cp client/.env.example client/.env
```
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_API_URL=/api
```

---

### Step 3: Install Dependencies

From the root directory, run:
```bash
npm install
npm run install:all
```
*(Or install in `server` and `client` individually with `cd server && npm install` and `cd ../client && npm install`)*

---

### Step 4: Run the Application

Start both the backend server and Vite frontend concurrently with:
```bash
npm run dev
```

* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)
* **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing the Memory System

1. **Test Initial Memory Storage**:
   * Open the Chat and send:
     > *"My name is Rahul. I'm studying computer science at VIT and I really like Minecraft."*
   * The AI responds warmly.
   * Switch to the **Memories** tab in the sidebar. You will see:
     * `Rahul` (Fact, Importance 5)
     * `Studies CS at VIT` (Fact, Importance 4)
     * `Likes Minecraft` (Preference, Importance 4)

2. **Test Context-Free Recall**:
   * Click **"+ New Chat"** (creates a completely blank conversation history).
   * Ask:
     > *"What game should I play tonight?"*
   * Notice the response:
     > *"Since you enjoy Minecraft, you might like..."*
   * Click the **"🧠 1 memory recalled"** badge above the response to view the exact memory and vector match confidence score!

3. **Test Conflict Resolution & Memory Updates**:
   * Send:
     > *"Actually, I don't play Minecraft anymore. My favorite game now is Elden Ring."*
   * Check the **Memories** page. The older Minecraft memory will be automatically marked as `Outdated`, and `Elden Ring` will be stored as the new active preference!

4. **Test Manual Memory Curation**:
   * Click **"Add Memory"** in the Memories page.
   * Add: *"User prefers concise answers with C code examples."* (Category: `Instruction`, Importance: `5`).
   * In a new chat, ask: *"How do I implement binary search?"*
   * The AI will provide a concise C implementation with user input handling without you having to ask for C.

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send message, retrieve memories, generate Gemini response, and extract new memories |
| `GET` | `/api/conversations` | List user's conversations |
| `GET` | `/api/conversations/:id`| Get conversation details with message history |
| `POST` | `/api/conversations` | Create a new conversation |
| `PATCH`| `/api/conversations/:id`| Rename or pin conversation |
| `DELETE`| `/api/conversations/:id`| Delete conversation and all its messages |
| `GET` | `/api/memories` | List memories (filter by `type`, `status`, `search`) |
| `GET` | `/api/memories/stats` | Get breakdown of stored memories by category |
| `POST` | `/api/memories` | Manually insert memory (auto-generates 768-dim vector) |
| `PATCH`| `/api/memories/:id` | Update memory content or status |
| `DELETE`| `/api/memories/:id` | Delete specific memory |
| `DELETE`| `/api/memories` | Clear all memories for user |
| `GET` | `/api/auth/profile` | Get user settings and instructions |
| `PATCH`| `/api/auth/profile` | Update memory toggle (`memory_enabled`) or system directives |

---

## 🛡️ Security & Privacy Architecture

* **Zero Frontend API Keys**: The `GEMINI_API_KEY` and Supabase Service Role Key are kept strictly on the backend.
* **Per-User Memory Isolation**: All vector similarity queries and CRUD operations are filtered strictly by `user_id`.
* **Row-Level Security (RLS)**: PostgreSQL tables enforce database-level policies so users cannot access data belonging to others.
* **Rate Limiting**: Integrated `express-rate-limit` prevents spamming chat generation or flooding embeddings.

---

## 🔧 Troubleshooting Guide

### 1. "Vector search RPC error: match_memories does not exist"
* **Solution**: Ensure you ran `server/src/database/schema.sql` in the Supabase SQL Editor. It creates the `match_memories` function and enables `pgvector`.

### 2. "API key not valid. Please pass a valid API key."
* **Solution**: Check that your `GEMINI_API_KEY` in `server/.env` is correct. You can get one from [Google AI Studio](https://aistudio.google.com/).

### 3. Running without Supabase initially (Guest Demo Mode)
* The application is built with a fallback guest mode so you can test and explore the UI immediately. To enable full database persistence and vector indexing, configure your Supabase credentials in `server/.env`.
