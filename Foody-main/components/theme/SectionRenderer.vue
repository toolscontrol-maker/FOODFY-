<script setup lang="ts">
import type { ThemeSection } from '~/stores/useOnlineStoreStore'

import SectionPreviewHeader from './sections/SectionPreviewHeader.vue'
import SectionPreviewHero from './sections/SectionPreviewHero.vue'
import SectionPreviewHeroSplit from './sections/SectionPreviewHeroSplit.vue'
import SectionPreviewMarquee from './sections/SectionPreviewMarquee.vue'
import SectionPreviewPromoBanner from './sections/SectionPreviewPromoBanner.vue'
import SectionPreviewCountdown from './sections/SectionPreviewCountdown.vue'
import SectionPreviewFeaturedCollection from './sections/SectionPreviewFeaturedCollection.vue'
import SectionPreviewCollectionGrid from './sections/SectionPreviewCollectionGrid.vue'
import SectionPreviewBestSellers from './sections/SectionPreviewBestSellers.vue'
import SectionPreviewRelatedProducts from './sections/SectionPreviewRelatedProducts.vue'
import SectionPreviewProductDetail from './sections/SectionPreviewProductDetail.vue'
import SectionPreviewRichText from './sections/SectionPreviewRichText.vue'
import SectionPreviewImageWithText from './sections/SectionPreviewImageWithText.vue'
import SectionPreviewVideo from './sections/SectionPreviewVideo.vue'
import SectionPreviewTestimonials from './sections/SectionPreviewTestimonials.vue'
import SectionPreviewTrustIcons from './sections/SectionPreviewTrustIcons.vue'
import SectionPreviewFeaturesGrid from './sections/SectionPreviewFeaturesGrid.vue'
import SectionPreviewLogoList from './sections/SectionPreviewLogoList.vue'
import SectionPreviewFaq from './sections/SectionPreviewFaq.vue'
import SectionPreviewNewsletter from './sections/SectionPreviewNewsletter.vue'
import SectionPreviewFooter from './sections/SectionPreviewFooter.vue'
import SectionPreviewCtaStrip from './sections/SectionPreviewCtaStrip.vue'
import SectionPreviewHowItWorks from './sections/SectionPreviewHowItWorks.vue'
import SectionPreviewStatsRow from './sections/SectionPreviewStatsRow.vue'
import SectionPreviewDailySpecial from './sections/SectionPreviewDailySpecial.vue'
import SectionPreviewFallback from './sections/SectionPreviewFallback.vue'
import SectionPreviewEditorialHero from './sections/SectionPreviewEditorialHero.vue'
import SectionPreviewEditorialGallery from './sections/SectionPreviewEditorialGallery.vue'
import SectionPreviewBrandManifesto from './sections/SectionPreviewBrandManifesto.vue'
import SectionPreviewCollectionSelector from './sections/SectionPreviewCollectionSelector.vue'
import SectionPreviewShopTheLook from './sections/SectionPreviewShopTheLook.vue'
import SectionPreviewDropAnnouncement from './sections/SectionPreviewDropAnnouncement.vue'

import ThemeSectionShell from './shared/ThemeSectionShell.vue'

const props = defineProps<{
  sections: ThemeSection[]
  themeId: string
  primaryColor: string
  isMobile: boolean
  logoWidth?: number
  hoverEffect?: string
}>()

const SECTION_MAP: Record<string, any> = {
  header: SectionPreviewHeader,
  hero_banner: SectionPreviewHero,
  hero_split: SectionPreviewHeroSplit,
  marquee: SectionPreviewMarquee,
  promo_banner: SectionPreviewPromoBanner,
  countdown_timer: SectionPreviewCountdown,
  featured_collection: SectionPreviewFeaturedCollection,
  collection_grid: SectionPreviewCollectionGrid,
  best_sellers: SectionPreviewBestSellers,
  related_products: SectionPreviewRelatedProducts,
  product_detail: SectionPreviewProductDetail,
  rich_text: SectionPreviewRichText,
  image_with_text: SectionPreviewImageWithText,
  video_section: SectionPreviewVideo,
  testimonials: SectionPreviewTestimonials,
  trust_icons: SectionPreviewTrustIcons,
  features_grid: SectionPreviewFeaturesGrid,
  logo_list: SectionPreviewLogoList,
  faq_accordion: SectionPreviewFaq,
  newsletter: SectionPreviewNewsletter,
  footer: SectionPreviewFooter,
  cta_strip: SectionPreviewCtaStrip,
  how_it_works: SectionPreviewHowItWorks,
  stats_row: SectionPreviewStatsRow,
  daily_special: SectionPreviewDailySpecial,
  editorial_hero: SectionPreviewEditorialHero,
  editorial_gallery: SectionPreviewEditorialGallery,
  brand_manifesto: SectionPreviewBrandManifesto,
  collection_selector: SectionPreviewCollectionSelector,
  shop_the_look: SectionPreviewShopTheLook,
  drop_announcement: SectionPreviewDropAnnouncement,
}

const componentFor = (type: string) => SECTION_MAP[type] ?? SectionPreviewFallback
</script>

<template>
  <template v-for="sec in sections" :key="sec.id">
    <ThemeSectionShell v-if="!sec.hidden" :sec="sec" :theme-id="themeId">
      <component
        :is="componentFor(sec.type)"
        :sec="sec"
        :primary-color="primaryColor"
        :is-mobile="isMobile"
        :logo-width="logoWidth"
        :hover-effect="hoverEffect"
      />
    </ThemeSectionShell>
  </template>
</template>
