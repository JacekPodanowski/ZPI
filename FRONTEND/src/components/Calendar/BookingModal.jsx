import React, { useState } from 'react';
import { format } from 'date-fns';

const BookingModal = ({ isOpen, onClose, onSuccess, slot, siteId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState('');

  if (!isOpen || !slot) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate siteId before making request
    if (!siteId) {
      setStatus('error');
      setError('Brak identyfikatora witryny. Nie można dokonać rezerwacji.');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/v1/public-sites/${siteId}/bookings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: slot.start,
          duration: slot.duration,
          guest_name: name,
          guest_email: email,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Wystąpił błąd podczas rezerwacji. Spróbuj ponownie.');
      }
      
      setStatus('success');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Nie udało się połączyć z serwerem. Sprawdź połączenie internetowe.');
    }
  };

  const handleClose = () => {
    onClose();
    // Reset stanu po zamknięciu
    setTimeout(() => {
      setStatus('idle');
      setName('');
      setEmail('');
      setError('');
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {status === 'success' ? (
          <div>
            <h2 className="text-2xl font-bold text-emerald-700 mb-4">Rezerwacja potwierdzona!</h2>
            <p className="text-neutral-600 mb-6">Dziękujemy za umówienie sesji. Potwierdzenie zostało wysłane na Twój adres e-mail.</p>
            <button onClick={handleClose} className="w-full bg-neutral-900 text-white py-2 rounded-md hover:bg-neutral-700 transition-colors">
              Zamknij
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">Potwierdź rezerwację</h2>
            <p className="text-neutral-600 mb-6">
              Termin: {format(new Date(slot.start), 'd MMMM yyyy, HH:mm')}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Imię i nazwisko
                </label>
                <input 
                  type="text" 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="w-full border border-neutral-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Adres e-mail
                </label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="w-full border border-neutral-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              {status === 'error' && (
                <p className="text-red-600 mb-4 text-sm">{error}</p>
              )}
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={handleClose} 
                  disabled={status === 'loading'} 
                  className="w-full bg-neutral-200 text-neutral-800 py-2 rounded-md hover:bg-neutral-300 transition-colors disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button 
                  type="submit" 
                  disabled={status === 'loading'} 
                  className="w-full bg-neutral-900 text-white py-2 rounded-md hover:bg-neutral-700 transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Rezerwowanie...' : 'Zarezerwuj'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
