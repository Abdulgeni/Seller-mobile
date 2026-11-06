# ADR 0019: Ethiopian Luxury Artisan Catalogue, Multi-Provider Payment Suite (Telebirr, CBE, M-Pesa), and Receipt Elevation

## Context
The seller app is evolving to serve Ethiopian merchants in Addis Ababa and beyond.
The user requested:
1. Elevate visual design to luxury, magnificent, elegant, and premium mobile app standards built by pro experts.
2. Localize payment systems for Ethiopia by integrating **Telebirr** (Ethio Telecom), **CBE Birr / CBE Mobile Banking** (Commercial Bank of Ethiopia), and **M-Pesa Ethiopia** (Safaricom Ethiopia).
3. Omit and replace the confusing "M-Pesa Vault Receipt" with a crystal-clear, luxury **Transaction Receipt & Confirmation**.
4. Curate specific, authentic luxury goods (Traditional Habesha textiles, Highland leathercraft, Single-Origin Specialty Coffee, clay Jebena coffee ceremony sets, and Lalibela silver filigree jewelry) with 100% matched high-definition photography, replacing generic seeded dummy items.
5. Primary currency: **ETB** (Ethiopian Birr).

## Decisions
1. **Currency**: Add `ETB` to `CurrencyCodeSchema` and set it as the primary default across the entire application.
2. **Payment Providers**: Introduce `PaymentProviderSchema = z.enum(["TELEBIRR", "CBE", "MPESA"])`. Support realistic Ethiopian payment initiation flows:
   - **Telebirr**: In-app push / USSD prompt (*127#) for Ethio Telecom lines (+251 9... / 09...).
   - **CBE Birr**: Commercial Bank of Ethiopia direct account transfer / USSD push (*847#).
   - **M-Pesa Ethiopia**: Safaricom Ethiopia STK push (*733#) for Safaricom lines (+251 7... / 07...).
3. **Receipt Component**: Rename and redesign the previous "vault receipt" into `<PaymentReceiptConfirmation>`, providing an official luxury transaction confirmation with provider branding, authentic transaction reference codes (`TLB-...`, `CBE-FT...`, `MP-ETH-...`), and native share sheet export.
4. **Catalogue Curation**: Curate an exclusive boutique catalogue of authentic Ethiopian artisan products with realistic pricing in ETB, matched high-resolution photography, and detailed craftsmanship descriptions.
5. **Phone & Address Localization**: Validate Ethiopian phone formats (`+2519...`, `+2517...`, `09...`, `07...`) and use real Addis Ababa delivery districts (Bole, Kazanchis, Old Airport, Sarbet, Piassa, Hawassa).

## Consequences
- Full alignment with real-world Ethiopian merchant workflows.
- Professional, world-class mobile app feel matching top international luxury commerce apps.
- Clear, understandable receipt presentation replacing confusing terminology.
- All automated tests remain 100% green.
