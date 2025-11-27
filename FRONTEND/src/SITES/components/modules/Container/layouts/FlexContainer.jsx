import { motion } from 'framer-motion';
import TextModule from '../../Text';
import ButtonModule from '../../Button';
import GalleryModule from '../../Gallery';
import SpacerModule from '../../Spacer';

const FlexContainer = ({ content, style, isEditing = false }) => {
  const { 
    direction = 'horizontal', 
    gap = '1rem', 
    align = 'center', 
    justify = 'center',
    wrap = true,
    children = []
  } = content || {};

  const components = {
    text: TextModule,
    button: ButtonModule,
    gallery: GalleryModule,
    spacer: SpacerModule,
  };

  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end'
  };

  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around'
  };

  return (
    <div className="py-8 px-4 md:py-12 md:px-6 relative">
      {/* Label kontenera w trybie edycji */}
      {isEditing && (
        <div className="absolute -top-2 left-4 md:left-8 px-2 py-1 rounded text-xs font-medium z-10"
             style={{ backgroundColor: 'rgb(146, 0, 32)', color: 'rgb(228, 229, 218)' }}>
          📦 Kontener ({direction === 'horizontal' ? '↔️' : '↕️'})
        </div>
      )}
      
      <div 
        className="max-w-6xl mx-auto relative flex flex-col md:flex-row"
        style={{
          flexDirection: direction === 'horizontal' ? 'column' : 'column',
          gap: gap,
          alignItems: alignMap[align],
          justifyContent: justifyMap[justify],
          flexWrap: wrap ? 'wrap' : 'nowrap',
          border: isEditing ? '2px dashed rgba(146, 0, 32, 0.3)' : 'none',
          borderRadius: '1rem',
          padding: isEditing ? '1rem' : '0',
          minHeight: children.length === 0 && isEditing ? '100px' : 'auto'
        }}
      >
        <style>{`
          @media (min-width: 768px) {
            .max-w-6xl.mx-auto.relative.flex {
              flex-direction: ${direction === 'horizontal' ? 'row' : 'column'} !important;
            }
          }
        `}</style>
        {children.length === 0 && isEditing && (
          <div className="flex items-center justify-center w-full h-full text-center opacity-50">
            <div>
              <p className="text-sm">Kontener jest pusty</p>
              <p className="text-xs mt-1">Dodaj elementy w panelu po prawej →</p>
            </div>
          </div>
        )}
        
        {children.map((child, idx) => {
          const Component = components[child.type];
          if (!Component) return null;
          
          // Oblicz flex dla tego dziecka
          const flexGrow = child.content?.flexGrow ? 1 : 0;
          const flexShrink = child.content?.flexGrow ? 1 : 0;
          const flexBasis = child.content?.flexGrow ? '0%' : 'auto';
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
              style={{ 
                flex: `${flexGrow} ${flexShrink} ${flexBasis}`,
                minWidth: child.content?.flexGrow ? '0' : 'auto',
                border: isEditing ? '1px solid rgba(30, 30, 30, 0.1)' : 'none',
                borderRadius: '0.5rem',
                padding: isEditing ? '0.5rem' : '0'
              }}
            >
              {/* Mini label elementu w trybie edycji */}
              {isEditing && (
                <div className="absolute -top-2 left-2 px-2 py-0.5 rounded text-xs bg-white shadow-sm z-10"
                     style={{ color: 'rgb(30, 30, 30)', fontSize: '10px' }}>
                  {child.type === 'text' && '📝'}
                  {child.type === 'button' && '🔘'}
                  {child.type === 'gallery' && '🖼️'}
                  {child.type === 'spacer' && '↕️'}
                  {' '}{child.type}
                  {child.content?.flexGrow && ' ↔️'}
                </div>
              )}
              <Component content={child.content} style={style} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FlexContainer;
