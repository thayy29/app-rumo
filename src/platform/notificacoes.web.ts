// Na web (teste por link) não há notificação local sem servidor: tudo vira nada, sem erro.
export async function pedirPermissao(): Promise<boolean> {
  return false;
}
export async function agendarFimDoBloco(_fimEm: number): Promise<string> {
  return '';
}
export async function agendarEmSegundos(_segundos: number): Promise<string> {
  return '';
}
export async function agendarLembreteDiario(_hora: number, _minuto: number): Promise<string> {
  return '';
}
export async function cancelar(_id: string | null | undefined): Promise<void> {}
export async function pendentes(): Promise<number> {
  return 0;
}
