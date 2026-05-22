import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import RecipeCard from '../components/RecipeCard'
import type { Recipe } from '../types'

export default function Catalog() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRecipes((data as Recipe[]) ?? [])
        setLoading(false)
      })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recipe?')) return
    await supabase.from('recipes').delete().eq('id', id)
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  const filtered = recipes.filter(
    (r) =>
      search === '' ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      (r.instagram_creator ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recipe Catalog</h1>
        <Link
          to="/add"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Recipe
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, tag, or creator..."
          className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-medium text-gray-600">
            {search ? 'No recipes match your search' : 'No recipes yet'}
          </p>
          {!search && (
            <Link
              to="/add"
              className="mt-4 inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first recipe
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
