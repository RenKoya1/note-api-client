import { AppealContent } from "./common";

/**
 * Note type returned from username search endpoint
 * GET /v2/creators/{username}/contents
 */
export interface UserNote {
    id: number;
    type: string;
    status: string;
    name: string;
    description: string | null;
    likeCount: number;
    price: number;
    key: string;
    slug: string;
    publishAt: string;
    thumbnailExternalUrl: string;
    eyecatch: string | null;
    user: UserNoteUser;
    canRead: boolean;
    isAuthor: boolean;
    externalUrl: string | null;
    customDomain: string | null;
    body: string;
    separator: string | null;
    isLimited: boolean;
    isTrial: boolean;
    canUpdate: boolean;
    tweetText: string;
    twitterRelatedAccounts: string;
    isRefund: boolean;
    isLiked: boolean;
    commentCount: number;
    likes: unknown[];
    anonymousLikeCount: number;
    disableComment: boolean;
    hashtags: UserNoteHashtag[];
    twitterShareUrl: string;
    facebookShareUrl: string;
    lineShareUrl: string;
    audio: Record<string, unknown>;
    pictures: unknown[];
    limitedMessage: string | null;
    labels: unknown[];
    priorSale: unknown | null;
    canMultipleLimitedNote: boolean;
    isMembershipConnected: boolean;
    hasAvailableCirclePlans: boolean;
    isPinned: boolean;
    pinnedUserNoteId: number | null;
    spEyecatch: string | null;
    enableBacktoDraft: boolean;
    notificationMessages: unknown[];
    isProfiled: boolean;
    isForWork: boolean;
    isCircleDescription: boolean;
    noteDraft: unknown | null;
    noteUrl: string;
    imageCount: number;
    format: string;
    capabilities: UserNoteCapabilities;
    discountCampaigns: UserNoteDiscountCampaign[];
    remainedCharNum: number;
    remainedImageNum: number;
    remainedFileNum: number;
    priceInfo: PriceInfo;
}

export interface UserNoteUser {
    id: number;
    key: string;
    name: string;
    urlname: string;
    nickname: string;
    userProfileImagePath: string;
    customDomain: string | null;
    disableSupport: boolean;
    disableGuestPurchase: boolean;
    emailConfirmedFlag: boolean;
    likeAppealText: string | null;
    likeAppealImage: string | null;
    purchaseAppealTextNote: string | null;
    twitterNickname: string | null;
    shareAppeal: AppealContent;
    magazineAddAppeal: AppealContent;
}

export interface UserNoteHashtag {
    hashtag: {
        name: string;
    };
}

export interface UserNoteCapabilities {
    amazonpayCampaign: boolean;
    amazonpay: boolean;
    guestAmazonpay: boolean;
    rubyText: boolean;
    formulaText: boolean;
    duplication: boolean;
    noteComment: boolean;
}

export interface UserNoteDiscountCampaign {
    key: string;
    kind: string;
    status: string;
    discounted_price: number;
}

export interface PriceInfo {
    isFree: boolean;
    lowestPrice: number | null;
    hasMultiple: boolean;
    hasSubscription: boolean;
    oneshotLowestPrice: number | null;
}

/**
 * Response from username search endpoint GET /v2/creators/{username}/contents
 */
export interface UserNotesResponse {
    contents: UserNote[];
    isLastPage: boolean;
    totalCount: number;
}
