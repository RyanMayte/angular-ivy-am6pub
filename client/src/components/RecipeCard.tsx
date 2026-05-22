import { Link } from 'react-router-dom'
import { Clock, Users, Instagram, Trash2 } from 'lucide-react'
import type { Recipe } from '../types'

interface Props {
  recipe: Recipe
  onDelete?: (id: string) => void
}

export default function RecipeCard({ recipe, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
      {recipe.thumbnail_url ? (
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={recipe.thumbnail_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center">
          <span className="text-4xl">🍽️</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/recipe/${recipe.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2">
              {recipe.title}
            </h3>
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(recipe.id)}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1"
              aria-label="Delete recipe"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {recipe.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
        )}

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {recipe.servings}
            </span>
          )}
          {(recipe.prep_time ?? recipe.cook_time) && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {[recipe.prep_time, recipe.cook_time].filter(Boolean).join(' + ')}
            </span>
          )}
          {recipe.instagram_url && (
            <a
              href={recipe.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-pink-500 hover:text-pink-600 ml-auto"
            >
              <Instagram className="w-3.5 h-3.5" />
              {recipe.instagram_creator ? `@${recipe.instagram_creator}` : 'Reel'}
            </a>
          )}
        </div>

        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 text-xs text-gray-400">{recipe.ingredients.length} ingredients</div>
      </div>
    </div>
  )
}
