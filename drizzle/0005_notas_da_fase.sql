CREATE TABLE `nota_da_fase` (
	`track_id` text NOT NULL,
	`fase` text NOT NULL,
	`texto` text NOT NULL,
	`atualizada_em` integer NOT NULL,
	PRIMARY KEY(`track_id`, `fase`),
	FOREIGN KEY (`track_id`) REFERENCES `track`(`id`) ON UPDATE no action ON DELETE cascade
);
