
export interface UserChoices {
  ingredients: string;
  sauces: string[];
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
}

export enum Step {
  Welcome = 0,
  Ingredients = 1,
  Suggestions = 2,
  Preferences = 3,
  Environment = 4,
  Loading = 5,
  Result = 6
}
