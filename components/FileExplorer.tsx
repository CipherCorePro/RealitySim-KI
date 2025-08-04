
import React from 'react';
import { FileNode } from '../types';
import FileNodeView from './FileNodeView';
import Icon from './Icon';
import { useTranslation } from '../hooks/useTranslation';

interface FileExplorerProps {
  fileTree: FileNode | null;
  onFileClick: (path: string) => void;
  onAnalyzeDirectory: (path: string) => void;
  analyzingPath: string | null;
  onCreateItem: (path: string, type: 'file' | 'directory') => void;
  onRenameItem: (path: string, type: 'file' | 'directory') => void;
  onDeleteItem: (path: string, type: 'file' | 'directory') => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
    fileTree, 
    onFileClick, 
    onAnalyzeDirectory, 
    analyzingPath,
    onCreateItem,
    onRenameItem,
    onDeleteItem
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-slate-800/50 rounded-lg overflow-y-auto h-full p-2 flex flex-col">
      <div className="p-2 border-b border-slate-700 mb-2 flex-shrink-0 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-100">{t('projectExplorer')}</h2>
        {fileTree && (
             <button onClick={() => onCreateItem('', 'file')} title={t('createFile')} className="p-1.5 rounded-full hover:bg-slate-600">
                <Icon type="addFile" className="w-4 h-4" />
            </button>
        )}
      </div>
      <div className="pr-1 overflow-y-auto flex-grow">
        {fileTree ? (
          <FileNodeView 
            node={fileTree} 
            onFileClick={onFileClick} 
            onAnalyzeDirectory={onAnalyzeDirectory} 
            analyzingPath={analyzingPath}
            onCreateItem={onCreateItem}
            onRenameItem={onRenameItem}
            onDeleteItem={onDeleteItem}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-4">
            <Icon type="zip" className="w-16 h-16 mb-4" />
            <p className="font-semibold">{t('noProjectLoaded')}</p>
            <p className="text-sm">{t('uploadZipToStart')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
