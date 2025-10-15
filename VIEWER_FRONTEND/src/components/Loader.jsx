import React from 'react'
import { motion } from 'framer-motion'

const Loader = ({ text = 'Ładowanie...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
      />
      <p className="mt-4 text-text text-lg">{text}</p>
    </div>
  )
}

export default Loader
