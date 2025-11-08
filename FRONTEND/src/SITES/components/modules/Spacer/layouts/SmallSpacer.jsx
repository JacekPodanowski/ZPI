import React from 'react';

const SmallSpacer = ({ content }) => {
  return <div style={{ height: content.height || '2rem' }} />;
};

export default SmallSpacer;
