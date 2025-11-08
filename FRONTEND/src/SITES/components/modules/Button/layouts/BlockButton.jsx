import React from 'react';
import { motion } from 'framer-motion';

const BlockButton = ({ content, vibe, theme }) => {
  return (
    <div 
      className={`${vibe.spacing} px-4`}
      style={{ textAlign: content.align || 'center' }}
    >
      <motion.a
        href={content.link}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-block px-8 py-3 ${vibe.rounded} font-medium ${vibe.shadows} ${vibe.animations}`}
        style={{
          backgroundColor: content.bgColor || theme.primary,
          color: content.textColor || theme.background
        }}
      >
        {content.text}
      </motion.a>
    </div>
  );
};

export default BlockButton;
