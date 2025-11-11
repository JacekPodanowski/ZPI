import React from 'react';
import { motion } from 'framer-motion';

const FullWidthButton = ({ content, style }) => {
  return (
    <div className={`${style.spacing} px-4`}>
      <motion.a
        href={content.link}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`block px-8 py-4 ${style.rounded} font-medium ${style.shadows} ${style.animations} text-center`}
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

export default FullWidthButton;
