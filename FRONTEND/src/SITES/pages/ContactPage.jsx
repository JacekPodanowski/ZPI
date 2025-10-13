import React from 'react'
import ContactSection from '../components/ContactSection'

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <ContactSection config={{ email: 'kontakt@wellness.pl', phone: '+48 123 456 789' }} />
    </div>
  )
}

export default ContactPage
