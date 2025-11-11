import React from 'react';
import { motion } from 'framer-motion';

const BlockButton = ({ content, style }) => {
  return (
    <div 
      className={`${style.spacing} py-6 px-4 md:py-8 md:px-6`}
      style={{ textAlign: content.align || 'center' }}
    >
      <motion.a
        href={content.link}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-block px-6 py-3 md:px-8 md:py-3 ${style.rounded} font-medium ${style.shadows} ${style.animations}`}
        style={{
          backgroundColor: content.bgColor || style.primary,
          color: content.textColor || style.background
        }}
      >
        {content.text}
      </motion.a>
    </div>
  );
};

export default BlockButton;
