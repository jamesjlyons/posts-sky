import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Placeholder from "@tiptap/extension-placeholder";
import History from "@tiptap/extension-history";
import { RichText as RichTextAPI } from "@atproto/api";
import { generateJSON } from "@tiptap/html";

interface TextInputProps {
  richtext: RichTextAPI;
  placeholder?: string;
  isActive?: boolean;
  disabled?: boolean;
  setRichText: (rt: RichTextAPI) => void;
  onPressPublish?: (rt: RichTextAPI) => void;
  onPhotoPasted?: (uri: string) => void;
  className?: string;
}

export function TextInput({
  richtext,
  placeholder = "What's on your mind...",
  isActive = true,
  disabled = false,
  setRichText,
  className = "",
}: TextInputProps) {
  const extensions = [
    Document,
    Paragraph,
    Text,
    Placeholder.configure({
      placeholder,
    }),
    History,
  ];

  const editor = useEditor({
    extensions,
    content: generateJSON(richtext.text, extensions),
    editable: isActive && !disabled,
    autofocus: "end",
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const newRt = new RichTextAPI({ text });
      // Detect mentions, links etc without making network requests
      newRt.detectFacetsWithoutResolution();
      setRichText(newRt);
    },
    editorProps: {},
  });

  return (
    <div className={`min-h-[100px] ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
}
