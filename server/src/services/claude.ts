import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Extract structured recipe data from Instagram caption text and return ONLY valid JSON — no markdown, no explanation.

Return exactly this structure:
{
  "title": "Recipe name",
  "description": "One sentence summary",
  "servings": 4,
  "prep_time": "10 mins",
  "cook_time": "30 mins",
  "ingredients": [
    {
      "name": "ingredient name (lowercase, singular)",
      "quantity": "numeric amount as string e.g. '2', '0.5', '100'",
      "unit": "g/kg/ml/l/tbsp/tsp/cup/clove/bunch/pinch/slice or empty string",
      "category": "veg|meat|fish|dairy|bakery|cupboard|frozen|other"
    }
  ],
  "method": ["Step 1...", "Step 2..."],
  "tags": ["cuisine", "meal-type", "dietary-info"]
}

Category guide:
- veg: fresh vegetables, salad, fruit, herbs
- meat: beef, chicken, pork, lamb, bacon, sausages
- fish: fish, prawns, shellfish, tinned fish
- dairy: milk, cream, cheese, butter, eggs, yogurt
- bakery: bread, flour, pastry, baking powder, yeast
- cupboard: tinned goods, pasta, rice, oil, vinegar, sauces, spices, sugar, stock
- frozen: frozen vegetables, ice cream, frozen pastry
- other: anything else

If servings, prep_time or cook_time are not mentioned set them to null.
If no recipe is found return: {"error": "No recipe found"}`

export async function extractRecipeFromText(
  text: string,
  url?: string,
): Promise<Record<string, unknown>> {
  const userContent = url ? `Instagram reel URL: ${url}\n\nCaption:\n${text}` : text

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  })

  const block = message.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')

  const json = block.text.trim()
  return JSON.parse(json) as Record<string, unknown>
}
