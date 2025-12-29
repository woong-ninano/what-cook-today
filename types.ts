
export interface UserChoices {
  mode: 'fridge' | 'seasonal' | 'convenience';
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
  id?: number; // Supabase DB ID (Optional)
  dishName: string;
  comment: string;
  ingredientsList: string; // HTML format <ul><li>
  easyRecipe: string;
  gourmetRecipe: string;
  similarRecipes: SimilarRecipe[];
  referenceLinks: ReferenceLink[];
  imageUrl?: string;
  thumbnailUrl?: string; // 썸네일 URL 추가
  created_at?: string; // DB created_at
  rating_sum?: number;
  rating_count?: number;
  download_count?: number;
  vote_success?: number;
  vote_fail?: number;
  comment_count?: number;
}

export interface Comment {
  id: number;
  recipe_id: number;
  user_id: string;
  user_email: string;
  content: string;
  created_at: string;
}

export enum Step {
  Welcome = 0,
  ModeSelection = 1,
  Ingredients = 2,
  SeasonalSelection = 3,
  ConvenienceSelection = 4,
  CuisineSelection = 5,
  Suggestions = 6,
  Preferences = 7,
  Environment = 8,
  Loading = 9,
  Result = 10,
  Community = 11 // New Step for Community View
}
