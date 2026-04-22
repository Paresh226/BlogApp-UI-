export const slugify = (value) => {
  const text = (value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return text || 'post'
}

export const createDraftPost = () => {
  return {
    title: '',
    slug: 'new-post',
    excerpt: '',
    content: '',
    imageUrl: '',
    published: false,
    removeImage: false,
    imageFile: null,
  }
}

export const toUpsertFormData = (draft) => {
  const fd = new FormData()
  fd.set('title', draft.title || '')
  fd.set('slug', draft.slug || '')
  fd.set('excerpt', draft.excerpt || '')
  fd.set('content', draft.content || '')
  fd.set('published', String(Boolean(draft.published)))
  fd.set('removeImage', String(Boolean(draft.removeImage)))
  if (draft.imageFile) fd.set('image', draft.imageFile)
  return fd
}
