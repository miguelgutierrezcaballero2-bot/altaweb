/**
 * Demo catalog seed — one-shot bootstrap of the three storefront rubros and
 * a realistic B2B equipment spread for development smoke tests.
 *
 * Idempotent: if the managers already hold data, seeding is skipped so a
 * server restart (or dev HMR reload) never duplicates rows.
 *
 * Note: placeholder images reuse the demo electronics files shipped in
 * public/products; real gastro imagery is a Phase-6 content task.
 */

import { categoryManager } from '@/lib/managers/category-manager';
import { productManager } from '@/lib/managers/product-manager';
import { promotionManager } from '@/lib/managers/promotion-manager';
import { userManager } from '@/lib/managers/user-manager';
import type { CreateProductInput } from '@/lib/types/product';
import type { CreatePromotionInput } from '@/lib/types/promotion';

// Demo placeholder images shipped with the starter (stand-ins; see header).
const PLACEHOLDER_IMAGES = [
  '/products/backpack.jpg',
  '/products/headphones.jpg',
  '/products/hero-banner.jpg',
  '/products/laptop-stand.jpg',
  '/products/smartwatch.jpg',
  '/products/speaker.jpg',
] as const;

function image(index: number): string {
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
}

const CATEGORY_SEEDS = [
  {
    slug: 'pollerias',
    name: 'Pollerías',
    description: 'Freidoras, spiderventas, vitrinas térmicas y utensilios para asado de pollo a espiedo.',
    sortOrder: 0,
  },
  {
    slug: 'cafeterias',
    name: 'Cafeterías',
    description: 'Máquinas espresso, molinos, exhibidoras y mobiliario para cafetería profesional.',
    sortOrder: 1,
  },
  {
    slug: 'pizzerias',
    name: 'Pizzerías',
    description: 'Hornos pizzeros, amasadoras y todo el equipamiento para línea de pizza.',
    sortOrder: 2,
  },
] as const;

/** Product seeds; `categoryId` is resolved from the category slug at seed time. */
interface ProductSeed extends Omit<CreateProductInput, 'categoryId' | 'images'> {
  categorySlug: 'pollerias' | 'cafeterias' | 'pizzerias';
  imageIndex: number;
}

const PRODUCT_SEEDS: ProductSeed[] = [
  // ── Pollerías ───────────────────────────────────────────────
  {
    categorySlug: 'pollerias',
    imageIndex: 0,
    name: 'Freidora dúplex industrial 20+20 L',
    description:
      'Doble cuba de acero inoxidable 304, termostato de 50 a 190 °C, canastillas cromadas y canaleta de recogida de grasa. Potencia 27 kW eléctrica.',
    price: 1845000,
    compareAtPrice: 2100000,
    sku: 'POL-FRE-001',
    stock: 12,
    rating: 4.8,
  },
  {
    categorySlug: 'pollerias',
    imageIndex: 1,
    name: 'Spiderventa a propano 24 pollos',
    description:
      'Motor eléctrico con cadena reforzada, quemadores de propano independientes y 24 posiciones de espiedo. Ideal para rotación alta de pollo asado.',
    price: 2320000,
    compareAtPrice: null,
    sku: 'POL-SPV-001',
    stock: 8,
    rating: 4.6,
  },
  {
    categorySlug: 'pollerias',
    imageIndex: 2,
    name: 'Vitrina térmica angular con cañonera 1,2 m',
    description:
      'Mantiene el pollo asado a 80 °C con cañonera para pan y papas fritas. Vidrio templado de seguridad y ruedas con freno.',
    price: 989000,
    compareAtPrice: 1090000,
    sku: 'POL-VIT-001',
    stock: 15,
    rating: 4.3,
  },
  {
    categorySlug: 'pollerias',
    imageIndex: 3,
    name: 'Refrigerador comercial vertical 700 L',
    description:
      'Dos puertas de vidrio, ventilación forzada, rango 0–10 °C y estantes de acero troquelados regulables. Ideal como depósito del rubro.',
    price: 1780000,
    compareAtPrice: null,
    sku: 'POL-REF-001',
    stock: 6,
    rating: 4.1,
  },
  {
    categorySlug: 'pollerias',
    imageIndex: 4,
    name: 'Rebanadora eléctrica 300 mm con carro',
    description:
      'Cuchilla de acero al cromo con carro de aluminio anodizado, espesor regulable de 0 a 15 mm y afilador integrado.',
    price: 745000,
    compareAtPrice: null,
    sku: 'POL-REB-001',
    stock: 10,
    rating: 4.0,
  },
  {
    categorySlug: 'pollerias',
    imageIndex: 5,
    name: 'Extractor de humos espiral 2500 m³/h',
    description:
      'Extractor helicoidal para campana de cocina profesional, motor cerrado con protección térmica y marco de acero fundido listo para montaje.',
    price: 640000,
    compareAtPrice: null,
    sku: 'POL-EXT-001',
    stock: 0,
    rating: 3.9,
  },

  // ── Cafeterías ──────────────────────────────────────────────
  {
    categorySlug: 'cafeterias',
    imageIndex: 1,
    name: 'Máquina espresso electrónica 2 grupos',
    description:
      'Dosificación volumétrica programable, caldera de 11 L y bomba rotativa de presión constante. Incluye manómetros duales y portafiltros adicionales.',
    price: 4650000,
    compareAtPrice: 5290000,
    sku: 'CAF-MQE-001',
    stock: 4,
    rating: 4.7,
  },
  {
    categorySlug: 'cafeterias',
    imageIndex: 2,
    name: 'Molino dosificador de café 1 kg',
    description:
      'Rodillos planos de 64 mm, dosificación por tiempo programable y tolva de 1 kg con tapa antifuga. Ajuste de molienda por micrométrico.',
    price: 1120000,
    compareAtPrice: null,
    sku: 'CAF-MOL-001',
    stock: 9,
    rating: 4.5,
  },
  {
    categorySlug: 'cafeterias',
    imageIndex: 3,
    name: 'Pava eléctrica industrial 10 L',
    description:
      'Cuerpo de inoxidable con doble pared y aislación, surtidor de 1 L por bombeo y reconexión automática que mantiene el agua a 100 °C.',
    price: 320000,
    compareAtPrice: null,
    sku: 'CAF-PAV-001',
    stock: 20,
    rating: 4.2,
  },
  {
    categorySlug: 'cafeterias',
    imageIndex: 0,
    name: 'Sifón sifonador de crema 1 L profesional',
    description:
      'Cuerpo de aluminio fundido con tres boquillas, compatible con cartuchos N2O. Para cremas, espumas y cargas rápidas en barra.',
    price: 145000,
    compareAtPrice: 169000,
    sku: 'CAF-SIF-001',
    stock: 25,
    rating: 4.4,
  },
  {
    categorySlug: 'cafeterias',
    imageIndex: 4,
    name: 'Exhibidora refrigerada de tortas 1,5 m',
    description:
      'Cristal curvo, rango 2–8 °C, luces LED interiores y estantes ajustables para exhibir repostería con temperatura estable.',
    price: 1580000,
    compareAtPrice: null,
    sku: 'CAF-EXH-001',
    stock: 2,
    rating: 4.6,
  },

  // ── Pizzerías ───────────────────────────────────────────────
  {
    categorySlug: 'pizzerias',
    imageIndex: 5,
    name: 'Horno pizzero a propano 2 pisos',
    description:
      'Cámara independiente por piso para seis pizzas de 35 cm, termostato de hasta 500 °C y interior de material refractario.',
    price: 3980000,
    compareAtPrice: 4350000,
    sku: 'PZX-HOR-001',
    stock: 5,
    rating: 4.9,
  },
  {
    categorySlug: 'pizzerias',
    imageIndex: 0,
    name: 'Amasadora planetaria 30 L industrial',
    description:
      'Cabezal con tres velocidades y accesorios de gancho, batidor y paleta. Ideal para masas de pizza, panadería y pastelería.',
    price: 2150000,
    compareAtPrice: null,
    sku: 'PZX-AMA-001',
    stock: 7,
    rating: 4.6,
  },
  {
    categorySlug: 'pizzerias',
    imageIndex: 2,
    name: 'Reactor de propano 60 cm con parrilla',
    description:
      'Parrilla de hierro fundido con dos quemadores de propano independientes por zona, termocupla de seguridad y estribos regulables.',
    price: 390000,
    compareAtPrice: null,
    sku: 'PZX-QUI-001',
    stock: 18,
    rating: 3.8,
  },
  {
    categorySlug: 'pizzerias',
    imageIndex: 1,
    name: 'Palas de horno inox con mango (juego x2)',
    description:
      'Juego de dos paletas de aluminio con mango de madera para hornos de piso. Incluye soporte de pared para colgado.',
    price: 89000,
    compareAtPrice: null,
    sku: 'PZX-PAL-001',
    stock: 30,
    rating: 4.2,
  },
];

export interface SeedResult {
  seeded: boolean;
  categories: number;
  products: number;
  users: number;
  promotions: number;
}

/** Demo vendor user marker (Phase-5-auth scaffolding — see seedDemoUsers). */
export const DEMO_USER_EMAIL = 'compras@negocio.demo';

/** Demo login accounts shown as a hint on /login (demo passwords, per doc constraint). */
export interface DemoAccount {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'customer';
}

/**
 * Demo users, data-driven so seeding and the API-graph mirror share one
 * source of truth. Purchases account = admin; vendor persona = 'customer'
 * because the domain role enum (customer | admin) has no vendor role
 * (honest labeling + recorded follow-up).
 */
const DEMO_USER_INPUTS = [
  {
    email: DEMO_USER_EMAIL,
    password: 'demo-password',
    firstName: 'Sofía',
    lastName: 'González',
    phone: '+54 11 4000-0000',
    role: 'admin' as const,
    address: [
      {
        street: 'Av. San Juan 2565',
        city: 'Buenos Aires',
        state: 'CABA',
        zip: '1231',
        country: 'Argentina',
      },
    ],
  },
  {
    // Vendor persona. The domain enum is 'customer' | 'admin' and has no
    // vendor role (honest-read rule): closest role is 'customer', the UI
    // labels it as such, and the enum extension is a recorded follow-up.
    email: 'vendedor@negocio.demo',
    password: 'demo-password',
    firstName: 'Martín',
    lastName: 'Díaz',
    phone: '+54 11 4777-0000',
    role: 'customer' as const,
    address: [
      {
        street: 'Bv. Oro 1930',
        city: 'Buenos Aires',
        state: 'CABA',
        zip: '1427',
        country: 'Argentina',
      },
    ],
  },
] as const;

export const DEMO_LOGIN_ACCOUNTS: DemoAccount[] = DEMO_USER_INPUTS.map((user) => ({
  email: user.email,
  password: user.password,
  fullName: `${user.firstName} ${user.lastName}`,
  role: user.role,
}));

/** Demo promo codes displayed as a hint in the checkout form. */
export const DEMO_PROMO_CODES = ['BIENVENIDA10', 'GASTRO20K'] as const;

/**
 * Guarantees the seed has run before an RSC page reads the managers.
 *
 * Why not rely on instrumentation alone: `register()` runs in the server
 * boot process, but `next dev` may render RSC pages in a separate worker
 * whose in-memory singleton maps start empty. This per-process idempotent
 * guard makes any render topology equivalent.
 */
export function ensureCatalogSeeded(): SeedResult {
  return seedCatalog();
}

/**
 * Seeds the full demo dataset when the in-memory stores are empty.
 * Each section (catalog, demo user, demo promotions) is guarded
 * independently, so a process that already holds catalog data still gets
 * the user/promotions sections added.
 * Safe to call repeatedly (instrumentation register, hot reloads).
 */
export function seedCatalog(): SeedResult {
  const catalog = seedCatalogData();
  const users = seedDemoUsers();
  const promos = seedDemoPromotions();

  return {
    seeded: catalog.seeded || users.seeded || promos.seeded,
    categories: catalog.categories,
    products: catalog.products,
    users: users.users,
    promotions: promos.promotions,
  };
}

function seedCatalogData(): { seeded: boolean; categories: number; products: number } {
  if (categoryManager.findAll().length > 0 || productManager.findAll().length > 0) {
    return { seeded: false, categories: 0, products: 0 };
  }

  const categoryIdBySlug = new Map<string, string>();
  for (const category of CATEGORY_SEEDS) {
    const created = categoryManager.create({
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: true,
    });
    categoryIdBySlug.set(category.slug, created.id);
  }

  for (const seed of PRODUCT_SEEDS) {
    productManager.create({
      name: seed.name,
      description: seed.description,
      price: seed.price,
      compareAtPrice: seed.compareAtPrice ?? null,
      images: [image(seed.imageIndex)],
      categoryId: categoryIdBySlug.get(seed.categorySlug)!,
      sku: seed.sku,
      stock: seed.stock,
      rating: seed.rating,
      isActive: true,
    });
  }

  return { seeded: true, categories: CATEGORY_SEEDS.length, products: PRODUCT_SEEDS.length };
}

/**
 * Demo users — Phase-5 auth scaffolding.
 *
 * The storefront login depends on the users HTTP contract, and dev keeps
 * seeded users invisible to the API route graph (Phase-4 lesson), so these
 * accounts are (a) seeded into boot/render graphs here and (b) mirrored
 * into the API graph by syncDemoUsersViaApi from the /login shell.
 * Idempotent by email lookup.
 */
function seedDemoUsers(): { seeded: boolean; users: number } {
  let created = 0;
  for (const input of DEMO_USER_INPUTS) {
    if (userManager.findByEmail(input.email)) continue;
    userManager.create({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      address: [...input.address],
      role: input.role,
    });
    created++;
  }
  return { seeded: created > 0, users: created };
}

/**
 * Demo promotions so the checkout promo-code flow has a valid + an
 * invalid/outcome to exercise end to end. Idempotent by code lookup.
 *
 * Exported separately because `/checkout` additionally syncs these codes
 * into the API route module graph via POST /api/promotions: in Next 16
 * Turbopack dev, API handlers hold their own manager instance, so hashing
 * the codes only into the page/boot graphs leaves the validate route blind.
 */
export const DEMO_PROMOTION_INPUTS: CreatePromotionInput[] = [
  {
    code: 'BIENVENIDA10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 100000,
    maxUses: 100,
    validFrom: new Date(Date.now() - 3 * 86400000),
    validUntil: new Date(Date.now() + 180 * 86400000),
  },
  {
    code: 'GASTRO20K',
    discountType: 'fixed',
    discountValue: 20000,
    minPurchase: 800000,
    maxUses: 50,
    validFrom: new Date(Date.now() - 3 * 86400000),
    validUntil: new Date(Date.now() + 180 * 86400000),
  },
];

function seedDemoPromotions(): { seeded: boolean; promotions: number } {
  let created = 0;
  for (const promo of DEMO_PROMOTION_INPUTS) {
    if (promotionManager.findByCode(promo.code)) continue;
    promotionManager.create(promo);
    created++;
  }
  return { seeded: created > 0, promotions: created };
}

/**
 * Best-effort sync of the demo promo codes into the API module graph
 * through the promotions HTTP contract. GET ?code= returning 404 means the
 * API-side manager has not seen the code yet; POST it then. Idempotent by
 * the GET check, on top of the manager's per-code idempotency.
 */
export async function syncDemoPromotionsViaApi(baseUrl: string): Promise<string[]> {
  const synced: string[] = [];
  for (const promo of DEMO_PROMOTION_INPUTS) {
    const check = await fetch(
      `${baseUrl}/api/promotions?code=${encodeURIComponent(promo.code)}`,
      { cache: 'no-store' },
    );
    if (check.ok) continue; // already visible to the API routes
    const create = await fetch(`${baseUrl}/api/promotions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promo),
    });
    if (create.ok) synced.push(promo.code);
  }
  return synced;
}

/**
 * Mirror of the demo users into the API module graph through the users
 * HTTP contract. Login works against /api/users (the auth route runs in
 * the API graph), so seeded users are mirrored here: GET ?email= returning
 * 404 means the API-side manager has not seen the email yet; POST it with
 * the documented demo credentials. Idempotent by the GET check, on top of
 * the manager's per-email idempotency.
 */
export async function syncDemoUsersViaApi(baseUrl: string): Promise<string[]> {
  const synced: string[] = [];
  for (const user of DEMO_USER_INPUTS) {
    const check = await fetch(
      `${baseUrl}/api/users?email=${encodeURIComponent(user.email)}`,
      { cache: 'no-store' },
    );
    if (check.ok) continue; // already visible to the API routes
    const create = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (create.ok) synced.push(user.email);
  }
  return synced;
}


