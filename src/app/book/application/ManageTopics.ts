'use server'
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";


export async function saveTopicWithSubtopics(
    topicId: string,
    title: string,
    slug: string,
    subtopics: string[]
) {
    const userId = await getAuthUserId();

    const topic = await prisma.topic.create({
        data: {
            id: topicId,
            title,
            slug,
            userId,
            subtopics: {
                create: subtopics.map((sub, index) => {
                    const fileSlug = `Tomo-${index + 1}-${slug}-${sub}`.toLowerCase().replace(/[^\w\d]+/g, '-');

                    return {
                        generated: false,
                        title: sub,
                        slug: fileSlug,
                        htmlPath: `/generated/${topicId}/${fileSlug}.html`,
                        quizPath: `/quiz/${topicId}/quiz-${fileSlug}.json`,
                    };
                }),
            },
        },
    });

    return topic;
}

export async function upsertSubtopic(topicId: string, title: string) {
    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new Error("Topic not found");

    const fileSlug = `Tomo-${title}-${topic.slug}`.toLowerCase().replace(/[^\w\d]+/g, '-');
    const htmlPath = `/generated/${topicId}/${fileSlug}.html`;
    const quizPath = `/quiz/${topicId}/quiz-${fileSlug}.json`;

    const existing = await prisma.subtopic.findFirst({
        where: { title, topicId },
    });

    if (existing) {
        return await prisma.subtopic.update({
            where: { id: existing.id },
            data: { title, slug: fileSlug, htmlPath, quizPath, generated: false },
        });
    } else {
        return await prisma.subtopic.create({
            data: {
                generated: false,
                title,
                slug: fileSlug,
                topicId,
                htmlPath,
                quizPath,
            },
        });
    }
}


export async function removeSubtopicByTitle(topicId: string, title: string) {
    const slug = `Tomo-${title}-${topicId}`.toLowerCase().replace(/[^\w\d]+/g, '-');

    const subtopic = await prisma.subtopic.findFirst({
        where: {
            topicId,
            slug,
        },
    });

    if (!subtopic) {
        throw new Error("Subtopic not found");
    }

    return await prisma.subtopic.delete({
        where: {
            id: subtopic.id,
        },
    });
}


