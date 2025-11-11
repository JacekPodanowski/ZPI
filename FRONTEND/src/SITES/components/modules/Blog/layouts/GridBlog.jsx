import React from 'react';
import { motion } from 'framer-motion';
import { resolveMediaUrl } from '../../../../../config/api';
import { isVideoUrl } from '../../../../../utils/mediaUtils';

const GridBlog = ({ content, style }) => {
  const { title, subtitle, posts = [], bgColor, textColor } = content;
  const backgroundColor = bgColor || style?.background || '#f5f2eb';
  const headingColor = textColor || style?.text || '#1e1e1e';
  const subtitleColor = textColor || style?.neutral || '#4b5563';
  const cardBackground = style?.surface || '#ffffff';
  const cardBorder = style?.colors?.borderSubtle || style?.borderColor || 'rgba(0, 0, 0, 0.06)';
  const emptyStateColor = style?.colors?.text?.subtle || style?.neutral || '#9ca3af';
  const textSize = style?.textSize || 'text-base leading-relaxed';
  const headingSize = style?.headingSize || 'text-3xl md:text-4xl lg:text-5xl font-semibold';
  const animationClasses = style?.animations || 'transition-all duration-300';

  return (
    <section
      className={`${style?.spacing || 'space-y-8 py-12 md:py-20 px-4 md:px-6'}`}
      style={{ backgroundColor }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {(title || subtitle) && (
          <div className="text-center space-y-2">
            {title && (
              <h2 className={headingSize} style={{ color: headingColor }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`${textSize} opacity-75`} style={{ color: subtitleColor }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => {
            const resolvedImage = resolveMediaUrl(post.image);
            const hasValidImage = resolvedImage && resolvedImage.trim() !== '';
            
            return (
              <motion.article
                key={post.id}
                whileHover={{ y: -6 }}
                className={`${style?.rounded || 'rounded-xl'} overflow-hidden group border ${style?.shadows || 'shadow-lg'} ${animationClasses}`}
                style={{
                  backgroundColor: cardBackground,
                  borderColor: cardBorder
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-black">
                  {hasValidImage ? (
                    isVideoUrl(post.image) ? (
                      <video
                        src={resolvedImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`w-full h-full object-cover group-hover:scale-105 ${animationClasses}`}
                      />
                    ) : (
                      <img
                        src={resolvedImage}
                        alt={post.title}
                        className={`w-full h-full object-cover group-hover:scale-105 ${animationClasses}`}
                      />
                    )
                  ) : (
                    <div className="w-full h-full grid place-items-center bg-black/5 text-sm text-black/40">
                      Dodaj zdjęcie
                    </div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none opacity-0 ${animationClasses} group-hover:opacity-100`} />

                  <div className={`absolute inset-0 flex flex-col justify-end p-6 text-white opacity-0 translate-y-6 ${animationClasses} group-hover:opacity-100 group-hover:translate-y-0`}>
                    <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                      {post.date || 'Nowość'}
                    </p>
                    <h3 className="text-xl font-semibold mt-1">{post.title || 'Nowy wpis'}</h3>
                    <p className="text-sm mt-3 leading-relaxed">
                      {post.excerpt || 'Dodaj krótki opis wpisu'}
                    </p>
                    {post.author && (
                      <p className="text-xs mt-4 opacity-80">
                        Autor: {post.author}
                      </p>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: emptyStateColor }}>
            Dodaj wpisy w konfiguratorze.
          </div>
        )}
      </div>
    </section>
  );
};

export default GridBlog;
