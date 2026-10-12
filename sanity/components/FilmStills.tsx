'use client'

import { UploadIcon } from '@sanity/icons/Upload'
import { Box, Button, Card, Flex, Text } from '@sanity/ui'
// Like the icons, @sanity/ui v4 exports the toast hook from its own subpath only.
import { useToast } from '@sanity/ui/toast'
import { createContext, useCallback, useContext, useRef, useState, type DragEvent } from 'react'
import {
  ArrayOfObjectsFunctions,
  DEFAULT_STUDIO_CLIENT_OPTIONS,
  insert,
  PatchEvent,
  setIfMissing,
  useClient,
  useFormValue,
  type ArrayInputFunctionsProps,
  type ArrayOfObjectsInputProps,
  type ArraySchemaType,
  type ObjectItem,
  type StringInputProps,
} from 'sanity'
import { stillAlt } from '@/lib/types'

type Progress = { done: number; total: number }
type Uploads = { upload: (files: File[]) => void; progress: Progress | null }

const UploadsContext = createContext<Uploads | null>(null)

// The site never renders SVG stills (lib/sanity.queries.ts), so they are refused here.
const isStill = (f: File) => f.type.startsWith('image/') && f.type !== 'image/svg+xml'
const hasFiles = (e: DragEvent) => e.dataTransfer.types.includes('Files')
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`

/**
 * The film's stills, several at a time: files dropped on the list, or picked together
 * through « Ajouter plusieurs images », are uploaded and added in that order.
 *
 * Sanity's own drop handling is bypassed for this field: with several files at once it
 * added nothing in Sanity 6.18, or threw. The uploads go through the public client API
 * instead, and each still is inserted already complete (asset set), in a single patch.
 */
export function StillsInput(props: ArrayOfObjectsInputProps) {
  const { onChange, readOnly } = props
  const client = useClient(DEFAULT_STUDIO_CLIENT_OPTIONS)
  const toast = useToast()
  const [progress, setProgress] = useState<Progress | null>(null)
  const [hovering, setHovering] = useState(false)
  const zone = useRef<HTMLDivElement>(null)
  const depth = useRef(0)

  const upload = useCallback(
    async (files: File[]) => {
      const stills = files.filter(isStill)
      const refused = files.filter((f) => !isStill(f)).map((f) => f.name)
      if (refused.length) {
        toast.push({
          status: 'warning',
          title: `Ignoré (pas une image JPEG, PNG, WebP…) : ${refused.join(', ')}`,
        })
      }
      if (!stills.length) return

      let done = 0
      setProgress({ done, total: stills.length })
      const results = await Promise.allSettled(
        stills.map(async (file) => {
          const asset = await client.assets.upload('image', file, { filename: file.name })
          setProgress({ done: ++done, total: stills.length })
          return asset._id
        }),
      )
      setProgress(null)

      const items = results.flatMap((r) =>
        r.status === 'fulfilled'
          ? [{ _type: 'image', _key: crypto.randomUUID().slice(-12), asset: { _type: 'reference', _ref: r.value } }]
          : [],
      )
      if (items.length) onChange(PatchEvent.from([setIfMissing([]), insert(items, 'after', [-1])]))

      const failed = stills.filter((_, i) => results[i].status === 'rejected').map((f) => f.name)
      if (failed.length) {
        results.forEach((r) => r.status === 'rejected' && console.error(r.reason))
        toast.push({
          status: 'error',
          title: `Échec de l’envoi de ${plural(failed.length, 'image')}`,
          description: `${failed.join(', ')}. Réessayez.`,
        })
      }
    },
    [client, onChange, toast],
  )

  // Only drags carrying files, and only over this field's own markup: a drop on the image
  // of a still opened for editing (a dialog, outside this element) replaces that image,
  // as usual.
  const ours = (e: DragEvent) => !readOnly && hasFiles(e) && !!zone.current?.contains(e.target as Node)
  const take = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <UploadsContext.Provider value={{ upload, progress }}>
      <Box
        ref={zone}
        style={{ position: 'relative' }}
        onDragEnterCapture={(e) => {
          if (!ours(e)) return
          take(e)
          depth.current++
          setHovering(true)
        }}
        onDragOverCapture={(e) => {
          if (!ours(e)) return
          take(e)
          e.dataTransfer.dropEffect = 'copy'
        }}
        onDragLeaveCapture={(e) => {
          if (!ours(e)) return
          e.stopPropagation()
          depth.current = Math.max(0, depth.current - 1)
          if (!depth.current) setHovering(false)
        }}
        onDropCapture={(e) => {
          if (!ours(e)) return
          take(e)
          depth.current = 0
          setHovering(false)
          upload(Array.from(e.dataTransfer.files))
        }}
      >
        {props.renderDefault({ ...props, arrayFunctions: StillsFunctions })}
        {hovering && (
          <Card
            tone="primary"
            border
            radius={2}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.95 }}
          >
            <Flex align="center" justify="center" height="fill">
              <Text weight="medium">Déposez pour ajouter les images à la fin de la liste</Text>
            </Flex>
          </Card>
        )}
      </Box>
    </UploadsContext.Provider>
  )
}

/** The row under the list: Sanity's « Add item », plus « Ajouter plusieurs images ». */
function StillsFunctions(props: ArrayInputFunctionsProps<ObjectItem, ArraySchemaType>) {
  const uploads = useContext(UploadsContext)
  const picker = useRef<HTMLInputElement>(null)
  const progress = uploads?.progress

  return (
    <ArrayOfObjectsFunctions {...props}>
      <Button
        icon={UploadIcon}
        mode="ghost"
        padding={3}
        text={progress ? `Envoi… ${progress.done}/${progress.total}` : 'Ajouter plusieurs images'}
        disabled={!uploads || !!progress}
        onClick={() => picker.current?.click()}
      />
      <input
        ref={picker}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.currentTarget.files ?? [])
          e.currentTarget.value = '' // so the same files can be picked again
          if (files.length) uploads?.upload(files)
        }}
      />
    </ArrayOfObjectsFunctions>
  )
}

/**
 * A still's alt text. Left empty, the site says « <title> — still »; the field shows that,
 * greyed, rather than storing it, so it follows the title if the film is renamed.
 */
export function StillAltInput(props: StringInputProps) {
  const title = useFormValue(['title'])
  const placeholder = typeof title === 'string' && title.trim() ? stillAlt(title.trim()) : undefined
  return props.renderDefault({
    ...props,
    // The plain input reads elementProps, the inline-changes one schemaType.
    elementProps: { ...props.elementProps, placeholder },
    schemaType: { ...props.schemaType, placeholder },
  })
}
