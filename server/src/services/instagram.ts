export async function fetchInstagramCaption(url: string): Promise<string | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return null

  try {
    const endpoint = new URL('https://graph.facebook.com/v18.0/instagram_oembed')
    endpoint.searchParams.set('url', url)
    endpoint.searchParams.set('access_token', token)
    endpoint.searchParams.set('fields', 'title,author_name,thumbnail_url')

    const res = await fetch(endpoint.toString())
    if (!res.ok) return null

    const data = (await res.json()) as { title?: string }
    return data.title ?? null
  } catch {
    return null
  }
}
