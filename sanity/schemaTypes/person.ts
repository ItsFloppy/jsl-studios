import { UserIcon } from '@sanity/icons/User'
import { defineField, defineType } from 'sanity'

/**
 * Someone shown in the Team tab of /about. The role is not stored here but on each group
 * membership (see teamGroup), because the same person can sit in several groups with a
 * different role in each: Justin is Chairman of the board and CEO of the team.
 */
export const person = defineType({
  name: 'person',
  title: 'Personne',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nom',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Portrait',
      type: 'image',
      description: 'Format 4:5 (portrait). Sans photo, un cadre vide s’affiche à sa place.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bio',
      title: 'Biographie',
      type: 'text',
      rows: 8,
      description: 'Un paragraphe, affiché quand on clique sur le nom.',
    }),
  ],
  preview: {
    select: { title: 'name', media: 'photo', bio: 'bio' },
    prepare: ({ title, media, bio }) => ({ title, media, subtitle: bio ? undefined : 'Biographie manquante' }),
  },
  orderings: [{ title: 'Nom', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] }],
})
