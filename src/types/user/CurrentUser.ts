import { CustomDomain } from "../note/common";

/**
 * Logged-in user returned from GET /v2/current_user.
 * Only commonly used fields are typed; the response contains many more
 * account settings flags.
 */
export interface CurrentUser {
  id: number;
  key: string;
  nickname: string;
  urlname: string;
  note_count: number;
  following_count: number;
  follower_count: number;
  magazine_count: number;
  profile: string | null;
  email: string;
  email_confirmed_flag: boolean;
  no_urlname_user: boolean;
  user_profile_image_path: string;
  user_wallpaper_image_path: string;
  is_me: boolean;
  is_premium: boolean;
  is_pro: boolean;
  can_create_note: boolean;
  reserved_posting_available: boolean;
  unread_notification_num: number;
  custom_domain: CustomDomain | null;
  created_at: string;
  point_balance: { total: number; paid: number; free: number };
  [key: string]: unknown;
}
