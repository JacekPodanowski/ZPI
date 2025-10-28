import React, { useState } from 'react'
import { motion } from 'framer-motion'

const ContactForm = ({ config }) => {
  const { 
    title = 'Skontaktuj się ze mną',
    subtitle = 'Wyślij mi wiadomość, a odezwę się tak szybko jak to możliwe',
    bgColor = 'rgb(255, 255, 255)',
    textColor = 'rgb(30, 30, 30)',
    accentColor = 'rgb(146, 0, 32)'
  } = config

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    
    // TODO: Implement actual email sending logic
    setTimeout(() => {
      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => setStatus(''), 3000)
    }, 1000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section className="py-20 px-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4" style={{ color: textColor }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg opacity-70" style={{ color: textColor }}>
              {subtitle}
            </p>
          )}
        </motion.div>
        
        <motion.form
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-semibold mb-2"
              style={{ color: textColor }}
            >
              Imię i nazwisko
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 transition-all"
              style={{ 
                borderColor: 'rgba(0,0,0,0.1)',
                focusRing: accentColor 
              }}
              placeholder="Jan Kowalski"
            />
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-semibold mb-2"
              style={{ color: textColor }}
            >
              Adres email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 transition-all"
              style={{ 
                borderColor: 'rgba(0,0,0,0.1)'
              }}
              placeholder="jan@example.com"
            />
          </div>

          <div>
            <label 
              htmlFor="message" 
              className="block text-sm font-semibold mb-2"
              style={{ color: textColor }}
            >
              Wiadomość
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="6"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 transition-all resize-none"
              style={{ 
                borderColor: 'rgba(0,0,0,0.1)'
              }}
              placeholder="Twoja wiadomość..."
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: accentColor,
              opacity: status === 'sending' ? 0.7 : 1
            }}
          >
            {status === 'sending' ? 'Wysyłanie...' : status === 'success' ? '✓ Wysłano!' : 'Wyślij wiadomość'}
          </button>

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 rounded-lg"
              style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: 'rgb(76, 175, 80)' }}
            >
              Dziękuję za wiadomość! Odezwę się wkrótce.
            </motion.div>
          )}
        </motion.form>
      </div>
    </section>
  )
}

export default ContactForm
