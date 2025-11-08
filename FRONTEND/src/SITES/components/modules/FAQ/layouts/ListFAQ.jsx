import React from 'react';

const ListFAQ = ({ content, vibe, theme }) => {
  const { title = 'FAQ', intro = '', items = [], bgColor, textColor } = content;

  return (
    <section className={`${vibe.spacing} px-4`} style={{ backgroundColor: bgColor || theme.background }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {(title || intro) && (
          <div className="text-center space-y-3">
            {title && (
              <h2 className={`${vibe.headingSize} font-semibold`} style={{ color: textColor || theme.text }}>
                {title}
              </h2>
            )}
            {intro && (
              <p className={vibe.textSize} style={{ color: textColor || theme.text }}>
                {intro}
              </p>
            )}
          </div>
        )}

        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="space-y-2">
              <h3 className="text-lg font-semibold" style={{ color: textColor || theme.primary }}>
                {item.question}
              </h3>
              <div
                className="prose prose-sm max-w-none opacity-80"
                style={{ color: textColor || theme.text }}
                dangerouslySetInnerHTML={{ __html: item.answer || '' }}
              />
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-10 text-sm opacity-40">
              Dodaj pytania w konfiguratorze.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ListFAQ;
