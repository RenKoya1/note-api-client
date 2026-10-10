import { CustomDomain } from "../note/common";

/** User entry of GET /v3/users/{key}/followers and /followings */
export interface FollowUser {
  id: number;
  key: string;
  name: string;
  nickname: string;
  urlname: string;
  profile: string;
  user_profile_image_path: string;
  withdrawal: boolean;
  is_following: boolean;
  is_followed: boolean;
  custom_domain: CustomDomain | null;
  follower_count: number;
  recommend_source: string;
  is_twitter_followee: boolean;
}

/** Response of GET /v3/users/{key}/followers and /followings */
export interface FollowsResponse {
  follows: FollowUser[];
  total_count: number;
  is_last_page: boolean;
}
