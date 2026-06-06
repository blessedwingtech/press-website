'use client';

import React, { forwardRef } from 'react';
import ReactQuill from 'react-quill';
// L'import CSS est déjà dans globals.css, mais on peut le garder ici au cas où
// import 'react-quill/dist/quill.snow.css';

const ReactQuillWrapper = forwardRef((props: any, ref) => {
  return <ReactQuill {...props} ref={ref} />;
});

ReactQuillWrapper.displayName = 'ReactQuillWrapper';

export default ReactQuillWrapper;