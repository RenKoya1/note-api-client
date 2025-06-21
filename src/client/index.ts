import axios, { type AxiosInstance } from "axios";
import { searchNotesByKeyword } from "../note/searchNotesByKeyword";
import { getNoteDetail } from "../note/getNoteDetail";
import { searchNotesByUsername } from "../note/searchNotesByUsername";
import { saveDraft } from "../note/saveDraft";
import { searchUsersByKeyword } from "../user/searchUsersByKeyword";
import { getFollowings } from "../user/getFollowings";
import { getFollowers } from "../user/getFollowers";
import { getUserDetail } from "../user/getUserDetail";
import { getComments } from "../note/getComments";
import { searchMagazinesByKeyword } from "../magazine/searchMagazinesByKeyword";
import { getMagazineDetail } from "../magazine/getMagazineDetail";
import { getCategories } from "../category/getCategories";
import { searchNotesByCategory } from "../note/searchNotesByCategory";
import { getHashtags } from "../hashtag/getHastags";
import { searchNotesByHashtag } from "../note/searchNotesByHashtag";
import { getHashtagDetail } from "../hashtag/getHashtagDetail";
import { getContests } from "../contest/getContests";
import { getRecommendMetadata } from "../recommend/getRecommendMetadata";
import { getMkitLayouts } from "../mkit/getMkitLayouts";
import { searchUserByUsername } from "../user/searchUserByUsername";

export class NoteAPIClient {
  private client: AxiosInstance;

  public BASE_URL = "https://note.com/api";
  public accessToken: string | null = null;
  constructor(accessToken?: string) {
    if (accessToken) {
      this.accessToken = accessToken;
    }
    this.client = axios.create({
      timeout: 14000,
    });
  }

  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const allParams = { ...params };
    try {
      const response = await this.client.get<T>(url, { params: allParams });

      return (response.data as any).data as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API request failed: ${error.message}`);
      } else {
        throw new Error(`Unexpected error: ${error}`);
      }
    }
  }
  public async post<T>(url: string, data?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      return (response.data as any).data as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API request failed: ${error.message}`);
      } else {
        throw new Error(`Unexpected error: ${error}`);
      }
    }
  }

  public searchNotesByKeyword = searchNotesByKeyword;
  public getNoteDetail = getNoteDetail;

  public searchNotesByUsername = searchNotesByUsername;
  public saveDraft = saveDraft;
  public searchUsersByKeyword = searchUsersByKeyword;
  public getUserDetail = getUserDetail;
  public getFollowings = getFollowings;
  public getFollowers = getFollowers;
  public getComments = getComments;
  public searchMagazinesByKeyword = searchMagazinesByKeyword;
  public getMagazineDetail = getMagazineDetail;
  public getCategories = getCategories;
  public searchNotesByCategory = searchNotesByCategory;
  public getHashtags = getHashtags;
  public searchNotesByHashtag = searchNotesByHashtag;
  public getHashtagDetail = getHashtagDetail;
  public getContests = getContests;
  public getRecommendMetadata = getRecommendMetadata;
  public getMkitLayouts = getMkitLayouts;
  public searchUserByUsername = searchUserByUsername;
}
