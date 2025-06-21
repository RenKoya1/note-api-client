export type UserSimple = {
  id: number;
  key: string;
  name: string;
  urlname: string;
  nickname: string;
  user_profile_image_path: string;
  custom_domain: {
    id: number;
    tls: boolean;
    host: string;
    type: string;
    key: string;
  };
  disable_support: boolean;
  email_confirmed_flag: boolean;
  like_appeal_text: string;
  like_appeal_image: string;
  twitter_nickname: string;
  magazine_add_appeal: {
    text: string;
    image: string | null;
  };
};
