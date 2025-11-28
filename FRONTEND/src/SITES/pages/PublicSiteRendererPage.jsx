// File: FRONTEND/src/SITES/pages/PublicSiteRendererPage.jsx
import { useParams } from 'react-router-dom';
import SiteApp from '../SiteApp';

const PublicSiteRendererPage = () => {
  // Pobiera :siteIdentifier z URL (np. "pracownia-jogi")
  const { siteIdentifier } = useParams();

  // Przekazuje identyfikator jako props do głównego komponentu renderującego
  // Nawigacja jest renderowana przez NavigationLayout w App.jsx
  return <SiteApp siteIdentifierFromPath={siteIdentifier} />;
};

export default PublicSiteRendererPage;
