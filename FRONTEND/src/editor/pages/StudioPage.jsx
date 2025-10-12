import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/Button'

const StudioPage = () => {
  const navigate = useNavigate()
  
  // Mock data - w przyszłości z API
  const userSites = [
    { id: 1, name: 'YOGA', url: 'yoga.example.com', lastModified: '2024-01-15' },
    { id: 2, name: 'KULINARIA', url: 'kulinaria.example.com', lastModified: '2024-01-10' },
  ]

  return (
    <div className="min-h-screen px-4 py-12" style={{ backgroundColor: 'rgb(228, 229, 218)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
            Studio
          </h1>
          <p className="text-lg opacity-70">Zarządzaj swoimi stronami</p>
        </motion.div>

        {/* Nowa strona */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Button 
            onClick={() => navigate('/templates')}
            className="text-lg px-8 py-4"
          >
            + Stwórz nową stronę
          </Button>
        </motion.div>

        {/* Lista stron */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSites.map((site, index) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold mb-1" style={{ color: 'rgb(30, 30, 30)' }}>
                  {site.name}
                </h3>
                <p className="text-sm opacity-60">{site.url}</p>
                <p className="text-xs opacity-50 mt-2">
                  Ostatnia modyfikacja: {site.lastModified}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/editor', { state: { siteId: site.id } })}
                  className="flex-1 text-sm py-2"
                >
                  Edytuj
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.open(`https://${site.url}`, '_blank')}
                  className="flex-1 text-sm py-2"
                >
                  Podgląd
                </Button>
              </div>
            </motion.div>
          ))}

          {/* Placeholder dla braku stron */}
          {userSites.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20"
            >
              <p className="text-xl opacity-60 mb-6">Nie masz jeszcze żadnych stron</p>
              <Button onClick={() => navigate('/templates')}>
                Stwórz swoją pierwszą stronę
              </Button>
            </motion.div>
          )}

          {/* Limit stron */}
          {userSites.length > 0 && userSites.length < 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white bg-opacity-50 rounded-xl p-6 border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: 'rgb(146, 0, 32)' }}
            >
              <div className="text-center">
                <p className="opacity-60 mb-2">
                  {3 - userSites.length} {3 - userSites.length === 1 ? 'miejsce' : 'miejsca'}
                </p>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/templates')}
                  style={{ color: 'rgb(146, 0, 32)' }}
                >
                  + Dodaj stronę
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudioPage
