// layouts/HorizontalNav.jsx - Traditional horizontal navigation
import { useState } from 'react';

const HorizontalNav = ({ content, style, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activePageId = content.activePageId;

  const backgroundColor = content.bgColor || style?.background || 'transparent';
  const textColor = content.textColor || style?.text || '#111';
  const activeColor = content.activeColor || style?.primary || textColor;
  const borderColor = style?.colors?.border || style?.borderColor || style?.secondary || activeColor;
  const dividerColor = style?.colors?.borderSubtle || borderColor;
  const animationClass = style?.animations || '';
  const shadowClass = style?.shadows || '';
  const textSizeClass = style?.textSize || 'text-base';

  const handleLinkClick = (event, link) => {
    event.preventDefault();
    
    // Jeśli jest onNavigate (edytor), użyj go
    if (onNavigate && link.pageId) {
      onNavigate(link.pageId);
      setIsMenuOpen(false);
      return;
    }
    
    // W przeciwnym razie użyj systemu eventów (publiczna strona)
    if (typeof window !== 'undefined') {
      const navigationEvent = new CustomEvent('site:navigate', {
        detail: {
          pageId: link.pageId,
          path: link.href
        }
      });
      window.dispatchEvent(navigationEvent);
    }
    
    // Zamknij menu mobilne po kliknięciu
    setIsMenuOpen(false);
  };
  
  return (
    <nav 
      className={`${content.sticky ? 'sticky top-0 z-50' : ''} ${shadowClass} ${animationClass}`}
      style={{ 
        backgroundColor,
        borderBottom: `1px solid ${borderColor}`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a 
            href="/" 
            className="flex items-center gap-2 md:gap-3"
            onClick={(e) => {
              e.preventDefault();
              // Znajdź link do strony głównej
              const homeLink = content.links?.find(link => link.href === '/' || link.pageId === 'home');
              if (homeLink) {
                handleLinkClick(e, homeLink);
              }
            }}
          >
            {content.logo?.src && (
              <img 
                src={content.logo.src} 
                alt={content.logo.alt || content.logo.text}
                className="h-8 md:h-10 w-auto"
              />
            )}
            {content.logo?.text && (
              <span 
                className="text-xl md:text-2xl font-semibold"
                style={{ color: activeColor }}
              >
                {content.logo.text}
              </span>
            )}
          </a>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {content.links?.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                onClick={(event) => handleLinkClick(event, link)}
                className={`inline-flex items-center h-full ${textSizeClass} ${animationClass} hover:opacity-70 ${link.pageId === activePageId ? 'font-semibold' : ''}`}
                style={{
                  color: link.pageId === activePageId ? activeColor : textColor,
                  lineHeight: 1.2
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: activeColor }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t space-y-3" style={{ borderColor: dividerColor }}>
            {content.links?.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                onClick={(event) => handleLinkClick(event, link)}
                className={`block ${textSizeClass} ${animationClass} hover:opacity-70`}
                style={{ color: link.pageId === activePageId ? activeColor : textColor }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default HorizontalNav;
