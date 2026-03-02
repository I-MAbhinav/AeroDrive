import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MainArea from './components/MainArea';

function App() {
  const [currentView, setCurrentView] = useState('drive');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Authenticator.Provider>
      <Authenticator variation="modal">
        {({ signOut, user }) => (
          <div className="app-container">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div className="main-wrapper">
              <Topbar signOut={signOut} user={user} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <MainArea currentView={currentView} searchQuery={searchQuery} />
            </div>

            {/* Watermark */}
            <div style={{
              position: 'fixed',
              bottom: '1rem',
              right: '1rem',
              background: 'linear-gradient(90deg, #ffffff, #265da9ff)',
              WebkitBackgroundClip: 'text',
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
        )}
      </Authenticator>
    </Authenticator.Provider>
  );
}

export default App;
