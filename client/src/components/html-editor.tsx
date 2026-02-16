import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3,
  Link, Image, Code, Quote, Minus, AlignLeft, AlignCenter, AlignRight,
  Eye, Code2
} from "lucide-react";

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  "data-testid"?: string;
}

export function HtmlEditor({ value, onChange, "data-testid": testId }: HtmlEditorProps) {
  const [mode, setMode] = useState<"visual" | "source">("visual");
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onChange]);

  const insertHtml = useCallback((html: string) => {
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onChange]);

  const handleLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const handleImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      insertHtml(`<img src="${url}" alt="" style="max-width:100%;height:auto;" />`);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: "bold", title: "Bold" },
    { icon: Italic, command: "italic", title: "Italic" },
    { icon: Underline, command: "underline", title: "Underline" },
    { type: "separator" as const },
    { icon: Heading1, command: "formatBlock", value: "h1", title: "Heading 1" },
    { icon: Heading2, command: "formatBlock", value: "h2", title: "Heading 2" },
    { icon: Heading3, command: "formatBlock", value: "h3", title: "Heading 3" },
    { type: "separator" as const },
    { icon: List, command: "insertUnorderedList", title: "Bullet List" },
    { icon: ListOrdered, command: "insertOrderedList", title: "Numbered List" },
    { icon: Quote, command: "formatBlock", value: "blockquote", title: "Blockquote" },
    { icon: Code, command: "formatBlock", value: "pre", title: "Code Block" },
    { icon: Minus, command: "insertHorizontalRule", title: "Horizontal Rule" },
    { type: "separator" as const },
    { icon: AlignLeft, command: "justifyLeft", title: "Align Left" },
    { icon: AlignCenter, command: "justifyCenter", title: "Align Center" },
    { icon: AlignRight, command: "justifyRight", title: "Align Right" },
    { type: "separator" as const },
    { icon: Link, command: "link", title: "Insert Link", action: handleLink },
    { icon: Image, command: "image", title: "Insert Image", action: handleImage },
  ];

  return (
    <div className="border rounded-md overflow-hidden" data-testid={testId}>
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 bg-muted/50 border-b">
        {toolbarButtons.map((btn, i) => {
          if ("type" in btn && btn.type === "separator") {
            return <div key={i} className="w-px h-5 bg-border mx-1" />;
          }
          const b = btn as { icon: typeof Bold; command: string; value?: string; title: string; action?: () => void };
          const Icon = b.icon;
          return (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title={b.title}
              onClick={() => {
                if (b.action) {
                  b.action();
                } else if (b.value) {
                  execCommand(b.command, b.value);
                } else {
                  execCommand(b.command);
                }
              }}
              data-testid={`button-editor-${b.command}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          );
        })}
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            type="button"
            variant={mode === "visual" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              if (mode === "source" && editorRef.current) {
                editorRef.current.innerHTML = value;
              }
              setMode("visual");
            }}
            data-testid="button-editor-visual-mode"
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> Visual
          </Button>
          <Button
            type="button"
            variant={mode === "source" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setMode("source")}
            data-testid="button-editor-source-mode"
          >
            <Code2 className="h-3.5 w-3.5 mr-1" /> HTML
          </Button>
        </div>
      </div>

      {mode === "visual" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[240px] p-4 text-sm focus:outline-none prose prose-sm dark:prose-invert max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded [&_pre]:font-mono [&_pre]:text-xs [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img]:rounded"
          dangerouslySetInnerHTML={{ __html: value }}
          onInput={() => {
            if (editorRef.current) {
              onChange(editorRef.current.innerHTML);
            }
          }}
          data-testid="editor-visual-area"
        />
      ) : (
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className="min-h-[240px] rounded-none border-0 font-mono text-xs resize-y focus-visible:ring-0"
          data-testid="editor-source-area"
        />
      )}
    </div>
  );
}
