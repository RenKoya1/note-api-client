import { CustomDomain, NoteStatus, NoteType } from "../note/common";

export interface MagazineUser {
  id: number;
  urlname: string;
  nickname: string;
  user_profile_image_path: string;
  profile: string | null;
  is_following: boolean;
  is_me: boolean;
  blocks_you: boolean;
  withdrawal: boolean;
  email_confirmed_flag: boolean;
  disable_support: boolean | null;
  custom_domain: CustomDomain | null;
  purchase_appeal_text: string | null;
}

export interface MagazineEditor {
  user_id: number;
  urlname: string;
  nickname: string;
  user_profile_image_path: string;
  profile: string | null;
  custom_domain: CustomDomain | null;
}

/** Magazine returned from GET /v1/magazines/{key} */
export interface MagazineDetail {
  id: number;
  key: string;
  name: string;
  description: string;
  price: number;
  note_count: number;
  updated_at: string;
  status: string;
  cover: string;
  cover_rectangle: string;
  cover_original: string;
  cover_landscape: string;
  cover_landscape_sp: string;
  cover_key: string;
  is_following: boolean;
  selected: boolean;
  tweet_text: string;
  twitter_share_url: string;
  facebook_share_url: string;
  line_share_url: string;
  note_share_url: string;
  magazine_url: string;
  is_purchased: boolean;
  is_active: boolean;
  is_subscribable: boolean;
  is_pre_suspended: boolean;
  is_suspended: boolean;
  is_jointly_managed: boolean;
  is_signup_enabled: boolean;
  message: string | null;
  is_official: boolean;
  can_read_all: boolean;
  is_auto_magazine: boolean;
  created_at: string;
  is_connected_with_specified_circle_plan: boolean;
  is_my_magazine: boolean;
  editors_count?: number;
  editors?: MagazineEditor[];
  subscription_info: unknown;
  has_coupon: boolean;
  custom_domain: CustomDomain | null;
  is_oneshot_subscribe_magazine: boolean;
  is_benefit_magazine: boolean;
  user: MagazineUser;
}

/** Note entry of GET /v1/magazines/{key}/notes */
export interface MagazineNote {
  id: number;
  key: string;
  slug: string;
  name: string;
  body: string | null;
  external_url: string | null;
  type: NoteType;
  eyecatch: string | null;
  description: string | null;
  price: number;
  status: NoteStatus;
  created_at: string;
  publish_at: string;
  pictures?: unknown[];
  user: {
    urlname: string;
    nickname: string;
    is_me: boolean;
    [key: string]: unknown;
  };
  is_purchased: boolean;
  is_magazine_purchased: boolean;
  has_coupon: boolean;
}

/** Response of GET /v1/magazines/{key}/notes (100 notes per page). */
export interface MagazineNotesResponse extends MagazineDetail {
  notes: MagazineNote[];
  next_page: number | null;
  prev_page: number | null;
  last_page: boolean;
}

/** Magazine returned from GET /v3/searches?context=magazine */
export interface SearchMagazine {
  id: number;
  key: string;
  name: string;
  description: string;
  price: number;
  status: string;
  yearly_price: number;
  cover: string;
  is_active: boolean;
  is_official: boolean;
  is_subscribable: boolean;
  is_pre_suspended: boolean;
  is_following: boolean;
  user: {
    id: number;
    key: string;
    name: string;
    urlname: string;
    nickname: string;
    user_profile_image_path: string;
    custom_domain: CustomDomain | null;
  };
  is_editable: boolean;
  is_suspended: boolean;
  is_purchased: boolean;
  is_subscribed: boolean;
  can_follow: boolean;
  is_author: boolean;
  is_jointly_managed: boolean;
  editors: unknown[];
  editors_count: number;
  custom_domain: CustomDomain | null;
}

/** Magazine returned from GET /v2/creators/{urlname}/contents?kind=magazine (camelCase keys). */
export interface CreatorMagazine {
  id: number;
  key: string;
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  status: string;
  cover: string;
  coverRectangle: string;
  isActive: boolean;
  isOfficial: boolean;
  isSubscribable: boolean;
  isSignupEnabled: boolean;
  isPreSuspended: boolean;
  isFollowing: boolean;
  user: {
    id: number;
    key: string;
    name: string;
    urlname: string;
    nickname: string;
    userProfileImagePath: string;
    customDomain: CustomDomain | null;
    blocksYou: boolean;
    emailConfirmedFlag: boolean;
  };
  isEditable: boolean;
  isSuspended: boolean;
  isPurchased: boolean;
  isSubscribed: boolean;
  canFollow: boolean;
  isAuthor: boolean;
  isJointlyManaged: boolean;
  editors: unknown[];
  editorsCount: number;
  customDomain: CustomDomain | null;
  subscriptionInfo: unknown;
  hasCoupon: boolean;
  isOneshotSubscribeMagazine: boolean;
  followerCount: number;
  noteCount: number;
  notes: unknown[];
  isImmediateCharge: boolean;
  suspendedAt: string | null;
  canReadAll: boolean;
}

/** Response of GET /v2/creators/{urlname}/contents?kind=magazine */
export interface CreatorMagazinesResponse {
  contents: CreatorMagazine[];
  isLastPage: boolean;
  totalCount: number;
}
