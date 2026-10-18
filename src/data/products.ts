import vanki from '@/assets/products/vanki.jpg'
import heartsVine from '@/assets/products/hearts-vine.jpg'
import twist from '@/assets/products/twist.jpg'
import petiteCluster from '@/assets/products/petite-cluster.jpg'

/**
 * The four CaratLane listing photos used in Figma (white studio background).
 * `zoom` reproduces Figma’s CROP fill: Vanki uses crop zoom 0.86 (image at
 * 116.28%), the others 0.72 (138.89%).
 */
export interface Product {
  id: ProductId
  name: string
  /** Short name used in vote tiles / notes. */
  short: string
  sku: string
  img: string
  zoom: number
  price: string
  mrp?: string
  /** Price range shown to the giver (hint pages hide exact prices). */
  range: string
  metal: string
}

export type ProductId = 'vanki' | 'hearts-vine' | 'twist' | 'petite-cluster'

export const PRODUCTS: Record<ProductId, Product> = {
  vanki: {
    id: 'vanki',
    name: 'Classic 9KT Gold Vanki Ring',
    short: 'Classic Vanki',
    sku: 'UR02452-8Y0000',
    img: vanki,
    zoom: 1 / 0.86,
    price: '₹9,732',
    mrp: '₹10,607',
    range: '₹9–10k',
    metal: 'Yellow gold',
  },
  'hearts-vine': {
    id: 'hearts-vine',
    name: 'Hearts Vine Diamond Ring',
    short: 'Hearts Vine',
    sku: 'JR12162',
    img: heartsVine,
    zoom: 1 / 0.72,
    price: '₹12,480',
    mrp: '₹13,640',
    range: '₹12–13k',
    metal: 'Yellow gold',
  },
  twist: {
    id: 'twist',
    name: 'Twist Diamond Ring',
    short: 'Twist Diamond',
    sku: 'JR07845',
    img: twist,
    zoom: 1 / 0.72,
    price: '₹10,950',
    range: '₹10–11k',
    metal: 'Yellow gold',
  },
  'petite-cluster': {
    id: 'petite-cluster',
    name: 'Petite Cluster Ring',
    short: 'Petite Cluster',
    sku: 'JR09908',
    img: petiteCluster,
    zoom: 1 / 0.72,
    price: '₹28,990',
    mrp: '₹31,500',
    range: '₹28–29k',
    metal: 'Yellow gold',
  },
}

export const product = (id: ProductId) => PRODUCTS[id]
