import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Users, Instagram, ShoppingCart, CheckCircle2, Circle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Recipe, IngredientCategory } from '../types'

const CATEGORY_COLORS: Record<IngredientCategory, string> = {
  veg: 'bg-green-100 text-green-700',
  meat: 'bg-red-100 text-red-700',
  fish: 'bg-blue-100 text-blue-700',
  dairy: 'bg-yellow-100 text-yellow-700',
  bakery: 'bg-orange-100 text-orange-700',
  cupboard: 'bg-gray-100 text-gray-700',
  frozen: 'bg-cyan-100 text-cyan-700',
  other: 'bg-purple-100 text-purple-700',
}

const CATEGORY_ORDER: IngredientCategory[] = [
  'veg', 'meat', 'fish', 'dairy', 'bakery', 'cupboard', 'frozen', 'other',
]

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set())
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!id) return
    supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setRecipe(data as Recipe | null)
        setLoading(false)
      })
  }, [id])

  const toggleStep = (i: number) =>
    setCheckedSteps((prev) => {
      const n = new Set(prev)
      n.has(i) ? n.delete(i) : n.add(i)
      return n
    })

  const toggleIngredient = (i: number) =>
    setCheckedIngredients((prev) => {
      const n = new Set(prev)
      n.has(i) ? n.delete(i) : n.add(i)
      return n
    })

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Recipe not found</p>
        <Link to="/catalog" className="mt-4 inline-block text-brand-600 font-medium">
          Back to catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <nav className="text-sm text-gray-500">
          <Link to="/catalog" className="hover:text-brand-600">
            Catalog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{recipe.title}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {recipe.thumbnail_url ? (
              <img
                src={recipe.thumbnail_url}
                alt={recipe.title}
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="aspect-video bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center text-5xl">
                🍽️
              </div>
            )}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-gray-500 mt-2">{recipe.description}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                {recipe.servings && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {recipe.servings} servings
                  </span>
                )}
                {recipe.prep_time && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Prep: {recipe.prep_time}
                  </span>
                )}
                {recipe.cook_time && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Cook: {recipe.cook_time}
                  </span>
                )}
                {recipe.instagram_url && (
                  <a
                    href={recipe.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-pink-500 hover:text-pink-600"
                  >
                    <Instagram className="w-4 h-4" />
                    {recipe.instagram_creator
                      ? `@${recipe.instagram_creator}`
                      : 'View original reel'}
                  </a>
                )}
              </div>
              {recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Method</h2>
            <ol className="space-y-4">
              {recipe.method.map((methodStep, i) => (
                <li
                  key={i}
                  className="flex gap-4 items-start cursor-pointer"
                  onClick={() => toggleStep(i)}
                >
                  <button
                    className={`shrink-0 mt-0.5 transition-colors ${
                      checkedSteps.has(i) ? 'text-green-500' : 'text-gray-300'
                    }`}
                  >
                    {checkedSteps.has(i) ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <p
                    className={`text-sm leading-relaxed transition-colors ${
                      checkedSteps.has(i) ? 'text-gray-400 line-through' : 'text-gray-700'
                    }`}
                  >
                    <span className="font-semibold text-brand-600 mr-1">Step {i + 1}.</span>
                    {methodStep}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Ingredients</h2>
              <Link
                to="/shopping"
                state={{ recipeId: recipe.id }}
                className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to list
              </Link>
            </div>

            {CATEGORY_ORDER.map((category) => {
              const items = recipe.ingredients
                .map((ing, idx) => ({ ing, idx }))
                .filter(({ ing }) => ing.category === category)
              if (items.length === 0) return null
              return (
                <div key={category} className="mb-4">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                      CATEGORY_COLORS[category]
                    }`}
                  >
                    {category}
                  </span>
                  <ul className="mt-2 space-y-1.5">
                    {items.map(({ ing, idx }) => (
                      <li
                        key={idx}
                        onClick={() => toggleIngredient(idx)}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <button
                          className={`shrink-0 transition-colors ${
                            checkedIngredients.has(idx)
                              ? 'text-green-500'
                              : 'text-gray-300 group-hover:text-gray-400'
                          }`}
                        >
                          {checkedIngredients.has(idx) ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <span
                          className={`text-sm transition-colors ${
                            checkedIngredients.has(idx) ? 'text-gray-400 line-through' : 'text-gray-700'
                          }`}
                        >
                          {ing.quantity && (
                            <span className="font-medium">
                              {ing.quantity}
                              {ing.unit ? ` ${ing.unit}` : ''}{' '}
                            </span>
                          )}
                          {ing.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
