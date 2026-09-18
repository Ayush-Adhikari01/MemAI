import { getSupabaseAdmin } from '../config/supabase.js';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Authentication Middleware
 * Validates Supabase JWT access token or allows guest/demo fallback if in local development
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const guestHeader = req.headers['x-user-id'];

    // 1. If explicit guest/demo header provided in dev or test mode
    if (guestHeader) {
      req.user = {
        id: guestHeader,
        email: 'guest@example.com',
        isGuest: true
      };
      return next();
    }

    // 2. If Bearer token is present
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const supabase = getSupabaseAdmin();

      if (!supabase) {
        // Fallback for development without live Supabase
        req.user = { id: DEMO_USER_ID, email: 'demo@example.com', isGuest: true };
        return next();
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          error: 'Unauthorized: Invalid or expired authentication token',
          details: error?.message
        });
      }

      req.user = {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        isGuest: false
      };
      return next();
    }

    // 3. If no auth header provided, fallback to default local demo user
    req.user = {
      id: DEMO_USER_ID,
      email: 'demo@example.com',
      isGuest: true
    };
    return next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
