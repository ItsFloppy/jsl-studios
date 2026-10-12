import { DocumentVideoIcon } from '@sanity/icons/DocumentVideo'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { altField, lienField, ordreField } from './fields'

/**
 * A feature film of the Studio page (/studios), one card each. Cards alternate left and
 * right in `ordre`; an empty optional field simply leaves its line out of the card.
 */
export const film = defineType({
  name: 'film',
  title: 'Film (Studios)',
  type: 'document',
  icon: DocumentVideoIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'stills',
      title: 'Images',
      type: 'array',
      description:
        'Format 16:9. La première s’affiche sur la carte ; avec plusieurs images, elles défilent au survol. Utilisez le point focal (hotspot) pour choisir ce qui reste visible au recadrage.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [altField('Par défaut : « <titre> — still ». À préciser si l’image est une affiche.')],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'genres',
      title: 'Genres',
      type: 'array',
      description: 'Affichés en pastilles sous le titre (ex. Comedy, Time travel).',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'year',
      title: 'Année',
      type: 'number',
      validation: (Rule) => Rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: 'directedBy',
      title: 'Écrit et réalisé par',
      type: 'string',
      initialValue: 'Justin Souriau-Levine',
    }),
    defineField({
      name: 'starring',
      title: 'Avec (casting)',
      type: 'string',
      description: 'Noms séparés par des virgules.',
    }),
    lienField('imdbUrl', 'Lien IMDb', 'Bouton « View on IMDb ». Vide : pas de bouton.'),
    lienField('watchUrl', 'Lien « Watch Now »', 'Bouton « Watch Now » (bande-annonce, plateforme…). Vide : pas de bouton.'),
    ordreField('du film sur la page Studios'),
  ],
  preview: {
    select: { title: 'title', year: 'year', genres: 'genres', media: 'stills.0' },
    prepare: ({ title, year, genres, media }) => ({
      title,
      subtitle: [year, Array.isArray(genres) ? genres.join(', ') : undefined].filter(Boolean).join(' · '),
      media,
    }),
  },
  orderings: [{ title: 'Ordre', name: 'ordreAsc', by: [{ field: 'ordre', direction: 'asc' }] }],
})
