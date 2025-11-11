// layouts/CenteredNav.jsx - Centered navigation with logo above
import { useState } from 'react';

const CenteredNav = ({ content, style, onNavigate }) => {
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
    if (onNavigate && link.pageId) {
      event.preventDefault();
      onNavigate(link.pageId, link.href);
    }
  };
  
  return (
    <nav 
      className={`${content.sticky ? 'sticky top-0 z-50' : ''} ${shadowClass} ${animationClass}`}
      style={{ 
        backgroundColor,
        borderBottom: `1px solid ${borderColor}`
      }}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Logo Centered */}
        <a href="/" className="flex flex-col items-center gap-2 mb-6">
          {content.logo?.src && (
            <img 
              src={content.logo.src} 
              alt={content.logo.alt || content.logo.text}
              className="h-10 md:h-12 w-auto"
            />
          )}
          {content.logo?.text && (
            <span 
              className="text-2xl md:text-3xl font-light tracking-wide"
              style={{ color: activeColor }}
            >
              {content.logo.text}
            </span>
          )}
        </a>
        
        {/* Desktop Links - Centered */}
        <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12">
          {content.links?.map((link, index) => (
            <a 
              key={index}
              href={link.href}
              onClick={(event) => handleLinkClick(event, link)}
              className={`${textSizeClass} ${animationClass} hover:opacity-70 ${link.pageId === activePageId ? 'font-semibold' : ''}`}
              style={{ color: link.pageId === activePageId ? activeColor : textColor }}
            >
              {link.label}
            </a>
          ))}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-2xl absolute top-6 right-4"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ color: activeColor }}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t space-y-3 text-center" style={{ borderColor: dividerColor }}>
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

export default CenteredNav;
