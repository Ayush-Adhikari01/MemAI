import { db } from '../database/supabaseAdapter.js';

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let profile = await db.getUserProfile(userId);

    if (!profile) {
      // Create initial profile if not found
      profile = await db.updateUserProfile(userId, {
        email: req.user.email || 'user@example.com',
        full_name: req.user.metadata?.full_name || 'User',
        memory_enabled: true
      });
    }

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { memory_enabled, custom_instructions, full_name } = req.body;

    const updates = {};
    if (memory_enabled !== undefined) updates.memory_enabled = memory_enabled;
    if (custom_instructions !== undefined) updates.custom_instructions = custom_instructions;
    if (full_name !== undefined) updates.full_name = full_name;

    const updated = await db.updateUserProfile(userId, updates);
    res.json({ success: true, profile: updated });
  } catch (error) {
    next(error);
  }
};
