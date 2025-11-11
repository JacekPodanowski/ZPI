export const applyOpacity = (color, alpha) => {
  if (typeof alpha !== 'number') {
    return color || `rgba(0, 0, 0, 1)`;
  }

  if (!color) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  if (color.startsWith('#')) {
    let hex = color.slice(1);

    if (hex.length === 3) {
      hex = hex.split('').map((char) => char + char).join('');
    }

    if (hex.length === 6) {
      const intValue = parseInt(hex, 16);
      const r = (intValue >> 16) & 255;
      const g = (intValue >> 8) & 255;
      const b = intValue & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  if (color.startsWith('rgba(')) {
    const parts = color.split(',');
    if (parts.length === 4) {
      parts[3] = ` ${alpha})`;
      return parts.join(',');
    }
  }

  if (color.startsWith('rgb(')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  }

  return color;
};

export default applyOpacity;
