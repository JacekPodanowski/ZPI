import { TEAM_DEFAULTS, TEAM_DESCRIPTOR } from '../_descriptors';
import GridTeam from './layouts/GridTeam';
import { mergeWithDefaults } from '../../../../utils/contentMerge';

const LAYOUTS = {
  grid: GridTeam,
  carousel: GridTeam,
  list: GridTeam
};

const TeamSection = ({ layout = 'grid', content = {}, style }) => {
  const defaultOptions = TEAM_DEFAULTS[layout] || TEAM_DEFAULTS.grid;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.grid;
  return <LayoutComponent content={mergedContent} style={style} />;
};

TeamSection.descriptor = TEAM_DESCRIPTOR;
export default TeamSection;
