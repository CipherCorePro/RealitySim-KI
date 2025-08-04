
import React, { useState } from 'react';
import { FileNode } from '../types';
import Icon from './Icon';
import { useTranslation } from '../hooks/useTranslation';

interface FileNodeViewProps {
  node: FileNode;
  onFileClick: (path: string) => void;
  level?: number;
  onAnalyzeDirectory: (path: string) => void;
  analyzingPath: string | null;
  onCreateItem: (path: string, type: 'file' | 'directory') => void;
  onRenameItem: (path: string, type: 'file' | 'directory') => void;
  onDeleteItem: (path: string, type: 'file' | 'directory') => void;
}

const FileNodeView: React.FC<FileNodeViewProps> = ({ 
    node, 
    onFileClick, 
    level = 0, 
    onAnalyzeDirectory, 
    analyzingPath,
    onCreateItem,
    onRenameItem,
    onDeleteItem
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();

  const isDirectory = node.type === 'directory';
  const isAnalyzing = analyzingPath === node.path;

  const getFileIconType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'css': case 'scss': case 'less': return 'css';
      case 'html': return 'html';
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': return 'image';
      default: return 'file';
    }
  };

  const handleToggle = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else {
        onFileClick(node.path);
    }
  };
  
  const ActionButton: React.FC<{onClick: () => void, title: string, icon: 'analyze' | 'spinner' | 'addFile' | 'addFolder' | 'rename' | 'delete', disabled?: boolean}> = ({onClick, title, icon, disabled}) => (
     <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        title={title}
        disabled={disabled}
        className="p-1.5 rounded-full hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <Icon type={icon} className="w-4 h-4" />
    </button>
  );

  return (
    <div style={{ paddingLeft: `${level * 1}rem` }}>
      <div
        onClick={handleToggle}
        className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-slate-700 cursor-pointer transition-colors duration-150 group relative"
      >
        {isDirectory ? (
          <span className={`transform transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        ) : <span className="w-3 h-3"></span>}
        <Icon type={isDirectory ? 'folder' : getFileIconType(node.name)} className="w-5 h-5 flex-shrink-0 text-sky-400" />
        <span className="truncate text-sm text-slate-300">{node.name}</span>

        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-slate-700/80 backdrop-blur-sm rounded-lg p-0.5">
            {isDirectory ? (
                <>
                    {isAnalyzing ? (
                        <Icon type="spinner" className="w-4 h-4 text-sky-400 mx-1.5" />
                    ) : (
                        <ActionButton onClick={() => onAnalyzeDirectory(node.path)} title={t('analyzeDirectoryTitle')} icon="analyze" />
                    )}
                    <ActionButton onClick={() => onCreateItem(node.path, 'file')} title={t('createFile')} icon="addFile" />
                    <ActionButton onClick={() => onCreateItem(node.path, 'directory')} title={t('createDirectory')} icon="addFolder" />
                    {node.path !== '' && <ActionButton onClick={() => onRenameItem(node.path, 'directory')} title={t('renameItem')} icon="rename" />}
                    {node.path !== '' && <ActionButton onClick={() => onDeleteItem(node.path, 'directory')} title={t('deleteItem')} icon="delete" />}
                </>
            ) : (
                 <>
                    <ActionButton onClick={() => onRenameItem(node.path, 'file')} title={t('renameItem')} icon="rename" />
                    <ActionButton onClick={() => onDeleteItem(node.path, 'file')} title={t('deleteItem')} icon="delete" />
                </>
            )}
        </div>
      </div>
      {isOpen && isDirectory && node.children && (
        <div>
          {node.children
            .sort((a, b) => { // Sort directories first, then alphabetically
                if (a.type === 'directory' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'directory') return 1;
                return a.name.localeCompare(b.name);
            })
            .map((child) => (
                <FileNodeView 
                    key={child.path} 
                    node={child} 
                    onFileClick={onFileClick} 
                    level={level + 1} 
                    onAnalyzeDirectory={onAnalyzeDirectory} 
                    analyzingPath={analyzingPath}
                    onCreateItem={onCreateItem}
                    onRenameItem={onRenameItem}
                    onDeleteItem={onDeleteItem}
                />
           ))}
        </div>
      )}
    </div>
  );
};

export default FileNodeView;
