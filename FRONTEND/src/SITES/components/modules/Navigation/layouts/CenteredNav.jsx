// layouts/CenteredNav.jsx - Centered navigation with logo above
import { useState } from 'react';
import { resolveMediaUrl } from '../../../../../config/api';

const CenteredNav = ({ content, vibe, theme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoUrl = content.logo?.src ? resolveMediaUrl(content.logo.src) : '';
  
  return (
    <nav 
      className={`${content.sticky ? 'sticky top-0 z-50' : ''} ${vibe.shadows} ${vibe.animations}`}
      style={{ 
        backgroundColor: content.bgColor || theme.background,
        borderBottom: `1px solid ${theme.secondary}`
      }}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Logo Centered */}
        <a href="/" className="flex flex-col items-center gap-2 mb-6">
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt={content.logo.alt || content.logo.text}
              className="h-10 md:h-12 w-auto"
            />
          )}
          {content.logo?.text && (
            <span 
              className="text-2xl md:text-3xl font-light tracking-wide"
              style={{ color: content.textColor || theme.primary }}
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
              className={`${vibe.textSize} ${vibe.animations} hover:opacity-70`}
              style={{ color: content.textColor || theme.text }}
            >
              {link.label}
            </a>
          ))}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-2xl absolute top-6 right-4"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ color: content.textColor || theme.primary }}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t space-y-3 text-center" style={{ borderColor: theme.secondary }}>
            {content.links?.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                className={`block ${vibe.textSize} ${vibe.animations} hover:opacity-70`}
                style={{ color: content.textColor || theme.text }}
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
