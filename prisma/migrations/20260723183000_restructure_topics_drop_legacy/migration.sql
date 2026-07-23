-- Phase 2 (destructive) of the topic-taxonomy restructuring — apply only
-- after prisma/backfill-lesson-topics.ts has confirmed every Lesson has a
-- non-null topicId (verified: 26/26, no NULLs, 5 users / 9 progress rows
-- untouched). Drops the old CrossTopic/TopicGradeLink model and the old
-- Lesson.topicGradeLinkId column entirely.

-- The single existing TopicConnection row points at CrossTopic ids that are
-- about to disappear; it's decorative-only ("Связь с другой темой" demo
-- content), so it's cleared rather than remapped. Can be recreated later
-- pointing at real Topic ids once that UI is revisited.
DELETE FROM "TopicConnection";

-- DropForeignKey
ALTER TABLE "TopicConnection" DROP CONSTRAINT "TopicConnection_fromTopicId_fkey";
ALTER TABLE "TopicConnection" DROP CONSTRAINT "TopicConnection_toTopicId_fkey";

-- DropForeignKey + column: old Lesson -> TopicGradeLink link, superseded by Lesson.topicId
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_topicGradeLinkId_fkey";
ALTER TABLE "Lesson" DROP COLUMN "topicGradeLinkId";

-- Now that every Lesson row has topicId populated, enforce NOT NULL
ALTER TABLE "Lesson" ALTER COLUMN "topicId" SET NOT NULL;

-- DropForeignKey + tables: old cross-grade topic model, replaced by Topic/TopicCategory
ALTER TABLE "TopicGradeLink" DROP CONSTRAINT "TopicGradeLink_crossTopicId_fkey";
ALTER TABLE "TopicGradeLink" DROP CONSTRAINT "TopicGradeLink_gradeId_fkey";
DROP TABLE "TopicGradeLink";
DROP TABLE "CrossTopic";

-- AddForeignKey: TopicConnection now points at the new Topic model
ALTER TABLE "TopicConnection" ADD CONSTRAINT "TopicConnection_fromTopicId_fkey" FOREIGN KEY ("fromTopicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TopicConnection" ADD CONSTRAINT "TopicConnection_toTopicId_fkey" FOREIGN KEY ("toTopicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
