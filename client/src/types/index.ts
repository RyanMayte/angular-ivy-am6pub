export type IngredientCategory = 'veg' | 'meat' | 'fish' | 'dairy' | 'bakery' | 'cupboard' | 'frozen' | 'other'

export interface Ingredient {
  name: string
  quantity: string
  unit: string
  category: IngredientCategory
}

export interface Recipe {
  id: string
  user_id: string
  title: string
  description?: string
  instagram_url?: string
  instagram_creator?: string
  thumbnail_url?: string
  ingredients: Ingredient[]
  method: string[]
  tags: string[]
  servings?: number
  prep_time?: string
  cook_time?: string
  created_at: string
  updated_at: string
}

export interface ExtractedRecipe {
  title: string
  description?: string
  servings?: number
  prep_time?: string
  cook_time?: string
  ingredients: Ingredient[]
  method: string[]
  tags: string[]
  error?: string
}
