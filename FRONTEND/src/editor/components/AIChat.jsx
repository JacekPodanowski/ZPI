import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendAIMessage } from '../../config/api'
import Button from '../../components/Button'
import useEditorStore from '../../store/editorStore'

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const { selectedModule, templateConfig } = useEditorStore()

  // Informuj o wybranym module
  useEffect(() => {
    if (selectedModule && isOpen) {
      const module = templateConfig.modules.find((m) => m.id === selectedModule)
      if (module) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            content: `Wybrano sekcję: ${module.name}. Jak mogę pomóc w jej edycji?`,
          },
        ])
      }
    }
  }, [selectedModule, isOpen])

  const handleSend = async () => {
    if (!message.trim()) return

    const userMessage = { role: 'user', content: message }
    setMessages([...messages, userMessage])
    setMessage('')
    setLoading(true)

    try {
      const response = await sendAIMessage(message)
      setMessages((prev) => [...prev, { role: 'ai', content: response.message }])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Przepraszam, AI API jest obecnie niedostępne.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-40"
        style={{ backgroundColor: 'rgb(146, 0, 32)', color: 'rgb(228, 229, 218)' }}
      >
        {isOpen ? '✕' : '🤖'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col z-40"
          >
            <div className="p-4 rounded-t-xl" style={{ backgroundColor: 'rgb(146, 0, 32)', color: 'rgb(228, 229, 218)' }}>
              <h3 className="font-semibold text-lg">Asystent AI</h3>
              <p className="text-sm opacity-90">
                {selectedModule
                  ? `Edytujesz: ${templateConfig.modules.find((m) => m.id === selectedModule)?.name}`
                  : 'Kliknij na sekcję, aby ją edytować'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center mt-8" style={{ color: 'rgba(30, 30, 30, 0.5)' }}>
                  <p>Jak mogę Ci pomóc?</p>
                  <p className="text-sm mt-2">Opisz, co chcesz zmienić na stronie</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl ${
                    msg.role === 'user'
                      ? 'ml-8'
                      : msg.role === 'system'
                      ? 'mx-4 text-center text-sm opacity-70'
                      : 'mr-8'
                  }`}
                  style={{
                    backgroundColor:
                      msg.role === 'user'
                        ? 'rgb(146, 0, 32)'
                        : msg.role === 'system'
                        ? 'rgb(228, 229, 218)'
                        : 'rgb(240, 240, 240)',
                    color:
                      msg.role === 'user'
                        ? 'rgb(228, 229, 218)'
                        : 'rgb(30, 30, 30)',
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div className="mr-8 p-3 rounded-xl" style={{ backgroundColor: 'rgb(240, 240, 240)', color: 'rgb(30, 30, 30)' }}>
                  Myślę...
                </div>
              )}
            </div>

            <div className="p-4 border-t" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Wpisz wiadomość..."
                  className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'rgba(30, 30, 30, 0.2)',
                    '--tw-ring-color': 'rgb(146, 0, 32)',
                  }}
                />
                <Button onClick={handleSend} disabled={loading} className="px-6">
                  Wyślij
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIChat
