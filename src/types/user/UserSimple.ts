export type UserSimple = {
  id: number;
  key: string;
  name: string;
  urlname: string;
  nickname: string | null;
  user_profile_image_path: string;
  custom_domain: {
    id?: number;
    tls: boolean;
    host: string;
    type: string;
    key: string;
  } | null;
  disable_support: boolean;
  email_confirmed_flag: boolean;
  like_appeal_text: string | null;
  like_appeal_image: string | null;
  twitter_nickname: string | null;
  magazine_add_appeal: {
    text: string | null;
    image: string | null;
  };
};
