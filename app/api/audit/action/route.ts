import { NextResponse } from 'next/server';

const actions = ['approve', 'reject'] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action?: string };
    if (!actions.includes(body.action as typeof actions[number])) {
      return NextResponse.json({ error: 'Invalid audit action.' }, { status: 400 });
    }

    return NextResponse.json({
      action: body.action,
      status: body.action === 'approve' ? 'approved' : 'rejected',
      completedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Unable to complete that audit action.' }, { status: 400 });
  }
}