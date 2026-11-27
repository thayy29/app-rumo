import type { TarefaBase } from '../tipos';

const FEIA = 'Desenhar a curva em 4 pontos, sem ajuste fino';
const P = 'Antes de começar';
const C = 'Cardápio';

// Antes de começar (tarefas) e o cardápio por seção: a pessoa escolhe de 3 a 6 itens por track.
export const AUTOMACAO: TarefaBase[] = [
  { id: 'automacao.returns', fase: 'automacao', tipo: 'tarefa', grupo: P, texto: 'Criar dois returns: A com delay (Echo em 1/8) e B com reverb', prontoQuando: 'Os returns A e B tocam com os sends', versaoFeia: 'Só o return de reverb' },
  { id: 'automacao.auto-filter', fase: 'automacao', tipo: 'tarefa', grupo: P, texto: 'Colocar um Auto Filter nos grupos que vão se mover (harmonia, hats)', prontoQuando: 'O envelope tem um filtro para mover', versaoFeia: 'Só no grupo de harmonia' },
  { id: 'automacao.intro-filtro', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'INTRO', texto: 'Abrir devagar o filtro nos hats ou na percussão', parametro: 'Auto Filter: frequência (low-pass) em 16–32 compassos', prontoQuando: 'A intro cresce sem entrar elemento novo', versaoFeia: FEIA },
  { id: 'automacao.groove-volume', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'GROOVE', texto: 'Entrar os elementos com volume, não de uma vez', parametro: 'Volume do clip ou fader em 2–4 compassos', prontoQuando: 'Nenhuma entrada soa como um corte', versaoFeia: FEIA },
  { id: 'automacao.build-highpass', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'BUILD', texto: 'Subir um high-pass no grupo de harmonia ou na mix', parametro: 'Auto Filter (high-pass): frequência, 8 compassos', prontoQuando: 'O grave some antes do drop', versaoFeia: FEIA },
  { id: 'automacao.build-sends', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'BUILD', texto: 'Crescer reverb e delay na última frase', parametro: 'Send A e Send B', prontoQuando: 'A cauda enche o espaço antes do drop', versaoFeia: FEIA },
  { id: 'automacao.build-drive', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'BUILD', texto: 'Subir a ressonância ou o drive do synth principal', parametro: 'Resonance / Drive do filtro ou do Roar', prontoQuando: 'A tensão sobe mesmo com o volume parado', versaoFeia: FEIA },
  { id: 'automacao.corte-seco', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'Fim do BUILD', texto: 'Zerar sends e filtro no primeiro tempo do DROP', parametro: 'Todos os envelopes do BUILD', prontoQuando: 'O drop entra limpo, sem cauda', versaoFeia: FEIA },
  { id: 'automacao.drop-baixo', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'DROP', texto: 'Fazer o baixo respirar com um LFO lento no cutoff ou no drive', parametro: 'Cutoff / Drive com LFO, 4 compassos', prontoQuando: 'O baixo respira sem mudar notas', versaoFeia: FEIA },
  { id: 'automacao.drop-topo', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'DROP', texto: 'Pulsar pan ou volume num elemento de topo', parametro: 'Pan / Volume, 1–2 compassos', prontoQuando: 'O topo se mexe no espaço', versaoFeia: FEIA },
  { id: 'automacao.eco', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'Fim de cada frase', texto: 'Subir o send de delay só na última palavra ou no último stab', parametro: 'Send A, 1 compasso', prontoQuando: 'O eco aponta para a próxima frase', versaoFeia: FEIA },
  { id: 'automacao.break-longe', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'BREAK', texto: 'Fechar o low-pass na harmonia e aumentar o reverb', parametro: 'Auto Filter + Send B', prontoQuando: 'O break soa mais distante e íntimo', versaoFeia: FEIA },
  { id: 'automacao.volta', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'BREAK → BUILD 2', texto: 'Sumir a textura enquanto o filtro reabre', parametro: 'Volume + Auto Filter', prontoQuando: 'A volta é uma curva, não um corte', versaoFeia: FEIA },
  { id: 'automacao.outro-filtro', fase: 'automacao', tipo: 'cardapio', grupo: C, secao: 'OUTRO', texto: 'Fechar aos poucos o filtro nos últimos elementos', parametro: 'Auto Filter, 16–32 compassos', prontoQuando: 'A saída dá lugar para a próxima track no set', versaoFeia: FEIA },
];
