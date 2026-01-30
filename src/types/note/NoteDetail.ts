import { AppealContent } from "./common";

/**
 * Full note detail response from GET /v3/notes/{key}
 */
export interface NoteDetail {
  id: number;
  user_id: number;
  status: "published" | "draft" | string;
  type: string;
  key: string;
  slug: string;
  name: string;
  body: string;
  separator: string | null;
  description: string | null;
  index: unknown[];
  external_url: string | null;
  disable_comment: boolean;
  editable_scopes: string[];
  non_editable_reason: string | null;
  capabilities: NoteCapabilities;
  created_at: string;
  comment_count: number;
  user: NoteDetailUser;
  audio: unknown | null;
  belonging_magazine_keys: string[];
  can_comment: boolean;
  can_delete: boolean;
  can_member_edit: boolean;
  can_member_publish: boolean;
  can_member_read: boolean;
  can_member_write: boolean;
  can_multiple_limited_note: boolean;
  can_publish: boolean;
  can_read: boolean;
  can_sell_on_first_come_note: boolean;
  can_update: boolean;
  can_vote: boolean;
  categories: unknown[];
  category: string | null;
  classify_categories: ClassifyCategory[];
  comment_viewable: boolean;
  custom_domain: string | null;
  embedded_contents: EmbeddedContent[];
  eyecatch: string | null;
  eyecatch_alt: string | null;
  eyecatch_height: number | null;
  eyecatch_width: number | null;
  format: string;
  has_coupon: boolean;
  has_draft: boolean;
  hashtag_notes: HashtagNote[];
  is_available: boolean;
  is_circle_description: boolean;
  is_draft: boolean;
  is_for_work: boolean;
  is_purchased_within_last_24_hours: boolean;
  is_liked: boolean;
  is_limited: boolean;
  is_magazine_purchased: boolean;
  is_member_edit: boolean;
  is_member_editing: boolean;
  is_my_note: boolean;
  is_pinned: boolean;
  is_profiled: boolean;
  is_published: boolean;
  is_purchased: boolean;
  is_r18: boolean;
  is_r18_confirmation_needed: boolean;
  is_refund: boolean;
  is_reserved: boolean;
  is_supported: boolean;
  is_temporary_frozen: boolean;
  is_trial: boolean;
  labels: unknown[];
  like_count: number;
  anonymous_like_count: number;
  magazines_for_buy: unknown[];
  magazines_for_subscribe: unknown[];
  member_edit_locked_at: string | null;
  note_share_url: string;
  related_contests: unknown[];
  paywall: PaywallInfo;
  pictures: unknown[];
  pinned_user_note_id: number | null;
  price: number;
  prior_sale: unknown | null;
  publish_at: string;
  reading_uuid: string;
  remained_char_num: number;
  remained_figure_num: number;
  remained_image_num: number;
  remained_file_num: number;
  remained_sound_num: number;
  reserved_publish_at: string | null;
  facebook_share_url: string;
  line_share_url: string;
  twitter_share_url: string;
  note_url: string;
  twitter_related_accounts: string;
  tweet_text: string;
  circle_plans: unknown[];
  is_public_membership_connected: boolean;
  is_board_disabled: boolean;
  discount_campaigns: DiscountCampaign[];
  lead_form: unknown | null;
  line_add_friend: unknown | null;
  line_add_friend_note_enable_feature: boolean;
  note_share_total_count: number;
  note_share_provider_details: NoteShareProviderDetails;
  is_published_preview_note: boolean;
  is_ratable: boolean;
  content_rating_via: string;
  content_raters: unknown[];
  my_rating_exists: boolean;
  rater_count: number;
  is_recently_purchased: boolean;
  requires_login_for_purchase: boolean;
  is_recently_tip: boolean;
  exclude_from_creator_top: boolean;
  exclude_ai_learning_reward: boolean;
  is_related_with_investment: boolean;
  related_stocks: unknown[];
}

export interface NoteCapabilities {
  amazonpay_campaign: boolean;
  amazonpay: boolean;
  guest_amazonpay: boolean;
  ruby_text: boolean;
  formula_text: boolean;
  duplication: boolean;
  note_comment: boolean;
}

export interface NoteDetailUser {
  id: number;
  key: string;
  urlname: string;
  nickname: string;
  active_flag: boolean;
  note_count: number;
  email_confirmed_flag: boolean;
  created_at: string;
  user_profile_image_path: string;
  no_urlname_user: boolean;
  store_url: string;
  following_count: number;
  follower_count: number;
  profile: string | null;
  withdrawal: boolean;
  is_me: boolean;
  is_following: boolean;
  is_followed: boolean;
  is_admin: boolean;
  custom_domain: string | null;
  enable_serif: boolean;
  others_related_notes_enabled: boolean;
  is_creator_popular_sort_enabled: boolean;
  disable_support: boolean | null;
  twitter_nickname: string | null;
  socials: {
    twitter?: {
      nickname?: string;
      name?: string;
      uid?: string;
    };
  };
  external_links: Record<string, unknown>;
  pro_user_id: number | null;
  purchase_appeal_text_note: string | null;
  purchase_appeal_text_magazine: string | null;
  purchase_appeal_text_support: string | null;
  follow_appeal_text: string | null;
  follow_appeal_image: string | null;
  like_appeal_text: string | null;
  like_appeal_image: string | null;
  share_appeal: AppealContent;
  magazine_add_appeal: AppealContent;
  blocks_you: boolean;
  is_blocked: boolean;
  disable_guest_purchase: boolean;
  support_box_appeal_text: string | null;
  custom_support_box: unknown | null;
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
    name: string;
  };
}

export interface ClassifyCategory {
  id: number;
}

export interface DiscountCampaign {
  key: string;
  kind: string;
  status: string;
  discounted_price: number;
}

export interface NoteShareProviderDetails {
  facebook: ShareProviderDetail;
  line: ShareProviderDetail;
  note: ShareProviderDetail;
  others: ShareProviderDetail;
  twitter: ShareProviderDetail;
}

export interface ShareProviderDetail {
  count: number;
  is_shared: boolean;
}
