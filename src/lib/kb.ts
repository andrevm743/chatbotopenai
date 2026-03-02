import { prisma } from './prisma';

export async function searchKnowledge(query: string) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);

  const docs = await prisma.knowledgeDocument.findMany({
    where: { active: true },
    take: 40,
    orderBy: { updatedAt: 'desc' }
  });

  const ranked = docs
    .map((doc) => {
      const hay = `${doc.title} ${doc.tags} ${doc.extractedText}`.toLowerCase();
      const score = tokens.reduce((acc, token) => acc + (hay.includes(token) ? 1 : 0), 0);
      return { doc, score };
    })
    .filter((it) => it.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((it) => ({
      id: it.doc.id,
      title: it.doc.title,
      tags: it.doc.tags,
      snippet: it.doc.extractedText.slice(0, 1500)
    }));

  return ranked;
}
