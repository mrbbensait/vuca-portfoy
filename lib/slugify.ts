// Türkçe karakter desteğiyle URL-friendly slug oluşturma

const TURKISH_MAP: Record<string, string> = {
  'ç': 'c', 'Ç': 'C',
  'ğ': 'g', 'Ğ': 'G',
  'ı': 'i', 'I': 'I',
  'İ': 'I', 'i': 'i',
  'ö': 'o', 'Ö': 'O',
  'ş': 's', 'Ş': 'S',
  'ü': 'u', 'Ü': 'U',
}

export function slugify(text: string): string {
  let slug = text.toLowerCase()

  // Türkçe karakterleri dönüştür
  for (const [from, to] of Object.entries(TURKISH_MAP)) {
    slug = slug.replace(new RegExp(from, 'g'), to.toLowerCase())
  }

  return slug
    .normalize('NFD')                   // Unicode normalization
    .replace(/[\u0300-\u036f]/g, '')    // Aksanları kaldır
    .replace(/[^a-z0-9\s-]/g, '')       // Alfanumerik olmayan karakterleri kaldır
    .replace(/\s+/g, '-')               // Boşlukları tire yap
    .replace(/-+/g, '-')                // Birden fazla tireyi tekleştir
    .replace(/^-+|-+$/g, '')            // Baştaki ve sondaki tireleri kaldır
    .substring(0, 80)                   // Maksimum 80 karakter
}

export function generateSlug(portfolioName: string, displayName?: string): string {
  const base = displayName
    ? `${displayName}-${portfolioName}`
    : portfolioName

  return slugify(base)
}
