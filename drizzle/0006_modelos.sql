CREATE TABLE `modelo_tarefa` (
	`id` text PRIMARY KEY NOT NULL,
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
	`criado_em` integer NOT NULL
);
