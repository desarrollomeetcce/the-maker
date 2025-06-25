-- DropIndex
DROP INDEX "Topic_slug_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subtopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "generated" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "htmlPath" TEXT NOT NULL,
    "quizPath" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subtopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subtopic" ("createdAt", "htmlPath", "id", "quizPath", "slug", "title", "topicId") SELECT "createdAt", "htmlPath", "id", "quizPath", "slug", "title", "topicId" FROM "Subtopic";
DROP TABLE "Subtopic";
ALTER TABLE "new_Subtopic" RENAME TO "Subtopic";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
