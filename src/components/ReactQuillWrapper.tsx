'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';

const ReactQuillWrapper = forwardRef((props: any, ref) => {
  const localRef = useRef<any>(null);

  const syncEditor = (instance: any) => {
    if (!instance) return;
    localRef.current = instance;

    if (typeof ref === 'function') {
      ref(instance);
    } else if (ref && typeof ref === 'object') {
      (ref as any).current = instance;
    }

    if (props.forwardedRef) {
      if (typeof props.forwardedRef === 'function') {
        props.forwardedRef(instance);
      } else if (typeof props.forwardedRef === 'object') {
        props.forwardedRef.current = instance;
      }
    }

    if (props.onEditorReady) {
      const quill = instance.getEditor ? instance.getEditor() : instance;
      props.onEditorReady(quill);
    }
  };

  useEffect(() => {
    if (localRef.current) {
      syncEditor(localRef.current);
    }
  }, []);

  return (
    <ReactQuill
      {...props}
      ref={(el: any) => {
        if (el) {
          syncEditor(el);
        }
      }}
    />
  );
});

ReactQuillWrapper.displayName = 'ReactQuillWrapper';

export default ReactQuillWrapper;