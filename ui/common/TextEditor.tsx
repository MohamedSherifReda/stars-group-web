import { forwardRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const TextEditor = forwardRef((props: { initialValue?: string }, ref) => {
  const editorRef = ref as React.RefObject<Editor>;
  
   return (
     <>
       <Editor
         apiKey={import.meta.env.VITE_TINY_API_KEY}
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
