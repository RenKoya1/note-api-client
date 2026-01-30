/**
 * Custom domain configuration
 */
export interface CustomDomain {
    host: string;
    type: string;
    key: string;
    tls: boolean;
}

/**
 * Appeal content (used for like_appeal, share_appeal, magazine_add_appeal, etc.)
 */
export interface AppealContent {
    text: string | null;
    image: string | null;
}
