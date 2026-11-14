/* © 2026 Eden Jewelry. All rights reserved. */
// The workshop pieces (19 products) with their photos.
//
// PHOTOS: in client/public/products/<folder>/ (served by the website itself).
// PRICES: temporary. Change them in the admin dashboard (Edit -> Price -> Save)
// or here, then run `npm run seed` again.
//
// Running the seed again updates these products by code, removes products whose
// code is not in this list, and keeps orders and users.
// To add a new photo later: Dashboard -> Edit -> Upload photos (ImageKit) -> Save.

export const rings = [
  {
    code: 'R01',
    name: 'Silver Feather Pendant',
    type: 'pendant',
    stone: 'none',
    price: 35,
    sizes: [],
    images: ['/products/01-silver-feather-pendant/silver-feather-pendant-1.jpg'],
    description:
      'Handmade 925 silver feather with finely engraved barbs and a hanging loop. Light, detailed and easy to wear every day.',
  },
  {
    code: 'R02',
    name: 'Olive Green Halo Ring',
    type: 'ring',
    stone: 'green',
    price: 85,
    featured: true,
    images: ['/products/02-olive-green-oval-halo-ring/olive-green-oval-halo-ring-1.jpg', '/products/02-olive-green-oval-halo-ring/olive-green-oval-halo-ring-2.jpg'],
    description:
      'A large faceted olive-green oval in a scalloped silver halo, set on an open split band.',
  },
  {
    code: 'R03',
    name: 'Light Blue Solitaire',
    type: 'ring',
    stone: 'light blue',
    price: 75,
    images: ['/products/03-light-blue-solitaire-ring/light-blue-solitaire-ring-1.jpg', '/products/03-light-blue-solitaire-ring/light-blue-solitaire-ring-2.jpg'],
    description:
      'A round light-blue stone held high in a six-prong crown on a slim, polished band.',
  },
  {
    code: 'R04',
    name: 'Champagne Diamond Solitaire',
    type: 'ring',
    stone: 'diamond',
    price: 120,
    featured: true,
    images: ['/products/04-champagne-solitaire-ring/champagne-solitaire-ring-1.jpg', '/products/04-champagne-solitaire-ring/champagne-solitaire-ring-2.jpg', '/products/04-champagne-solitaire-ring/champagne-solitaire-ring-3.jpg', '/products/04-champagne-solitaire-ring/champagne-solitaire-ring-4.jpg'],
    description:
      'A round champagne-toned diamond-cut stone raised in a six-prong setting on a fine silver band.',
  },
  {
    code: 'R05',
    name: 'Orange Marquise Split Ring',
    type: 'ring',
    stone: 'orange',
    price: 70,
    images: ['/products/05-orange-marquise-split-ring/orange-marquise-split-ring-1.jpg'],
    description:
      'A faceted orange marquise set between the two arms of an open split shank.',
  },
  {
    code: 'R06',
    name: 'Pink Cabochon Twist Ring',
    type: 'ring',
    stone: 'pink',
    price: 65,
    images: ['/products/06-pink-cabochon-twist-ring/pink-cabochon-twist-ring-1.jpg'],
    description:
      'A smooth oval pink cabochon in four prongs on a twisted crossover band.',
  },
  {
    code: 'R07',
    name: 'Greek Key Red Stone Ring',
    type: 'ring',
    stone: 'red',
    price: 110,
    featured: true,
    images: ['/products/07-red-stone-greek-key-mens-ring/red-stone-greek-key-mens-ring-1.jpg'],
    description:
      "A wide men's band with a faceted red oval and a Greek key pattern cut along both sides.",
  },
  {
    code: 'R08',
    name: 'Turquoise Square Signet',
    type: 'ring',
    stone: 'turquoise',
    price: 90,
    images: ['/products/08-turquoise-square-signet-ring/turquoise-square-signet-ring-1.jpg'],
    description:
      "A natural-looking turquoise cushion in a square four-claw head on a solid men's band.",
  },
  {
    code: 'R09',
    name: 'Diamond Wide Band',
    type: 'ring',
    stone: 'diamond',
    price: 130,
    featured: true,
    images: ['/products/09-clear-stone-wide-band-ring/clear-stone-wide-band-ring-1.jpg'],
    description:
      'A modern wide band with a round diamond-cut stone set flush in a high-polish finish.',
  },
  {
    code: 'R10',
    name: 'Turquoise Ribbed Ring',
    type: 'ring',
    stone: 'turquoise',
    price: 80,
    images: ['/products/10-turquoise-ribbed-mens-ring/turquoise-ribbed-mens-ring-1.jpg'],
    description:
      'A small oval turquoise in a square frame with ribbed, stepped shoulders.',
  },
  {
    code: 'R11',
    name: 'Engraved Red Stone Ring',
    type: 'ring',
    stone: 'red',
    price: 95,
    images: ['/products/11-red-stone-engraved-mens-ring/red-stone-engraved-mens-ring-1.jpg'],
    description:
      'A round faceted red stone in a crown bezel on a square head with an engraved shank.',
  },
  {
    code: 'R12',
    name: 'Dendritic Agate Ring',
    type: 'ring',
    stone: 'agate',
    price: 85,
    images: ['/products/12-dendritic-agate-ribbed-mens-ring/dendritic-agate-ribbed-mens-ring-1.jpg'],
    description:
      'White agate with natural tree-like patterns in a square head on a ribbed band. No two stones are the same.',
  },
  {
    code: 'R13',
    name: 'Diamond Hexagon Ring',
    type: 'ring',
    stone: 'diamond',
    price: 125,
    featured: true,
    images: ['/products/13-clear-stone-hexagon-mens-ring/clear-stone-hexagon-mens-ring-1.jpg'],
    description:
      "A round diamond-cut stone in a sharp hexagon bezel on a smooth, wide men's band.",
  },
  {
    code: 'R14',
    name: 'Light Blue Ribbed Ring',
    type: 'ring',
    stone: 'light blue',
    price: 85,
    images: ['/products/14-light-blue-ribbed-mens-ring/light-blue-ribbed-mens-ring-1.jpg'],
    description:
      'A round light-blue stone in an octagon top with ribbed, stepped shoulders.',
  },
  {
    code: 'R15',
    name: 'Dark Red Oval Ring',
    type: 'ring',
    stone: 'dark red',
    price: 100,
    featured: true,
    images: ['/products/15-dark-red-oval-textured-ring/dark-red-oval-textured-ring-1.jpg'],
    description:
      'A large polished dark-red oval cabochon on a heavily textured, scaled shank.',
  },
  {
    code: 'R16',
    name: 'Flower Bud Open Ring',
    type: 'ring',
    stone: 'none',
    price: 45,
    images: ['/products/16-silver-flower-bud-open-ring/silver-flower-bud-open-ring-1.jpg'],
    description:
      'An open bypass ring ending in a silver flower bud and a detailed leaf. Adjusts slightly to the finger.',
  },
  {
    code: 'R17',
    name: 'Black Stone Signet',
    type: 'ring',
    stone: 'black',
    price: 60,
    images: ['/products/17-polished-signet-black-stone-ring/polished-signet-black-stone-ring-1.jpg'],
    description:
      'A minimal high-polish signet with one small black stone set in the corner.',
  },
  {
    code: 'R18',
    name: 'Orange Hexagon Signet',
    type: 'ring',
    stone: 'orange',
    price: 90,
    images: ['/products/18-orange-hexagon-engraved-signet-ring/orange-hexagon-engraved-signet-ring-1.jpg'],
    description:
      'A flat orange hexagonal stone on a classic signet with engraved shoulders.',
  },
  {
    code: 'R19',
    name: 'Dark Red Square Ring',
    type: 'ring',
    stone: 'dark red',
    price: 95,
    images: ['/products/19-dark-red-square-rope-ring/dark-red-square-rope-ring-1.jpg'],
    description:
      'A square dark-red cabochon on a band with rope and carved details.',
  },
].map((p) => ({ type: 'ring', color: 'silver', inStock: true, featured: false, videos: [], ...p }));
