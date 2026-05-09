interface CloudFunctionEvent {
  deviceId: string;
  userId: string;
  configContent: string;
  forceSync?: boolean;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<{
  success: boolean;
  message: string;
  data?: {
    deviceId: string;
    configType: string;
    oldVersion: number;
    newVersion: number;
    isNewConfig: boolean;
    updatedAt: Date;
  };
}>;
