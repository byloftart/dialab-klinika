CREATE TABLE `diagnosticServices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleAz` varchar(255) NOT NULL,
	`descriptionAz` text NOT NULL,
	`imageUrl` varchar(512),
	`icon` varchar(100),
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diagnosticServices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diagnosticSubServices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`diagnosticServiceId` int NOT NULL,
	`titleAz` varchar(255) NOT NULL,
	`descriptionAz` text,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diagnosticSubServices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `laboratoryAnalysisTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleAz` varchar(255) NOT NULL,
	`descriptionAz` text NOT NULL,
	`icon` varchar(100),
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `laboratoryAnalysisTypes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `laboratorySubTests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisTypeId` int NOT NULL,
	`titleAz` varchar(255) NOT NULL,
	`descriptionAz` text,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `laboratorySubTests_id` PRIMARY KEY(`id`)
);
