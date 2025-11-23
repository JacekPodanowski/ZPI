import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { resolveMediaUrl } from '../../../../../config/api';
import { isVideoUrl } from '../../../../../utils/mediaUtils';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const GridTeam = ({ content, style, siteId, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleSubtitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { subtitle: newValue });
  };
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    title = 'Poznaj nasz zespół',
    subtitle = 'Ludzie, którzy wspierają Cię w drodze do równowagi',
    members = [],
    cardWidth = 320,
    cardHeight = 420,
    bgColor = style?.background || '#FFFFFF',
    backgroundImage,
    backgroundOverlayColor,
    textColor = style?.text || 'rgb(30, 30, 30)',
    accentColor = style?.primary || 'rgb(146, 0, 32)'
  } = content || {};

  const overlayColor = backgroundOverlayColor ?? (backgroundImage ? 'rgba(0, 0, 0, 0.35)' : undefined);

  // Fetch team members from API
  useEffect(() => {
    console.log('[GridTeam] siteId:', siteId);
    
    if (!siteId) {
      console.log('[GridTeam] No siteId, skipping API fetch');
      setLoading(false);
      return;
    }

    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const apiUrl = `${API_BASE}/api/v1/public-sites/${siteId}/team/`;
        console.log('[GridTeam] Fetching team members from:', apiUrl);
        const response = await fetch(apiUrl);
        console.log('[GridTeam] Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch team members: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[GridTeam] Fetched team members:', data);
        setTeamMembers(data);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [siteId]);

  // Use fetched members if available, otherwise fallback to destructured members for preview
  const displayMembers = teamMembers.length > 0 ? teamMembers : members;

  return (
    <section className="py-4 relative overflow-hidden" style={{ backgroundColor: bgColor }}>
      <BackgroundMedia media={backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-6xl mx-auto space-y-6 relative z-10 px-4">
        {(title || subtitle) && (
          <div className="text-center space-y-3">
            {(isEditing || title) && (
              isEditing ? (
                <EditableText
                  value={title || ''}
                  onSave={handleTitleSave}
                  as="h2"
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold"
                  style={{ color: textColor }}
                  placeholder="Click to edit title..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold" style={{ color: textColor }}>
                  {title}
                </h2>
              )
            )}
            {(isEditing || subtitle) && (
              isEditing ? (
                <EditableText
                  value={subtitle || ''}
                  onSave={handleSubtitleSave}
                  as="p"
                  className="text-base opacity-70"
                  style={{ color: textColor }}
                  placeholder="Click to edit subtitle..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <p className="text-base opacity-70" style={{ color: textColor }}>
                  {subtitle}
                </p>
              )
            )}
          </div>
        )}

        <div 
          className="justify-items-center"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${cardWidth}px, ${cardWidth}px))`,
            justifyContent: 'center',
            gap: '1.25rem'
          }}
        >
          {displayMembers.map((member) => {
            const resolvedImage = resolveMediaUrl(member.image);
            const hasValidImage = resolvedImage && resolvedImage.trim() !== '';
            
            return (
              <motion.article
                key={member.id}
                className="relative rounded-3xl overflow-hidden shadow-lg group bg-white"
                style={{ width: `${cardWidth}px`, minHeight: `${cardHeight}px` }}
                whileHover={{ y: -8 }}
              >
                <div 
                  className="relative overflow-hidden bg-black"
                  style={{ height: `${Math.round(cardHeight * 0.6)}px` }}
                >
                  {hasValidImage ? (
                    isVideoUrl(member.image) ? (
                      <video
                        src={resolvedImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      >
                        Twoja przeglądarka nie obsługuje odtwarzania wideo.
                      </video>
                    ) : (
                      <img
                        src={resolvedImage}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="w-full h-full grid place-items-center bg-black/5 text-sm text-black/40">
                      Dodaj zdjęcie
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white opacity-0 translate-y-6 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    {member.bio && (
                      <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: member.bio }} />
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-2" style={{ color: textColor }}>
                  <div>
                    <h3 className="text-xl font-semibold">{member.name || 'Nowa osoba'}</h3>
                    {member.role && (
                      <p className="text-sm uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                        {member.role}
                      </p>
                    )}
                  </div>
                  {member.description && (
                    <p 
                      className="text-sm opacity-70 transition-all duration-300"
                      dangerouslySetInnerHTML={{ __html: member.description }}
                      style={{
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.display = 'block';
                        e.currentTarget.style.WebkitLineClamp = 'unset';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.display = '-webkit-box';
                        e.currentTarget.style.WebkitLineClamp = '4';
                      }}
                    />
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>

        {!loading && !error && displayMembers.length === 0 && (
          <div className="text-center py-12 text-sm text-black/40">
            Nie dodano jeszcze członków zespołu. Przejdź do zarządzania stroną, aby dodać członków zespołu.
          </div>
        )}
      </div>
    </section>
  );
};

export default GridTeam;
