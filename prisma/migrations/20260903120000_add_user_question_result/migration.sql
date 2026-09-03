-- CreateTable
CREATE TABLE "UserQuestionResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestionResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestionResult_userId_questionId_key" ON "UserQuestionResult"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "UserQuestionResult" ADD CONSTRAINT "UserQuestionResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionResult" ADD CONSTRAINT "UserQuestionResult_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Аннулируем существующий прогресс уроков: раньше "пройдено" ставилось за
-- одно долистывание карточек, без учёта теста — эти данные некорректны по
-- новой формуле (карточки + тест) и по просьбе пользователя не пересчитываются,
-- а просто обнуляются. Ошибки (UserMistake), расписание повторений
-- (RepetitionItem) и стрик (UserStreak) не трогаем — это отдельные фичи.
TRUNCATE TABLE "UserLessonProgress";
