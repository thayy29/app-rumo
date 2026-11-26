import { SymbolView, type SymbolViewProps } from 'expo-symbols';

// Ícone do sistema (SF Symbols). Na web não há SF Symbols: ver Simbolo.web.tsx.
export type NomeSimbolo = SymbolViewProps['name'];

export function Simbolo(props: { name: NomeSimbolo; size: number; tintColor: string; weight?: SymbolViewProps['weight'] }) {
  return <SymbolView {...props} />;
}
