/**
 * Custom domain configuration
 */
export interface CustomDomain {
    id?: number;
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

/** Kind of note. Unknown future values are still accepted. */
export type NoteType =
    | "TextNote"
    | "ImageNote"
    | "SoundNote"
    | "MovieNote"
    | "TalkNote"
    | (string & {});

/** Publication status of a note. "" is a freshly created, never saved note. */
export type NoteStatus =
    | "published"
    | "draft"
    | "reserved"
    | "private"
    | "frozen"
    | "deleted"
    | ""
    | (string & {});
