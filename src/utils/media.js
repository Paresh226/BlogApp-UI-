import { resolveApiUrl } from '../api/client.js'

export const resolveImageSrc = (imageUrl) => {
  if (!imageUrl) {
    return ''
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  return resolveApiUrl(imageUrl)
}
