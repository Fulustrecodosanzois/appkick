export interface User {
    id: string;
    username: string;
    email: string;
    profile_pic: string;
    channel_id: string;
  }
  
  export interface Channel {
    id: string;
    user_id: string;
    name: string;
    slug: string;
    is_banned: boolean;
    playback_url: string;
    vod_enabled: boolean;
    subscription_enabled: boolean;
  }
  
  export interface Stream {
    id: string;
    channel_id: string;
    session_title: string;
    is_live: boolean;
    viewer_count: number;
    start_time: string;
    language: string;
    is_mature: boolean;
    category_id: string;
    category_name: string;
  }
  
  export interface ChatMessage {
    id: string;
    channel_id: string;
    user_id: string;
    username: string;
    content: string;
    created_at: string;
  }
  
  export interface Subscription {
    id: string;
    user_id: string;
    username: string;
    tier: number;
    created_at: string;
  }
  
  export interface Clip {
    id: string;
    channel_id: string;
    user_id: string;
    title: string;
    created_at: string;
    view_count: number;
    thumbnail_url: string;
    clip_url: string;
  }
  
  export interface BanUser {
    user_id: string;
    reason: string;
    duration: number | null; // null for permanent
  }
  
  export interface CategoryData {
    id: string;
    name: string;
    slug: string;
    viewers: number;
  }