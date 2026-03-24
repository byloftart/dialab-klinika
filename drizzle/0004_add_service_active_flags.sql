ALTER TABLE `diagnosticServices`
ADD COLUMN `isActive` boolean NOT NULL DEFAULT true;
--> statement-breakpoint
ALTER TABLE `laboratoryAnalysisTypes`
ADD COLUMN `isActive` boolean NOT NULL DEFAULT true;
