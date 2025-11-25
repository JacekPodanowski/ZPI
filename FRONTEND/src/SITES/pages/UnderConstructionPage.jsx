import React from 'react';
import { motion } from 'framer-motion';

/**
 * UnderConstructionPage - Elegant page shown when site is not yet published
 * 
 * This page is displayed for sites where is_published=False.
 * Features smooth animations and a professional, calming design
 * following the "Ethereal Minimalism" theme.
 */
const UnderConstructionPage = ({ siteName = "Ta strona" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)' }}>
      
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              background: `rgba(${146 + Math.random() * 50}, ${Math.random() * 30}, ${32 + Math.random() * 20}, ${Math.random() * 0.3 + 0.1})`,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        
        {/* Animated logo/icon */}
        <motion.div
          className="mb-8 inline-block"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring',
            stiffness: 260,
            damping: 20,
            duration: 0.8
          }}
        >
          <div className="relative w-24 h-24 mx-auto">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ 
                background: 'linear-gradient(135deg, rgb(146, 0, 32) 0%, rgb(114, 0, 21) 100%)',
              }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(146, 0, 32, 0.3)',
                  '0 0 40px rgba(146, 0, 32, 0.5)',
                  '0 0 20px rgba(146, 0, 32, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="rgb(146, 0, 32)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="rgb(146, 0, 32)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="rgb(146, 0, 32)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4"
          style={{ 
            background: 'linear-gradient(135deg, rgb(220, 220, 220) 0%, rgb(146, 0, 32) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Wkrótce dostępne
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl text-gray-400 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {siteName} jest w trakcie przygotowań
        </motion.p>

        {/* Loading animation */}
        <motion.div
          className="flex justify-center space-x-2 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'rgb(146, 0, 32)' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>

        {/* Description */}
        <motion.div
          className="text-gray-500 max-w-md mx-auto space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p className="text-sm md:text-base">
            Pracujemy nad tym, aby zapewnić Ci najlepsze doświadczenie.
          </p>
          <p className="text-sm md:text-base">
            Strona zostanie opublikowana wkrótce.
          </p>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          className="mt-12 h-px w-64 mx-auto"
          style={{ background: 'linear-gradient(90deg, transparent, rgb(146, 0, 32), transparent)' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 1 }}
        />

        {/* Pulse animation at bottom */}
        <motion.div
          className="mt-8"
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg
            className="w-8 h-8 mx-auto"
            fill="none"
            stroke="rgb(146, 0, 32)"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </div>

      {/* Gradient overlay at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: 'linear-gradient(to top, rgba(12, 12, 12, 0.8), transparent)' }}
      />
    </div>
  );
};

export default UnderConstructionPage;
