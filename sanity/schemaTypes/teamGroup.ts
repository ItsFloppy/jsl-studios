import { UsersIcon } from '@sanity/icons/Users'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { ordreField } from './fields'

/** A group of the Team tab (Our Board, Our Team, Our Consultants), listed in its own order. */
export const teamGroup = defineType({
  name: 'teamGroup',
  title: 'Groupe (Équipe)',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      description: 'Ex. Our Board.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'members',
      title: 'Membres',
      type: 'array',
      description: 'Dans l’ordre d’affichage : glissez-déposez les lignes pour les réordonner.',
      of: [defineArrayMember({ type: 'teamMember' })],
      validation: (Rule) =>
        Rule.custom((members) => {
          const refs = (Array.isArray(members) ? members : [])
            .map((m) => (m as { person?: { _ref?: string } })?.person?._ref)
            .filter(Boolean)
          return new Set(refs).size === refs.length ? true : 'Une même personne apparaît deux fois dans ce groupe.'
        }),
    }),
    ordreField('du groupe dans l’onglet Team'),
  ],
  preview: {
    select: { title: 'title', members: 'members' },
    prepare: ({ title, members }) => {
      const n = Array.isArray(members) ? members.length : 0
      return { title, subtitle: `${n} membre${n > 1 ? 's' : ''}` }
    },
  },
  orderings: [{ title: 'Ordre', name: 'ordreAsc', by: [{ field: 'ordre', direction: 'asc' }] }],
})
