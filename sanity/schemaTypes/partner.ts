import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe'
import { defineField, defineType } from 'sanity'
import { RELATIONSHIPS } from '../../lib/types'
import { lienField, ordreField } from './fields'

/**
 * A tile of the Network mosaic. Its size comes from the relationship plus the visibility,
 * exactly as the static site computed it (SCORE + VISIBILITY in lib/behaviors/about.ts),
 * and `ordre` feeds the mosaic's deterministic shuffle: the same order always gives the
 * same layout.
 */
export const partner = defineType({
  name: 'partner',
  title: 'Partenaire (Network)',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nom',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sector',
      title: 'Secteur',
      type: 'reference',
      to: [{ type: 'networkSector' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'relationship',
      title: 'Relation',
      type: 'string',
      description: 'Pèse sur la taille de la tuile : Client (la plus grande), puis Featured, Network, Relationship, Conversation.',
      options: { list: RELATIONSHIPS, layout: 'radio', direction: 'horizontal' },
      initialValue: 'network',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'visibility',
      title: 'Notoriété',
      type: 'number',
      description: 'De 1 (confidentiel) à 5 (mondialement connu). Agrandit la tuile. 3 par défaut.',
      initialValue: 3,
      validation: (Rule) => Rule.required().integer().min(1).max(5),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'PNG à fond transparent, environ 1200 × 560. Sans logo, le nom s’affiche en toutes lettres.',
      options: { accept: 'image/png,image/svg+xml,image/webp' },
    }),
    defineField({
      name: 'invertLogo',
      title: 'Inverser les couleurs du logo',
      type: 'boolean',
      description: 'Pour un logo clair, dessiné pour un fond sombre : il est inversé pour rester lisible sur la tuile claire.',
      initialValue: false,
    }),
    lienField('url', 'Site web', 'Où mène un clic sur la tuile.'),
    ordreField('dans la mosaïque'),
  ],
  preview: {
    select: { title: 'name', sector: 'sector.title', relationship: 'relationship', media: 'logo' },
    prepare: ({ title, sector, relationship, media }) => ({
      title,
      subtitle: [sector, relationship].filter(Boolean).join(' · '),
      media,
    }),
  },
  orderings: [
    { title: 'Ordre', name: 'ordreAsc', by: [{ field: 'ordre', direction: 'asc' }] },
    { title: 'Nom', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] },
  ],
})
