import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const CancelBookingPage = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, error, confirming
  const [error, setError] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (!bookingId || !token) {
      setStatus('error');
      setError('Nieprawidłowy link odwołania.');
      return;
    }

    // Fetch booking details first
    fetchBookingDetails();
  }, [bookingId, token]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/v1/bookings/${bookingId}/verify-cancellation/?token=${token}`
      );

      if (!response.ok) {
        throw new Error('Nie można zweryfikować rezerwacji.');
      }

      const data = await response.json();
      setBookingDetails(data);
      setStatus('confirming');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Wystąpił błąd podczas ładowania danych.');
    }
  };

  const handleCancelBooking = async () => {
    setStatus('loading');
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/v1/bookings/${bookingId}/cancel-public/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Nie udało się odwołać rezerwacji.');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-lg w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-900 mb-6"></div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Przetwarzanie...</h2>
            <p className="text-neutral-600">Proszę czekać.</p>
          </div>
        )}

        {status === 'confirming' && bookingDetails && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Potwierdź odwołanie</h2>
              <p className="text-neutral-600">Czy na pewno chcesz odwołać tę rezerwację?</p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-6 mb-8 space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Wydarzenie:</span>
                <span className="font-semibold text-neutral-900">{bookingDetails.event_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Data:</span>
                <span className="font-semibold text-neutral-900">{bookingDetails.event_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Godzina:</span>
                <span className="font-semibold text-neutral-900">{bookingDetails.event_time}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.close()}
                className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Odwołaj rezerwację
              </button>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Rezerwacja odwołana</h2>
            <p className="text-neutral-600 mb-8">
              Twoja rezerwacja została pomyślnie odwołana. Właściciel strony otrzymał powiadomienie.
            </p>
            <button
              onClick={() => window.close()}
              className="w-full px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
            >
              Zamknij
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Wystąpił błąd</h2>
            <p className="text-red-600 mb-8">{error || 'Nie udało się odwołać rezerwacji.'}</p>
            <button
              onClick={() => window.close()}
              className="w-full px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
            >
              Zamknij
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelBookingPage;
