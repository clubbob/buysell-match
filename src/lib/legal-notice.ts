import { SITE_COMPANY, SITE_NAME } from '@/lib/site';

/** 전자상거래법 제20조 제1항 통신판매중개 고지 문구 */
export const INTERMEDIARY_NOTICE = `${SITE_NAME}은 통신판매중개자이며 통신판매의 당사자가 아닙니다. 따라서 상품, 상품정보, 거래에 관한 의무와 책임은 각 판매자에게 있습니다.`;

export const DISPUTE_CONTACT_EMAIL = SITE_COMPANY.email;

export const LEGAL_EFFECTIVE_DATE = '2026.10.01';

export const DISPUTE_GUIDE_INTRO = `${SITE_COMPANY.legalName}이 운영하는 ${SITE_NAME}은 구매자와 판매자 사이 거래를 중개합니다. 배송·환불·상품 하자 등 분쟁이 생기면 아래 경로로 접수해 주세요. 회사는 관련 기록을 보관하고, 당사자 연락 안내 등 합리적인 범위에서 협조합니다.`;
