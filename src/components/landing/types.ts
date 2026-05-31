// Shared types for landing marketing components.
// Centralised here to avoid duplication across landing/* components (SonarQube).

export interface TrustItem {
  /** Inline SVG path data (24x24 viewBox) for the indicator icon */
  iconPath: string
  /** Primary metric or claim, e.g. "Habilitador DIAN" */
  value: string
  /** Supporting label, e.g. "Certificado oficial" */
  label: string
}

export type BentoSpan = 'lg' | 'md' | 'sm'

export interface ProductTab {
  id: string
  label: string
}
