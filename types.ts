
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
  TaskSelection = 1,
  Ingredients = 2,
  Suggestions = 3, // AI 추천 부재료/양념 단계 추가
  Preferences = 4,
  Environment = 5,
  Loading = 6,
  Result = 7
}
