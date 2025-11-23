export const getTypographyFonts = (style = {}) => {
  const fallback = '"Inter", sans-serif';
  const titleFont = style?.titleFont || fallback;
  const textFont = style?.textFont || titleFont || fallback;
  return {
    titleFont,
    textFont
  };
};

export default getTypographyFonts;
