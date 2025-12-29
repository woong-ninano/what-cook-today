
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
  id?: number; 
  dishName: string;
  comment: string;
  ingredientsList: string; 
  easyRecipe: string;
  gourmetRecipe: string;
  similarRecipes: SimilarRecipe[];
  referenceLinks: ReferenceLink[];
  imageUrl?: string;
  thumbnailUrl?: string; 
  created_at?: string; 
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

export interface CommunityCache {
  recipes: RecipeResult[];
  searchTerm: string;
  sortBy: 'latest' | 'rating' | 'success' | 'comments';
  page: number;
  hasMore: boolean;
  scrollPosition: number;
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
  Community = 11
}
