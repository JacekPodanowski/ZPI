import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/Button'

const WelcomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: 'rgb(228, 229, 218)' }}>
      {/* Zaloguj się - prawy górny róg */}
      <div className="absolute top-8 right-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/studio')}
          className="text-lg"
          style={{ color: 'rgb(30, 30, 30)' }}
        >
          Zaloguj się
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        {/* Logo - czarne na beżowym tle */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div 
            className="w-40 h-40 mx-auto rounded-xl flex items-center justify-center mb-8 shadow-lg"
            style={{ backgroundColor: 'rgb(30, 30, 30)' }}
          >
            <span 
              className="text-8xl font-bold"
              style={{ color: 'rgb(228, 229, 218)' }}
            >
              W
            </span>
          </div>
        </motion.div>

        {/* Przycisk główny */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Button 
            onClick={() => navigate('/templates')}
            className="text-xl px-12 py-4"
            style={{ 
              backgroundColor: 'rgb(146, 0, 32)',
              color: 'rgb(228, 229, 218)'
            }}
          >
            Stwórz swoją stronę
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default WelcomePage
