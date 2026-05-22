import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Instagram, Wand2, Plus, Minus, Save, AlertCircle } from 'lucide-react'
import { extractRecipe } from '../lib/api'
import { supabase } from '../lib/supabase'
import type { ExtractedRecipe, Ingredient, IngredientCategory } from '../types'

const CATEGORIES: IngredientCategory[] = [
  'veg', 'meat', 'fish', 'dairy', 'bakery', 'cupboard', 'frozen', 'other',
]

export default function AddRecipe() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<'input' | 'review'>('input')
  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [saving, setSaving] = useState(false)
  const [recipe, setRecipe] = useState<ExtractedRecipe | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState('')

  const handleExtract = async () => {
    if (!url && !caption) {
      setExtractError('Please provide an Instagram URL or paste the recipe caption')
      return
    }
    setExtracting(true)
    setExtractError('')
    try {
      const extracted = await extractRecipe(url, caption)
      if (extracted.error) {
        setExtractError(extracted.error)
      } else {
        setRecipe(extracted)
        setCurrentStep('review')
      }
    } catch (e) {
      setExtractError(e instanceof Error ? e.message : 'Failed to extract recipe')
    } finally {
      setExtracting(false)
    }
  }

  const handleSave = async () => {
    if (!recipe) return
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        instagram_url: url || null,
        thumbnail_url: thumbnailUrl || null,
        ingredients: recipe.ingredients,
        method: recipe.method,
        tags: recipe.tags,
        servings: recipe.servings ?? null,
        prep_time: recipe.prep_time ?? null,
        cook_time: recipe.cook_time ?? null,
      })
      .select()
      .single()
    setSaving(false)
    if (!error && data) navigate(`/recipe/${(data as { id: string }).id}`)
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    if (!recipe) return
    const updated = [...recipe.ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setRecipe({ ...recipe, ingredients: updated })
  }

  const addIngredient = () => {
    if (!recipe) return
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { name: '', quantity: '', unit: '', category: 'cupboard' }],
    })
  }

  const removeIngredient = (index: number) => {
    if (!recipe) return
    setRecipe({ ...recipe, ingredients: recipe.ingredients.filter((_, i) => i !== index) })
  }

  const updateMethodStep = (index: number, value: string) => {
    if (!recipe) return
    const updated = [...recipe.method]
    updated[index] = value
    setRecipe({ ...recipe, method: updated })
  }

  const addMethodStep = () => {
    if (!recipe) return
    setRecipe({ ...recipe, method: [...recipe.method, ''] })
  }

  const removeMethodStep = (index: number) => {
    if (!recipe) return
    setRecipe({ ...recipe, method: recipe.method.filter((_, i) => i !== index) })
  }

  if (currentStep === 'review' && recipe) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Recipe</h1>
            <p className="text-gray-500 text-sm mt-1">Edit any details before saving</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep('input')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Recipe'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Info</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={recipe.title}
                onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={recipe.description ?? ''}
                onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                <input
                  type="number"
                  value={recipe.servings ?? ''}
                  onChange={(e) =>
                    setRecipe({ ...recipe, servings: parseInt(e.target.value) || undefined })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prep time</label>
                <input
                  value={recipe.prep_time ?? ''}
                  onChange={(e) => setRecipe({ ...recipe, prep_time: e.target.value })}
                  placeholder="10 mins"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cook time</label>
                <input
                  value={recipe.cook_time ?? ''}
                  onChange={(e) => setRecipe({ ...recipe, cook_time: e.target.value })}
                  placeholder="30 mins"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Ingredients</h2>
              <button
                onClick={addIngredient}
                className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                <span className="col-span-1">Qty</span>
                <span className="col-span-1">Unit</span>
                <span className="col-span-5">Name</span>
                <span className="col-span-4">Category</span>
              </div>
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(i, 'quantity', e.target.value)}
                    placeholder="2"
                    className="col-span-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <input
                    value={ing.unit}
                    onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                    placeholder="g"
                    className="col-span-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <input
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                    placeholder="Ingredient"
                    className="col-span-5 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <select
                    value={ing.category}
                    onChange={(e) => updateIngredient(i, 'category', e.target.value)}
                    className="col-span-4 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeIngredient(i)}
                    className="col-span-1 text-gray-400 hover:text-red-500 flex justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Method</h2>
              <button
                onClick={addMethodStep}
                className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add step
              </button>
            </div>
            <div className="space-y-3">
              {recipe.method.map((methodStep, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center mt-1.5">
                    {i + 1}
                  </span>
                  <textarea
                    value={methodStep}
                    onChange={(e) => updateMethodStep(i, e.target.value)}
                    rows={2}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={() => removeMethodStep(i)}
                    className="text-gray-400 hover:text-red-500 mt-2"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Tags</h2>
            <input
              value={recipe.tags.join(', ')}
              onChange={(e) =>
                setRecipe({
                  ...recipe,
                  tags: e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="italian, pasta, quick, vegetarian..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Recipe from Instagram</h1>
      <p className="text-gray-500 mb-8">
        Paste an Instagram reel URL and the recipe caption — Claude AI will extract everything for
        you.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <Instagram className="w-4 h-4 text-pink-500" />
            Instagram Reel URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-xs text-gray-400 mt-1">Stored as a link back to the original reel</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Recipe Caption / Text{' '}
            <span className="text-gray-400 font-normal">(paste from the reel)</span>
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={8}
            placeholder={`Creamy Pasta Carbonara 🍝\n\nIngredients:\n- 200g spaghetti\n- 3 egg yolks\n- 100g pancetta\n...`}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">
            Tip: tap the caption in Instagram to expand it, then long-press to copy all the text
          </p>
        </div>

        {extractError && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {extractError}
          </div>
        )}

        <button
          onClick={handleExtract}
          disabled={extracting || (!url && !caption)}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          <Wand2 className="w-5 h-5" />
          {extracting ? 'Extracting recipe with AI...' : 'Extract Recipe with AI'}
        </button>
      </div>
    </div>
  )
}
