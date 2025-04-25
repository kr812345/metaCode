'use client'
import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { dracula } from '@uiw/codemirror-theme-dracula';

const CodeEditor = ({ code, onCodeChange, language = 'javascript', height = '100%', readOnly = false }) => {
    const languageExtensions = {
        javascript: javascript({ jsx: true }),
        python: python(),
        java: java(),
        cpp: cpp()
    };

    return (
        <CodeMirror
            value={code}
            height={height}
            theme={dracula}
            extensions={[languageExtensions[language] || languageExtensions.javascript]}
            onChange={onCodeChange}
            readOnly={readOnly}
            basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: true,
                historyKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true
            }}
        />
    );
};

export default CodeEditor;
