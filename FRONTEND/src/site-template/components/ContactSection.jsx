import React from 'react'
import { motion } from 'framer-motion'

const ContactSection = ({ config }) => {
  const { email, phone } = config

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-text mb-12"
        >
          Skontaktuj się ze mną
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="bg-background rounded-xl p-8 shadow-md hover:shadow-xl transition-all">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-semibold mb-2">Email</h3>
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>
          </div>
          
          <div className="bg-background rounded-xl p-8 shadow-md hover:shadow-xl transition-all">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Telefon</h3>
            <a href={`tel:${phone}`} className="text-primary hover:underline">
              {phone}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ContactSection
