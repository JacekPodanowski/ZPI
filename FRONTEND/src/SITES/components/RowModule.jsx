import React from 'react'

const RowModule = ({ config, children }) => {
  const { gap = '1rem', align = 'center', justify = 'center' } = config

  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch'
  }

  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around'
  }

  return (
    <div 
      className="py-8 px-4"
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: gap,
        alignItems: alignMap[align],
        justifyContent: justifyMap[justify]
      }}
    >
      {children}
    </div>
  )
}

export default RowModule
