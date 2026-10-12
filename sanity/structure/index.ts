import { DocumentVideoIcon } from '@sanity/icons/DocumentVideo'
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe'
import { FolderIcon } from '@sanity/icons/Folder'
import { TagsIcon } from '@sanity/icons/Tags'
import { UserIcon } from '@sanity/icons/User'
import { UsersIcon } from '@sanity/icons/Users'
import { VideoIcon } from '@sanity/icons/Video'
import type { StructureBuilder, StructureResolver } from 'sanity/structure'

const BY_ORDRE = [{ field: 'ordre', direction: 'asc' as const }]

/**
 * A type's documents in the order the site shows them, rather than Sanity's default
 * (last edited first), so the list in the Studio reads like the page.
 */
function ordered(S: StructureBuilder, type: string, title: string, icon: typeof FolderIcon) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .id(type)
    .child(S.documentTypeList(type).title(title).defaultOrdering(BY_ORDRE))
}

/**
 * "By category" / "by sector": one entry per parent, opening the children that point at it.
 * New documents created from there get the parent filled in.
 */
function grouped(
  S: StructureBuilder,
  opts: { id: string; title: string; icon: typeof FolderIcon; parentType: string; childType: string; refField: string },
) {
  return S.listItem()
    .title(opts.title)
    .icon(opts.icon)
    .id(opts.id)
    .child(
      S.documentTypeList(opts.parentType)
        .title(opts.title)
        .defaultOrdering(BY_ORDRE)
        .child((parentId) =>
          S.documentList()
            .title('Contenu')
            .schemaType(opts.childType)
            .filter(`_type == $type && ${opts.refField}._ref == $parentId`)
            .params({ type: opts.childType, parentId })
            .defaultOrdering(BY_ORDRE)
            .initialValueTemplates([
              S.initialValueTemplateItem(`${opts.childType}-in-${opts.parentType}`, { parentId }),
            ]),
        ),
    )
}

/**
 * The Studio's navigation, one section per part of the site.
 *
 * ⚠ A new document type MUST be added here, or it appears nowhere in the Studio even
 * when it is registered in the schema.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenu')
    .items([
      S.listItem()
        .title('Studios')
        .icon(DocumentVideoIcon)
        .id('section-studio')
        .child(S.list().title('Studios').items([ordered(S, 'film', 'Films', DocumentVideoIcon)])),

      S.listItem()
        .title('Productions')
        .icon(VideoIcon)
        .id('section-production')
        .child(
          S.list()
            .title('Productions')
            .items([
              ordered(S, 'productionProject', 'Tous les projets', VideoIcon),
              grouped(S, {
                id: 'projects-by-category',
                title: 'Projets par catégorie',
                icon: FolderIcon,
                parentType: 'productionCategory',
                childType: 'productionProject',
                refField: 'category',
              }),
              S.divider(),
              ordered(S, 'productionCategory', 'Catégories', FolderIcon),
            ]),
        ),

      S.listItem()
        .title('Équipe')
        .icon(UsersIcon)
        .id('section-team')
        .child(
          S.list()
            .title('Équipe')
            .items([
              ordered(S, 'teamGroup', 'Groupes', UsersIcon),
              S.documentTypeListItem('person').title('Personnes').icon(UserIcon),
            ]),
        ),

      S.listItem()
        .title('Network')
        .icon(EarthGlobeIcon)
        .id('section-network')
        .child(
          S.list()
            .title('Network')
            .items([
              ordered(S, 'partner', 'Tous les partenaires', EarthGlobeIcon),
              grouped(S, {
                id: 'partners-by-sector',
                title: 'Partenaires par secteur',
                icon: TagsIcon,
                parentType: 'networkSector',
                childType: 'partner',
                refField: 'sector',
              }),
              S.divider(),
              ordered(S, 'networkSector', 'Secteurs', TagsIcon),
            ]),
        ),
    ])
