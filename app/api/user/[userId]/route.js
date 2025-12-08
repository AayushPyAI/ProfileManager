import { NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/user.js';
import { authenticateRequest } from '@/lib/apiAuth.js';

// GET is public (for viewing user profiles)
export async function GET(req, context) {
  try {
    const resolvedParams = 'then' in context.params ? await context.params : context.params;
    const { userId } = resolvedParams;
    
    const user = await getUserById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// PATCH requires authentication and ownership
export async function PATCH(req, context) {
  try {
    // Authenticate the request
    const { error, user } = await authenticateRequest(req);
    
    if (error) {
      return error;
    }

    const resolvedParams = 'then' in context.params ? await context.params : context.params;
    const { userId } = resolvedParams;

    // Verify ownership
    if (user._id.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized - You can only update your own account' }, { status: 403 });
    }

    const data = await req.json();
    const updatedUser = await updateUser(userId, data);
    if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// DELETE requires authentication and ownership
export async function DELETE(req, context) {
  try {
    // Authenticate the request
    const { error, user } = await authenticateRequest(req);
    
    if (error) {
      return error;
    }

    if (!user || !user._id) {
      return NextResponse.json({ error: 'Unauthorized - User not found' }, { status: 401 });
    }

    const resolvedParams = 'then' in context.params ? await context.params : context.params;
    const { userId } = resolvedParams;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Convert both to strings for comparison
    const authenticatedUserId = user._id.toString();
    const requestedUserId = userId.toString();

    // Verify ownership
    if (authenticatedUserId !== requestedUserId) {
      console.log('Ownership check failed:', { authenticatedUserId, requestedUserId });
      return NextResponse.json({ error: 'Unauthorized - You can only delete your own account' }, { status: 403 });
    }

    await deleteUser(userId);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: error || 'Failed to delete user' }, { status: 500 });
  }
}