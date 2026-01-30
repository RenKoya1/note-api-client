import { CustomDomain } from "./common";

/**
 * Note type returned from hashtag search endpoint
 * GET /v3/hashtags/{hashtag}/notes
 */
export interface HashtagSearchNote {
    type: string;
    status: string;
    name: string;
    description: string | null;
    price: number;
    can_read_note_all: boolean;
    key: string;
    publish_at: string;
    thumbnail_external_url: string;
    body: string;
    eyecatch_url: string | null;
    sp_eyecatch_url: string | null;
    user: HashtagSearchNoteUser;
    audio: unknown | null;
    pictures: unknown[];
    external_url: string;
    like_count: number;
    is_liked: boolean;
    custom_domain: CustomDomain | null;
    prior_sale: unknown | null;
    is_limited: boolean;
    separator: string | null;
    is_author: boolean;
    discount_campaigns: HashtagNoteDiscountCampaign[];
}

export interface HashtagSearchNoteUser {
    key: string;
    name: string;
    urlname: string;
    nickname: string;
    user_profile_image_url: string;
    custom_domain: CustomDomain | null;
}

export interface HashtagNoteDiscountCampaign {
    key: string;
    kind: string;
    status: string;
    discounted_price: number;
}

/**
 * Response from hashtag search endpoint GET /v3/hashtags/{hashtag}/notes
 */
export interface HashtagSearchResponse {
    notes: HashtagSearchNote[];
    count: number;
    is_last_page: boolean;
    next_page: number | null;
}
