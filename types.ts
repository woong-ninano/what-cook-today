
export interface UserChoices {
  mode: 'fridge' | 'seasonal';
  ingredients: string;
  sauces: string[];
  cuisine: string;
  partner: string;
  theme: string;
  tools: string[];
  level: string;
}

export interface SimilarRecipe {
  title: string;
  reason: string;
}

export interface ReferenceLink {
  title: string;
  url: string;
}

export interface RecipeResult {
  dishName: string;
  comment: string;
  easyRecipe: string;
  gourmetRecipe: string;
  similarRecipes: SimilarRecipe[];
  referenceLinks: ReferenceLink[];
  imageUrl?: string;
}

export enum Step {
  Welcome = 0,
  ModeSelection = 1,
  Ingredients = 2,
  SeasonalSelection = 3,
  CuisineSelection = 4,
  Suggestions = 5,
  Preferences = 6,
  Environment = 7,
  Loading = 8,
  Result = 9
}
