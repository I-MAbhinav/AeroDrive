import { FileText, Image as ImageIcon, Video, Folder, MoreVertical, UploadCloud, ChevronRight, FolderPlus, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { uploadData, remove, getUrl } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

interface StorageFile {
    id: string;
    key: string;
    name: string;
    size?: number | null;
    lastModified?: string | null;
    type: string;
    folderPath: string;
    url?: string;
}

const getIcon = (type: string, name: string) => {
    if (type === 'folder') return <Folder fill="currentColor" size={32} style={{ color: '#60a5fa' }} />;

    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return <ImageIcon size={32} style={{ color: '#34d399' }} />;
    if (['mp4', 'mov', 'avi'].includes(ext)) return <Video size={32} style={{ color: '#f472b6' }} />;
    return <FileText size={32} style={{ color: '#a78bfa' }} />;
};

const formatSize = (bytes?: number | null) => {
    if (!bytes) return '--';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

interface MainAreaProps {
    currentView: string;
    searchQuery: string;
}

const MainArea = ({ currentView, searchQuery }: MainAreaProps) => {
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState<string>('root');
    const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            let queryFilter: any = { folderPath: { eq: currentPath } };

            if (currentView === 'folders') {
                queryFilter = { type: { eq: 'folder' } };
            } else if (currentView === 'recent') {
                queryFilter = undefined;
            } else if (currentView === 'starred' || currentView === 'trash') {
                queryFilter = { key: { eq: 'non-existent-key' } }; // Mock empty for these views as they don't have schema fields yet
            }

            const { data: records, errors } = await client.models.FileRecord.list(
                queryFilter ? { filter: queryFilter } : undefined
            );

            if (errors) console.error(errors);

            const filesWithUrls = await Promise.all(
                records.map(async (item) => {
                    let url = undefined;
                    if (item.type === 'file') {
                        try {
                            const pathResolver = ({ identityId }: { identityId: string }) => item.key.replace('${identityId}', identityId);
                            const urlResult = await getUrl({
                                path: pathResolver as any,
                                options: {
                                    expiresIn: 3600 // 1 hour expiration
                                }
                            });
                            url = urlResult.url.toString();
                        } catch (e) {
                            console.error('Error getting URL for', item.key, e);
                        }
                    }

                    return {
                        id: item.id,
                        key: item.key,
                        name: item.name,
                        size: item.size,
                        lastModified: item.lastModified,
                        type: item.type,
                        folderPath: item.folderPath,
                        url: url
                    };
                })
            );

            filesWithUrls.sort((a, b) => {
                if (currentView === 'recent') {
                    const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
                    const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
                    return dateB - dateA;
                }
                if (a.type === 'folder' && b.type !== 'folder') return -1;
                if (b.type === 'folder' && a.type !== 'folder') return 1;
                return a.name.localeCompare(b.name);
            });

            setFiles(filesWithUrls);
        } catch (e) {
            console.error('Error fetching files:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const getFileTypeCategory = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'images';
        if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'videos';
        if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'].includes(ext)) return 'documents';
        return 'other';
    };

    useEffect(() => {
        if (currentView !== 'drive' && currentPath !== 'root') {
            setCurrentPath('root');
        }
        setFileTypeFilter('all'); // Reset filter on view change
        fetchFiles();
    }, [currentPath, currentView]);

    useEffect(() => {
        const handleForceUpload = () => {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        };
        document.addEventListener('trigger-upload', handleForceUpload);
        return () => document.removeEventListener('trigger-upload', handleForceUpload);
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        try {
            setIsUploading(true);
            const storagePath = `private/\${identityId}/${Date.now()}-${file.name}`;

            await uploadData({
                path: ({ identityId }) => storagePath.replace('${identityId}', identityId || ''),
                data: file
            }).result;

            await client.models.FileRecord.create({
                key: storagePath,
                name: file.name,
                size: file.size,
                lastModified: new Date().toISOString(),
                type: 'file',
                folderPath: currentPath
            });

            await fetchFiles();
        } catch (err) {
            console.error('Error uploading file: ', err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCreateFolder = async () => {
        const folderName = prompt('Enter folder name:');
        if (!folderName) return;

        try {
            setIsLoading(true);
            await client.models.FileRecord.create({
                key: `folder-${Date.now()}`,
                name: folderName,
                type: 'folder',
                folderPath: currentPath,
                lastModified: new Date().toISOString(),
            });
            await fetchFiles();
        } catch (e) {
            console.error('Error creating folder:', e);
            setIsLoading(false);
        }
    };

    const handleDelete = async (file: StorageFile) => {
        if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;
        try {
            if (file.type === 'file') {
                const pathResolver = ({ identityId }: { identityId: string }) => file.key.replace('${identityId}', identityId);
                await remove({ path: pathResolver as any });
            }

            await client.models.FileRecord.delete({ id: file.id });
            setFiles(files.filter(f => f.id !== file.id));
        } catch (err) {
            console.error('Error deleting:', err);
        }
    };

    const navigateTo = (folderName: string) => {
        setCurrentPath(currentPath === 'root' ? folderName : `${currentPath}/${folderName}`);
    };

    const breadcrumbs = currentPath.split('/');

    const visibleFiles = files.filter(file => {
        // First apply search query if exists
        if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Then apply type filter (folders are always shown unless searching specifically)
        if (fileTypeFilter !== 'all') {
            // If we are strictly filtering types, hide folders for a cleaner view of just those files
            if (file.type === 'folder') return false;

            const category = getFileTypeCategory(file.name);
            if (category !== fileTypeFilter) return false;
        }

        return true;
    });

    return (
        <main className="content-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
                    <span
                        style={{ cursor: 'pointer', color: currentPath === 'root' ? 'var(--text-primary)' : 'var(--text-secondary)', textTransform: 'capitalize' }}
                        onClick={() => setCurrentPath('root')}
                    >
                        {currentView === 'drive' ? 'My Drive' : currentView}
                    </span>
                    {breadcrumbs.map((crumb, idx) => {
                        if (crumb === 'root') return null;
                        return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
                                <span
                                    style={{ cursor: 'pointer', color: idx === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                    onClick={() => {
                                        const rootIndex = breadcrumbs.indexOf('root');
                                        const targetBreadcrumbs = breadcrumbs.slice(rootIndex, idx + 1);
                                        setCurrentPath(targetBreadcrumbs.join('/'));
                                    }}
                                >
                                    {crumb}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {currentView === 'drive' && (
                        <button className="btn-primary" onClick={handleCreateFolder} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }} disabled={isUploading || isLoading}>
                            <FolderPlus size={18} />
                            <span>New Folder</span>
                        </button>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <button
                        className="btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isLoading}
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                        <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                    </button>
                </div>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {['all', 'images', 'videos', 'documents'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFileTypeFilter(type)}
                        style={{
                            background: fileTypeFilter === type ? 'var(--accent)' : 'var(--bg-glass)',
                            color: fileTypeFilter === type ? 'white' : 'var(--text-secondary)',
                            border: `1px solid ${fileTypeFilter === type ? 'var(--accent)' : 'var(--border)'}`,
                            padding: '0.35rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--accent)' }}>
                    <Loader2 size={40} className="animate-spin" />
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {visibleFiles.length === 0 && !isUploading && (
                        <div className="fade-in" style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1', padding: '2rem', textAlign: 'center' }}>
                            {searchQuery ? 'No matching files found.' : 'This folder is empty.'}
                        </div>
                    )}

                    {visibleFiles.map((file, idx) => (
                        <div key={file.id} className="glass-panel fade-in" style={{
                            padding: '1.5rem',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            transition: 'transform 0.2s, background 0.2s',
                            animationDelay: `${idx * 0.05}s`
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'var(--bg-glass)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                {getIcon(file.type, file.name)}
                                <div style={{ cursor: 'pointer', padding: '0.25rem' }} onClick={() => handleDelete(file)}>
                                    <MoreVertical size={16} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </div>

                            <div style={{ flexGrow: 1 }}>
                                <div
                                    style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
                                    title={file.name}
                                    onClick={() => {
                                        if (file.type === 'folder') {
                                            navigateTo(file.name);
                                        } else if (file.url) {
                                            window.open(file.url, '_blank');
                                        }
                                    }}
                                >
                                    {file.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                    {file.type === 'folder' ? '--' : formatSize(file.size)} • {file.lastModified ? new Date(file.lastModified).toLocaleDateString() : ''}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default MainArea;
