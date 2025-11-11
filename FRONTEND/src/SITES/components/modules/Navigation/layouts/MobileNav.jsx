import { useState } from 'react';

const MobileNav = ({ content, style, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activePageId = content.activePageId;

  const backgroundColor = content.bgColor || style?.surface || style?.background || 'transparent';
  const textColor = content.textColor || style?.text || '#111';
  const activeColor = content.activeColor || style?.primary || textColor;
  const borderColor = style?.colors?.border || style?.borderColor || style?.secondary || activeColor;
  const dividerColor = style?.colors?.borderSubtle || borderColor;
  const animationClass = style?.animations || '';
  const textSizeClass = style?.textSize || 'text-base';

  const handleLinkClick = (event, link) => {
    if (onNavigate && link.pageId) {
      event.preventDefault();
      onNavigate(link.pageId, link.href);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`${content.sticky ? 'sticky top-0 z-50' : ''} ${animationClass}`}
      style={{
        backgroundColor,
        borderBottom: `1px solid ${borderColor}`
      }}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          {content.logo?.src && (
            <img
              src={content.logo.src}
              alt={content.logo.alt || content.logo.text}
              className="h-9 w-auto"
            />
          )}
          {content.logo?.text && (
            <span
              className="text-lg font-semibold"
              style={{ color: activeColor }}
            >
              {content.logo.text}
            </span>
          )}
        </a>

        <button
          type="button"
          className="text-2xl"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          style={{ color: textColor }}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out border-t ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ borderColor: dividerColor, backgroundColor }}
      >
        <div className="flex flex-col gap-2 px-4 py-3">
          {content.links?.map((link, index) => {
            const isActive = link.pageId === activePageId;
            return (
              <a
                key={index}
                href={link.href}
                onClick={(event) => handleLinkClick(event, link)}
                className={`${textSizeClass} font-medium`}
                style={{
                  color: isActive ? activeColor : textColor
                }}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileNav;
