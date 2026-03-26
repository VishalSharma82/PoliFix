import { supabase } from './supabase'

export type ReputationAction = 'report' | 'verify' | 'resolve' | 'comment'

const REPUTATION_POINTS: Record<ReputationAction, number> = {
  report: 10,
  verify: 5,
  resolve: 20,
  comment: 2,
}

export async function updateReputation(userId: string, action: ReputationAction) {
  try {
    const points = REPUTATION_POINTS[action]
    
    // 1. Get current reputation
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('reputation_points')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    // 2. Update reputation
    const newPoints = (profile?.reputation_points || 0) + points
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ reputation_points: newPoints })
      .eq('id', userId)

    if (updateError) throw updateError

    return { success: true, pointsAdded: points, totalPoints: newPoints }
  } catch (error) {
    console.error('Error updating reputation:', error)
    return { success: false, error }
  }
}

export async function createNotification(userId: string, type: string, message: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        message,
        is_read: false,
      })
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error }
  }
}
