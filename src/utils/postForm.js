export const slugify = (value) => {
  const text = (value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return text || 'post'
}

export const createDraftPost = () => ({
  title: '',
  slug: 'new-post',
  excerpt: '',
  content: '',
  imageUrl: '',
  published: false,
  removeImage: false,
  imageFile: null,
})

export const toUpsertFormData = (draft) => {
  const formData = new FormData()

  formData.set('title', draft.title || '')
  formData.set('slug', draft.slug || '')
  formData.set('excerpt', draft.excerpt || '')
  formData.set('content', draft.content || '')
  formData.set('published', String(Boolean(draft.published)))
  formData.set('removeImage', String(Boolean(draft.removeImage)))

  if (draft.imageFile) {
    formData.set('image', draft.imageFile)
  }

  return formData
}
