import { useMemo } from 'react';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useThemeContext } from './ThemeProvider';

/**
 * Returns a merged object that combines the semantic theme with the MUI theme instance.
 * This ensures legacy components relying on MUI continue to work while exposing
 * the new color system under the `colors` key.
 */
const useTheme = () => {
	const context = useThemeContext();
	const muiTheme = useMuiTheme();

	return useMemo(() => {
		const semanticTheme = context?.theme;

		if (!semanticTheme || !muiTheme) {
			return {
				...semanticTheme,
				mode: context?.mode,
				toggleMode: context?.toggleMode,
				switchTheme: context?.switchTheme,
				availableThemes: context?.availableThemes,
				colors: semanticTheme?.colors || {},
				typography: semanticTheme?.typography || {}
			};
		}

		return {
			...muiTheme,
			mode: context.mode,
			themeId: context.themeId,
			toggleMode: context.toggleMode,
			switchTheme: context.switchTheme,
			availableThemes: context.availableThemes,
			colors: semanticTheme.colors,
			palettes: semanticTheme.palettes,
			contrast: semanticTheme.contrast,
					typography: {
						...muiTheme.typography,
						fonts: semanticTheme.typography.fonts,
						sizes: semanticTheme.typography.sizes,
						weights: semanticTheme.typography.weights,
						lineHeights: semanticTheme.typography.lineHeights,
						letterSpacing: semanticTheme.typography.letterSpacing,
						tokens: semanticTheme.typography,
						textStyles: semanticTheme.textStyles
					},
			semantic: semanticTheme
		};
	}, [context, muiTheme]);
};

export default useTheme;
