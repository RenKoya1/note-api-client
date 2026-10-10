/** Response of GET /v2/metadata/{encoded page url} (page <head> metadata). */
export interface PageMetadata {
  title: string;
  description: string;
  ogSiteName: string;
  ogUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterSite: string;
  twitterCard: string;
  canonical: string;
  isNoindex: boolean;
  [key: string]: unknown;
}
