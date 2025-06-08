import axios, { type AxiosInstance } from "axios";
import { getArticlesByKeyword } from "../article/getArticlesByKeyword";
import { getArticleDetail } from "../article/getArticleDetail";
import { getArticlesByUsername } from "../article/getArticlesByUsername";

export class NoteAPIClient {
  private client: AxiosInstance;

  public BASE_URL = "https://note.com/api";
  constructor() {
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
  public getArticlesByKeyword = getArticlesByKeyword;
  public getArticleDetail = getArticleDetail;

  public getArticlesByUsername = getArticlesByUsername;
}
