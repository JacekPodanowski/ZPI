import React from 'react';

const BlockText = ({ content, vibe, theme }) => {
  return (
    <div 
      className={`${vibe.spacing} ${vibe.rounded}`}
      style={{ backgroundColor: theme.background }}
    >
      <div
        className={`max-w-4xl mx-auto ${vibe.textSize}`}
        style={{ 
          textAlign: content.align || 'left',
          color: content.textColor || theme.text,
          fontSize: content.fontSize || '16px'
        }}
        dangerouslySetInnerHTML={{ __html: content.content || '' }}
      />
    </div>
  );
};

export default BlockText;
