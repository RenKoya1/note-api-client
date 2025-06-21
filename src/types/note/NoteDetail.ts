export interface NoteDetail {
  id: number;
  user_id: number;
  status: "published" | "draft" | string;
  type: string;
  key: string;
  slug: string;
  name: string;
  body: string;
  created_at: string;
  publish_at: string;
  is_draft: boolean;
  is_published: boolean;
  is_liked: boolean;
  is_available: boolean;
  like_count: number;
  anonymous_like_count: number;
  price: number;
  note_url: string;
  note_share_url: string;
  twitter_share_url: string;
  facebook_share_url: string;
  line_share_url: string;
  tweet_text: string;
  user: NoteUser;
  embedded_contents: EmbeddedContent[];
  paywall: PaywallInfo;
  classify_categories: { id: number }[];
  hashtag_notes: HashtagNote[];
  socials?: {
    twitter?: {
      nickname?: string;
    };
  };
  pictures: unknown[];
  eyecatch: string | null;
  can_comment: boolean;
  can_read: boolean;
  can_publish: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_vote: boolean;
  can_show_hashtag_banner: boolean;
  is_my_note: boolean;
  is_r18: boolean;
  is_temporary_frozen: boolean;
  is_supported: boolean;
  member_edit_locked_at: string | null;
  pinned_user_note_id: number;
  custom_domain: string | null;
  magazine_add_appeal?: {
    text?: string;
    image?: string;
  };
  follow_appeal_text?: string | null;
  follow_appeal_image?: string | null;
  like_appeal_text?: string | null;
  like_appeal_image?: string | null;
}

export interface NoteUser {
  id: number;
  key: string;
  urlname: string;
  nickname: string;
  created_at: string;
  active_flag: boolean;
  email_confirmed_flag: boolean;
  note_count: number;
  follower_count: number;
  following_count: number;
  user_profile_image_path: string;
  twitter_nickname?: string;
  is_me: boolean;
  is_following: boolean;
  is_followed: boolean;
  blocks_you: boolean;
  is_blocked: boolean;
}
export interface EmbeddedContent {
  key: string;
  url: string;
  service: string;
  identifier: string | null;
  embeddable_type: string;
  html_for_embed: string;
  html_for_display: string | null;
  caption: string | null;
  created_at: string;
  is_custom_domain: boolean;
}

export interface PaywallInfo {
  is_simple_paid_note: boolean;
  is_simple_paid_note_test_a: boolean;
  same_month_cnt: number;
  context: {
    is_show_limited_pay_note_paywall: boolean;
    is_membership_connected: boolean;
  };
}

export interface HashtagNote {
  id: number;
  created_at: string;
  hashtag: {
    id: number;
    name: string;
  };
}
