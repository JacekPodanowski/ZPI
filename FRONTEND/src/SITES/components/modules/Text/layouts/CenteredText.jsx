import React from 'react';

const CenteredText = ({ content, vibe, theme }) => {
  return (
    <div 
      className={`${vibe.spacing} ${vibe.rounded} text-center`}
      style={{ backgroundColor: theme.background }}
    >
      <div
        className={`max-w-4xl mx-auto ${vibe.textSize}`}
        style={{ 
          color: content.textColor || theme.text,
          fontSize: content.fontSize || '18px'
        }}
        dangerouslySetInnerHTML={{ __html: content.content || '' }}
      />
    </div>
  );
};

export default CenteredText;
