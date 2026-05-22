import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, ShoppingCart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import RecipeCard from '../components/RecipeCard'
import type { Recipe } from '../types'

export default function Home() {
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([])
  const [totalRecipes, setTotalRecipes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('recipes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data, count }) => {
        setRecentRecipes((data as Recipe[]) ?? [])
        setTotalRecipes(count ?? 0)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-500 mt-1">Your recipe collection from Instagram</p>
        </div>
        <Link
          to="/add"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Recipe
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Saved Recipes', value: String(totalRecipes), icon: BookOpen, color: 'bg-blue-50 text-blue-600', to: '/catalog' },
          { label: 'Add New', value: 'From Instagram', icon: Plus, color: 'bg-brand-50 text-brand-600', to: '/add' },
          { label: 'Shopping List', value: 'Build yours', icon: ShoppingCart, color: 'bg-green-50 text-green-600', to: '/shopping' },
        ].map(({ label, value, icon: Icon, color, to }) => (
          <Link
            key={label}
            to={to}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{label}</div>
              <div className="font-semibold text-gray-900">{value}</div>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recently Added</h2>
          <Link to="/catalog" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recentRecipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="font-medium text-gray-600">No recipes yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first recipe from an Instagram reel</p>
            <Link
              to="/add"
              className="mt-4 inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
