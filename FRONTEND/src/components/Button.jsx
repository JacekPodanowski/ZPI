import { motion } from 'framer-motion'

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, style = {} }) => {
  const baseStyles = 'px-6 py-3 rounded-xl font-medium transition-all duration-300'
  
  const variants = {
    primary: 'shadow-md hover:shadow-lg',
    secondary: 'border border-current hover:shadow-md',
    ghost: 'hover:opacity-70',
  }

  const defaultStyles = {
    primary: {
      backgroundColor: 'rgb(146, 0, 32)',
      color: 'rgb(228, 229, 218)',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'rgb(30, 30, 30)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'rgb(30, 30, 30)',
    },
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{ ...defaultStyles[variant], ...style }}
    >
      {children}
    </motion.button>
  )
}

export default Button
