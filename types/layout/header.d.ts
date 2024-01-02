import type { LinksUi, Optional } from '#s94-ui/types'
import type { slideover as slideoverConfig } from '@nuxt/ui/dist/runtime/ui.config'

export interface HeaderUi {
  button: {
    base: string
    icon: {
      close: string
      open: string
    }
  }
  center: string
  container: string
  left: string
  links?: Partial<LinksUi>
  logo: string
  panel: {
    card: {
      center: string
      footer: string
      header: string
      links: string
    }
    slideover: Optional<typeof slideoverConfig>
  }
  right: string
  socials?: Partial<LinksUi>
  wrapper: string
}

export type HeaderConfig = HeaderUi