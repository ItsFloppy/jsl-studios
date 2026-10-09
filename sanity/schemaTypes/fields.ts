import { defineField } from 'sanity'

/**
 * The `ordre` field shared by every ordered list (films, projects, categories, groups,
 * sectors, partners). Lists sort by it, then by creation date, so a new document lands at
 * the end without anyone having to number it.
 */
export function ordreField(lieu: string) {
  return defineField({
    name: 'ordre',
    title: 'Ordre',
    type: 'number',
    description: `Position ${lieu} : le plus petit nombre passe en premier. Laissez des écarts (10, 20, 30…) pour pouvoir intercaler plus tard.`,
    initialValue: 100,
    validation: (Rule) => Rule.required().integer(),
  })
}

/** An http(s) link field. */
export function lienField(name: string, title: string, description?: string) {
  return defineField({
    name,
    title,
    type: 'url',
    description,
    validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
  })
}

/** The `alt` sub-field of an image: what a screen reader says in its place. */
export function altField(description: string) {
  return defineField({
    name: 'alt',
    title: 'Texte alternatif',
    type: 'string',
    description,
  })
}
