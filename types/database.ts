export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    reputation_points: number
                    badges: string[]
                    bio: string | null
                    location: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    reputation_points?: number
                    badges?: string[]
                    bio?: string | null
                    location?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    reputation_points?: number
                    badges?: string[]
                    bio?: string | null
                    location?: string | null
                    created_at?: string
                }
            }
            problems: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    category: 'pothole' | 'garbage' | 'streetlight' | 'water_leak' | 'road_damage' | 'safety_issue'
                    severity: 'low' | 'medium' | 'high' | 'critical'
                    status: 'reported' | 'verified' | 'assigned' | 'in_progress' | 'resolved'
                    lat: number
                    lng: number
                    address: string | null
                    image_urls: string[]
                    reporter_id: string
                    confirmed_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    category: 'pothole' | 'garbage' | 'streetlight' | 'water_leak' | 'road_damage' | 'safety_issue'
                    severity: 'low' | 'medium' | 'high' | 'critical'
                    status?: 'reported' | 'verified' | 'assigned' | 'in_progress' | 'resolved'
                    lat: number
                    lng: number
                    address?: string | null
                    image_urls?: string[]
                    reporter_id: string
                    confirmed_count?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    category?: 'pothole' | 'garbage' | 'streetlight' | 'water_leak' | 'road_damage' | 'safety_issue'
                    severity?: 'low' | 'medium' | 'high' | 'critical'
                    status?: 'reported' | 'verified' | 'assigned' | 'in_progress' | 'resolved'
                    lat?: number
                    lng?: number
                    address?: string | null
                    image_urls?: string[]
                    reporter_id?: string
                    confirmed_count?: number
                    created_at?: string
                }
            }
            verifications: {
                Row: {
                    id: string
                    problem_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    problem_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    problem_id?: string
                    user_id?: string
                    created_at?: string
                }
            }
            comments: {
                Row: {
                    id: string
                    problem_id: string
                    user_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    problem_id: string
                    user_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    problem_id?: string
                    user_id?: string
                    content?: string
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    message: string
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    message: string
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    message?: string
                    is_read?: boolean
                    created_at?: string
                }
            }
        }
    }
}
