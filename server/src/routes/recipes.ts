import { Router, type Request, type Response } from 'express'
import { extractRecipeFromText } from '../services/claude.js'
import { fetchInstagramCaption } from '../services/instagram.js'

const router = Router()

router.post('/extract-recipe', async (req: Request, res: Response) => {
  const { instagramUrl, captionText } = req.body as {
    instagramUrl?: string
    captionText?: string
  }

  if (!instagramUrl && !captionText) {
    res.status(400).json({ message: 'Provide an Instagram URL or caption text' })
    return
  }

  try {
    let text = captionText?.trim() ?? ''

    if (!text && instagramUrl) {
      const fetched = await fetchInstagramCaption(instagramUrl)
      if (fetched) text = fetched
    }

    if (!text) {
      res.status(400).json({
        message:
          'Could not fetch caption automatically. Please paste the recipe caption from the reel.',
      })
      return
    }

    const recipe = await extractRecipeFromText(text, instagramUrl)
    res.json(recipe)
  } catch (err) {
    console.error('Extraction error:', err)
    res.status(500).json({ message: 'Failed to extract recipe' })
  }
})

export default router
