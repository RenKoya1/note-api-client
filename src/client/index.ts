import axios, { type AxiosInstance } from "axios";
import { searchNotesByKeyword } from "../note/searchNotesByKeyword";
import { getNoteDetail } from "../note/getNoteDetail";
import { searchNotesByUsername } from "../note/searchNotesByUsername";
import { saveDraft } from "../note/saveDraft";
import { searchUsersByKeyword } from "../user/searchUsersByKeyword";
import { getFollowings } from "../user/getFollowings";
import { getFollowers } from "../user/getFollowers";
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
import { signIn } from "../authentication/signIn";
import { createNote } from "../note/createNote";
import { editNote } from "../note/editNote";
import { uploadEyecatch } from "../eyecatch/uploadEyecatch";
import { draftDelete } from "../note/draftDelete";
import { deleteNote } from "../note/deleteNote";
export class NoteAPIClient {
  private client: AxiosInstance;

  public BASE_URL = "https://note.com/api";
  public cookies: string | null = null;
  public csrfToken: string | null = null;
  constructor(cookies?: string) {
    if (cookies) {
      this.cookies = cookies;
    }
    this.client = axios.create({
      timeout: 14000,
    });
  }

  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const allParams = { ...params };
    try {
      const response = await this.client.get<T>(url, {
        params: allParams,
        headers: {
          Cookie: this.cookies,
          "Content-Type": "application/json",
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
  public async post<T>(url: string, data?: Record<string, any>): Promise<T> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Origin: "https://note.com",
        Referer: "https://note.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      };

      if (this.cookies) {
        headers.Cookie = this.cookies;
      }

      if (this.csrfToken) {
        headers["x-note-csrf-token"] = this.csrfToken;
        headers["X-CSRF-Token"] = this.csrfToken;
        headers["X-XSRF-TOKEN"] = this.csrfToken;
      }

      const response = await this.client.post<T>(url, data, {
        headers,
      });

      // Set-Cookieヘッダーからcookie名=値のペアのみを抽出
      const setCookies = response.headers["set-cookie"] || [];
      if (setCookies.length > 0) {
        this.cookies = setCookies
          .map((cookie) => cookie.split(";")[0]) // 最初のname=valueのみ取得
          .join("; ");
      }

      // CSRFトークンをレスポンスから取得
      if ((response.data as any).data?.csrf_token) {
        this.csrfToken = (response.data as any).data.csrf_token;
      }

      return (response.data as any).data as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API request failed: ${error.message}`);
      } else {
        throw new Error(`Unexpected error: ${error}`);
      }
    }
  }

  public async put<T>(url: string, data?: Record<string, any>): Promise<T> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Origin: "https://note.com",
        Referer: "https://note.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      };

      if (this.cookies) {
        headers.Cookie = this.cookies;
      }

      if (this.csrfToken) {
        headers["x-note-csrf-token"] = this.csrfToken;
        headers["X-CSRF-Token"] = this.csrfToken;
        headers["X-XSRF-TOKEN"] = this.csrfToken;
      }

      const response = await this.client.put<T>(url, data, {
        headers,
      });

      // Set-Cookieヘッダーからcookie名=値のペアのみを抽出
      const setCookies = response.headers["set-cookie"] || [];
      if (setCookies.length > 0) {
        this.cookies = setCookies
          .map((cookie) => cookie.split(";")[0]) // 最初のname=valueのみ取得
          .join("; ");
      }

      return (response.data as any).data as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API request failed: ${error.message}`);
      } else {
        throw new Error(`Unexpected error: ${error}`);
      }
    }
  }

  public async delete<T>(url: string, data?: Record<string, any>): Promise<T> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Origin: "https://note.com",
        Referer: "https://note.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      };

      if (this.cookies) {
        headers.Cookie = this.cookies;
      }

      if (this.csrfToken) {
        headers["x-note-csrf-token"] = this.csrfToken;
        headers["X-CSRF-Token"] = this.csrfToken;
        headers["X-XSRF-TOKEN"] = this.csrfToken;
      }

      const response = await this.client.delete<T>(url, {
        headers,
        data: data,
      });

      // Set-Cookieヘッダーからcookie名=値のペアのみを抽出
      const setCookies = response.headers["set-cookie"] || [];
      if (setCookies.length > 0) {
        this.cookies = setCookies
          .map((cookie) => cookie.split(";")[0]) // 最初のname=valueのみ取得
          .join("; ");
      }

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
  public signIn = signIn;
  public createNote = createNote;
  public editNote = editNote;
  public uploadEyecatch = uploadEyecatch;
  public deleteNote = deleteNote;
  public draftDelete = draftDelete;
}
