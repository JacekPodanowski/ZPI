/**
 * Team roles loaded from shared JSON config.
 * Edit SHARED_SETTINGS/teamRoles.json and run sync.bat
 */
import teamRolesJson from './teamRoles.json';

export const TEAM_ROLES = teamRolesJson;

/**
 * Get role information by role key
 * @param {string} role - Role key (viewer, contributor, manager, owner)
 * @returns {object} Role information object
 */
export const getRoleInfo = (role) => {
  return TEAM_ROLES[role] || TEAM_ROLES.viewer;
};

/**
 * Get translated role name
 * @param {string} role - Role key
 * @param {string} lang - Language ('en' or 'pl')
 * @returns {string} Translated role name
 */
export const getRoleName = (role, lang = 'en') => {
  const roleInfo = getRoleInfo(role);
  return lang === 'pl' ? roleInfo.namePolish : roleInfo.name;
};
