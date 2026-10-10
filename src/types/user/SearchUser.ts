import { CustomDomain } from "../note/common";

/** User returned from GET /v3/searches?context=user */
export interface SearchUser {
  id: number;
  urlname: string;
  profile: string | null;
  key: string;
  nickname: string | null;
  following_count: number;
  follower_count: number;
  is_following: boolean;
  is_followed: boolean;
  is_myself: boolean;
  profile_image_url: string;
  is_blocked: boolean;
  is_official: boolean;
  show_follow_count: boolean;
  custom_domain: CustomDomain | null;
  follow_appeal_text: string | null;
  follow_appeal_image: string | null;
}
