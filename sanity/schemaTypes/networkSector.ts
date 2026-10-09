import { TagsIcon } from '@sanity/icons/Tags'
import { defineField, defineType } from 'sanity'
import { ordreField } from './fields'

/** A filter of the Network mosaic (/about#network). A sector with no partner is hidden. */
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
    ordreField('du bouton de filtre'),
  ],
  preview: {
    select: { title: 'title' },
  },
  orderings: [{ title: 'Ordre', name: 'ordreAsc', by: [{ field: 'ordre', direction: 'asc' }] }],
})
