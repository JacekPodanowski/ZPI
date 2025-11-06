import React from 'react';
import { motion } from 'framer-motion';
import { resolveMediaUrl } from '../../../../../config/api';
import { isVideoUrl } from '../../../../../utils/mediaUtils';

const GridBlog = ({ content, vibe, theme }) => {
  const { title, subtitle, posts = [], bgColor, textColor } = content;

  return (
    <section className={`${vibe.spacing} px-4`} style={{ backgroundColor: bgColor || theme.background }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {(title || subtitle) && (
          <div className="text-center space-y-2">
            {title && (
              <h2 className={`${vibe.headingSize} font-semibold`} style={{ color: textColor || theme.text }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`${vibe.textSize} opacity-75`} style={{ color: textColor || theme.text }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const resolvedImage = resolveMediaUrl(post.image);
            const hasValidImage = resolvedImage && resolvedImage.trim() !== '';
            
            return (
              <motion.article
                key={post.id}
                whileHover={{ y: -6 }}
                className={`${vibe.rounded} overflow-hidden ${vibe.shadows} group bg-white`}
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
                        className={`w-full h-full object-cover group-hover:scale-105 ${vibe.animations}`}
                      />
                    ) : (
                      <img
                        src={resolvedImage}
                        alt={post.title}
                        className={`w-full h-full object-cover group-hover:scale-105 ${vibe.animations}`}
                      />
                    )
                  ) : (
                    <div className="w-full h-full grid place-items-center bg-black/5 text-sm text-black/40">
                      Dodaj zdjęcie
                    </div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none opacity-0 ${vibe.animations} group-hover:opacity-100`} />

                  <div className={`absolute inset-0 flex flex-col justify-end p-6 text-white opacity-0 translate-y-6 ${vibe.animations} group-hover:opacity-100 group-hover:translate-y-0`}>
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
          <div className="text-center py-12 text-sm text-black/40">
            Dodaj wpisy w konfiguratorze.
          </div>
        )}
      </div>
    </section>
  );
};

export default GridBlog;
