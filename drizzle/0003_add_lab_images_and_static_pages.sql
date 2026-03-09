ALTER TABLE `laboratoryAnalysisTypes`
ADD COLUMN `imageUrl` varchar(512);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `staticPages` (
  `id` int AUTO_INCREMENT NOT NULL,
  `titleAz` varchar(255) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `excerptAz` text,
  `contentAz` text,
  `heroImageUrl` varchar(512),
  `order` int DEFAULT 0,
  `isPublished` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `staticPages_id` PRIMARY KEY(`id`),
  CONSTRAINT `staticPages_slug_unique` UNIQUE(`slug`)
);
