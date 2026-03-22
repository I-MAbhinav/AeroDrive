import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MainArea from './components/MainArea';
import LandingPage from './components/LandingPage';

function AppContent() {
  const { authStatus, signOut, user } = useAuthenticator((context) => [context.authStatus, context.user]);
  const [currentView, setCurrentView] = useState('drive');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // If user becomes authenticated, close the login modal automatically
  useEffect(() => {
    if (authStatus === 'authenticated') {
      setShowLoginModal(false);
    }
  }, [authStatus]);

  if (authStatus === 'authenticated') {
    return (
      <div className="app-container">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        
        <div className="main-wrapper">
          <Topbar 
            signOut={signOut} 
            user={user} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <MainArea currentView={currentView} searchQuery={searchQuery} />
        </div>

        {/* Watermark */}
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          background: 'linear-gradient(90deg, #ffffff, #265da9ff)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '0.875rem',
          fontWeight: 500,
          zIndex: 1000,
          pointerEvents: 'none',
          opacity: 0.8
        }}>
          © Build by Abhinav Shakya as a Demo
        </div>
      </div>
    );
  }

  // Unauthenticated View
  return (
    <>
      <LandingPage onLoginClick={() => setShowLoginModal(true)} />
      {showLoginModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-container">
            <button className="auth-modal-close" onClick={() => setShowLoginModal(false)}>
              ✕
            </button>
            <Authenticator />
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <Authenticator.Provider>
      <AppContent />
    </Authenticator.Provider>
  );
}

export default App;
