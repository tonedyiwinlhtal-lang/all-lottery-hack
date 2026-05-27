export interface LotteryResult {
  issueNumber: string;
  number: string;
  colour: string;
  premium: string;
}

export interface LotteryResponse {
  data: {
    list: LotteryResult[];
    pageNo: number;
    totalPage: number;
    totalCount: number;
  };
  code: number;
  msg: string;
  msgCode: number;
  serviceNowTime: string;
}

export type Provider = "ck" | "bigwin" | "sixlottery";

export interface TrackedPrediction {
  issueNumber: string;
  provider: Provider;
  isSmall: boolean;
  predictedNumber: number;
  confidence: number;
  status: 'PENDING' | 'WIN' | 'LOSE';
  actualNumber?: number;
}
