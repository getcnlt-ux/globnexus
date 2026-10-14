export interface StaticRate {
  id: string;
  country: string;
  type: 'Air' | 'Sea';
  freightRate: string;
  proxyFee: string;
  transitTime: string;
  remarks?: string;
}

export const STATIC_RATES: StaticRate[] = [
  { 
    id: 'rate_1', 
    country: '중국 (China)', 
    type: 'Air', 
    freightRate: '$3.5 / kg', 
    proxyFee: '구매단가 5% (최소 $10)', 
    transitTime: '항공 3-5 영업일', 
    remarks: '심천/광저우 물류센터 신속입고 기준, 매일 선적' 
  },
  { 
    id: 'rate_2', 
    country: '중국 (China)', 
    type: 'Sea', 
    freightRate: '$120 / CBM', 
    proxyFee: '구매단가 3% (최소 $15)', 
    transitTime: '해상 7-12 영업일', 
    remarks: '인천항 입항 후 국내 배송 연계' 
  },
  { 
    id: 'rate_3', 
    country: '미국 (USA)', 
    type: 'Air', 
    freightRate: '$7.8 / lb', 
    proxyFee: '구매단가 7% (최소 $15)', 
    transitTime: '항공 4-7 영업일', 
    remarks: '오레곤(OR)/델라웨어(DE) 무택스 센터 가동' 
  },
  { 
    id: 'rate_4', 
    country: '일본 (Japan)', 
    type: 'Air', 
    freightRate: '¥650 / 0.5kg', 
    proxyFee: '구매단가 5% (최소 ¥1,000)', 
    transitTime: '항공 2-4 영업일', 
    remarks: '동경/오사카 창고 주 5회 출고 및 페덱스 연계' 
  },
  { 
    id: 'rate_5', 
    country: '일본 (Japan)', 
    type: 'Sea', 
    freightRate: '¥18,000 / CBM', 
    proxyFee: '구매단가 5% (최소 ¥1,000)', 
    transitTime: '해상 5-10 영업일', 
    remarks: '선박 스케줄 조율 가능' 
  }
];
