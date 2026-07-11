export interface CategoryHubSeo {
  slug: string;
  categoryName: string;
  title: string;
  description: string;
  intro: string;
  imageAlt: string;
}

export const CATEGORY_HUBS: CategoryHubSeo[] = [
  {
    slug: 'brassware',
    categoryName: 'Brassware',
    title: 'Brassware & Pooja Idols',
    description:
      'Shop handcrafted brass vilakku, idols, arathi plates, and pooja brassware in Trichy. Authentic sacred decor for home shrines and daily rituals.',
    intro:
      'Explore our brassware collection for daily pooja and festival rituals — from kuthu vilakku and lamps to idols and ceremonial pieces. Each item is selected for traditional craftsmanship and lasting shine in your home shrine.',
    imageAlt: 'Brassware collection — pooja idols, vilakku, and sacred brass decor',
  },
  {
    slug: 'herbal-health',
    categoryName: 'Herbal Health',
    title: 'Herbal Health & Ayurvedic Products',
    description:
      'Buy authentic herbal chooranam, legiyam, thailam, and wellness syrups in Trichy. Natural Ayurvedic products from trusted brands like Annai Aravind.',
    intro:
      'Our herbal health range includes traditional chooranams, legiyams, medicated oils, and natural syrups used in Tamil wellness practices. Browse trusted formulations for everyday herbal care.',
    imageAlt: 'Herbal health products — chooranam, thailam, and Ayurvedic remedies',
  },
  {
    slug: 'herbal-beauty',
    categoryName: 'Herbal Beauty',
    title: 'Herbal Beauty & Natural Skincare',
    description:
      'Natural herbal soaps, kumkum, face packs, and beauty care made with plant-based ingredients. Shop herbal beauty products online in Trichy.',
    intro:
      'Discover herbal soaps, natural face packs, and gentle beauty essentials made with ingredients like aloe vera, sandal, and traditional herbs — crafted for everyday skin and hair care.',
    imageAlt: 'Herbal beauty products — natural soaps and skincare',
  },
];

const HUB_BY_SLUG = new Map(CATEGORY_HUBS.map((hub) => [hub.slug, hub]));
const HUB_BY_NAME = new Map(
  CATEGORY_HUBS.map((hub) => [hub.categoryName.toLowerCase(), hub])
);

export function getCategoryHubBySlug(slug: string): CategoryHubSeo | undefined {
  return HUB_BY_SLUG.get(slug.toLowerCase());
}

export function getCategoryHubByName(name: string): CategoryHubSeo | undefined {
  return HUB_BY_NAME.get(name.trim().toLowerCase());
}

export function categoryHubPath(slug: string): string {
  return `/shop/${slug}`;
}
