interface CloudFunctionEvent {
  deviceId: string;
  userId: string;
  configType: 'db' | 'json';
  configContent: string;
  changeLog?: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<{
  success: boolean;
  message: string;
  data?: {
    deviceId: string;
    configType: string;
    version: number;
    updatedAt: Date;
  };
}>;
