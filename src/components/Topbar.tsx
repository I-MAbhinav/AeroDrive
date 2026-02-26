import { Search, Bell, Settings, Plus, LogOut, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AuthUser } from 'aws-amplify/auth';

interface TopbarProps {
    signOut?: () => void;
    user?: AuthUser;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const Topbar = ({ signOut, user, searchQuery, setSearchQuery }: TopbarProps) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Init from local storage or default to true
        return localStorage.getItem('theme') !== 'light';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <header className="topbar">
            <div className="search-container">
                <Search className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search files, folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="profile-controls">
                <button
                    className="btn-primary"
                    onClick={() => {
                        // Dispatch custom event to trigger upload in MainArea
                        document.dispatchEvent(new CustomEvent('trigger-upload'));
                    }}
                >
                    <Plus size={18} />
                    <span>New</span>
                </button>

                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', marginLeft: '1rem' }}>
                    <Bell style={{ cursor: 'pointer' }} />
                    <Settings style={{ cursor: 'pointer' }} onClick={() => setIsSettingsOpen(true)} />
                </div>

                <div style={{ position: 'relative' }}>
                    <div
                        className="avatar"
                        title={user?.signInDetails?.loginId || 'User'}
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        {user?.signInDetails?.loginId?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    {isProfileOpen && (
                        <>
                            <div
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <div className="profile-dropdown glass-panel fade-in">
                                <div className="profile-dropdown-header">
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Signed In As</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                                        {user?.signInDetails?.loginId || 'Unknown User'}
                                    </div>
                                </div>
                                <div className="profile-dropdown-body">
                                    {signOut && (
                                        <button className="dropdown-item text-danger" onClick={signOut}>
                                            <LogOut size={16} />
                                            <span>Sign Out / Switch Account</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isSettingsOpen && (
                <div className="settings-modal-overlay" onClick={() => setIsSettingsOpen(false)}>
                    <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="settings-modal-header">
                            <h3>Settings</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setIsSettingsOpen(false)} />
                        </div>
                        <div className="settings-modal-body">
                            <div className="settings-option">
                                <span>Dark Mode</span>
                                <input
                                    type="checkbox"
                                    checked={isDarkMode}
                                    onChange={toggleTheme}
                                />
                            </div>
                            <div className="settings-option">
                                <span>Email Notifications</span>
                                <input type="checkbox" defaultChecked />
                            </div>
                            <div className="settings-option">
                                <span>Compact View</span>
                                <input type="checkbox" />
                            </div>
                            <button className="btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }} onClick={() => setIsSettingsOpen(false)}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Topbar;
