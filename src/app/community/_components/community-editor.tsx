"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import type { Editor } from "@tiptap/core";
import type { CommunityDocument } from "@/lib/community/document";
import styles from "@/styles/components/board-modal.module.scss";

type BlockAction = "paragraph" | "heading" | "bullet" | "quote";

type CommunityEditorProps = {
  onChange: (document: CommunityDocument, characterCount: number) => void;
  onSubmit: () => void;
};

const CHARACTER_LIMIT = 3000;

const BLOCK_ACTIONS: Array<{ type: BlockAction; label: string; hint: string }> = [
  { type: "paragraph", label: "본문", hint: "일반 문단" },
  { type: "heading", label: "소제목", hint: "내용을 나누는 제목" },
  { type: "bullet", label: "글머리", hint: "항목 정리" },
  { type: "quote", label: "인용", hint: "강조하고 싶은 문장" },
];

export default function CommunityEditor({ onChange, onSubmit }: CommunityEditorProps) {
  const [slashMenuPosition, setSlashMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const submitRef = useRef(onSubmit);
  const editorContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    submitRef.current = onSubmit;
  }, [onSubmit]);

  const updateSlashMenu = useCallback((editor: Editor) => {
    const { $from } = editor.state.selection;
    const isSlashOnly = $from.parent.isTextblock && $from.parent.textContent === "/";

    if (!isSlashOnly || !editorContainerRef.current) {
      setSlashMenuPosition(null);
      return;
    }

    const cursor = editor.view.coordsAtPos(editor.state.selection.from);
    const container = editorContainerRef.current.getBoundingClientRect();
    setSlashMenuPosition({
      top: cursor.bottom - container.top + 8,
      left: Math.max(
        0,
        Math.min(cursor.left - container.left, container.width - 280),
      ),
    });
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: "내용을 입력하거나 '/'로 블록을 선택하세요",
      }),
      CharacterCount.configure({ limit: CHARACTER_LIMIT }),
    ],
    editorProps: {
      attributes: {
        class: styles.tiptap,
        "aria-label": "게시글 내용",
      },
      handleKeyDown: (_view, event) => {
        if (event.key !== "Enter" || (!event.metaKey && !event.ctrlKey)) {
          return false;
        }

        event.preventDefault();
        submitRef.current();
        return true;
      },
    },
    onCreate: ({ editor: nextEditor }) => {
      onChange(
        nextEditor.getJSON() as CommunityDocument,
        nextEditor.storage.characterCount.characters(),
      );
    },
    onUpdate: ({ editor: nextEditor }) => {
      onChange(
        nextEditor.getJSON() as CommunityDocument,
        nextEditor.storage.characterCount.characters(),
      );
      updateSlashMenu(nextEditor);
    },
    onSelectionUpdate: ({ editor: nextEditor }) => updateSlashMenu(nextEditor),
  });

  const applyBlockAction = (action: BlockAction) => {
    if (!editor) return;

    const { $from } = editor.state.selection;
    editor.chain().focus().deleteRange({
      from: $from.start(),
      to: $from.end(),
    }).run();

    if (action === "heading") {
      editor.chain().focus().setHeading({ level: 2 }).run();
    }
    if (action === "bullet") {
      editor.chain().focus().toggleBulletList().run();
    }
    if (action === "quote") {
      editor.chain().focus().toggleBlockquote().run();
    }
    if (action === "paragraph") {
      editor.chain().focus().setParagraph().run();
    }

    setSlashMenuPosition(null);
  };

  if (!editor) return null;

  return (
    <section
      ref={editorContainerRef}
      className={styles.editor__content}
      aria-label="게시글 내용"
    >
      <EditorContent editor={editor} />
      {slashMenuPosition && (
        <div
          className={styles.command__menu}
          role="menu"
          aria-label="블록 선택"
          style={slashMenuPosition}
        >
          <p className={styles.command__title}>/ 블록 명령</p>
          {BLOCK_ACTIONS.map((action) => (
            <button
              key={action.type}
              type="button"
              role="menuitem"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyBlockAction(action.type)}
            >
              <strong>{action.label}</strong>
              <span>{action.hint}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
