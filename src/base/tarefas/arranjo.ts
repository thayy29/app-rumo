import type { TarefaBase } from '../tipos';

// O arranjo nasce por subtração: a track inteira com o loop completo, depois cada seção perde elementos.
const E = 'Esqueleto';
const S = 'Subtrair por seção';
const H = 'Conferir a história';

export const ARRANJO: TarefaBase[] = [
  { id: 'arranjo.locators', fase: 'arranjo', tipo: 'tarefa', grupo: E, texto: 'Criar os locators do mapa do estilo', prontoQuando: 'Os locators aparecem na barra do Arrangement', versaoFeia: 'Só três: INTRO, DROP, OUTRO' },
  { id: 'arranjo.duplicar', fase: 'arranjo', tipo: 'tarefa', grupo: E, texto: 'Levar o loop da Session para o Arrangement e duplicar até o fim do mapa', prontoQuando: 'O loop completo toca do início ao fim', versaoFeia: 'Duplicar só até o primeiro DROP' },
  { id: 'arranjo.organizar', fase: 'arranjo', tipo: 'tarefa', grupo: E, texto: 'Organizar as faixas por função e cor (kick, bateria, baixo, harmonia, hook, FX)', prontoQuando: 'Dá para achar qualquer elemento em 2 segundos', versaoFeia: 'Só colorir kick e baixo' },
  { id: 'arranjo.intro', fase: 'arranjo', tipo: 'tarefa', grupo: S, secao: 'INTRO', texto: 'Deixar a INTRO só com kick, hats e percussão', prontoQuando: 'Os primeiros 16 compassos dão para mixar num set', versaoFeia: 'Apagar baixo e acordes da intro' },
  { id: 'arranjo.groove', fase: 'arranjo', tipo: 'tarefa', grupo: S, secao: 'GROOVE', texto: 'Entrar o baixo e um elemento por vez no GROOVE, a cada 8 compassos', prontoQuando: 'Cada 8 compassos traz algo novo', versaoFeia: 'Só o baixo entra' },
  { id: 'arranjo.build', fase: 'arranjo', tipo: 'tarefa', grupo: S, secao: 'BUILD', texto: 'Tirar o baixo e o kick nos últimos 4 ou 8 compassos do BUILD', prontoQuando: 'Sente-se o vácuo antes do drop', versaoFeia: 'Tirar só o baixo' },
  { id: 'arranjo.drop1', fase: 'arranjo', tipo: 'tarefa', grupo: S, secao: 'DROP 1', texto: 'Juntar tudo no DROP 1, com o hook na frente', prontoQuando: 'O drop é a parte mais cheia até aqui', versaoFeia: 'Deixar o loop completo' },
  { id: 'arranjo.break', fase: 'arranjo', tipo: 'tarefa', grupo: S, secao: 'BREAK', texto: 'Tirar kick e baixo do BREAK; ficam harmonia, vocal e texturas', prontoQuando: 'A energia cai e dá vontade de voltar', versaoFeia: 'Mutar o kick' },
  { id: 'arranjo.drop2', fase: 'arranjo', tipo: 'tarefa', grupo: S, secao: 'DROP 2', texto: 'Fazer o DROP 2 com uma diferença: camada nova, variação de baixo ou progressão', prontoQuando: 'O segundo drop não é uma cópia', versaoFeia: 'Um elemento a mais' },
  { id: 'arranjo.outro', fase: 'arranjo', tipo: 'tarefa', grupo: S, secao: 'OUTRO', texto: 'Espelhar a intro no OUTRO, saindo um elemento a cada 8 compassos', prontoQuando: 'Termina só com kick e hats', versaoFeia: 'Copiar a intro no fim' },
  { id: 'arranjo.tipo-drop', fase: 'arranjo', tipo: 'tarefa', grupo: H, texto: 'Escolher o tipo de drop: culmination, minimal ou fancy', prontoQuando: 'O tipo está anotado no locator do DROP', versaoFeia: 'Ficar no culmination' },
  { id: 'arranjo.referencia', fase: 'arranjo', tipo: 'tarefa', grupo: H, texto: 'Comparar a estrutura com a referência no Arrangement', prontoQuando: 'As seções têm tamanho parecido com a referência', versaoFeia: 'Comparar só a intro' },
  { id: 'arranjo.ouvir', fase: 'arranjo', tipo: 'tarefa', grupo: H, texto: 'Ouvir a track inteira de olhos fechados e marcar onde perde o interesse', prontoQuando: 'Cada ponto fraco virou um locator "!"', versaoFeia: 'Ouvir até o primeiro DROP' },
  { id: 'arranjo.feedback', fase: 'arranjo', tipo: 'tarefa', grupo: H, texto: 'Mandar o esqueleto para alguém e pedir uma frase de feedback', prontoQuando: 'Recebi uma resposta', versaoFeia: 'Ouvir num celular, longe do computador' },
];
