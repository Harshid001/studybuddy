// src/utils/theme.js
// ─── Design Tokens ───────────────────────────────────────────
// Single source of truth for all colors, spacing, typography.
// Use these in StyleSheet.create() when Tailwind isn't enough.

export const colors = {
  // Backgrounds
  white:    "#ffffff",
  paper:    "#f8f7f4",
  paper2:   "#f2f0ec",

  // Borders
  rule:     "#e4e1d8",
  rule2:    "#cdc9bc",

  // Text
  ink:      "#1c1c1e",
  ink2:     "#4a4a52",
  ink3:     "#8e8e98",
  ink4:     "#b8b8c0",

  // Brand — Navy blue
  navy:     "#1a4480",
  navy2:    "#0f2d5c",
  navyLt:   "#edf2fa",
  navyMid:  "#c8d8f0",

  // Semantic
  teal:     "#0d6e6e",
  tealLt:   "#e4f4f4",
  amber:    "#b45309",
  amberLt:  "#fef3e2",
  danger:   "#b91c1c",
  dangerLt: "#fef2f2",
  success:  "#166534",
  successLt:"#f0fdf4",
  purple:   "#5b21b6",
  purpleLt: "#f5f3ff",
};

export const fonts = {
  regular:    "Lato_400Regular",
  bold:       "Lato_700Bold",
  black:      "Lato_900Black",
  serif:      "PlayfairDisplay_700Bold",
  serifBlack: "PlayfairDisplay_900Black",
  mono:       "SourceCodePro_400Regular",
  monoBold:   "SourceCodePro_600SemiBold",
};

export const radius = {
  sm:  4,
  md:  8,
  lg:  12,
  xl:  16,
  full: 9999,
};

export const shadow = {
  sm: {
    shadowColor:   "#1c1c1e",
    shadowOpacity: 0.07,
    shadowRadius:  6,
    shadowOffset:  { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor:   "#1c1c1e",
    shadowOpacity: 0.12,
    shadowRadius:  14,
    shadowOffset:  { width: 0, height: 4 },
    elevation: 5,
  },
  lg: {
    shadowColor:   "#1c1c1e",
    shadowOpacity: 0.20,
    shadowRadius:  24,
    shadowOffset:  { width: 0, height: 8 },
    elevation: 10,
  },
};

// Activity level helper — returns color/bg/border for any question count
export function activityStyle(questionCount) {
  if (questionCount >= 5)
    return { label: "Active",       color: colors.success, bg: colors.successLt, border: "#bbf7d0", pct: Math.min(100, questionCount * 8) };
  if (questionCount >= 1)
    return { label: "Learning",     color: colors.amber,   bg: colors.amberLt,   border: "#fcd38d", pct: questionCount * 20 };
  return   { label: "Not started",  color: colors.danger,  bg: colors.dangerLt,  border: "#fecaca", pct: 0 };
}

// Avatar palette
export const AV_BG  = ["#dbeafe","#dcfce7","#fef3c7","#fce7f3","#cffafe","#e0e7ff","#fef9c3","#d1fae5","#ffe4e6","#f0fdf4"];
export const AV_CLR = ["#1e40af","#166534","#92400e","#9d174d","#0e7490","#3730a3","#854d0e","#065f46","#9f1239","#14532d"];
