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
      description: 'La marque, affichée en majuscules sur la carte (ex. LaQuan Smith). Pour la GFC : la marque si la vidéo est centrée sur un créateur, « Global Fashion Collective » pour un show à plusieurs.',
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
      name: 'season',
      title: 'Saison ou événement',
      type: 'string',
      description: 'Dernière ligne de la carte (ex. New York FW SS27). Vide : le libellé de la catégorie s’affiche à sa place.',
    }),
    lienField('videoUrl', 'Lien vidéo', 'Où mène un clic sur la carte (YouTube, Vimeo…). Vide : la carte n’est pas cliquable.'),
    ordreField('de la carte dans sa catégorie'),
  ],
  preview: {
    select: { client: 'client', title: 'title', category: 'category.label', season: 'season', media: 'thumbnail' },
    prepare: ({ client, title, category, season, media }) => ({
      title: `${client ?? ''} — ${title ?? ''}`,
      subtitle: [category, season].filter(Boolean).join(' · '),
      media,
    }),
  },
  orderings: [{ title: 'Ordre', name: 'ordreAsc', by: [{ field: 'ordre', direction: 'asc' }] }],
})
