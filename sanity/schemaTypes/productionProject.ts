import { VideoIcon } from '@sanity/icons/Video'
import { defineField, defineType } from 'sanity'
import { altField, lienField, ordreField } from './fields'

/** A card of the Production page, inside its category's section. */
export const productionProject = defineType({
  name: 'productionProject',
  title: 'Projet (Productions)',
  type: 'document',
  icon: VideoIcon,
  fields: [
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'Affiché en majuscules sur la carte, quelle que soit la saisie (ex. LaQuan Smith, GFC FW26).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'reference',
      to: [{ type: 'productionCategory' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Vignette',
      type: 'image',
      description: 'Format 16:9. Le point focal (hotspot) choisit ce qui reste visible au recadrage.',
      options: { hotspot: true },
      fields: [altField('Par défaut : « <client> — <titre> ».')],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Année',
      type: 'number',
      validation: (Rule) => Rule.integer().min(1900).max(2100),
    }),
    lienField('videoUrl', 'Lien vidéo', 'Où mène un clic sur la carte (YouTube, Vimeo…). Vide : la carte n’est pas cliquable.'),
    ordreField('de la carte dans sa catégorie'),
  ],
  preview: {
    select: { client: 'client', title: 'title', category: 'category.label', year: 'year', media: 'thumbnail' },
    prepare: ({ client, title, category, year, media }) => ({
      title: `${client ?? ''} — ${title ?? ''}`,
      subtitle: [year, category].filter(Boolean).join(' · '),
      media,
    }),
  },
  orderings: [{ title: 'Ordre', name: 'ordreAsc', by: [{ field: 'ordre', direction: 'asc' }] }],
})
