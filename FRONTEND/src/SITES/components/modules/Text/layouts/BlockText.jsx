import React from 'react';

const BlockText = ({ content, style }) => {
  return (
    <div 
      className={`${style.spacing} ${style.rounded}`}
      style={{ backgroundColor: style.background }}
    >
      <div
        className={`max-w-4xl mx-auto ${style.textSize}`}
        style={{ 
          textAlign: content.align || 'left',
          color: content.textColor || style.text,
          fontSize: content.fontSize || '16px'
        }}
        dangerouslySetInnerHTML={{ __html: content.content || '' }}
      />
    </div>
  );
};

export default BlockText;
