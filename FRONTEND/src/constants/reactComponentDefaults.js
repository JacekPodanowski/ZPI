export const DEFAULT_REACT_COMPONENT_SOURCE = `(props) => {
  const resolveMedia = typeof props?.resolveMediaUrl === 'function' ? props.resolveMediaUrl : (value) => value;
  const highlight = props?.accentColor || 'rgb(146, 0, 32)';
  const mediaValue = props?.imageUrl || '';
  const mediaUrl = mediaValue ? resolveMedia(mediaValue) : '';

  const isLikelyVideo = (value) => {
    if (!value || typeof value !== 'string') return false;
    const sanitized = value.split('?')[0].toLowerCase();
    return /\.(mp4|webm|ogg|mov|m4v)$/i.test(sanitized);
  };

  const useVideo = Boolean(props?.imageIsVideo || isLikelyVideo(mediaValue) || isLikelyVideo(mediaUrl));

  const linkType = props?.ctaLinkType || 'none';
  const internalPath = props?.ctaInternalPath || '';
  const internalPageId = props?.ctaInternalPageId || '';
  const externalHref = props?.ctaHref || '';
  const navigateToPage = typeof props?.navigateToSitePage === 'function' ? props.navigateToSitePage : null;

  const normalizeInternalHref = (value) => {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed.length) return '';
    if (trimmed.startsWith('#')) return trimmed;
    if (trimmed.startsWith('/')) return trimmed;
    return '/' + trimmed.replace(/^[/]+/, '');
  };

  const resolvedInternalHref = normalizeInternalHref(internalPath);
  const resolvedExternalHref = typeof externalHref === 'string' ? externalHref.trim() : '';

  const computedHref = (() => {
    if (linkType === 'internal') {
      return resolvedInternalHref;
    }
    if (linkType === 'external') {
      return resolvedExternalHref;
    }
    return '';
  })();

  const isLinkAction = linkType !== 'none' && Boolean(computedHref);
  const externalTarget = props?.ctaTarget || '_self';
  const relAttr = linkType === 'external' && externalTarget === '_blank' ? 'noopener noreferrer' : undefined;

  const handleInternalNavigation = (event) => {
    if (linkType !== 'internal') {
      return;
    }

    if (!computedHref) {
      event.preventDefault();
      return;
    }

    const detail = { path: computedHref, pageId: internalPageId };

    if (navigateToPage) {
      event.preventDefault();
      navigateToPage(detail);
      return;
    }

    if (computedHref.startsWith('#')) {
      event.preventDefault();
      const targetElement = document.getElementById(computedHref.substring(1));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const commonCtaStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.65rem',
    background: props?.ctaBg || highlight,
    color: props?.ctaTextColor || 'rgb(228, 229, 218)',
    borderRadius: '999px',
    padding: '0.9rem 2.4rem',
    fontSize: '1rem',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 18px 45px rgba(146, 0, 32, 0.22)'
  };

  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem',
        padding: '3rem',
        borderRadius: '24px',
        background: 'rgba(146, 0, 32, 0.05)',
        border: '1px solid rgba(146, 0, 32, 0.2)',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div style={{ flex: '1 1 0', textAlign: 'left' }}>
        <p
          style={{
            fontSize: '0.9rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: highlight,
            marginBottom: '0.75rem'
          }}
        >
          {props?.eyebrow || 'Nowość'}
        </p>
        <h2
          style={{
            fontSize: '2.4rem',
            marginBottom: '1rem',
            color: props?.titleColor || highlight
          }}
        >
          {props?.title || 'Sekcja z autorskim komponentem'}
        </h2>
        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: 1.7,
            marginBottom: '2rem',
            color: props?.textColor || 'rgb(30, 30, 30)'
          }}
        >
          {props?.description || 'Opis sekcji możesz dowolnie zmieniać z poziomu konfiguratora. Tekst jest automatycznie aktualizowany po zapisaniu zmian.'}
        </p>
        {isLinkAction ? (
          <a
            href={computedHref}
            style={commonCtaStyles}
            target={linkType === 'external' ? externalTarget : '_self'}
            rel={relAttr}
            onClick={handleInternalNavigation}
          >
            {props?.ctaLabel || 'Skontaktuj się z nami'}
            <span aria-hidden="true">→</span>
          </a>
        ) : (
          <button
            type="button"
            style={commonCtaStyles}
            onClick={typeof props?.onCtaClick === 'function' ? props.onCtaClick : undefined}
          >
            {props?.ctaLabel || 'Skontaktuj się z nami'}
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
      <div
        style={{
          flex: '0 0 320px',
          aspectRatio: '4 / 5',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 30px 60px rgba(146, 0, 32, 0.22)',
          background: 'linear-gradient(135deg, rgba(146, 0, 32, 0.12), rgba(146, 0, 32, 0.3))'
        }}
      >
        {mediaUrl ? (
          useVideo ? (
            <video
              src={mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              controls={props?.videoControls ?? false}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={props?.imageAlt || 'Podgląd wybranej grafiki'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(146, 0, 32, 0.7)',
              fontSize: '0.95rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            Dodaj swoją fotografię w panelu edycji
          </div>
        )}
      </div>
    </section>
  );
}`;

export const DEFAULT_REACT_COMPONENT_PROPS = {
  eyebrow: 'Nowość',
  title: 'Sekcja z autorskim komponentem',
  titleColor: 'rgb(146, 0, 32)',
  description: 'Opis sekcji możesz dowolnie zmieniać z poziomu konfiguratora. Tekst jest automatycznie aktualizowany po zapisaniu zmian.',
  textColor: 'rgb(30, 30, 30)',
  accentColor: 'rgb(146, 0, 32)',
  ctaLabel: 'Skontaktuj się z nami',
  ctaBg: 'rgb(146, 0, 32)',
  ctaTextColor: 'rgb(228, 229, 218)',
  ctaLinkType: 'internal',
  ctaInternalPageId: 'contact',
  ctaInternalPath: '/kontakt',
  ctaHref: '',
  ctaTarget: '_self',
  imageIsVideo: false,
  videoControls: false,
  imageUrl: '',
  imageAlt: 'Podgląd wybranej grafiki'
};

export const REACT_COMPONENT_MEDIA_PROP_KEYS = [
  'image',
  'photo',
  'graphic',
  'thumbnail',
  'avatar',
  'cover',
  'background',
  'media',
  'video'
];
