// This build is light-only: the header keeps a light background, so every place
// that shows the brand mark must use the light-background artwork.
//
// Note the CMS keys read backwards compared to their name: `logoDark` holds the
// light-background logo, `logoLight` the dark-background one. Renaming them in
// the DB would orphan the uploaded files, so the mapping is pinned here.
export function pickLogo(company: Record<string, string>): string {
  return company.logoDark || company.logo || company.logoLight;
}