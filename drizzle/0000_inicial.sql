CREATE TABLE `bloco` (
	`id` text PRIMARY KEY NOT NULL,
	`topico_id` text,
	`iniciado_em` integer NOT NULL,
	`duracao_ms` integer NOT NULL,
	`pausado_total_ms` integer DEFAULT 0 NOT NULL,
	`pausado_em` integer,
	`notificacao_id` text,
	`encerrado_em` integer,
	FOREIGN KEY (`topico_id`) REFERENCES `topico`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `estudo` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`tipo` text NOT NULL,
	`criado_em` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `grupo` (
	`id` text PRIMARY KEY NOT NULL,
	`estudo_id` text NOT NULL,
	`ordem` integer NOT NULL,
	`nome` text NOT NULL,
	FOREIGN KEY (`estudo_id`) REFERENCES `estudo`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `topico` (
	`id` text PRIMARY KEY NOT NULL,
	`grupo_id` text NOT NULL,
	`ordem` integer NOT NULL,
	`texto` text NOT NULL,
	`feito_em` integer,
	FOREIGN KEY (`grupo_id`) REFERENCES `grupo`(`id`) ON UPDATE no action ON DELETE cascade
);
