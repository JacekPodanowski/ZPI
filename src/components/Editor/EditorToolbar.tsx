import React from 'react';

const EditorToolbar: React.FC = () => {
    return (
        <div className="editor-toolbar">
            <button className="toolbar-button">Undo</button>
            <button className="toolbar-button">Redo</button>
            <button className="toolbar-button">Save</button>
            <button className="toolbar-button">Preview</button>
            <button className="toolbar-button">Export</button>
        </div>
    );
};

export default EditorToolbar;