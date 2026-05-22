export function fcfa(n: number): string {
  return Math.round(n).toLocaleString('fr-FR').replace(/,/g, ' ') + ' FCFA'
}

export function fcfaShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1_000) return Math.round(n / 1_000) + 'K'
  return String(Math.round(n))
}

export function pct(n: number, decimals = 1): string {
  return (n * 100).toFixed(decimals).replace('.0', '') + ' %'
}
