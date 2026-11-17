import { TagsIcon } from '@sanity/icons/Tags'
import { defineField, defineType } from 'sanity'
import { ordreField } from './fields'

/**
 * A filter of the Network mosaic (/about#network). A sector with no partner is hidden. A
 * highlighted sector (the institutional partners) is not a filter: its partners show as a
 * row of their own above the mosaic.
 */
export const networkSector = defineType({
  name: 'networkSector',
  title: 'Secteur (Network)',
  type: 'document',
  icon: TagsIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nom',
      type: 'string',
      description: 'Ex. Fashion & Luxury. Devient un bouton de filtre au-dessus de la mosaïque.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'highlight',
      title: 'Mettre en avant',
      type: 'boolean',
      description: 'Ses partenaires s’affichent en bandeau au-dessus des filtres, hors de la mosaïque (ex. Institutional partners).',
      initialValue: false,
    }),
    ordreField('du bouton de filtre'),
  ],
  preview: {
    select: { title: 'title', highlight: 'highlight' },
    prepare: ({ title, highlight }) => ({ title, subtitle: highlight ? 'Bandeau mis en avant' : undefined }),
  },
  orderings: [{ title: 'Ordre', name: 'ordreAsc', by: [{ field: 'ordre', direction: 'asc' }] }],
})
