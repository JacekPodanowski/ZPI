import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const NewsletterSubscription = ({ siteIdentifier, accentColor, textColor }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

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

  useEffect(() => {
    if (!showCelebration) {
      return undefined;
    }
    const timeout = setTimeout(() => setShowCelebration(false), 4000);
    return () => clearTimeout(timeout);
  }, [showCelebration]);

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
          email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        let successMessage = '🎉 Hurra! Jesteś na liście. Damy znać, gdy pojawi się nowe Big Event.';
        if (data.reactivated) {
          successMessage = 'Witamy ponownie! Będziesz dostawać info o nowych Big Eventach.';
        } else if (data.already_subscribed) {
          successMessage = 'Ten adres email jest już na liście powiadomień.';
        }
        setMessage(successMessage);
        if (!data.already_subscribed) {
          setEmail('');
          setShowCelebration(true);
        }
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
              disabled={status === 'loading'}
              className="w-full px-4 py-3 rounded-lg border border-black/20 focus:outline-none focus:ring-2 transition-all"
              style={{ 
                focusRingColor: accentColor,
                backgroundColor: 'white'
              }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={status === 'loading'}
            whileHover={{ scale: status !== 'loading' ? 1.02 : 1 }}
            whileTap={{ scale: status !== 'loading' ? 0.98 : 1 }}
            animate={status === 'success' ? { scale: [1, 1.05, 1], boxShadow: '0px 10px 30px rgba(34,197,94,0.35)' } : { scale: 1, boxShadow: '0px 0px 0px rgba(0,0,0,0)' }}
            transition={{ duration: 0.6 }}
            className="px-8 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all relative"
            style={{ backgroundColor: accentColor }}
          >
            {status === 'loading' ? 'Zapisuję...' : status === 'success' ? '✓ Zapisano' : 'Zapisz się'}
          </motion.button>
        </div>

        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="col-span-full flex flex-col gap-2"
          >
            <motion.p
              className="text-green-700 font-semibold flex items-center gap-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1.05, 1] }}
              transition={{ duration: 0.6 }}
            >
              <span>🎈 Zapisane! Hurra!</span>
              <span className="text-green-500 text-sm">Dziękujemy, że jesteś z nami.</span>
            </motion.p>
            <div className="flex gap-4 h-16 items-end">
              {['#bbf7d0', '#4ade80', '#86efac'].map((color, index) => (
                <motion.span
                  key={color}
                  className="w-3 rounded-full"
                  style={{ backgroundColor: color, height: '100%' }}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [20, -30, -50], scale: [0.8, 1, 1.05] }}
                  transition={{ duration: 3, delay: index * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg text-sm ${
              status === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
            role="status"
            aria-live="polite"
          >
            {message}
          </motion.div>
        )}
      </form>

      <p className="mt-4 text-xs opacity-60" style={{ color: textColor }}>
        📧 Powiadamiamy tylko przy nowych Big Eventach. Każdy email zawiera link do wypisania się.
      </p>
    </motion.div>
  );
};

export default NewsletterSubscription;
