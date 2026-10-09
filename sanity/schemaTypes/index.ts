// Objects
import { teamMember } from './objects/teamMember'

// Documents
import { film } from './film'
import { networkSector } from './networkSector'
import { partner } from './partner'
import { person } from './person'
import { productionCategory } from './productionCategory'
import { productionProject } from './productionProject'
import { teamGroup } from './teamGroup'

/**
 * Every type the Studio knows. A new document type must also be listed in
 * sanity/structure/index.ts, or it shows up nowhere in the Studio (see CLAUDE.md).
 */
export const schemaTypes = [
  // objects
  teamMember,
  // documents
  film,
  productionCategory,
  productionProject,
  person,
  teamGroup,
  networkSector,
  partner,
]
