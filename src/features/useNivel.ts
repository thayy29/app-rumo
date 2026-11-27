import { useAoVivo } from '@/data/aoVivo';
import { nivelPara, proximoNivel } from '@/domain/nivel';
import { consultaTerminadas } from '@/features/track';

// Nível atual pelas tracks terminadas, ao vivo: o Knob se veste de acordo.
export function useNivel() {
  const { data: terminadas } = useAoVivo(consultaTerminadas());
  return { terminadas, nivel: nivelPara(terminadas.length), proximo: proximoNivel(terminadas.length) };
}
