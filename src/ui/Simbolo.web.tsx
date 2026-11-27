import { Text } from 'react-native';

import type { NomeSimbolo } from './Simbolo';

// Na web (versão de teste por link) os SF Symbols viram caracteres simples.
const GLIFOS: Record<string, string> = {
  checkmark: '✓',
  link: '🔗',
  'list.bullet': '☰',
  'chevron.left': '‹',
  book: '📖',
  laptopcomputer: '💻',
  pencil: '✎',
  plus: '+',
  xmark: '×',
  map: '▦',
  'slider.horizontal.3': '≡',
  'music.note.list': '♫',
  'arrow.uturn.left': '↺',
};

export function Simbolo({ name, size, tintColor }: { name: NomeSimbolo; size: number; tintColor: string; weight?: string }) {
  const glifo = GLIFOS[String(name)] ?? '•';
  return <Text style={{ fontSize: size, lineHeight: size * 1.2, color: tintColor, fontWeight: '700' }}>{glifo}</Text>;
}
