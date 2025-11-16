// File: FRONTEND/src/SITES/pages/SiteListPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const SiteListPage = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await apiClient.get('/public-sites/');
        setSites(response.data);
      } catch (err) {
        setError('Nie udało się załadować listy stron.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>Ładowanie stron...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#dc2626'
      }}>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          marginBottom: '0.5rem',
          color: '#111827'
        }}>
          Dostępne strony
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#6b7280', 
          marginBottom: '2rem' 
        }}>
          Lista wszystkich publicznych stron w systemie
        </p>

        {sites.length === 0 ? (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center', 
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{ color: '#6b7280' }}>Brak dostępnych stron</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {sites.map((site) => (
              <Link
                key={site.id}
                to={`/viewer/${site.identifier}`}
                style={{
                  display: 'block',
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h2 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>
                  {site.name}
                </h2>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  marginBottom: '0.75rem'
                }}>
                  {site.identifier}
                </p>
                {site.owner && (
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#9ca3af',
                    fontStyle: 'italic'
                  }}>
                    Właściciel: {site.owner.email}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteListPage;
