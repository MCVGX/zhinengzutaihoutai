interface CloudFunctionEvent {
  deviceId: string;
  userId: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<{
  success: boolean;
  hasBinding: boolean;
  deviceId: string;
  userId: string;
  message: string;
}>;
