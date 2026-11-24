import { useColorScheme } from 'react-native';

import { cores, type Cores } from './tokens';

export function useCores(): Cores {
  return useColorScheme() === 'dark' ? cores.escuro : cores.claro;
}
