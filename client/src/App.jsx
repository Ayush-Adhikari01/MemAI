import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Layout } from './components/Layout.jsx';
import { ChatPage } from './pages/ChatPage.jsx';
import { MemoriesPage } from './pages/MemoriesPage.jsx';
import { SettingsModal } from './components/Settings/SettingsModal.jsx';
import { AuthModal } from './components/Auth/AuthModal.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'memories'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <Layout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
          >
            {activeTab === 'chat' && <ChatPage />}
            {activeTab === 'memories' && <MemoriesPage />}
          </Layout>

          {/* Global Modals */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
          />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
