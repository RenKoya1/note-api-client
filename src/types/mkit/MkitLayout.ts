import { CustomDomain, NoteType } from "../note/common";

export interface MkitNote {
  id: number;
  key: string;
  type: NoteType;
  name: string;
  publish_at: string;
  eyecatch_url: string | null;
  custom_domain: CustomDomain | null;
  user: {
    id: number;
    key: string;
    nickname: string;
    urlname: string;
    custom_domain: CustomDomain | null;
    user_profile_image_path: string;
  };
  is_liked: boolean;
  can_read: boolean;
  like_count: number;
  recommend_source: string;
  price: number;
  external_url: string | null;
  format: string;
  discount_campaigns: unknown[];
  audio: unknown | null;
  read_permissions: Record<string, boolean>;
}

export interface MkitSection {
  type: string;
  is_hashtag: boolean;
  hashtag_id: number | null;
  label_name: string;
  notes: MkitNote[];
  url: string;
  description: string | null;
  contents: { content_id: number | null; content_type: string | null };
}

/** Response of GET /v3/mkit_layouts/json */
export interface MkitLayoutsResponse {
  page: number;
  isLast: boolean;
  sections: MkitSection[];
}
