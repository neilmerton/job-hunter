import { NextResponse } from 'next/server';
import { serverAuthService } from '@/services/authService.server';

export async function POST() {
  const user = await serverAuthService.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    await serverAuthService.deleteUser(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
