import { FolderIcon } from '@sanity/icons/Folder'
import { defineField, defineType } from 'sanity'
import { ordreField } from './fields'

/** A section of the Productions page (/productions). A category with no project is hidden. */
export const productionCategory = defineType({
  name: 'productionCategory',
  title: 'Catégorie (Productions)',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de la section',
      type: 'string',
      description: 'Au pluriel, en tête de section (ex. Fashion films).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Libellé sur les cartes',
      type: 'string',
      description: 'Au singulier, après l’année sur chaque carte (ex. « 2026 · Fashion film »).',
      validation: (Rule) => Rule.required(),
    }),
    ordreField('de la section sur la page Productions'),
  ],
  preview: {
    select: { title: 'title', subtitle: 'label' },
  },
  orderings: [{ title: 'Ordre', name: 'ordreAsc', by: [{ field: 'ordre', direction: 'asc' }] }],
})
