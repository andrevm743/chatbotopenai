import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const chats = await prisma.chat.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });
  return NextResponse.json({ chats });
}
