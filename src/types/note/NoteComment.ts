/** Rich text tree of a comment in the current comment system. */
export type NoteCommentNode =
  | { type: "root"; children: NoteCommentNode[] }
  | { type: "element"; tag_name: string; children: NoteCommentNode[] }
  | { type: "text"; value: string };

export interface NoteCommentUser {
  key: string;
  urlname: string;
  nickname: string | null;
  profile_image_url: string;
}

/**
 * Comment returned from GET /v3/notes/{key}/note_comments
 * (notes with `capabilities.note_comment === true`).
 */
export interface NoteComment {
  key: string;
  note_key: string;
  /** Rich text; use `noteCommentToText` to get plain text. */
  comment: NoteCommentNode;
  like_count: number;
  reply_count: number;
  is_edited: boolean;
  is_liked: boolean;
  is_creator_liked: boolean;
  is_creator_replied: boolean;
  /** false for replies. */
  is_root: boolean;
  is_replied_to_root: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
  user: NoteCommentUser;
  /** User a reply is addressed to. */
  to_user: NoteCommentUser | null;
  comment_like_appeal_text: string | null;
  comment_like_appeal_image: string | null;
  latest_creator_reply: unknown;
}

/** Response of getNoteComments. */
export interface NoteCommentsResponse {
  comments: NoteComment[];
  current_page: number;
  next_page: number | null;
  total_count: number;
}
