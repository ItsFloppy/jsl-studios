import { UserIcon } from '@sanity/icons/User'
import { defineField, defineType } from 'sanity'

/** One line of a team group: who, and their role within that group. */
export const teamMember = defineType({
  name: 'teamMember',
  title: 'Membre',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'person',
      title: 'Personne',
      type: 'reference',
      to: [{ type: 'person' }],
      description: 'Choisissez une personne existante, ou créez-la directement depuis ici.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Rôle dans ce groupe',
      type: 'string',
      description: 'Ex. Board Member · Investor.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'person.name', subtitle: 'role', media: 'person.photo' },
  },
})
