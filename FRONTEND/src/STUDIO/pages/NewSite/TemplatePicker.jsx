import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useTemplateStore from '../../store/templateStore'
import Button from '../../../components/Button'

const TemplatePicker = () => {
  const navigate = useNavigate()
  const { templates } = useTemplateStore()

  const handleSelectTemplate = (templateId) => {
  navigate(`/studio/configure/${templateId}`)
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'rgb(228, 229, 218)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'rgb(30, 30, 30)' }}>
            Wybierz szablon
          </h1>
          <p className="text-lg opacity-70">
            Zacznij od gotowego szablonu i dostosuj go do swoich potrzeb
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all"
            >
              <div 
                className="h-48 flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, rgb(146, 0, 32) 0%, rgb(200, 50, 80) 100%)' 
                }}
              >
                <span className="text-6xl text-white font-bold">W</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                  {template.name}
                </h3>
                <p className="opacity-70 mb-4">{template.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.modules.map((module) => (
                    <span 
                      key={module} 
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: 'rgb(228, 229, 218)',
                        color: 'rgb(30, 30, 30)'
                      }}
                    >
                      {module}
                    </span>
                  ))}
                </div>
                <Button 
                  onClick={() => handleSelectTemplate(template.id)} 
                  className="w-full"
                >
                  Wybierz szablon
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TemplatePicker
