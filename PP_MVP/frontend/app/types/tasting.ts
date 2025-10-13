/**
 * Tasting Note Types
 * 
 * Standardized vocabulary for wine tasting notes to enable
 * consistent data collection and palate profile building.
 */

export type TastingNoteCreate = {
  wine_id: number;
  // Appearance
  appearance_clarity?: "Clear" | "Hazy" | "Cloudy";
  appearance_color?: string;
  appearance_intensity?: "Pale" | "Medium" | "Deep";
  // Aroma
  aroma_primary?: "Fruit" | "Floral" | "Herbal";
  aroma_secondary?: "Yeast" | "Butter" | "Vanilla" | "Toast";
  aroma_tertiary?: "Earth" | "Leather" | "Mushroom" | "Dried Fruit";
  // Palate (1–5 scales)
  palate_sweetness?: number;
  palate_acidity?: number;
  palate_tannin?: number;
  palate_body?: number;
  palate_alcohol?: number;
  // Freeform
  flavor_characteristics?: string;
  finish_length?: number; // 1–5
};

export const CLARITY = ["Clear", "Hazy", "Cloudy"] as const;
export const INTENSITY = ["Pale", "Medium", "Deep"] as const;
export const AROMA_PRIMARY = ["Fruit", "Floral", "Herbal"] as const;
export const AROMA_SECONDARY = ["Yeast", "Butter", "Vanilla", "Toast"] as const;
export const AROMA_TERTIARY = ["Earth", "Leather", "Mushroom", "Dried Fruit"] as const;

