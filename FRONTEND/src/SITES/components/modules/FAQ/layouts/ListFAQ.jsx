import React from 'react';

const ListFAQ = ({ content, style }) => {
  const { title = 'FAQ', intro = '', items = [], bgColor, textColor } = content;

  return (
  <section className={`${style.spacing} py-12 px-4 md:py-20 md:px-6`} style={{ backgroundColor: bgColor || style.background }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {(title || intro) && (
          <div className="text-center space-y-3">
            {title && (
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-semibold`} style={{ color: textColor || style.text }}>
                {title}
              </h2>
            )}
            {intro && (
              <p className={style.textSize} style={{ color: textColor || style.text }}>
                {intro}
              </p>
            )}
          </div>
        )}

        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="space-y-2">
              <h3 className="text-lg font-semibold" style={{ color: textColor || style.primary }}>
                {item.question}
              </h3>
              <div
                className="prose prose-sm max-w-none opacity-80"
                style={{ color: textColor || style.text }}
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
