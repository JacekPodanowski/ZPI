import React from 'react'

const TextModule = ({ config }) => {
  const { content, fontSize, textColor, align, layout = 'block' } = config

  return (
    <div 
      className={`py-8 px-4 ${layout === 'inline' ? 'inline-block' : ''}`}
      style={{ 
        textAlign: align,
        color: textColor,
        fontSize: fontSize
      }}
    >
      <div
        className={layout === 'inline' ? 'inline-block' : 'max-w-4xl mx-auto'}
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
    </div>
  )
}

export default TextModule
