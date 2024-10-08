<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import type { VariantProps, TV } from 'tailwind-variants'
import { VisuallyHidden } from 'radix-vue'
import { tv } from 'tailwind-variants'
import { toRefs } from '@vueuse/core'

import type { ButtonProps } from '#ui/components/Button.vue'
import { SLinks, UButton, UContainer, USlideover } from '#components'
import _appConfig from '#build/app.config'
import type { Links, LinksVariants } from '#s94-ui/types'
import { computed, defineSlots, ref, useRoute, useScroll, watch } from '#imports'

export const theme = {
  slots: {
    root: 'w-full bg-background/75 backdrop-blur text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 -mb-px text-xl',
    container: 'flex items-center justify-between gap-3 h-header max-w-[90rem]',
    left: 'lg:flex-1 flex items-center gap-1.5 text-2xl truncate',
    center: 'hidden lg:flex text-lg',
    right: 'flex items-center justify-end lg:flex-1 gap-2',
    logo: 'flex-shrink-0 font-bold flex items-end gap-1.5 break-keep',
    mobileButton: 'lg:hidden',
    slideoverOverlay: 'bg-background/75 dark:bg-background/75',
    slideoverContent: 'bg-background dark:bg-background',
    slideoverHeader: 'w-full h-header inline-flex items-center justify-between border-b border-gray-200 dark:border-gray-800 text-2xl',
    slideoverBody: 'size-full flex flex-col justify-around text-xl',
    slideoverFooter: 'w-fit mx-auto text-xl min-h-header',
    socials: 'w-fit',
  },
  variants: {
    variant: {
      transparent: {
        root: 'border-0 bg-background/0 backdrop-blur-none',
      },
      faded: {
        root: 'border-0 bg-background/0 backdrop-blur-none bg-gradient-to-b from-background/75 to-transparent',
      },
    },
    sticky: {
      true: {
        root: 'sticky top-0 z-50 transition-all duration-300 ease-in-out',
      },
    },
    rtl: {
      true: {
        container: 'flex-row-reverse',
        left: 'flex-row-reverse',
        right: 'flex-row-reverse',
        slideoverHeader: 'flex-row-reverse',
        slideoverFooter: 'flex-row-reverse',
      },
    },
    hideSocials: {
      desktop: {
        socials: 'lg:hidden',
      },
      mobile: {
        socials: 'hidden lg:flex',
      },
      true: {
        socials: 'hidden',
      },
    },
  },
} satisfies Parameters<TV>[0]

const appConfig = _appConfig as AppConfig & { s94Ui: { header: Partial<typeof theme> } }

const header = tv({ extend: tv(theme), ...(appConfig.s94Ui.header || {}) })

export type HeaderVariants = VariantProps<typeof header>

export interface HeaderProps {
  hideCenter?: boolean
  hideLeft?: boolean
  hideMobileButton?: boolean
  hidePanel?: boolean
  hideRight?: boolean
  hideOnScroll?: boolean
  hideSocials?: 'desktop' | 'mobile' | boolean
  hide?: {
    center?: boolean
    left?: boolean
    mobileButton?: boolean
    panel?: boolean
    right?: boolean
    onScroll?: boolean
    socials?: 'desktop' | 'mobile' | boolean
  }
  links?: Links
  linksVariant?: LinksVariants['variant']
  mobileButtonIcon?: {
    close?: string
    open?: string
  }
  mobileButtonColor?: ButtonProps['color']
  rtl?: boolean
  socials?: Links
  socialsVariant?: LinksVariants['variant']
  sticky?: boolean
  title?: string
  titleTo?: string
  variant?: HeaderVariants['variant']
  class?: any
  ui?: Partial<typeof header.slots>
}

export interface HeaderSlots {
  center: any
  left: any
  logo: any
  mobileButton(props: { open?: boolean }): any
  slideoverTitle: any
  slideoverClose(props: { open?: boolean }): any
  slideoverBody: any
  slideoverFooter: any
  right: any
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<HeaderProps>(), {
  sticky: false,
  hideOnScroll: false,
  mobileButtonIcon: () => ({
    close: 'i-heroicons-x-mark',
    open: 'i-heroicons-bars-2',
  }),
  mobileButtonColor: 'gray',
  rtl: false,
  titleTo: '/',
})
const slots = defineSlots<HeaderSlots>()

const ui = computed(() => tv({ extend: header, slots: props.ui })({
  hideSocials: props.hideSocials || props.hide?.socials,
  rtl: props.rtl,
  sticky: props.sticky,
  variant: props.variant,
}))

const route = useRoute()
const isMenuOpen = ref(false)

const navPosition = ref<string>('0')
const { isScrolling, directions } = useScroll(window)
const { top: toTop, bottom: toBottom } = toRefs(directions)

watch([() => route.fullPath, toTop, toBottom], ([newRoute], [prevRoute]) => {
  if (newRoute !== prevRoute) {
    isMenuOpen.value = false
  }
  if (props.hide?.onScroll || props.hideOnScroll) {
    if (isScrolling.value && toTop.value) {
      navPosition.value = '0'
    }
    else if (isScrolling.value && toBottom.value) {
      navPosition.value = 'calc((var(--header-height) + 2px) * -1)'
    }
  }
})
</script>

<template>
  <header :class="ui.root({ class: props.class })" :style="{ top: navPosition }">
    <UContainer :class="ui.container()">
      <div v-if="(!hide?.left && !hideLeft) && (title || slots.left || slots.logo)" :class="ui.left()">
        <slot name="left">
          <NuxtLink :class="ui.logo()" :to="titleTo" aria-label="Logo">
            <slot name="logo">
              {{ title }}
            </slot>
          </NuxtLink>
        </slot>
      </div>

      <div v-if="(!hide?.center && !hideCenter) && (links || slots.center)" :class="ui.center()">
        <slot name="center">
          <SLinks :links="links" :variant="linksVariant" />
        </slot>
      </div>

      <div v-if="(!hide?.right && !hideRight) && (socials || slots.right || slots.mobileButton)" :class="ui.right()">
        <slot name="right">
          <SLinks
            v-if="socials && hide?.socials !== true"
            :class="ui.socials()"
            :links="socials"
            :variant="socialsVariant"
          />
        </slot>

        <USlideover
          v-if="!hide?.panel && !hidePanel"
          :open="isMenuOpen"
          :side="rtl ? 'left' : 'right'"
          :ui="{
            overlay: ui.slideoverOverlay(),
            content: ui.slideoverContent(),
            header: ui.slideoverHeader(),
            body: ui.slideoverBody(),
            footer: ui.slideoverFooter(),
          }"
        >
          <slot name="mobileButton" :open="isMenuOpen">
            <UButton
              v-if="!hide?.panel && !hidePanel && !hide?.mobileButton && !hideMobileButton"
              :aria-label="`${isMenuOpen ? 'Close' : 'Open'} Mobile Menu`"
              :class="ui.mobileButton()"
              :icon="isMenuOpen ? mobileButtonIcon.close : mobileButtonIcon.open"
              :color="mobileButtonColor"
              size="xl"
              variant="ghost"
              @click="isMenuOpen = !isMenuOpen"
            />
          </slot>

          <template #title>
            <slot name="slideoverTitle">
              <NuxtLink :class="ui.logo()" :to="titleTo" aria-label="Logo">
                <slot name="logo">
                  {{ title }}
                </slot>
              </NuxtLink>
            </slot>
          </template>
          <template #close>
            <slot name="slideoverClose" :open="isMenuOpen">
              <UButton
                :aria-label="`${isMenuOpen ? 'Close' : 'Open'} Mobile Menu`"
                :class="ui.mobileButton()"
                :icon="isMenuOpen ? mobileButtonIcon.close : mobileButtonIcon.open"
                :color="mobileButtonColor"
                size="xl"
                variant="ghost"
                @click="isMenuOpen = !isMenuOpen"
              />
            </slot>
          </template>

          <template #body>
            <slot name="slideoverBody">
              <SLinks :links="links" :variant="linksVariant" vertical />
              <div />
            </slot>
          </template>

          <template #footer>
            <slot name="slideoverFooter">
              <SLinks
                v-if="(!hide?.socials && !hideSocials) && socials"
                :class="ui.socials()"
                :links="socials"
                :variant="socialsVariant"
              />
            </slot>
          </template>

          <template #description>
            <VisuallyHidden>
              Mobile Sidebar
            </VisuallyHidden>
          </template>
        </USlideover>
      </div>
    </UContainer>
  </header>
</template>
