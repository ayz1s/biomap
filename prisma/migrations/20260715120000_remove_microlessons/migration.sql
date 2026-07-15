-- DropForeignKey
ALTER TABLE "MicroLessonQuestion" DROP CONSTRAINT "MicroLessonQuestion_microLessonId_fkey";

-- DropForeignKey
ALTER TABLE "MicroLessonOption" DROP CONSTRAINT "MicroLessonOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "MicroLessonHint" DROP CONSTRAINT "MicroLessonHint_questionId_fkey";

-- DropTable
DROP TABLE "MicroLessonHint";

-- DropTable
DROP TABLE "MicroLessonOption";

-- DropTable
DROP TABLE "MicroLessonQuestion";

-- DropTable
DROP TABLE "MicroLesson";

-- DropEnum
DROP TYPE "MicroLessonQuestionKind";
