import { TEAM_DEFAULTS, TEAM_DESCRIPTOR } from '../_descriptors';
import GridTeam from './layouts/GridTeam';
import { mergeWithDefaults } from '../../../../utils/contentMerge';

const LAYOUTS = {
  grid: GridTeam,
  carousel: GridTeam,
  list: GridTeam
};

const TeamModule = ({ layout = 'grid', content = {}, vibe, theme }) => {
  const defaults = TEAM_DEFAULTS[layout] || TEAM_DEFAULTS.grid;
  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.grid;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

TeamModule.descriptor = TEAM_DESCRIPTOR;
export default TeamModule;
