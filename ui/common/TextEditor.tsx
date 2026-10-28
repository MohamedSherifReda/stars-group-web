import { forwardRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import toast from 'react-hot-toast';

export const MAX_EDITOR_CONTENT_BYTES = 200 * 1024; // 200 KB of HTML

/**
 * Reads the editor HTML and enforces the size bound. Shows a visible error and returns
 * null when the content is too large.
 */
export function getBoundedEditorContent(editor: unknown): string | null {
  const html = ((editor as any)?.getContent?.() as string | undefined) ?? '';
  const bytes = new TextEncoder().encode(html).length;
  if (bytes > MAX_EDITOR_CONTENT_BYTES) {
    toast.error(
      `Content is too large (${Math.ceil(bytes / 1024)} KB). The limit is ${MAX_EDITOR_CONTENT_BYTES / 1024} KB; remove images or text and try again.`
    );
    return null;
  }
  return html;
}

const TextEditor = forwardRef((props: { initialValue?: string }, ref) => {
  const editorRef = ref as React.RefObject<Editor>;
  
   return (
     <>
       <Editor
         // TinyMCE Cloud keys are public by design (they are sent to the browser by every
         // integration). Protect the key by restricting its approved domains in the Tiny
         // account dashboard. The release channel is pinned so a new major cannot ship
         // unreviewed code into the CMS.
         apiKey={import.meta.env.VITE_TINY_API_KEY}
         cloudChannel="7"
         onInit={(_evt, editor) => (editorRef.current = editor)}
         initialValue={props.initialValue || '<p>This is the initial content of the editor.</p>'}
         init={{
           height: 500,
           menubar: false,
           plugins: [
             'advlist',
             'autolink',
             'lists',
             'link',
             'image',
             'charmap',
             'preview',
             'anchor',
             'searchreplace',
             'visualblocks',
             'code',
             'fullscreen',
             'insertdatetime',
             'media',
             'table',
             'code',
             'help',
             'wordcount',
           ],
           toolbar:
             'undo redo | blocks | ' +
             'bold italic forecolor | alignleft aligncenter ' +
             'alignright alignjustify | bullist numlist outdent indent | ' +
             'removeformat | help',
           content_style:
             'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
         }}
       />
     </>
   );
 }); 

 export default TextEditor;
