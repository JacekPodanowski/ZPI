import React from 'react'
import HeroSection from '../components/HeroSection'
import CalendarSection from '../components/CalendarSection'
import AboutSection from '../components/AboutSection'
import ContactForm from '../components/ContactForm'

const HomePage = () => {
  return (
    <div>
      <HeroSection
        config={{
          title: 'Witaj w Świecie Wellness',
          subtitle: 'Odkryj harmonię ciała i umysłu',
          bgColor: '#f8f6f3',
          textColor: '#222',
        }}
      />
      <CalendarSection config={{ title: 'Zarezerwuj Termin', color: '#c04b3e' }} />
      <AboutSection
        config={{
          title: 'O Mnie',
          description: 'Jestem certyfikowanym instruktorem wellness z pasją do zdrowego stylu życia.',
          imageUrl: '',
        }}
      />
      <ContactForm config={{ email: 'kontakt@wellness.pl', phone: '+48 123 456 789' }} />
    </div>
  )
}

export default HomePage
