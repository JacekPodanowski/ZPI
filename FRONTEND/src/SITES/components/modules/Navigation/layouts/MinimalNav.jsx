// layouts/MinimalNav.jsx - Ultra minimal navigation
import { useState } from 'react';

const MinimalNav = ({ content, style, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activePageId = content.activePageId;

  const backgroundColor = content.bgColor || style?.background || 'transparent';
  const textColor = content.textColor || style?.text || '#111';
  const activeColor = content.activeColor || style?.primary || textColor;
  const animationClass = style?.animations || '';

  const handleLinkClick = (event, link) => {
    if (onNavigate && link.pageId) {
      event.preventDefault();
      onNavigate(link.pageId, link.href);
    }
  };
  
  return (
    <nav 
      className={`${content.sticky ? 'sticky top-0 z-50' : ''} ${animationClass}`}
      style={{ 
        backgroundColor
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Logo (optional) */}
          {content.logo?.text && (
            <a 
              href="/" 
              className="text-lg md:text-xl font-light tracking-wider"
              style={{ color: activeColor }}
            >
              {content.logo.text}
            </a>
          )}
          
          {/* Desktop Links - Right aligned or centered if no logo */}
          <div className={`hidden md:flex items-center gap-6 lg:gap-10 ${!content.logo?.text ? 'mx-auto' : ''}`}>
            {content.links?.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                onClick={(event) => handleLinkClick(event, link)}
                className={`text-sm md:text-base ${animationClass} hover:opacity-60 tracking-wide ${link.pageId === activePageId ? 'font-semibold' : 'font-light'}`}
                style={{ color: link.pageId === activePageId ? activeColor : textColor }}
              >
                {link.label}
              </a>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: activeColor }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-6 pt-4 space-y-4">
            {content.links?.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                onClick={(event) => handleLinkClick(event, link)}
                className={`block text-sm ${animationClass} hover:opacity-60 font-light`}
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

export default MinimalNav;
