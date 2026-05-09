interface CloudFunctionEvent {
  deviceId: string;
  userId: string;
  localConfig: string;
  configType?: 'db' | 'json';
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<{
  success: boolean;
  message: string;
  data?: {
    hasCloudConfig: boolean;
    hasDifferences: boolean;
    differenceType: 'identical' | 'modified' | 'new';
    localVersion: number;
    cloudVersion: number;
    localConfig: string;
    cloudConfig: string | null;
    differences: any;
    updatedAt?: Date;
    updatedBy?: string;
  };
}>;
