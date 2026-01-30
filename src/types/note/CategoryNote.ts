/**
 * Note type returned from category/hashtag search endpoints
 * GET /v1/categories/{category}
 * GET /v3/hashtags/{hashtag}/notes
 */
export interface CategoryNote {
    id: number;
    key: string;
    is_treasured_note: boolean;
    body: string;
    external_url: string | null;
    separator: string | null;
    type: string;
    user_id: number;
    name: string;
    description: string | null;
    tweet_text: string;
    twitter_share_url: string;
    facebook_share_url: string;
    line_share_url: string;
    note_url: string;
    can_multiple_limited_note: boolean;
    can_sell_on_first_come_note: boolean;
    pictures: CategoryNotePicture[];
    embedded_contents: CategoryNoteEmbeddedContent[];
    audio: unknown | null;
    status: string;
    publish_at: string;
    price: number;
    created_at: string;
    updated_at: string;
    format: string;
    like_count: number;
    anonymous_like_count: number | null;
    image_count: number;
    comment_count: number;
    is_limited: boolean;
    is_trial: boolean;
    is_refund: boolean;
    is_membership_connected: boolean;
    has_available_circle_plans: boolean;
    is_my_note: boolean;
    can_read: boolean;
    can_vote: boolean;
    can_comment: boolean;
    labels: unknown[];
    is_liked: boolean | null;
    is_purchased: boolean;
    is_magazine_purchased: boolean;
    is_available: boolean;
    eyecatch: string | null;
    eyecatch_width: number | null;
    eyecatch_height: number | null;
    sp_eyecatch: string;
    has_draft: boolean;
    is_draft: boolean | null;
    is_published: boolean;
    is_reserved: boolean;
    reserved_publish_at: string | null;
    disable_comment: boolean;
    likes: unknown[];
    user: CategoryNoteUser;
    comment_viewable: boolean;
    comments: unknown[];
    hashtag_notes: CategoryHashtagNote[];
    has_coupon: boolean;
    prior_sale: unknown | null;
    custom_domain: string | null;
    editable_scopes: string[];
    non_editable_reason: string | null;
}

export interface CategoryNotePicture {
    caption: string | null;
    url: string;
    key: string;
}

export interface CategoryNoteEmbeddedContent {
    caption: string | null;
    key: string;
}

export interface CategoryNoteUser {
    id: number;
    urlname: string;
    nickname: string;
    note_count: number;
    following_count: number;
    follower_count: number;
    user_profile_image_path: string;
    created_at: string;
    disable_support: boolean;
    is_following: boolean;
    is_me: boolean;
    like_appeal_text: string | null;
    like_appeal_image: string | null;
    share_appeal: {
        text: string | null;
        image: string | null;
    };
    magazine_add_appeal: {
        text: string | null;
        image: string | null;
    };
    purchase_appeal_text_note: string | null;
    purchase_appeal_text_magazine: string | null;
    purchase_appeal_text_support: string | null;
    follow_appeal_text: string | null;
    follow_appeal_image: string | null;
    twitter_nickname: string | null;
    custom_domain: string | null;
}

export interface CategoryHashtagNote {
    id: number;
    created_at: string;
    hashtag: {
        name: string;
    };
}

/**
 * Response from category search endpoint GET /v1/categories/{category}
 */
export interface CategorySearchResponse {
    notes: CategoryNote[];
    next_page: number | null;
    is_last_page: boolean;
}
