import React from 'react';

const InlineText = ({ content, style }) => {
  return (
    <div 
      className="inline-block px-4"
      style={{ 
        textAlign: content.align || 'left',
        color: content.textColor || style.text,
        fontSize: content.fontSize || '14px'
      }}
    >
      <div
        className="inline-block"
        dangerouslySetInnerHTML={{ __html: content.content || '' }}
      />
    </div>
  );
};

export default InlineText;
