// Na web o Alert com botões do React Native não aparece; o confirm do navegador funciona no Safari do iPhone.
export function confirmar(opcoes: { titulo: string; mensagem: string; confirmar: string; destrutivo?: boolean }): Promise<boolean> {
  return Promise.resolve(globalThis.confirm?.(`${opcoes.titulo}\n\n${opcoes.mensagem}`) ?? false);
}
