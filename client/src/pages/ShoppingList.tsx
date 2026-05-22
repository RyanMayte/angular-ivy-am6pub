import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ShoppingCart, CheckSquare, Square, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Recipe, IngredientCategory } from '../types'

const SECTIONS: { category: IngredientCategory; label: string; emoji: string; color: string }[] = [
  { category: 'veg', label: 'Fruit & Veg', emoji: '🥦', color: 'bg-green-50 border-green-200' },
  { category: 'meat', label: 'Meat', emoji: '🥩', color: 'bg-red-50 border-red-200' },
  { category: 'fish', label: 'Fish & Seafood', emoji: '🐟', color: 'bg-blue-50 border-blue-200' },
  { category: 'dairy', label: 'Dairy & Eggs', emoji: '🧀', color: 'bg-yellow-50 border-yellow-200' },
  { category: 'bakery', label: 'Bakery', emoji: '🍞', color: 'bg-orange-50 border-orange-200' },
  { category: 'cupboard', label: 'Cupboard', emoji: '🥫', color: 'bg-gray-50 border-gray-200' },
  { category: 'frozen', label: 'Frozen', emoji: '🧣', color: 'bg-cyan-50 border-cyan-200' },
  { category: 'other', label: 'Other', emoji: '🛍️', color: 'bg-purple-50 border-purple-200' },
]

interface ListItem {
  name: string
  quantity: string
  unit: string
  category: IngredientCategory
  checked: boolean
  recipeNames: string[]
}

export default function ShoppingListPage() {
  const location = useLocation()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [items, setItems] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('recipes')
      .select('*')
      .order('title')
      .then(({ data }) => {
        setRecipes((data as Recipe[]) ?? [])
        setLoading(false)
        const state = location.state as { recipeId?: string } | null
        if (state?.recipeId) setSelectedIds(new Set([state.recipeId]))
      })
  }, [location.state])

  useEffect(() => {
    const selected = recipes.filter((r) => selectedIds.has(r.id))
    const map = new Map<string, ListItem>()

    for (const recipe of selected) {
      for (const ing of recipe.ingredients) {
        const key = `${ing.name.toLowerCase().trim()}__${ing.unit}`
        const existing = map.get(key)
        if (existing) {
          const a = parseFloat(existing.quantity)
          const b = parseFloat(ing.quantity)
          if (!isNaN(a) && !isNaN(b)) existing.quantity = String(a + b)
          if (!existing.recipeNames.includes(recipe.title))
            existing.recipeNames.push(recipe.title)
        } else {
          map.set(key, {
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category,
            checked: false,
            recipeNames: [recipe.title],
          })
        }
      }
    }
    setItems(Array.from(map.values()))
  }, [selectedIds, recipes])

  const toggleRecipe = (id: string) =>
    setSelectedIds((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  const toggleItem = (index: number) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item)))

  const exportList = () => {
    const lines: string[] = ['Shopping List', '=============', '']
    for (const section of SECTIONS) {
      const sectionItems = items.filter((i) => i.category === section.category && !i.checked)
      if (sectionItems.length === 0) continue
      lines.push(`${section.emoji} ${section.label}`)
      for (const item of sectionItems) {
        lines.push(`  □ ${item.quantity}${item.unit ? ' ' + item.unit : ''} ${item.name}`)
      }
      lines.push('')
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'shopping-list.txt'
    a.click()
  }

  const checkedCount = items.filter((i) => i.checked).length

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
          <p className="text-gray-500 text-sm mt-1">Select recipes to build your list</p>
        </div>
        <div className="flex gap-2">
          {checkedCount > 0 && (
            <button
              onClick={() => setItems((prev) => prev.map((i) => ({ ...i, checked: false })))}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <CheckSquare className="w-4 h-4" /> Uncheck all
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={exportList}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-3">Select Recipes</h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No recipes saved yet</p>
          ) : (
            <div className="space-y-1">
              {recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => toggleRecipe(recipe.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedIds.has(recipe.id)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {selectedIds.has(recipe.id) ? (
                    <CheckSquare className="w-4 h-4 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 shrink-0 text-gray-400" />
                  )}
                  <span className="line-clamp-1 flex-1">{recipe.title}</span>
                  <span className="text-xs text-gray-400 shrink-0">{recipe.ingredients.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedIds.size === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium text-gray-500">Select recipes to build your list</p>
              <p className="text-sm mt-1">Ingredients will be combined and organised by shop section</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                {items.length} items from {selectedIds.size} recipe
                {selectedIds.size !== 1 ? 's' : ''}
                {checkedCount > 0 && ` · ${checkedCount} ticked off`}
              </p>

              {SECTIONS.map((section) => {
                const sectionItems = items
                  .map((item, idx) => ({ item, idx }))
                  .filter(({ item }) => item.category === section.category)
                if (sectionItems.length === 0) return null
                return (
                  <div key={section.category} className={`rounded-xl border p-4 ${section.color}`}>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {section.emoji} {section.label}
                      <span className="text-xs font-normal text-gray-500 ml-2">
                        ({sectionItems.length})
                      </span>
                    </h3>
                    <ul className="space-y-2">
                      {sectionItems.map(({ item, idx }) => (
                        <li
                          key={idx}
                          onClick={() => toggleItem(idx)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <button
                            className={`shrink-0 transition-colors ${
                              item.checked
                                ? 'text-green-500'
                                : 'text-gray-400 group-hover:text-gray-600'
                            }`}
                          >
                            {item.checked ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <span
                            className={`text-sm flex-1 ${
                              item.checked ? 'text-gray-400 line-through' : 'text-gray-800'
                            }`}
                          >
                            {item.quantity && (
                              <span className="font-medium">
                                {item.quantity}
                                {item.unit ? ` ${item.unit}` : ''}{' '}
                              </span>
                            )}
                            {item.name}
                          </span>
                          {item.recipeNames.length > 1 && (
                            <span className="text-xs text-gray-400 italic shrink-0">
                              {item.recipeNames.length} recipes
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
