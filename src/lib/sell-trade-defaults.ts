/** 판매 상품 등록 시 배송·교환·반품 기본 문구 (국내 쇼핑몰 공통 표기 참고) */

export const DEFAULT_SHIPPING_FEE = '무료';

export const DEFAULT_SHIPPING_GUIDE = `배송 방법: 택배
배송 지역: 전국
배송 기간: 결제·입금 확인 후 1~3일 이내 출고 (영업일 기준), 수령까지 보통 2~5일 소요
※ 천재지변, 물량 수급 변동 등으로 배송이 지연될 수 있습니다.`;

export const DEFAULT_RETURN_POLICY = `교환/반품 신청 기간: 상품 수령 후 7일 이내

교환/반품 제한사항
· 주문/제작 상품의 경우, 상품의 제작이 이미 진행된 경우
· 상품 포장을 개봉하여 사용 또는 설치 완료되어 상품의 가치가 훼손된 경우 (단, 내용 확인을 위한 포장 개봉의 경우는 제외)
· 고객의 사용, 시간경과, 일부 소비에 의하여 상품의 가치가 현저히 감소한 경우
· 세트상품 일부 사용, 구성품을 분실하였거나 취급 부주의로 인한 파손/고장/오염으로 재판매 불가한 경우
· 모니터 해상도의 차이로 인해 색상이나 이미지가 실제와 달라, 고객이 단순 변심으로 교환/반품을 무료로 요청하는 경우
· 제조사의 사정 (신모델 출시 등) 및 부품 가격 변동 등에 의해 무료 교환/반품으로 요청하는 경우

반품 배송비: 단순 변심 시 구매자 부담 / 상품 불량·오배송 시 판매자 부담`;

export const DEFAULT_TRADE_DETAIL = {
  shippingFee: DEFAULT_SHIPPING_FEE,
  shippingGuide: DEFAULT_SHIPPING_GUIDE,
  returnPolicy: DEFAULT_RETURN_POLICY,
};
