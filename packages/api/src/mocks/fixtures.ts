import type {
  DashboardKpiMetrics,
  Order,
  OrderStatus,
  PaymentTransaction,
  Product,
} from "@repo/schemas";

interface CuratedProductSeed {
  title: string;
  category: Product["category"];
  price: number;
  description: string;
  imageUri: string;
  thumbnailUri: string;
  variants: Array<{ sku: string; size?: string; color?: string; priceOffset: number }>;
  tags: string[];
}

export const CURATED_ETHIOPIAN_PRODUCTS: CuratedProductSeed[] = [
  {
    title: "Handwoven Menen Habesha Kemis (Gold Tibeb)",
    category: "Apparel",
    price: 24500,
    description:
      "Masterfully hand-spun pure Ethiopian cotton evening dress adorned with shimmering gold and emerald Aksumite geometric tibeb borders.",
    imageUri: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "KMS-MNN-S", size: "S", color: "Ivory & Gold", priceOffset: 0 },
      { sku: "KMS-MNN-M", size: "M", color: "Ivory & Gold", priceOffset: 0 },
      { sku: "KMS-MNN-L", size: "L", color: "Ivory & Gold", priceOffset: 1200 },
    ],
    tags: ["habesha kemis", "handwoven", "gold tibeb", "ceremonial"],
  },
  {
    title: "Artisan Shemma Netela Scarf (Silver Rayed Border)",
    category: "Apparel",
    price: 4800,
    description:
      "Featherlight two-layered pure cotton shawl featuring delicate silver thread weft work. Handwoven by artisan weavers in Shiro Meda, Addis Ababa.",
    imageUri: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "NTL-SLV-STD", size: "Standard (2m)", color: "White/Silver", priceOffset: 0 },
    ],
    tags: ["netela", "shemma", "cotton", "addis artisan"],
  },
  {
    title: "Festive Wollo Silk-Blend Kemis with Belt",
    category: "Apparel",
    price: 28000,
    description:
      "Regal ceremonial Wollo-style silk and hand-spun cotton robe with intricate hand-embroidered belt and flared sleeves.",
    imageUri: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "KMS-WLL-M", size: "M", color: "Crimson & Gold", priceOffset: 0 },
      { sku: "KMS-WLL-L", size: "L", color: "Crimson & Gold", priceOffset: 0 },
    ],
    tags: ["wollo", "silk blend", "festive", "luxury attire"],
  },
  {
    title: "Modern Tibeb Linen Tunic & Trousers",
    category: "Apparel",
    price: 14000,
    description:
      "Modern tailored menswear crafted from natural Ethiopian flax linen with subtle minimalist collar embroidery.",
    imageUri: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "TNC-LNN-M", size: "M", color: "Natural Sand", priceOffset: 0 },
      { sku: "TNC-LNN-L", size: "L", color: "Natural Sand", priceOffset: 0 },
      { sku: "TNC-LNN-XL", size: "XL", color: "Natural Sand", priceOffset: 500 },
    ],
    tags: ["menswear", "tibeb", "linen", "contemporary"],
  },
  {
    title: "Batu Pure Cotton Gabi Throw",
    category: "Apparel",
    price: 6500,
    description:
      "Traditional four-fold brushed soft highland cotton blanket, prized for cold Ethiopian highland evenings.",
    imageUri: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "GBI-BTU-STD", size: "Large", color: "Cloud White", priceOffset: 0 },
    ],
    tags: ["gabi", "cotton throw", "highland", "heritage"],
  },
  {
    title: "Highland Calfskin Executive Duffle Bag",
    category: "Accessories",
    price: 18500,
    description:
      "Full-grain pull-up leather weekender crafted from world-renowned Ethiopian highland cowhide, naturally vegetable-tanned.",
    imageUri: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "LTH-DFL-BRN", size: "45L", color: "Cognac Brown", priceOffset: 0 },
      { sku: "LTH-DFL-BLK", size: "45L", color: "Obsidian Black", priceOffset: 0 },
    ],
    tags: ["leather", "duffle", "travel", "highland craft"],
  },
  {
    title: "Addis Artisan Crossbody Saddle Bag",
    category: "Accessories",
    price: 9200,
    description:
      "Vegetable-tanned structured leather crossbody with hand-forged brass buckle and lush pigskin interior lining.",
    imageUri: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "LTH-SDL-HNY", color: "Honey Tan", priceOffset: 0 },
      { sku: "LTH-SDL-DKB", color: "Dark Espresso", priceOffset: 0 },
    ],
    tags: ["leather bag", "saddle bag", "handcrafted", "addis"],
  },
  {
    title: "Entoto Handcrafted Chelsea Boots",
    category: "Footwear",
    price: 12800,
    description:
      "Highland leather ankle boots with Goodyear-welt construction, elasticated side gussets, and storm-welt lug sole.",
    imageUri: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "SH-ENT-41", size: "EU 41", color: "Rich Chestnut", priceOffset: 0 },
      { sku: "SH-ENT-42", size: "EU 42", color: "Rich Chestnut", priceOffset: 0 },
      { sku: "SH-ENT-43", size: "EU 43", color: "Rich Chestnut", priceOffset: 0 },
      { sku: "SH-ENT-44", size: "EU 44", color: "Rich Chestnut", priceOffset: 0 },
    ],
    tags: ["boots", "chelsea", "footwear", "ethiopian leather"],
  },
  {
    title: "Minimalist Raw-Edge Leather Laptop Folio",
    category: "Accessories",
    price: 5400,
    description:
      "Sleek protective sleeve for 14-inch to 16-inch laptops, crafted from untreated full-grain hide that patinas beautifully over time.",
    imageUri: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "LTH-FLO-14", size: "14-inch", color: "Chestnut", priceOffset: 0 },
      { sku: "LTH-FLO-16", size: "16-inch", color: "Chestnut", priceOffset: 600 },
    ],
    tags: ["laptop sleeve", "folio", "minimalist", "executive"],
  },
  {
    title: "Hand-Stitched Bifold Cardholder Wallet",
    category: "Accessories",
    price: 2800,
    description:
      "Ultra-compact pocket cardholder with 6 card slots and central cash compartment, saddle-stitched with waxed linen thread.",
    imageUri: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "LTH-WLT-S", color: "Desert Tan", priceOffset: 0 },
      { sku: "LTH-WLT-B", color: "Midnight Black", priceOffset: 0 },
    ],
    tags: ["wallet", "cardholder", "saddle stitch"],
  },
  {
    title: "Yirgacheffe Grade 1 Special Reserve (Washed Beans, 1kg)",
    category: "Specialty Coffee",
    price: 3200,
    description:
      "Grown at 2,100m elevation. Distinct jasmine floral aroma, delicate bergamot and lemon zest acidity, with a smooth honey nectar finish.",
    imageUri: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "COF-YRG-500", size: "500g", color: "Whole Bean", priceOffset: -1400 },
      { sku: "COF-YRG-1KG", size: "1kg", color: "Whole Bean", priceOffset: 0 },
    ],
    tags: ["coffee", "yirgacheffe", "single origin", "specialty coffee"],
  },
  {
    title: "Sidama Guji Natural Heirloom Roast (Whole Bean, 1kg)",
    category: "Specialty Coffee",
    price: 3500,
    description:
      "Naturally sun-dried on African raised beds in the highlands of Oromia. Bursting with ripe wild blueberry, dark cacao, and peach notes.",
    imageUri: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "COF-GUJ-500", size: "500g", color: "Whole Bean", priceOffset: -1500 },
      { sku: "COF-GUJ-1KG", size: "1kg", color: "Whole Bean", priceOffset: 0 },
    ],
    tags: ["coffee", "guji", "sidama", "natural process"],
  },
  {
    title: "Harar Longberry Sun-Dried Coffee (Whole Bean, 1kg)",
    category: "Specialty Coffee",
    price: 2900,
    description:
      "Eastern Ethiopian heirloom cultivar. Heavy velvety body with distinct spiced cardamom, dried blackberry, and dark wine-like tones.",
    imageUri: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "COF-HRR-1KG", size: "1kg", color: "Whole Bean", priceOffset: 0 },
    ],
    tags: ["coffee", "harar", "longberry", "spiced roast"],
  },
  {
    title: "Kaffa Ancient Forest Wild Harvest (Limited Edition, 500g)",
    category: "Specialty Coffee",
    price: 4600,
    description:
      "Hand-foraged wild Arabica harvested from pristine UNESCO biosphere reserves in Kaffa, the birthplace of all coffee.",
    imageUri: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "COF-KFF-500", size: "500g (Tin)", color: "Whole Bean", priceOffset: 0 },
    ],
    tags: ["kaffa", "wild harvest", "unesco", "rare micro-lot"],
  },
  {
    title: "Handcrafted Terracotta Clay Jebena Coffee Pitcher",
    category: "Home & Living",
    price: 3800,
    description:
      "Traditional black clay Ethiopian coffee pot hand-burnished by master potters. Features spherical base and straw-filtered pouring neck.",
    imageUri: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "JBN-TER-M", size: "Medium (6-cup)", color: "Smoked Terracotta", priceOffset: 0 },
    ],
    tags: ["jebena", "clay pitcher", "coffee ceremony", "earthenware"],
  },
  {
    title: "Addis Brass-Inlaid Sini Porcelain Cups (Set of 6)",
    category: "Home & Living",
    price: 4200,
    description:
      "Six handleless porcelain coffee cups lined with delicate gold and brass filigree geometric patterns, designed for the Buna ceremony.",
    imageUri: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "SINI-SET-6", size: "Set of 6", color: "White & Gold", priceOffset: 0 },
    ],
    tags: ["sini cups", "buna ceremony", "porcelain", "gold rim"],
  },
  {
    title: "Traditional Woven Straw Mesob Dining Basket",
    category: "Home & Living",
    price: 16500,
    description:
      "Intricately coiled dining centerpiece basket with conical cover, woven by master basketweavers from dyed highland wild grasses.",
    imageUri: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "MSB-TRD-L", size: "Large Dining Table", color: "Multi-Ge'ez Weave", priceOffset: 0 },
    ],
    tags: ["mesob", "dining basket", "handwoven straw", "centerpiece"],
  },
  {
    title: "Carved Wild Olive Wood Serving Platter",
    category: "Home & Living",
    price: 4900,
    description:
      "Single-block carved sustainably harvested wild olive wood board, polished with organic beeswax and cold-pressed linseed oil.",
    imageUri: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "WD-PLT-M", size: "40cm", color: "Natural Grain", priceOffset: 0 },
    ],
    tags: ["olive wood", "platter", "natural grain", "artisan kitchen"],
  },
  {
    title: "Lalibela Cross Sterling Silver Pendant Necklace",
    category: "Jewelry",
    price: 8500,
    description:
      "Hand-chiseled lost-wax cast 925 sterling silver Lalibela processional cross pendant on a braided black silk cord.",
    imageUri: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "JWL-LAL-925", size: "50mm Pendant", color: "Sterling Silver", priceOffset: 0 },
    ],
    tags: ["cross pendant", "lalibela", "sterling silver", "filigree jewelry"],
  },
  {
    title: "Axumite Geometric Filigree Bangle Bracelet",
    category: "Jewelry",
    price: 11200,
    description:
      "Traditional open-cuff silver bangle bracelet hand-engraved with ancient Aksumite obelisk motifs and floral filigree.",
    imageUri: "https://images.unsplash.com/photo-1611591475152-477038e2354c?auto=format&fit=crop&w=800&q=80",
    thumbnailUri: "https://images.unsplash.com/photo-1611591475152-477038e2354c?auto=format&fit=crop&w=200&q=80",
    variants: [
      { sku: "JWL-AXM-CUF", size: "Adjustable", color: "Antique Silver", priceOffset: 0 },
    ],
    tags: ["bangle", "axumite", "cuff bracelet", "hand engraved"],
  },
];

export function generateSeedProducts(count = 5000): Product[] {
  const products: Product[] = [];
  const baseTimestamp = new Date("2026-10-01T08:00:00Z").getTime();
  const curatedLen = CURATED_ETHIOPIAN_PRODUCTS.length;

  for (let i = 1; i <= count; i++) {
    const seed = CURATED_ETHIOPIAN_PRODUCTS[(i - 1) % curatedLen]!;
    const id = `prod_${i}`;
    const inStock = i % 11 !== 0; // ~90% in stock
    const stockCount = inStock ? 4 + (i % 45) : 0;
    const createdAt = new Date(baseTimestamp + i * 60000).toISOString();

    const title = i <= curatedLen ? seed.title : `${seed.title} (Batch ${Math.floor(i / curatedLen) + 1})`;

    products.push({
      id,
      vendorId: "vdr_primary_store",
      title,
      description: seed.description,
      category: seed.category,
      price: seed.price,
      currency: "ETB",
      inStock,
      stockCount,
      images: [
        {
          id: `img_${i}_1`,
          uri: seed.imageUri,
          thumbnailUri: seed.thumbnailUri,
          isCover: true,
          order: 0,
          fileSizeBytes: 120 * 1024,
          width: 800,
          height: 800,
        },
      ],
      variants: seed.variants.map((v, vIdx) => ({
        id: `var_${i}_${vIdx + 1}`,
        sku: `${v.sku}-${i}`,
        size: v.size,
        color: v.color,
        priceOffset: v.priceOffset,
        stock: Math.floor(stockCount / Math.max(1, seed.variants.length)),
      })),
      tags: seed.tags,
      createdAt,
      updatedAt: createdAt,
    });
  }
  return products;
}

const ETHIOPIAN_CUSTOMERS = [
  { name: "Dawit Alemu", phone: "+251911234567", address: "Bole Atlas, Cameroon St, Addis Ababa" },
  { name: "Bethlehem Tadesse", phone: "+251912345678", address: "Kazanchis, Guinea Conakry St, Addis Ababa" },
  { name: "Yohannes Haile", phone: "+251711456789", address: "Old Airport, South Africa St, Addis Ababa" },
  { name: "Selamawit Desta", phone: "+251922334455", address: "Sarbet, Tor Hailoch, Addis Ababa" },
  { name: "Tariku Bekele", phone: "+251933445566", address: "Piassa, Church Road, Addis Ababa" },
  { name: "Almaz Kebede", phone: "+251911889900", address: "Bole Medhanialem, Edna Mall Area, Addis Ababa" },
  { name: "Henok Girma", phone: "+251712998877", address: "CMC Michael, Addis Ababa" },
  { name: "Meron Tesfaye", phone: "+251944556677", address: "Hawassa Lake View, Hawassa" },
];

export function generateSeedOrders(): Order[] {
  const statuses: OrderStatus[] = ["NEW", "ACCEPTED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
  const orders: Order[] = [];
  const now = new Date("2026-10-27T10:00:00Z").getTime();
  const custLen = ETHIOPIAN_CUSTOMERS.length;
  const prodLen = CURATED_ETHIOPIAN_PRODUCTS.length;

  for (let i = 1; i <= 30; i++) {
    const status = statuses[(i - 1) % statuses.length] ?? "NEW";
    const orderNumber = `ORD-ADDIS-${2026000 + i}`;
    const cust = ETHIOPIAN_CUSTOMERS[(i - 1) % custLen]!;
    const prodSeed = CURATED_ETHIOPIAN_PRODUCTS[(i - 1) % prodLen]!;
    const quantity = (i % 3) + 1;
    const unitPrice = prodSeed.price;
    const subtotal = unitPrice * quantity;
    const shippingFee = 350; // Standard express Addis dispatch
    const total = subtotal + shippingFee;
    const createdDate = new Date(now - i * 3600 * 1000 * 4).toISOString();

    orders.push({
      id: `ord_${i}`,
      orderNumber,
      vendorId: "vdr_primary_store",
      customer: {
        id: `cust_${i}`,
        name: cust.name,
        phone: cust.phone,
        email: `${cust.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
        shippingAddress: cust.address,
      },
      status,
      items: [
        {
          id: `item_${i}_1`,
          productId: `prod_${((i - 1) % prodLen) + 1}`,
          productTitle: prodSeed.title,
          sku: `SKU-${prodSeed.category.slice(0, 3).toUpperCase()}-${i}`,
          vendorId: "vdr_primary_store",
          quantity,
          unitPrice,
          subtotal,
          commissionRate: 0.0,
          netVendorAmount: subtotal,
        },
      ],
      currency: "ETB",
      subtotal,
      shippingFee,
      discountTotal: 0,
      total,
      timeline: [
        {
          id: `tl_${i}_1`,
          status: "NEW",
          timestamp: createdDate,
          actor: "Customer App Checkout",
          note: "Order placed via Telebirr Checkout",
        },
        ...(status !== "NEW"
          ? [
              {
                id: `tl_${i}_2`,
                status,
                timestamp: new Date(now - i * 3600 * 1000 * 2).toISOString(),
                actor: "Atelier Addis Fulfillment",
                note: `Transitioned to ${status}`,
              },
            ]
          : []),
      ],
      createdAt: createdDate,
      updatedAt: createdDate,
    });
  }

  return orders;
}

export function generateSeedDashboardMetrics(): DashboardKpiMetrics {
  return {
    vendorId: "vdr_primary_store",
    revenueToday: 384500,
    revenueYesterday: 312000,
    revenueChangePercent: 23.2,
    ordersTodayCount: 28,
    ordersPendingAcceptanceCount: 6,
    lowStockItemsCount: 4,
    pendingPayoutAmount: 215400,
    currency: "ETB",
    revenue7DaysSeries: [
      { date: "2026-10-21", label: "Wed", revenue: 245000, orderCount: 16 },
      { date: "2026-10-22", label: "Thu", revenue: 289000, orderCount: 20 },
      { date: "2026-10-23", label: "Fri", revenue: 345000, orderCount: 24 },
      { date: "2026-10-24", label: "Sat", revenue: 468000, orderCount: 35 },
      { date: "2026-10-25", label: "Sun", revenue: 395000, orderCount: 28 },
      { date: "2026-10-26", label: "Mon", revenue: 312000, orderCount: 22 },
      { date: "2026-10-27", label: "Tue", revenue: 384500, orderCount: 28 },
    ],
    lastAggregatedAt: new Date("2026-10-27T10:00:00Z").toISOString(),
  };
}

export function generateSeedTransactions(): PaymentTransaction[] {
  return [
    {
      id: "tx_1",
      orderId: "ord_1",
      vendorId: "vdr_primary_store",
      amount: 24850,
      currency: "ETB",
      customerPhone: "+251911234567",
      provider: "TELEBIRR",
      state: "SUCCESS",
      providerReference: "TLB-89342710",
      idempotencyKey: "8f5a6b12-9c34-4d67-8e9a-112233445566",
      checkoutRequestId: "TB_REQ_27102026_1",
      initiatedAt: "2026-10-27T08:15:00Z",
      completedAt: "2026-10-27T08:15:24Z",
      receiptNumber: "TLB-89342710",
    },
  ];
}
