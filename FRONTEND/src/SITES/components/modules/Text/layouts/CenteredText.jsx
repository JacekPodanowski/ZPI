import React from 'react';

const CenteredText = ({ content, style }) => {
  return (
    <div 
      className={`${style.spacing} ${style.rounded} text-center`}
      style={{ backgroundColor: style.background }}
    >
      <div
        className={`max-w-4xl mx-auto ${style.textSize}`}
        style={{ 
          color: content.textColor || style.text,
          fontSize: content.fontSize || '18px'
        }}
        dangerouslySetInnerHTML={{ __html: content.content || '' }}
      />
    </div>
  );
};

export default CenteredText;
