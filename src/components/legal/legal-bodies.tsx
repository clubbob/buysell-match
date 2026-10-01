import CompanyInfo from '@/components/legal/CompanyInfo';
import { LegalSection } from '@/components/legal/LegalDoc';
import IntermediaryNotice from '@/components/legal/IntermediaryNotice';
import { BUYER_DETAIL_LABEL, SELLER_DETAIL_LABEL } from '@/lib/profile-labels';
import { DISPUTE_CONTACT_EMAIL, DISPUTE_GUIDE_INTRO, INTERMEDIARY_NOTICE } from '@/lib/legal-notice';
import { SITE_COMPANY, SITE_NAME } from '@/lib/site';

const OPERATOR = SITE_COMPANY.legalName;

export function TermsBody() {
  return (
    <>
      <p className="text-muted">
        {OPERATOR}(이하 &quot;회사&quot;)가 운영하는 {SITE_NAME} 서비스(이하 &quot;서비스&quot;) 이용과 관련한 조건을
        정합니다.
      </p>

      <LegalSection title="제1조 (목적)">
        <p>
          이 약관은 회사가 제공하는 공동구매 중개 서비스의 이용 조건과 회사·회원 사이의 권리·의무를 정합니다.
        </p>
      </LegalSection>

      <LegalSection title="제2조 (정의)">
        <p>이 약관에서 사용하는 말은 다음과 같습니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            &quot;서비스&quot;란 회사가 웹사이트를 통해 구매자와 판매자의 공동구매 매칭을 중개하는 {SITE_NAME} 일체를
            말합니다.
          </li>
          <li>&quot;회원&quot;이란 이 약관에 동의하고 가입한 자를 말합니다.</li>
          <li>&quot;이용 모드&quot;란 회원이 구매자 또는 판매자로 서비스를 이용하는 선택을 말합니다.</li>
          <li>&quot;판매자&quot;란 {SELLER_DETAIL_LABEL}을 마친 회원으로, 팝니다 글을 올리거나 관리하는 자를 말합니다.</li>
          <li>&quot;구매자&quot;란 {BUYER_DETAIL_LABEL}을 마친 회원으로, 구매 참여를 하거나 삽니다 글을 올리는 자를 말합니다.</li>
          <li>&quot;팝니다&quot;란 판매자가 공동구매 상품을 올리는 게시물을 말합니다.</li>
          <li>&quot;삽니다&quot;란 구매자가 찾는 상품을 올리는 게시물을 말합니다.</li>
          <li>&quot;구매 참여&quot;란 구매자가 팝니다 글에 수량을 접수하는 행위를 말합니다.</li>
          <li>&quot;게시물&quot;이란 회원이 서비스에 올린 글, 사진, 상품 안내, 문의 등 정보를 말합니다.</li>
        </ul>
      </LegalSection>

      <LegalSection title="제3조 (약관의 효력과 변경)">
        <p>
          회사는 이 약관을 서비스 하단 및 약관 페이지에 게시합니다. 약관을 바꿀 때는 변경 내용과 시행일을 서비스에
          알립니다. 변경 약관 시행일 이후 서비스를 계속 이용하면 변경에 동의한 것으로 봅니다. 회원이 동의하지 않으면
          이용을 중단하고 탈퇴할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제4조 (서비스의 성격 — 통신판매중개)">
        <p>{INTERMEDIARY_NOTICE}</p>
        <p>
          회사는 「전자상거래 등에서의 소비자보호에 관한 법률」에 따른 통신판매중개자입니다. 통신판매업 신고는 면제
          대상이며, 신고번호는 &quot;{SITE_COMPANY.mailOrderRegistration}&quot;로 표시합니다.
        </p>
        <p>
          회사는 결제·정산·배송·교환·환불의 당사자가 아니며 이를 직접 처리하지 않습니다. 상품의 품질, 가격, 재고, 배송,
          세금계산서, 사후 처리 등 거래 조건과 이행의 책임은 해당 판매자와 구매자에게 있습니다.
        </p>
        <p>
          회사는 판매자와 구매자가 서로 연락하고 거래를 진행할 수 있도록 정보를 연결할 뿐이며, 개별 거래의 성사·이행을
          보증하지 않습니다. 서비스 초기 화면, 상품 상세, 구매 참여 화면, 사이트 하단 등에 위 내용을 표시합니다.
        </p>
      </LegalSection>

      <LegalSection title="제4조의2 (판매자 신원 정보의 표시)">
        <p>
          회사는 구매자가 구매 참여(청약)를 하기 전에, 해당 상품 판매자의 상호, 대표자명, 사업장 주소, 전화번호,
          사업자등록번호를 서비스 화면에서 확인할 수 있도록 합니다. 판매자는 {SELLER_DETAIL_LABEL} 정보를 사실에 맞게
          등록·유지해야 하며, 회사는 국세청 사업자 상태 조회 등으로 진위를 확인할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제5조 (회원가입)">
        <p>
          가입은 이름, 이메일, 비밀번호를 등록하고 이용약관·개인정보처리방침에 동의하면 완료됩니다. 마케팅 수신 동의는
          선택이며, 거부해도 가입과 기본 이용에는 제한이 없습니다.
        </p>
        <p>
          같은 회원이 구매자와 판매자 상세 등록을 모두 할 수 있으며, 가입 시점에 이용 역할이 정해지지 않습니다. 이용 모드는
          마이페이지에서 선택합니다.
        </p>
        <p>회사는 허위 정보, 타인 명의, 법령 위반이 확인되면 가입을 거절하거나 이용을 제한할 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="제6조 (구매자·판매자 이용)">
        <p>
          구매 참여, 팝니다·삽니다 등록 등 일부 기능은 해당 상세 등록을 마친 뒤에 이용할 수 있습니다. 판매자는 팝니다
          등록 전 {SELLER_DETAIL_LABEL}을 완료해야 하며, 구매자는 구매 참여 전 {BUYER_DETAIL_LABEL}을 완료해야 합니다.
        </p>
        <p>
          구매자로 이용할 때는 팝니다에서 수량을 접수하고, 판매자가 안내한 조건에 따라 입금·수령합니다. 판매자로 이용할
          때는 팝니다를 올리고, 구매 참여를 관리하며 판매 확정·결제·배송 상태를 확인합니다.
        </p>
        <p>구매자는 삽니다 글을 올려 찾는 상품을 알릴 수 있고, 판매자는 자신이 올린 팝니다를 관리합니다.</p>
      </LegalSection>

      <LegalSection title="제7조 (게시와 거래)">
        <p>
          판매자는 상품 내용, 가격, 공동구매 수량, 마감, 결제·배송·교환 방법을 사실에 맞게 밝혀야 합니다. 쿠팡 URL,
          스마트스토어 URL, 유튜브 판매상품 URL은 각각 또는 함께 등록할 수 있습니다. 쿠팡·스마트스토어 링크는 새 창으로
          열리고, 유튜브는 서비스 화면에서 재생됩니다.
        </p>
        <p>
          구매 참여는 판매자가 안내한 조건에 따르는 의사 표시이며, 실제 결제·입금·배송·환불은 판매자와 구매자 사이에서
          직접 이루어집니다. 회사는 결제 대행·에스크로·배송 대행을 제공하지 않습니다.
        </p>
        <p>
          회사는 법령에 어긋나거나 타인의 권리를 침해하는 게시물을 삭제하거나 노출을 제한할 수 있습니다. 게시물의
          저작권은 작성자에게 있고, 회사는 서비스 운영·분쟁 처리에 필요한 범위에서 이를 이용·보관할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제8조 (회원의 의무)">
        <p>회원은 다음 행위를 해서는 안 됩니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>허위 상품, 허위 사업자 정보, 타인 사칭, 허위 구매 참여</li>
          <li>법령에 위반되는 물품의 거래 알선</li>
          <li>다른 회원에 대한 괴롭힘, 스팸, 무단 개인정보 수집·유출</li>
          <li>서비스의 정상적인 운영을 방해하는 행위, 시스템 무단 접근</li>
        </ul>
      </LegalSection>

      <LegalSection title="제9조 (서비스 제공의 제한)">
        <p>
          회사는 시스템 점검, 천재지변, 제휴 서비스 중단 등으로 서비스 제공을 일시 중단할 수 있습니다. 회원 의무 위반이
          있으면 사전 통지 후 이용을 제한하거나 계약을 해지할 수 있습니다. 긴급한 경우에는 사후에 알릴 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제10조 (책임의 제한)">
        <p>
          회사는 중개 과정에서 고의 또는 중대한 과실이 없는 한, 회원 사이의 거래로 발생한 분쟁, 손해, 불이행에 대해
          책임을 지지 않습니다. 회사가 제공하는 서비스의 장애에 대해서도 법령이 달리 정하지 않는 한 책임을 지지
          않습니다.
        </p>
      </LegalSection>

      <LegalSection title="제11조 (거래 기록 보존)">
        <p>
          회사는 중개를 통해 이루어진 거래와 관련된 팝니다·삽니다 게시물, 구매 참여 내역, 상품 문의·답변, 접속 기록 등을
          「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령이 정한 기간 동안 보관합니다. 보관 기간은
          개인정보처리방침을 따릅니다.
        </p>
      </LegalSection>

      <LegalSection title="제12조 (분쟁 해결 협조)">
        <p>
          구매자와 판매자 사이에 배송, 환불, 상품 하자 등으로 분쟁이 발생하면 회사는 분쟁 해결 안내 페이지(
          <a href="/dispute" className="font-semibold text-ink underline-offset-2 hover:underline">/dispute</a>
          ), 이메일(
          <a href={`mailto:${DISPUTE_CONTACT_EMAIL}`} className="font-semibold text-ink underline-offset-2 hover:underline">
            {DISPUTE_CONTACT_EMAIL}
          </a>
          ), 상품 문의 기능 등을 통해 접수·안내를 합니다.
        </p>
        <p>
          회사는 당사자 간 연락 안내, 보관된 거래 기록 확인, 분쟁 관련 고지 전달 등 합리적인 범위에서 협조합니다. 분쟁의
          최종 책임과 해결은 해당 판매자와 구매자에게 있으며, 회사는 통신판매의 당사자가 아닙니다.
        </p>
      </LegalSection>

      <LegalSection title="제13조 (계약 해지)">
        <p>
          회원은 마이페이지 또는 이메일({DISPUTE_CONTACT_EMAIL})로 탈퇴를 요청할 수 있습니다. 진행 중인 거래가 있으면
          회사가 탈퇴를 미룰 수 있습니다. 탈퇴 후에도 분쟁 처리, 법령상 보관 의무가 있는 정보는 해당 기간 동안
          보관합니다.
        </p>
      </LegalSection>

      <LegalSection title="제14조 (준거법과 관할)">
        <p>이 약관은 대한민국 법을 따릅니다. 서비스 이용과 관련한 분쟁은 민사소송법에 따른 관할 법원에 제기합니다.</p>
      </LegalSection>

      <LegalSection title="부칙 (사업자 정보)">
        <p>「전자상거래 등에서의 소비자보호에 관한 법률」 제10조에 따른 회사 사업자 정보는 다음과 같습니다.</p>
        <CompanyInfo variant="legal" className="mt-2" />
        <IntermediaryNotice variant="emphasized" className="mt-4" />
      </LegalSection>
    </>
  );
}

export function PrivacyBody() {
  return (
    <>
      <p>
        {OPERATOR}(이하 &quot;회사&quot;)는 「개인정보 보호법」에 따라 {SITE_NAME} 서비스 이용자의 개인정보를 보호하고,
        어떤 정보를 왜 모으며 어떻게 쓰는지 알립니다.
      </p>

      <LegalSection title="1. 수집하는 개인정보">
        <p>회사는 서비스 제공을 위해 다음 정보를 수집합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold text-ink">회원가입(필수)</span>: 이름, 이메일, 비밀번호. 비밀번호는 Google
            Firebase Authentication이 암호화 보관하며 회사가 평문으로 조회하지 않습니다.
          </li>
          <li>
            <span className="font-semibold text-ink">가입 동의 기록(필수)</span>: 이용약관·개인정보처리방침 동의 여부 및
            동의 시각, 마케팅 수신 동의 여부 및 동의·철회 시각
          </li>
          <li>
            <span className="font-semibold text-ink">{BUYER_DETAIL_LABEL}(구매자 이용 시)</span>: 핸드폰 번호, 배송 주소
          </li>
          <li>
            <span className="font-semibold text-ink">{SELLER_DETAIL_LABEL}(판매자 이용 시)</span>: 상호, 대표자,
            사업자등록번호, 핸드폰 번호, 사업장 전화, 사업장 주소, 사업자등록증 파일, 사업자 인증 여부
          </li>
          <li>
            <span className="font-semibold text-ink">서비스 이용 시 자동·직접 수집</span>: 팝니다·삽니다 게시 내용, 상품
            사진, 구매 참여 내역(수량·배송 주소·결제·배송 상태), 상품 문의·답변, 접속·이용 기록
          </li>
        </ul>
        <p>필수 항목을 제공하지 않으면 회원가입 또는 해당 기능 이용이 제한될 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="2. 이용 목적">
        <ul className="list-disc space-y-1 pl-5">
          <li>회원 식별, 로그인, 본인 확인, 이용 모드 관리</li>
          <li>구매자와 판매자의 매칭, 팝니다·삽니다·구매 참여 기능 제공</li>
          <li>판매자 신원 정보 표시, 사업자 정보 진위 확인(국세청 사업자 상태 조회)</li>
          <li>상품 문의·답변, 분쟁 접수·처리, 법령 위반 조사</li>
          <li>마케팅 수신에 동의한 회원에 한한 서비스 안내·혜택 정보 발송</li>
          <li>서비스 개선, 통계, 보안·부정 이용 방지</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. 보유 기간">
        <p>회원 탈퇴 시 지체 없이 파기합니다. 다만 관련 법령에 따라 다음 정보는 아래 기간 동안 보관합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>계약·청약 철회, 대금 결제, 재화 등의 공급 기록: 5년</li>
          <li>소비자 불만·분쟁 처리 기록: 3년</li>
          <li>표시·광고에 관한 기록: 6개월</li>
          <li>접속 기록: 3개월</li>
        </ul>
        <p>마케팅 수신 동의 정보는 동의 철회 또는 회원 탈퇴 시까지 보관합니다.</p>
      </LegalSection>

      <LegalSection title="4. 제3자 제공">
        <p>
          회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 근거한 요청, 수사·재판 등
          불가피한 경우에는 예외로 합니다.
        </p>
        <p>
          거래 이행에 필요한 연락처·배송 정보는 판매자와 구매자에게 각 상품 화면·참여 내역 등 서비스 기능을 통해
          표시될 수 있습니다. 회사는 카드 결제 대행·에스크로를 운영하지 않으며, 결제 정보를 결제 대행 업체에 넘기지
          않습니다.
        </p>
      </LegalSection>

      <LegalSection title="5. 처리 위탁">
        <p>회사는 서비스 운영을 위해 다음 업무를 위탁합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Google Firebase(Authentication, Firestore, Storage): 회원 인증, 데이터·파일 저장</li>
          <li>국세청 사업자 상태 조회 API: 판매자 사업자등록번호 진위 확인</li>
        </ul>
        <p>위탁 업무 종료 또는 보유 기간 만료 시 위탁 범위 안에서 파기되도록 합니다.</p>
      </LegalSection>

      <LegalSection title="6. 국세청 사업자 조회">
        <p>
          판매자 상세 등록 시 입력한 사업자등록번호를 국세청 사업자 상태 조회에 사용합니다. 조회 목적은 계속사업자 여부
          확인이며, 조회 결과는 등록 가능 여부 판단과 판매자 신원 확인에만 사용합니다.
        </p>
      </LegalSection>

      <LegalSection title="7. 이용자의 권리">
        <p>
          이용자는 자신의 개인정보 열람·정정·삭제·처리 정지를 요청할 수 있습니다. 마케팅 수신 동의는 마이페이지에서
          언제든지 변경하거나, 이메일({SITE_COMPANY.email})로 철회를 요청할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="8. 파기">
        <p>
          보유 기간이 끝나거나 처리 목적이 달성되면 복구할 수 없는 방법으로 파기합니다. 전자 파일은 재생할 수 없도록
          삭제하고, 종이 자료가 있으면 분쇄하거나 소각합니다.
        </p>
      </LegalSection>

      <LegalSection title="9. 안전성 확보 조치">
        <p>
          회사는 접근 권한 제한, 전송 구간 암호화, 비밀번호 암호화 보관, 접속 기록 유지, 관리자 계정 분리를 통해
          개인정보가 분실·도난·유출되지 않도록 관리합니다.
        </p>
      </LegalSection>

      <LegalSection title="10. 쿠키 및 로컬 저장소">
        <p>
          로그인 상태 유지, 이용 모드 선택, 이메일 저장 선택 등 서비스 제공에 필요한 범위에서 쿠키 또는 브라우저 로컬
          저장소를 사용할 수 있습니다. 브라우저 설정으로 저장을 거부할 수 있으나 일부 기능이 제한될 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="11. 개인정보 보호 책임">
        <p>
          개인정보 보호책임자는 {SITE_COMPANY.privacyOfficer}입니다. 개인정보 관련 문의·열람·정정·삭제·처리 정지 요청은
          이메일{' '}
          <a href={`mailto:${SITE_COMPANY.email}`} className="font-semibold text-ink underline-offset-2 hover:underline">
            {SITE_COMPANY.email}
          </a>
          또는 전화 {SITE_COMPANY.phone}로 접수합니다. 방문·우편 문의 주소는 {SITE_COMPANY.address}입니다.
        </p>
        <p>이 방침을 바꿀 때는 시행일 전에 서비스에 알립니다.</p>
      </LegalSection>
    </>
  );
}

export function DisputeBody() {
  return (
    <>
      <p>{DISPUTE_GUIDE_INTRO}</p>
      <p className="text-ink">{INTERMEDIARY_NOTICE}</p>

      <LegalSection title="1. 먼저 확인할 것">
        <ul className="list-disc space-y-1 pl-5">
          <li>상품 상세의 결제·배송·교환 안내와 판매자가 안내한 입금 기한·조건</li>
          <li>구매 참여 내역(수량, 판매 확정, 결제·배송 상태)</li>
          <li>상품 문의에 남긴 내용과 판매자 답변</li>
        </ul>
        <p>배송·환불 등은 원칙적으로 해당 판매자와 구매자가 직접 조율합니다.</p>
      </LegalSection>

      <LegalSection title="2. 분쟁 접수 방법">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold text-ink">이메일(회사 접수)</span>:{' '}
            <a href={`mailto:${DISPUTE_CONTACT_EMAIL}`} className="font-semibold text-ink underline-offset-2 hover:underline">
              {DISPUTE_CONTACT_EMAIL}
            </a>
          </li>
          <li>
            <span className="font-semibold text-ink">상품 문의</span>: 해당 팝니다 상세의 상품 문의 탭에서 판매자에게 직접
            문의
          </li>
          <li>
            <span className="font-semibold text-ink">마이페이지</span>: 판매자는 받은 상품 문의에서 답변
          </li>
        </ul>
        <p>이메일 접수 시 아래 정보를 함께 알려 주세요.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>회원 이메일, 연락 가능한 전화번호</li>
          <li>상품명(팝니다) 및 참여 일시</li>
          <li>분쟁 내용(배송 지연, 미배송, 환불 요청, 상품 하자 등)</li>
          <li>판매자·구매자 간 연락 여부</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. 회사의 협조 범위">
        <p>회사는 통신판매중개자로서 다음 범위에서 협조합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>보관된 게시물·구매 참여·문의 기록 확인</li>
          <li>당사자 연락 안내, 분쟁 관련 고지 전달</li>
          <li>법령 위반 또는 약관 위반 게시물·계정에 대한 조치</li>
        </ul>
        <p>
          회사는 결제 대행·환불 실행·배송 대행·손해배상 지급을 하지 않으며, 분쟁의 최종 해결 책임은 판매자와 구매자에게
          있습니다.
        </p>
      </LegalSection>

      <LegalSection title="4. 기록 보존">
        <p>
          중개를 통해 이루어진 거래·문의 기록은 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령에 따라
          보관합니다. 계약·공급 관련 기록은 5년, 소비자 불만·분쟁 처리 기록은 3년 등 개인정보처리방침의 보유 기간을
          따릅니다.
        </p>
      </LegalSection>

      <LegalSection title="5. 사업자 정보">
        <CompanyInfo variant="legal" />
      </LegalSection>
    </>
  );
}

export function MarketingBody() {
  return (
    <>
      <p>
        {OPERATOR}(이하 &quot;회사&quot;)는 {SITE_NAME} 서비스에서 선택 동의를 받은 회원에게만 마케팅 정보를 보냅니다. 이
        동의는 회원가입에 필수가 아니며, 거부해도 가입과 기본 이용에는 제한이 없습니다.
      </p>

      <LegalSection title="1. 수신 목적">
        <ul className="list-disc space-y-1 pl-5">
          <li>신규 기능, 서비스 이용 방법 안내</li>
          <li>공동구매·이벤트·혜택 정보</li>
          <li>회원에게 유용하다고 판단되는 거래·서비스 관련 소식</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. 수집·이용 항목">
        <p>가입 시 등록한 이름, 이메일, 마케팅 수신 동의 여부 및 동의·철회 시각을 이용합니다.</p>
      </LegalSection>

      <LegalSection title="3. 수신 채널">
        <p>가입 시 등록한 이메일로 발송합니다. 문자(SMS)·전화 광고는 이 동의 범위에 포함하지 않습니다.</p>
      </LegalSection>

      <LegalSection title="4. 보유 기간">
        <p>동의 철회 또는 회원 탈퇴 시까지 보관합니다. 철회·탈퇴 이후에는 마케팅 발송 목적으로 이용하지 않습니다.</p>
      </LegalSection>

      <LegalSection title="5. 동의 및 철회 방법">
        <ul className="list-disc space-y-1 pl-5">
          <li>회원가입 시 선택 동의</li>
          <li>마이페이지 회원 정보의 &quot;마케팅 수신 동의&quot; 설정 변경</li>
          <li>
            이메일{' '}
            <a href={`mailto:${SITE_COMPANY.email}`} className="font-semibold text-ink underline-offset-2 hover:underline">
              {SITE_COMPANY.email}
            </a>
            로 수신 거부 요청
          </li>
        </ul>
        <p>철회 전까지 이미 발송이 시작된 안내는 도착할 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="6. 필수 안내와의 구분">
        <p>
          약관·개인정보처리방침 변경, 거래·분쟁, 보안, 법령상 고지, 구매 참여·판매 관련 필수 알림 등 서비스 운영에
          필요한 안내는 마케팅 수신 동의와 관계없이 발송될 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="7. 문의">
        <p>
          마케팅 수신과 관련한 문의는 이메일{' '}
          <a href={`mailto:${SITE_COMPANY.email}`} className="font-semibold text-ink underline-offset-2 hover:underline">
            {SITE_COMPANY.email}
          </a>
          또는 개인정보 보호책임자 {SITE_COMPANY.privacyOfficer}에게 연락해 주세요.
        </p>
      </LegalSection>
    </>
  );
}
