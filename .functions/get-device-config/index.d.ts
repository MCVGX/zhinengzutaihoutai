interface CloudFunctionEvent {
  deviceId: string;
  userId: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<{
  success: boolean;
  message: string;
  data?: {
    deviceId: string;
    db: {
      configContent: string;
      version: number;
      updatedAt: Date;
      updatedBy: string;
    } | null;
    json: {
      configContent: string;
      version: number;
      updatedAt: Date;
      updatedBy: string;
    } | null;
  };
}>;
