import React, { useState } from 'react';
import { motion } from 'framer-motion';

const NewsletterSubscription = ({ siteIdentifier, accentColor, textColor }) => {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  // Don't render in editor/preview mode when siteIdentifier is not available
  if (!siteIdentifier || siteIdentifier === 'preview' || siteIdentifier === 'undefined') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-12 p-8 rounded-lg border border-black/10 text-center"
        style={{ backgroundColor: `${accentColor}10` }}
      >
        <p className="text-sm opacity-70" style={{ color: textColor }}>
          📧 Newsletter będzie dostępny po opublikowaniu strony
        </p>
      </motion.div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Podaj poprawny adres email');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/newsletter/subscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_identifier: siteIdentifier,
          email,
          frequency
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        // Handle different success scenarios
        if (data.resent) {
          setMessage('Email potwierdzający został wysłany ponownie. Sprawdź swoją skrzynkę.');
        } else if (data.reactivated) {
          setMessage('Twoja subskrypcja została reaktywowana!');
        } else {
          setMessage('Dziękujemy! Sprawdź swoją skrzynkę email, aby potwierdzić subskrypcję.');
        }
        setEmail('');
      } else {
        setStatus('error');
        // Handle error with already_subscribed flag
        if (data.already_subscribed) {
          setMessage('Ten adres email jest już zapisany na newsletter.');
        } else {
          setMessage(data.error || 'Wystąpił błąd. Spróbuj ponownie.');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Nie można połączyć się z serwerem. Spróbuj ponownie później.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12 p-8 rounded-lg border border-black/10"
      style={{ backgroundColor: `${accentColor}10` }}
    >
      <h3 className="text-2xl font-bold mb-3" style={{ color: textColor }}>
        Zapisz się na newsletter
      </h3>
      <p className="text-sm mb-6 opacity-70" style={{ color: textColor }}>
        Otrzymuj informacje o nadchodzących wydarzeniach bezpośrednio na swoją skrzynkę.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Twój adres email"
              disabled={status === 'loading' || status === 'success'}
              className="w-full px-4 py-3 rounded-lg border border-black/20 focus:outline-none focus:ring-2 transition-all"
              style={{ 
                focusRingColor: accentColor,
                backgroundColor: 'white'
              }}
            />
          </div>

          <div className="md:w-48">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              className="w-full px-4 py-3 rounded-lg border border-black/20 focus:outline-none focus:ring-2 transition-all bg-white"
              style={{ focusRingColor: accentColor }}
            >
              <option value="daily">Codziennie</option>
              <option value="weekly">Co tydzień</option>
              <option value="monthly">Co miesiąc</option>
            </select>
          </div>

          <motion.button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            whileHover={{ scale: status !== 'loading' && status !== 'success' ? 1.02 : 1 }}
            whileTap={{ scale: status !== 'loading' && status !== 'success' ? 0.98 : 1 }}
            className="px-8 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: accentColor }}
          >
            {status === 'loading' ? 'Zapisuję...' : status === 'success' ? '✓ Zapisano' : 'Zapisz się'}
          </motion.button>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg text-sm ${
              status === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
          >
            {message}
          </motion.div>
        )}
      </form>

      <p className="mt-4 text-xs opacity-60" style={{ color: textColor }}>
        📧 W każdym emailu znajdziesz link do wypisania się z newslettera. Możesz zrezygnować w dowolnym momencie.
      </p>
    </motion.div>
  );
};

export default NewsletterSubscription;
