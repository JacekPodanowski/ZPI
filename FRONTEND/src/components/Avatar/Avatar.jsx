import React from 'react';
import { Avatar as MuiAvatar } from '@mui/material';
import { getAvatarData } from '../../utils/avatarUtils';

/**
 * Universal Avatar component with automatic fallback to generated avatar
 * @param {Object} props
 * @param {string} props.avatarUrl - Custom avatar URL (optional)
 * @param {Object} props.user - User object with first_name, last_name, email, or name
 * @param {number} props.size - Avatar size in pixels (default: 40)
 * @param {Object} props.sx - Additional MUI sx props
 */
const Avatar = ({ avatarUrl, user, size = 40, sx = {}, ...otherProps }) => {
    const avatarData = getAvatarData(avatarUrl, user);

    return (
        <MuiAvatar
            src={avatarData.src}
            sx={{
                width: size,
                height: size,
                bgcolor: avatarData.hasCustom ? 'transparent' : avatarData.bgColor,
                fontSize: size * 0.45,
                fontWeight: 700,
                color: '#fff',
                ...sx
            }}
            {...otherProps}
        >
            {!avatarData.hasCustom && avatarData.letter}
        </MuiAvatar>
    );
};

export default Avatar;
