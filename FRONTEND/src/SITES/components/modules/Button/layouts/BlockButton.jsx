import React from 'react';
import { motion } from 'framer-motion';

const BlockButton = ({ content, vibe, theme }) => {
  return (
    <div 
      className={`${vibe.spacing} py-6 px-4 md:py-8 md:px-6`}
      style={{ textAlign: content.align || 'center' }}
    >
      <motion.a
        href={content.link}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-block px-6 py-3 md:px-8 md:py-3 ${vibe.rounded} font-medium ${vibe.shadows} ${vibe.animations}`}
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
