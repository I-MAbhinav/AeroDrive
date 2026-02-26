import { Cloud, Folder, Clock, Star, Trash2, HardDrive } from 'lucide-react';
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Sidebar = ({ currentView, setCurrentView }: SidebarProps) => {
  const [usedStorage, setUsedStorage] = useState(0);
  const TOTAL_STORAGE = 10 * 1024 * 1024 * 1024; // 10 GB

  useEffect(() => {
    // ObserveQuery automatically updates when new records are created or deleted
    const sub = client.models.FileRecord.observeQuery().subscribe({
      next: ({ items }) => {
        const total = items.reduce((acc, item) => {
          return acc + (item.type === 'file' && item.size ? item.size : 0);
        }, 0);
        setUsedStorage(total);
      },
      error: (err) => console.error('Error fetching storage:', err)
    });

    return () => sub.unsubscribe();
  }, []);

  const percentage = Math.min((usedStorage / TOTAL_STORAGE) * 100, 100).toFixed(1);

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <Cloud className="logo-icon" size={28} />
        <span>AeroDrive</span>
      </div>

      <nav className="nav-menu">
        <a href="#" className={`nav-item ${currentView === 'drive' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('drive'); }}>
          <HardDrive />
          <span>My Drive</span>
        </a>
        <a href="#" className={`nav-item ${currentView === 'folders' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('folders'); }}>
          <Folder />
          <span>Folders</span>
        </a>
        <a href="#" className={`nav-item ${currentView === 'recent' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('recent'); }}>
          <Clock />
          <span>Recent</span>
        </a>
        <a href="#" className={`nav-item ${currentView === 'starred' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('starred'); }}>
          <Star />
          <span>Starred</span>
        </a>
        <a href="#" className={`nav-item ${currentView === 'trash' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('trash'); }}>
          <Trash2 />
          <span>Trash</span>
        </a>
      </nav>

      <div className="storage-widget">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Storage</span>
          <span>{percentage}%</span>
        </div>
        <div className="storage-progress-bg">
          <div className="storage-progress-fill" style={{ width: `${percentage}%` }}></div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {formatSize(usedStorage)} of {formatSize(TOTAL_STORAGE)} used
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
