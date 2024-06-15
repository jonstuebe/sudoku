type TShirtSizes = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type ThemeSpacing = TShirtSizes;

export const spacing: Record<ThemeSpacing, number> = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

type ThemeRounding = TShirtSizes;

export const rounding: Record<ThemeRounding, number> = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
