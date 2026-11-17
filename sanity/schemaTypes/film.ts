import { DocumentVideoIcon } from '@sanity/icons/DocumentVideo'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { StillAltInput, StillsInput } from '../components/FilmStills'
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
        'Format 16:9. Pour en ajouter plusieurs d’un coup : « Ajouter plusieurs images », ou glissez-déposez les fichiers sur la liste. La première s’affiche sur la carte ; avec plusieurs images, elles défilent toutes seules tant que la carte est à l’écran. Utilisez le point focal (hotspot) pour choisir ce qui reste visible au recadrage.',
      components: { input: StillsInput },
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              ...altField('Laissé vide, le site utilise le texte affiché en gris. À préciser si l’image est une affiche.'),
              components: { input: StillAltInput },
            },
          ],
          // Sanity titles each row with its alt, so stills left on the default read "Untitled".
          preview: {
            select: { alt: 'alt', filename: 'asset.originalFilename', media: 'asset' },
            prepare: ({ alt, filename, media }) => ({
              title: alt || filename || 'Image',
              subtitle: alt ? undefined : 'Texte alternatif par défaut',
              media,
            }),
          },
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
      name: 'rating',
      title: 'Classification / note',
      type: 'string',
      description: 'Ligne « Rating » de la carte, telle qu’elle doit s’afficher (ex. PG-13, ou la note IMDb). Vide : pas de ligne.',
    }),
    defineField({
      name: 'year',
      title: 'Année de sortie',
      type: 'number',
      description: 'Ligne « Released ». Vide : le statut ci-dessous s’affiche à sa place.',
      validation: (Rule) => Rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      description: 'Pour un film pas encore sorti (ex. In post-production). Affiché seulement sans année de sortie.',
    }),
    defineField({
      name: 'directedBy',
      title: 'Écrit et réalisé par',
      type: 'string',
      initialValue: 'Justin Souriau-Levine',
    }),
    defineField({
      name: 'cinematographer',
      title: 'Directeur de la photographie',
      type: 'string',
    }),
    defineField({
      name: 'starring',
      title: 'Avec (casting)',
      type: 'string',
      description: 'Le casting principal seulement, 4 à 6 noms séparés par des virgules : le reste est sur IMDb.',
    }),
    lienField('imdbUrl', 'Lien IMDb', 'Bouton « View on IMDb ». Vide : pas de bouton.'),
    lienField('trailerUrl', 'Lien bande-annonce', 'Bouton « Watch the trailer ». Vide : pas de bouton.'),
    lienField('watchUrl', 'Lien « Watch Now »', 'Bouton « Watch Now », vers le film lui-même (plateforme, achat…). Vide : pas de bouton.'),
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
