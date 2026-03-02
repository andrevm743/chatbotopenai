import { prisma } from './prisma';

codex/create-internal-office-chat-web-app-njscch
function normalizeToken(token: string) {
  return token
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function countOccurrences(text: string, token: string) {
  return text.split(token).length - 1;
}

export async function searchKnowledge(query: string) {
  const tokens = query
    .split(/\s+/)
    .map((t) => normalizeToken(t))
    .filter((t) => t.length > 2)
    .slice(0, 15);

  if (!tokens.length) return [];

  const docs = await prisma.knowledgeDocument.findMany({
    where: { active: true },
    take: 50,
=======
export async function searchKnowledge(query: string) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);

  const docs = await prisma.knowledgeDocument.findMany({
    where: { active: true },
    take: 40,
main
    orderBy: { updatedAt: 'desc' }
  });

  const ranked = docs
    .map((doc) => {
codex/create-internal-office-chat-web-app-njscch
      const title = normalizeToken(doc.title);
      const tags = normalizeToken(doc.tags);
      const text = normalizeToken(doc.extractedText);

      const score = tokens.reduce((acc, token) => {
        return (
          acc +
          countOccurrences(title, token) * 4 +
          countOccurrences(tags, token) * 3 +
          Math.min(countOccurrences(text, token), 10)
        );
      }, 0);

=======
      const hay = `${doc.title} ${doc.tags} ${doc.extractedText}`.toLowerCase();
      const score = tokens.reduce((acc, token) => acc + (hay.includes(token) ? 1 : 0), 0);
main
      return { doc, score };
    })
    .filter((it) => it.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((it) => ({
      id: it.doc.id,
      title: it.doc.title,
      tags: it.doc.tags,
codex/create-internal-office-chat-web-app-njscch
      snippet: it.doc.extractedText.slice(0, 1600)
=======
      snippet: it.doc.extractedText.slice(0, 1500)
main
    }));

  return ranked;
}
