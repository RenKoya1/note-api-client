import axios, { type AxiosInstance } from "axios";
import { searchArticlesByKeyword } from "../articles/searchArticlesByKeyword";
import { getArticleDetail } from "../articles/getArticleDetail";
import { searchArticlesByUsername } from "../articles/searchArticlesByUsername";
import { saveDraft } from "../articles/saveDraft";
import { searchUsersByKeyword } from "../users/searchUsersByKeyword";
import { getFollowings } from "../users/getFollowings";
import { getFollowers } from "../users/getFollowers";
import { getUserDetail } from "../users/getUserDetail";
import { getComments } from "../articles/getComments";
import { searchMagazinesByKeyword } from "../magazines/searchMagazinesByKeyword";

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

  public searchArticlesByKeyword = searchArticlesByKeyword;
  public getArticleDetail = getArticleDetail;

  public searchArticlesByUsername = searchArticlesByUsername;
  public saveDraft = saveDraft;
  public searchUsersByKeyword = searchUsersByKeyword;
  public getUserDetail = getUserDetail;
  public getFollowings = getFollowings;
  public getFollowers = getFollowers;
  public getComments = getComments;
  public searchMagazinesByKeyword = searchMagazinesByKeyword;
}
