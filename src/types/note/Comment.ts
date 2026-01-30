/**
 * Comment response from GET /v1/note/{id}/comments
 */
export interface CommentsResponse {
    comments: Comment[];
    rest_comment_count: number;
}

export interface Comment {
    id: number;
    key: string;
    comment: string;
    like_count: number;
    created_at: string;
    is_edited: boolean;
    is_my_comment: boolean;
    likes: unknown[];
    user: CommentUser;
    is_liked: boolean;
}

export interface CommentUser {
    id: number;
    nickname: string;
    urlname: string;
    user_profile_image_path: string;
    comment_like_appeal_text: string | null;
    comment_like_appeal_image: string | null;
}
