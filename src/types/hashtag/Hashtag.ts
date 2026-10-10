/** Response of GET /v2/hashtags/{name} */
export interface HashtagDetail {
  id: number;
  /** Includes the leading "#", e.g. "#AI". */
  name: string;
  count: number;
  relatedHashtags: { name: string; count: number }[];
  relatedContests: unknown[];
  layoutInfraSectionKeys: unknown[];
  relatedGeneralTopicTag: string | null;
}

/** Hashtag returned from GET /v3/searches?context=hashtag */
export interface SearchHashtag {
  id: number;
  /** Includes the leading "#". */
  name: string;
  count: number;
}
