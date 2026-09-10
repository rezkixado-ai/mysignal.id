'use client';

import { forwardRef, useEffect, useRef, useCallback, useImperativeHandle } from 'react';
import { uploadMedia } from '../lib/api.js';
import '../styles/editorjs-theme.css';

// Editor.js and its plugins touch `window`/DOM directly, so they're loaded
// lazily on the client only — never at module top-level (would break SSR).
let editorJsModules;
function loadEditorJs() {
  if (!editorJsModules) {
    editorJsModules = Promise.all([
      import('@editorjs/editorjs'),
      import('@editorjs/header'),
      import('@editorjs/paragraph'),
      import('@editorjs/list'),
      import('@editorjs/quote'),
      import('@editorjs/table'),
      import('@editorjs/image'),
      import('./blocks/ImageGridTool.js'),
      import('./blocks/FaqTool.js'),
      import('./blocks/ProcessStepsTool.js'),
      import('./blocks/LogoMarqueeTool.js'),
      import('./blocks/ContactCardTool.js')
    ]).then(([
      { default: EditorJS },
      { default: Header },
      { default: Paragraph },
      { default: ListTool },
      { default: Quote },
      { default: Table },
      { default: ImageTool },
      { default: ImageGridTool },
      { default: FaqTool },
      { default: ProcessStepsTool },
      { default: LogoMarqueeTool },
      { default: ContactCardTool }
    ]) => ({ EditorJS, Header, Paragraph, ListTool, Quote, Table, ImageTool, ImageGridTool, FaqTool, ProcessStepsTool, LogoMarqueeTool, ContactCardTool }));
  }
  return editorJsModules;
}

// `value` should be an Editor.js OutputData shape: { blocks: [...] }.
// IMPORTANT: Editor.js is uncontrolled once mounted (like a textarea ref, not
// a controlled input) — it only reads `value` on first mount. When switching
// which article is being edited, render this with a fresh `key` (e.g.
// key={form.id || 'new'}) so React remounts it with the new article's blocks.
//
// Editor.js's own onChange is debounced (~400ms), so React state
// (form.content_blocks) can lag a moment behind what's actually in the
// editor. A forwardRef exposing getBlocks() lets the parent's save/submit
// handler pull the guaranteed-current state directly from Editor.js right
// before sending it to the server, instead of trusting whatever the last
// onChange happened to capture.
const BlockEditor = forwardRef(function BlockEditor({ value, onChange }, ref) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const saveNow = useCallback(async () => {
    if (!editorRef.current) return;
    try {
      const output = await editorRef.current.save();
      onChangeRef.current(output);
    } catch {
      // Editor.js throws transiently mid-keystroke on some tools; ignore.
    }
  }, []);

  useImperativeHandle(ref, () => ({
    async getBlocks() {
      if (!editorRef.current) return value;
      return editorRef.current.save();
    }
  }), [value]);

  useEffect(() => {
    let cancelled = false;

    loadEditorJs().then((mods) => {
      if (cancelled || !holderRef.current) return;
      const { EditorJS, Header, Paragraph, ListTool, Quote, Table, ImageTool, ImageGridTool, FaqTool, ProcessStepsTool, LogoMarqueeTool, ContactCardTool } = mods;

      editorRef.current = new EditorJS({
        holder: holderRef.current,
        data: value && Array.isArray(value.blocks) ? value : { blocks: [] },
        placeholder: 'Mulai nulis artikel di sini…',
        tools: {
          header: { class: Header, inlineToolbar: true, config: { levels: [2, 3, 4], defaultLevel: 2 } },
          paragraph: { class: Paragraph, inlineToolbar: true },
          list: { class: ListTool, inlineToolbar: true },
          quote: { class: Quote, inlineToolbar: true },
          table: { class: Table, inlineToolbar: true },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file) {
                  const result = await uploadMedia(file);
                  return { success: 1, file: { url: result.url } };
                }
              }
            }
          },
          imageGrid: { class: ImageGridTool, config: { uploadMedia } },
          faq: { class: FaqTool },
          processSteps: { class: ProcessStepsTool },
          logoMarquee: { class: LogoMarqueeTool, config: { uploadMedia } },
          contactCard: { class: ContactCardTool }
        },
        onChange: saveNow
      });
    });

    return () => {
      cancelled = true;
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally mount-once, see comment above
  }, []);

  return (
    <div
      ref={holderRef}
      className="block-editor"
      style={{
        minHeight: 260, background: 'var(--bg-soft)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '14px 16px', fontSize: 14.5, lineHeight: 1.6, color: 'var(--text)'
      }}
    />
  );
});

export default BlockEditor;
