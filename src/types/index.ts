export enum ServiceType {
  LOGISTICS = 'logistics',
  BUYING = 'buying',
  KR_CERT = 'kr_cert',
  CN_CERT = 'cn_cert',
  MANUFACTURING = 'manufacturing'
}

export type ConsultationStatus = 'received' | 'reviewing' | 'consulting' | 'quoting' | 'processing' | 'completed';

export interface UserInfo {
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  kakaoId?: string;
}

export interface ConsultationBase {
  id: string;
  userInfo: UserInfo;
  serviceType: ServiceType;
  consultationMethod: 'kakao' | 'email' | 'wechat';
  status: ConsultationStatus;
  createdAt: number;
}

export interface LogisticsDetails extends ConsultationBase {
  serviceType: ServiceType.LOGISTICS;
  startCountry: string;
  destCountry: string;
  productLink: string;
  quantityWeight: string;
  shippingMethod: string;
}

export interface BuyingDetails extends ConsultationBase {
  serviceType: ServiceType.BUYING;
  mallName: string;
  productLink: string;
  optionQuantity: string;
  unitPriceNegotiation: string;
}

export interface CertDetails extends ConsultationBase {
  serviceType: ServiceType.KR_CERT | ServiceType.CN_CERT;
  productNameModel: string;
  isWireless: boolean;
  hasBattery: boolean;
  certHistory: string;
}

export interface MfgDetails extends ConsultationBase {
  serviceType: ServiceType.MANUFACTURING;
  idea: string;
  quantity: string;
  drawingImage?: string;
  targetPrice: string;
  purpose: string;
}

export type ConsultationData = LogisticsDetails | BuyingDetails | CertDetails | MfgDetails;

export interface Inquiry {
  userInfo: UserInfo;
  subject: string;
  category: 'general' | 'partnership' | 'complaint' | 'other';
  message: string;
}
