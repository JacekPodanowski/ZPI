import React from 'react'
import ContactForm from '../components/ContactForm'

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <ContactForm config={{ email: 'kontakt@wellness.pl', phone: '+48 123 456 789' }} />
    </div>
  )
}

export default ContactPage
