
import React from 'react';
import Icon, { IconProps } from './Icon';
import { useTranslation } from '../hooks/useTranslation';

interface CodeEditorProps {
  filePath: string;
  content: string | null;
  onContentChange: (newContent: string) => void;
  onClose: () => void;
}

const getFileIconType = (fileName: string): IconProps['type'] => {
    if (!fileName) return 'file';
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'css': case 'scss': case 'less': return 'css';
      case 'html': return 'html';
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': return 'image';
      case 'zip': return 'zip';
      case 'pdf': return 'pdf';
      case 'doc': case 'docx': return 'docx';
      case 'xls': case 'xlsx': return 'xlsx';
      default: return 'file';
    }
};

const isBinaryFile = (content: string | null): boolean => {
    return content?.startsWith('[BINARY_FILE:') ?? false;
};

const CodeEditor: React.FC<CodeEditorProps> = ({ filePath, content, onContentChange, onClose }) => {
  const { t } = useTranslation();
  const isBinary = isBinaryFile(content);

  return (
    <div className="bg-slate-800/50 rounded-lg h-full flex flex-col">
      <div className="p-2 border-b border-slate-700 flex justify-between items-center flex-shrink-0 bg-slate-800/20">
        <div className="flex items-center space-x-2 p-1">
            <Icon type={getFileIconType(filePath)} className="w-5 h-5 flex-shrink-0" />
            <h2 className="text-sm font-mono text-slate-300">{filePath}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-700 transition-colors"
          title={t('close')}
        >
          <Icon type="close" className="w-5 h-5" />
        </button>
      </div>
      <textarea
        value={content ?? ''}
        onChange={(e) => onContentChange(e.target.value)}
        className="w-full h-full p-4 bg-transparent border-0 focus:ring-0 resize-none font-mono text-sm text-slate-300 placeholder:text-slate-500"
        placeholder={isBinary ? 'Binary file content cannot be displayed or edited.' : t('emptyFile')}
        aria-label={`Code for ${filePath}`}
        spellCheck="false"
        disabled={isBinary}
      />
    </div>
  );
};

export default CodeEditor;
