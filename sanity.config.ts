import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { StudioNavbar } from './sanity/components/StudioNavbar'
import { schemaTypes } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

// "New project in this category" / "new partner in this sector": the templates behind the
// grouped lists of sanity/structure. They need the parent they were opened from, so they
// make no sense in the Studio's global "Create" menu and are kept out of it.
const PARENT_TEMPLATES = [
  {
    id: 'productionProject-in-productionCategory',
    title: 'Projet dans cette catégorie',
    schemaType: 'productionProject',
    field: 'category',
  },
  { id: 'partner-in-networkSector', title: 'Partenaire dans ce secteur', schemaType: 'partner', field: 'sector' },
]

export default defineConfig({
  name: 'jsl-studios',
  title: 'JSL Studios',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  basePath: '/studio',
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      ...PARENT_TEMPLATES.map((t) => ({
        id: t.id,
        title: t.title,
        schemaType: t.schemaType,
        parameters: [{ name: 'parentId', type: 'string' }],
        value: ({ parentId }: { parentId: string }) => ({ [t.field]: { _type: 'reference', _ref: parentId } }),
      })),
    ],
  },
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global' ? prev.filter((o) => !PARENT_TEMPLATES.some((t) => t.id === o.templateId)) : prev,
  },
  studio: {
    components: {
      navbar: StudioNavbar,
    },
  },
})
