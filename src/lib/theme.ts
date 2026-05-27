import { Provider } from "../types";

export interface ThemeColors {
  primaryBg: string;
  bgLight: string;
  bgLighter: string;
  borderActive: string;
  borderSoft: string;
  textAccent: string;
  textAccentLight: string;
  shadow: string;
  shadowSoft: string;
  hex: string;
  spinnerSecondary: string;
}

export const getTheme = (provider: Provider): ThemeColors => {
  if (provider === 'bigwin') {
    return {
      primaryBg: "bg-green-600",
      bgLight: "bg-green-500/10",
      bgLighter: "bg-green-500/5",
      borderActive: "border-green-500",
      borderSoft: "border-green-500/30",
      textAccent: "text-green-500",
      textAccentLight: "text-green-400",
      shadow: "shadow-green-600/20",
      shadowSoft: "shadow-green-500/5",
      hex: "#22c55e",
      spinnerSecondary: "border-emerald-400"
    };
  } else if (provider === 'sixlottery') {
    return {
      primaryBg: "bg-red-600",
      bgLight: "bg-red-500/10",
      bgLighter: "bg-red-500/5",
      borderActive: "border-red-500",
      borderSoft: "border-red-500/30",
      textAccent: "text-red-500",
      textAccentLight: "text-red-400",
      shadow: "shadow-red-600/20",
      shadowSoft: "shadow-red-500/5",
      hex: "#ef4444",
      spinnerSecondary: "border-orange-400"
    };
  } else {
    // CK
    return {
      primaryBg: "bg-blue-600",
      bgLight: "bg-blue-500/10",
      bgLighter: "bg-blue-500/5",
      borderActive: "border-blue-500",
      borderSoft: "border-blue-500/30",
      textAccent: "text-blue-500",
      textAccentLight: "text-blue-400",
      shadow: "shadow-blue-600/20",
      shadowSoft: "shadow-blue-500/5",
      hex: "#3b82f6",
      spinnerSecondary: "border-indigo-400"
    };
  }
};
