// layouts/HorizontalNav.jsx - Traditional horizontal navigation
import { useState } from 'react';

const HorizontalNav = ({ content, vibe, theme, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activePageId = content.activePageId;

  const handleLinkClick = (event, link) => {
    if (onNavigate && link.pageId) {
      event.preventDefault();
      onNavigate(link.pageId, link.href);
    }
  };
  
  return (
    <nav 
      className={`${content.sticky ? 'sticky top-0 z-50' : ''} ${vibe.shadows} ${vibe.animations}`}
      style={{ 
        backgroundColor: content.bgColor || theme.background,
        borderBottom: `1px solid ${theme.secondary}`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 md:gap-3">
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
                style={{ color: content.textColor || theme.primary }}
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
                className={`${vibe.textSize} ${vibe.animations} hover:opacity-70 ${link.pageId === activePageId ? 'font-semibold' : ''}`}
                style={{ color: link.pageId === activePageId ? (content.activeColor || theme.primary) : (content.textColor || theme.text) }}
              >
                {link.label}
              </a>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: content.textColor || theme.primary }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t space-y-3" style={{ borderColor: theme.secondary }}>
            {content.links?.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                onClick={(event) => handleLinkClick(event, link)}
                className={`block ${vibe.textSize} ${vibe.animations} hover:opacity-70`}
                style={{ color: link.pageId === activePageId ? (content.activeColor || theme.primary) : (content.textColor || theme.text) }}
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
