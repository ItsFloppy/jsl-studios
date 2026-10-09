'use client'

import { ArrowLeftIcon } from '@sanity/icons/ArrowLeft'
import { Box, Button, Card, Flex } from '@sanity/ui'
import type { NavbarProps } from 'sanity'

/**
 * The Studio's navbar with a "Back to the site" button. Sanity has none by default: the
 * standard navbar is rendered (`renderDefault`) with a link to the home page beside it.
 */
export function StudioNavbar(props: NavbarProps) {
  return (
    <Flex align="stretch">
      <Card borderBottom>
        <Flex align="center" style={{ height: '100%' }} paddingX={2}>
          <Button as="a" href="/" icon={ArrowLeftIcon} text="Retour au site" mode="bleed" tone="primary" fontSize={1} />
        </Flex>
      </Card>
      <Box flex={1}>{props.renderDefault(props)}</Box>
    </Flex>
  )
}
