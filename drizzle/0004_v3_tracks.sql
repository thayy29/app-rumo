-- v3 (ADR-017): o domínio de curso sai e entra track → fase → tarefa.
-- Os dados da versão de estudo eram só de teste e não são migrados.
DROP TABLE `bloco`;
--> statement-breakpoint
DROP TABLE `topico`;
--> statement-breakpoint
DROP TABLE `grupo`;
--> statement-breakpoint
DROP TABLE `estudo`;
--> statement-breakpoint
CREATE TABLE `track` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`estilo` text NOT NULL,
	`bpm` integer NOT NULL,
	`tom` text,
	`destino` text DEFAULT 'pista' NOT NULL,
	`fase_atual` text NOT NULL,
	`criada_em` integer NOT NULL,
	`escolhida_em` integer NOT NULL,
	`terminada_em` integer,
	`arquivada_em` integer
);
--> statement-breakpoint
CREATE TABLE `tarefa` (
	`id` text PRIMARY KEY NOT NULL,
	`track_id` text NOT NULL,
	`fase` text NOT NULL,
	`ordem` integer NOT NULL,
	`base_id` text,
	`tipo` text DEFAULT 'tarefa' NOT NULL,
	`texto` text NOT NULL,
	`pronto_quando` text,
	`versao_feia` text,
	`grupo` text,
	`secao` text,
	`parametro` text,
	`escolhida` integer DEFAULT true NOT NULL,
	`feita_em` integer,
	`onde_parei` text,
	FOREIGN KEY (`track_id`) REFERENCES `track`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bloco` (
	`id` text PRIMARY KEY NOT NULL,
	`track_id` text,
	`tarefa_id` text,
	`modo` text DEFAULT 'completo' NOT NULL,
	`iniciado_em` integer NOT NULL,
	`duracao_ms` integer NOT NULL,
	`pausado_total_ms` integer DEFAULT 0 NOT NULL,
	`pausado_em` integer,
	`notificacao_id` text,
	`encerrado_em` integer,
	`resposta` text,
	FOREIGN KEY (`track_id`) REFERENCES `track`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tarefa_id`) REFERENCES `tarefa`(`id`) ON UPDATE no action ON DELETE set null
);
