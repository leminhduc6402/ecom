-- DropIndex
DROP INDEX "BrandTranslation_brandId_languageId_key";

CREATE UNIQUE INDEX "CategoryTranslation_categoryId_languageId_unique"
ON "CategoryTranslation" ("categoryId", "languageId")
WHERE "deletedAt" IS NULL;