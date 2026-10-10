import { CustomDomain } from "./common";

/** One entry of GET /v3/notes/{key}/likes */
export interface NoteLike {
  created_at: string;
  user: {
    id: number;
    key: string;
    nickname: string | null;
    urlname: string;
    profile: string | null;
    is_no_urlname_user: boolean;
    original_header_image_url: string | null;
    header_image_url: string | null;
    user_profile_image_url: string;
    is_me: boolean;
    follower_count: number;
    custom_domain: CustomDomain | null;
  };
}

/** Response of GET /v3/notes/{key}/likes (50 per page; an empty page means the end). */
export interface NoteLikesResponse {
  likes: NoteLike[];
  extra_fields: {
    is_liked_by_current_user: boolean;
    like_count: number;
    anonymous_like_count: number;
  };
}
