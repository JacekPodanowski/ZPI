import { motion } from 'framer-motion';

const InlineButton = ({ content, style }) => {
  return (
    <div className={`${style.spacing} inline-block px-4`}>
      <motion.a
        href={content.link}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-block px-8 py-3 ${style.rounded} font-medium ${style.shadows} ${style.animations}`}
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

export default InlineButton;
