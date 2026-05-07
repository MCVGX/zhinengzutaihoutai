interface CloudFunctionEvent {
  action: string;
  data?: {
    nickname?: string;
    avatar?: string;
  };
}

interface LoginResult {
  userId: string;
  openid: string;
  appId: string;
  loginStatus: string;
  isNewUser: boolean;
  nickname?: string;
  avatar?: string;
  lastLoginAt: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<LoginResult>;