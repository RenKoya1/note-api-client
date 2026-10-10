import { CustomDomain, NoteStatus, NoteType } from "../note/common";

/** One entry of GET /v2/contests (camelCase keys). */
export interface Contest {
  id: number;
  key: string;
  name: string;
  state: "opened" | "closed" | "finished" | (string & {});
  type: string;
  category: string;
  categories: unknown[];
  message: string | null;
  bannerImage: string;
  eyecatchUrl: string;
  color: string;
  themeColor: string;
  textColor: string;
  sponsor: string;
  openAt: string;
  closeAt: string;
  isForceFollowingEnabled: boolean;
  relatedUser: unknown | null;
  hashtag: { id: number; name: string; count: number };
  /** Announcement note of the contest. */
  note: {
    id: number;
    type: NoteType;
    status: NoteStatus;
    name: string;
    key: string;
    eyecatch: string | null;
    user: {
      id: number;
      name: string;
      urlname: string;
      nickname: string;
      userProfileImagePath: string;
      customDomain: CustomDomain | null;
      [key: string]: unknown;
    };
    customDomain: CustomDomain | null;
    commentCount: number;
    likeCount: number;
    anonymousLikeCount: number;
    disableComment: boolean;
  } | null;
}

export interface ContestsResponse {
  contests: Contest[];
  contestGroup: { name: string; description: string; contests: Contest[] };
}
