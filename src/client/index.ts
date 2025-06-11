import axios, { type AxiosInstance } from "axios";
import { searchArticlesByKeyword } from "../article/searchArticlesByKeyword";
import { getArticleDetail } from "../article/getArticleDetail";
import { searchArticlesByUsername } from "../article/searchArticlesByUsername";
import { saveDraft } from "../article/saveDraft";
import { searchUsersByKeyword } from "../user/searchUsersByKeyword";
import { getFollowings } from "../user/getFollowings";
import { getFollowers } from "../user/getFollowers";
import { getUserDetail } from "../user/getUserDetail";
import { getComments } from "../article/getComment";

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
}
