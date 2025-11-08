import React from 'react';
import { motion } from 'framer-motion';

const FullWidthButton = ({ content, vibe, theme }) => {
  return (
    <div className={`${vibe.spacing} px-4`}>
      <motion.a
        href={content.link}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`block px-8 py-4 ${vibe.rounded} font-medium ${vibe.shadows} ${vibe.animations} text-center`}
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

export default FullWidthButton;
