import React, { useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Image as ImageIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Undo, 
  Redo,
  Type,
  Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../contexts/ToastContext';
import { useRegion } from '../../contexts/RegionContext';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder }) => {
  const { addToast } = useToast();
  const { region } = useRegion();
  const [isUploading, setIsUploading] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg shadow-sm max-w-full h-auto my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Escreva o conteúdo aqui. Use a barra acima para formatar.',
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:h-0 before:pointer-events-none',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-4 text-gray-700',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Image Upload Handler
  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        
        if (file.size > 5 * 1024 * 1024) {
            addToast('error', 'A imagem deve ter no máximo 5MB.');
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${region}_content_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('news-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('news-images')
                .getPublicUrl(fileName);

            editor?.chain().focus().setImage({ src: publicUrl }).run();
            
        } catch (error) {
            console.error(error);
            addToast('error', 'Erro ao fazer upload da imagem.');
        } finally {
            setIsUploading(false);
        }
      }
    };
    
    input.click();
  }, [editor, region, addToast]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children, 
    title 
  }: { 
    onClick: () => void, 
    isActive?: boolean, 
    disabled?: boolean, 
    children: React.ReactNode, 
    title?: string 
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        "p-2 rounded-md transition-colors flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9",
        isActive 
          ? "bg-gray-200 text-gray-900 font-bold" 
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col">
      {/* Toolbar - Matches the design in the image */}
      <div className="bg-[#f9fafb] border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 sticky top-0 z-10">
        
        {/* Text Style Group */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 mr-1">
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBold().run()} 
                isActive={editor.isActive('bold')}
                title="Negrito (Ctrl+B)"
            >
                <Bold size={18} strokeWidth={2.5} />
            </ToolbarButton>
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleItalic().run()} 
                isActive={editor.isActive('italic')}
                title="Itálico (Ctrl+I)"
            >
                <Italic size={18} />
            </ToolbarButton>
        </div>

        {/* Heading Group */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 mr-1">
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
                isActive={editor.isActive('heading', { level: 2 })}
                title="Título Principal"
            >
                <Heading1 size={18} />
            </ToolbarButton>
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
                isActive={editor.isActive('heading', { level: 3 })}
                title="Subtítulo"
            >
                <Heading2 size={18} />
            </ToolbarButton>
            <ToolbarButton 
                onClick={() => editor.chain().focus().setParagraph().run()} 
                isActive={editor.isActive('paragraph')}
                title="Parágrafo Normal"
            >
                <Type size={18} />
            </ToolbarButton>
        </div>

        {/* Formatting Group */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 mr-1">
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBlockquote().run()} 
                isActive={editor.isActive('blockquote')}
                title="Citação"
            >
                <Quote size={18} />
            </ToolbarButton>
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBulletList().run()} 
                isActive={editor.isActive('bulletList')}
                title="Lista com Marcadores"
            >
                <List size={18} />
            </ToolbarButton>
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                isActive={editor.isActive('orderedList')}
                title="Lista Numerada"
            >
                <ListOrdered size={18} />
            </ToolbarButton>
        </div>

        {/* Alignment Group */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 mr-1">
            <ToolbarButton 
                onClick={() => editor.chain().focus().setTextAlign('left').run()} 
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Alinhar à Esquerda"
            >
                <AlignLeft size={18} />
            </ToolbarButton>
            <ToolbarButton 
                onClick={() => editor.chain().focus().setTextAlign('center').run()} 
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Centralizar"
            >
                <AlignCenter size={18} />
            </ToolbarButton>
            <ToolbarButton 
                onClick={() => editor.chain().focus().setTextAlign('right').run()} 
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Alinhar à Direita"
            >
                <AlignRight size={18} />
            </ToolbarButton>
        </div>

        {/* Media Group */}
        <div className="flex items-center gap-0.5">
            <ToolbarButton 
                onClick={addImage} 
                isActive={false}
                disabled={isUploading}
                title="Inserir Imagem"
            >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
            </ToolbarButton>
        </div>

        {/* History Group (Right Aligned) */}
        <div className="flex items-center gap-0.5 ml-auto">
            <ToolbarButton 
                onClick={() => editor.chain().focus().undo().run()} 
                disabled={!editor.can().undo()}
                title="Desfazer"
            >
                <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton 
                onClick={() => editor.chain().focus().redo().run()} 
                disabled={!editor.can().redo()}
                title="Refazer"
            >
                <Redo size={16} />
            </ToolbarButton>
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
      
      {/* Footer Status */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-[10px] text-gray-400 flex justify-end">
        {editor.storage.characterCount?.characters()} caracteres
      </div>
    </div>
  );
};

export default RichTextEditor;
