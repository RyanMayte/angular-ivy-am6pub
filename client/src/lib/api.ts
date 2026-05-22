import type { ExtractedRecipe } from '../types'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

export async function extractRecipe(
  instagramUrl: string,
  captionText: string,
): Promise<ExtractedRecipe> {
  const response = await fetch(`${API_URL}/api/extract-recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instagramUrl, captionText }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Failed to extract recipe' }))
    throw new Error((err as { message?: string }).message ?? 'Failed to extract recipe')
  }

  return response.json() as Promise<ExtractedRecipe>
}
