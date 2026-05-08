import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ko: {
    translation: {
      nav: {
        home: '홈',
        about: '회사소개',
        services: '서비스',
        apply: '견적신청',
        contact: '고객지원',
        faq: 'FAQ',
        track: '배송 조회',
        login: '로그인',
        signup: '회원가입',
        myReferral: '나의 레퍼럴 링크',
        copyLink: '링크 복사',
        copied: '복사됨!',
        account: '계정',
        adminPanel: '관리자 페이지',
        logout: '로그아웃'
      },
      home: {
        subtitle: '// GLOBRIDGE TOTAL CONTROL',
        titlePart1: 'BEYOND',
        titlePart2: 'GLOBAL',
        titlePart3: 'BY',
        titlePart4: 'INSIGHT',
        desc: '복잡한 글로벌 공급망을 날카로운 시선과 빈틈없는 원스톱 솔루션으로 리드합니다. 우리는 물류의 모든 과정을 완벽하게 관제합니다.',
        applyBtn: '무료 견적 문의',
        certBtn: '인증 가능 여부 확인',
        feature1Title: '원스톱 인증 대행',
        feature1Desc: '한국 KC인증부터 중국, 일본, 미·유럽 현지 허가까지. 비즈니스에 필요한 모든 인증 절차를 한 번에 해결합니다.',
        feature2Title: '압도적인 속도',
        feature2Desc: '항공, 해상, 철도 등 최적의 경로를 실시간으로 설계하여 가장 빠른 물류 흐름을 보장합니다.',
        feature3Title: '생산 연계 인프라',
        feature3Desc: '중국 현지 생산 라인 및 신제품 개발 네트워크를 통해 구매를 넘어 제조 단계까지 지원합니다.',
        mfgInfra: '// PRODUCTION_INFRASTRUCTURE',
        ctaTitle: '글로벌 물류의 새로운 기준 지금 바로 시작하세요.',
        ctaBtn: '무료 컨설팅 받기',
        airCargo: '항공운송',
        oceanVessel: '해상운송',
        purchaseProxy: '구매대행',
        logisticsProxy: '물류대행',
        certification: '인증관련',
        manufacturing: '생산 및 제조',
        mfgSectionTitlePart1: '아이디어가',
        mfgSectionTitlePart2: '제품',
        mfgSectionTitlePart3: '이 되는 완벽한 프로세스',
        mfgSectionDesc: '단순한 소싱을 넘어 독자적인 제품 개발을 꿈꾸시나요? 글로브리지는 중국 현지 최고의 정밀 제조 네트워크를 통해 시제품 제작부터 OEM 대량 생산까지 모든 단계를 완벽하게 관리합니다.',
        mfgStep1Title: '현지 공장 매칭',
        mfgStep1Desc: '제품군에 최적화된 제조 공정 보유 라인 섭외',
        mfgStep2Title: '품질 제어 시스템',
        mfgStep2Desc: '현지 상주 인력의 엄격한 샘플 및 본품 검수',
        mfgCta: '상담 시작'
      },
      about: {
        subtitle: '// CONNECTING_GLOBAL_BUSINESS',
        titlePart1: 'THE BRIDGE',
        titlePart2: 'BETWEEN',
        titlePart3: 'VISION &',
        titlePart4: 'REALITY',
        intro1: 'Globridge(글로브리지)는 단순한 물류 대행을 넘어, 전 세계 비즈니스의 국경을 허무는 혁신적인 가교 역할을 수행합니다.',
        intro2: '우리는 복잡한 글로벌 시장의 데이터를 날카로운 통찰력으로 분석하고, 견고한 디지털 인프라를 통해 고객의 비즈니스가 멈춤 없이 성장할 수 있는 최적의 경로를 제공합니다.',
        architectureTitle: 'ARCHITECTURE OF SCALE',
        philTitle: '날카로운 분석과\n빈틈없는 관리',
        philDesc: '물류는 단순히 물건을 옮기는 과정이 아닙니다. 정보의 흐름을 지배하고 리스크를 선제적으로 제어하는 것이 핵심입니다. 글로브리지는 인간의 통찰력과 디지털 관제 시스템을 결합하여 세상에 없던 물류 경험을 창조합니다.',
        strength1Title: '초정밀 관제',
        strength1Desc: '모든 물동량을 실시간으로 추적하고 리스크를 차단합니다.',
        strength2Title: '최적화 경로',
        strength2Desc: '비용과 시간을 획기적으로 줄이는 최단 루트를 설계합니다.',
        strengthTitle: '비교할 수 없는\n4가지 압도적 강점',
        strengthsLabel: '우리의 강점',
        verified: '// Verified Excellence.2024',
        mission: '우리는 세상의 모든 비즈니스가 국경이라는 제약 없이 자유롭게 연결되는 미래를 꿈꿉니다.',
        controlCenter: '글로브리지 글로벌 관제 센터',
        card1Title: '글로벌 인프라',
        card1Desc: '한국 본사와 중국, 일본, 미·유럽 현지 지사 및 글로벌 물류 네트워크를 통해 전 세계를 잇는 독보적인 벨류체인을 보유하고 있습니다.',
        card2Title: '생산/소싱 매니지먼트',
        card2Desc: '단순 배송을 넘어 중국 현지 공장 섭외, OEM 생산, 샘플 제작까지 비즈니스의 시작점부터 함께합니다.',
        card3Title: '완벽한 원스톱 인증',
        card3Desc: 'KC인증, 전자파인접, 허가 대행 등 복잡한 수입 인증 절차를 전문 인력이 한 번에 해결해 드립니다.',
        card4Title: '데이터 기반 신뢰',
        card4Desc: '전 과정 디지털 모니터링 시스템을 통해 불투명한 물류 시장에서 가장 정직하고 투명한 데이터를 제공합니다.'
      },
      footer: {
        links: 'Links',
        contact: 'Contact',
        admin: '관리자 접속',
        desc: '세계를 연결하는 글로벌 비즈니스의 가교. Globridge와 함께 국경 없는 물류와 구매의 혁신을 경험하세요.',
        sourcing: '구매 대행',
        certification: '인증 대행',
        services: '주요 서비스',
        b2b: 'B2B 솔루션',
        privacy: '개인정보처리방침',
        terms: '이용약관',
        inquiry: '문의하기',
        address: '서울특별시 강남구 테헤란로'
      },
      agent: {
        dashboard: '나의 레퍼럴 관리',
        desc: '에이전트님의 고유 링크를 통해 유입된 고객들의 문의 현황과 진행 상태를 실시간으로 확인할 수 있습니다.',
        myPromoLink: '나의 홍보용 링크',
        copy: '복사',
        copied: '복사됨',
        linkDesc: '이 링크를 통해 접속하여 견적을 신청하면 실적으로 기록됩니다.',
        referralHistory: '레퍼럴 실적 내역',
        referralHistoryDesc: '최근 유입된 실적 리스트입니다.',
        noData: '아직 유입된 실적이 없습니다.',
        table: {
          date: '일시',
          customer: '고객명 / 업체명',
          service: '서비스',
          status: '상태'
        },
        stats: {
          total: '전체 유치',
          pending: '대기 중',
          inProgress: '진행 중',
          completed: '완료됨',
          unit: '건'
        },
        status: {
          received: '접수완료',
          consulting: '상담진행중',
          completed: '완료(성공)',
          cancelled: '취소'
        },
        tracking: {
          title: '물류 배송 조회',
          desc: '주문 번호 또는 운송장 번호를 입력하여 실시간 물류 이동 경로를 확인하세요.',
          inputPlaceholder: '주문/운송장 번호 입력',
          search: '조회하기',
          statusLabels: {
            ordered: '주문 접수',
            preparing: '상품 준비 중',
            warehouse: '창고 입고',
            export: '수출 통관',
            shipping: '국제 운송 중',
            import: '수입 통관',
            local: '국내 배송',
            delivered: '배송 완료'
          },
          currentStep: '현재 단계',
          lastUpdate: '최종 업데이트',
          location: '위치',
          details: '상세 내역',
          myShipments: '나의 배송 현황',
          noShipments: '참조된 배송 정보가 없습니다.',
          viewDetails: '상세 보기',
          admin: {
            title: '물류 배송 체인 관리',
            shipmentList: '전체 배송 목록',
            updateStatus: '상태 업데이트',
            trackingNumber: '송장 번호',
            customer: '고객명',
            lastStep: '현재 단계',
            actions: '작업',
            edit: '상태 수정',
            save: '변경사항 저장',
            cancel: '취소'
          }
        }
      },
      consult: {
        title: '상담하기',
        wechat: '위챗 상담',
        kakao: '카카오톡 상담',
        email: '이메일 문의',
        live: '실시간 상담'
      },
      services_page: {
        title: '핵심 서비스',
        logistics: {
          title: '물류 대행',
          desc: '입고, 보관, 포장, 주문 관리부터 배송까지. 전 과정을 AI 기반 시스템으로 관리합니다.'
        },
        buying: {
          title: '구매 대행',
          desc: '중국, 일본, 미·유럽 등 현지 공장 소싱부터 품질 검수까지. 최상급 제품을 보장합니다.'
        },
        mfg: {
          title: '생산 및 제조',
          desc: '아이디어를 제품으로. 글로벌 제조 인프라를 통해 OEM 생산부터 신제품 개발까지 토탈 솔루션을 제공합니다.'
        },
        delivery: {
          title: '배송 대행',
          desc: '항공, 해상, 철도. 화물의 특성에 맞는 가장 효율적인 물류 경로를 매칭합니다.'
        },
        customs: {
          title: '인증 및 통관',
          desc: '복잡한 해외 현지 인증 및 통관 업무를 전문 인력이 대행하여 리스크를 해소합니다.'
        }
      },
      apply_page: {
        title: '견적 및 상담 신청',
        subtitle: '가장 빠르고 정확한 글로벌 비즈니스 솔루션을 설계해 드립니다.',
        success_title: '접수 완료',
        success_subtitle: '매니저가 확인 후 곧 연락드리겠습니다.',
        steps: {
          service: '서비스 선택',
          details: '상세 입력',
          info: '고객 정보',
          success: '완료'
        },
        selection: {
          title: '서비스를 선택해주세요',
          logistics: '물류대행',
          buying: '구매대행',
          kr_cert: '한국 인증대행',
          cn_cert: '중국 인증대행',
          mfg: '제조 / 개발'
        },
        service: {
          logistics: { desc: '가장 빠르고 경제적인 글로벌 운송 솔루션을 제안합니다.' },
          buying: { desc: '원하는 제품의 소싱부터 단가 협상, 현지 검수까지 대행합니다.' },
          kr_cert: { desc: '전기용품, 어린이제품 등 한국 내 필수 인증 획득을 지원합니다.' },
          cn_cert: { desc: '중국 현지 수출에 필요한 CCC 등 주요 인증을 대행합니다.' },
          mfg: { desc: '아이디어 구상부터 시제품 제작, OEM 생산 공장을 연결합니다.' }
        },
        fields: {
          name: '이름 / 업체명',
          phone: '연락처',
          email: '이메일',
          kakao: '카카오톡 ID (선택)',
          method: '선호하는 상담 방식',
          privacy: '개인정보 수집 및 이용 안내: 글로브리지는 원활한 상담을 위해 성함, 연락처, 이메일 정보를 수집합니다. 수집된 정보는 상담 목적 외 다른 용도로 사용되지 않으며, 상담 완료 후 지체 없이 파기됩니다.'
        },
        btns: {
          prev: '이전 단계',
          back: '뒤로 가기',
          next: '계속하기',
          almost: '거의 다 왔어요',
          submit: '신청 완료',
          submitting: '접수 중...',
          home: '홈으로 이동',
          kakao_chat: '카카오톡 실시간 상담'
        },
        detailed_fields: {
          title: '세부 정보를 입력해주세요',
          logistics: {
            route_from: '출발지',
            route_from_placeholder: '출발 국가/도시 (예: 중국, 일본, 미국 등)',
            route_to: '도착지',
            route_to_placeholder: '도착 국가/도시 (예: 한국 인천)',
            method: '배송 방식 선호',
            method_options: { air: '항공', sea: '해상', rail: '철도', unknown: '미정' },
            link: '제품 링크 (선택)',
            link_placeholder: '1688, 알리바바 등 대표 제품 링크',
            spec: '화물 정보 (수량/중량)',
            spec_placeholder: '예: 50박스 / 총 200kg',
            memo: '추가 요청사항',
            memo_placeholder: '냉장 배송, 특수 포장 등 상세 내용을 적어주세요.'
          },
          buying: {
            mall: '주요 소싱 채널',
            mall_options: { s1688: '1688', taobao: '타오바오', tmall: '티몰', other: '기타' },
            link: '상품 링크 / 이미지 URL',
            link_placeholder: '조사 대상 상품의 링크를 입력해주세요.',
            qty: '예상 주문 수량',
            qty_placeholder: '예: SKU당 100개',
            target_price: '희망 구매 단가',
            target_price_placeholder: '예: 개당 15위안 이하',
            nego: '단가 협상 필요 여부',
            nego_options: { yes: '필요함', already: '이미 협의됨' }
          },
          kr_cert: {
            name: '제품명 / 모델명',
            name_placeholder: '인증이 필요한 제품의 정확한 명칭',
            cat: '제품 카테고리',
            cat_placeholder: '예: 생활가전, 어린이 완구 등',
            battery: '배터리 포함 여부',
            wireless: '무선 기능 여부',
            options: { yes: '있음', no: '없음' },
            memo: '기존 인증 이력 / 기타 사항',
            memo_placeholder: '해외 인증 보유 여부를 적어주시면 더 빠른 상담이 가능합니다.'
          },
          mfg: {
            stage: '현재 단계',
            stage_options: { idea: '기획/아이디어', design: '디자인완성', proto: '도면/시제품보유' },
            cat: '제조 카테고리',
            cat_placeholder: '예: 금형 사출, 봉제, 전자회로 등',
            qty: '연간 예상 생산량',
            qty_placeholder: '예: 연 5,000개',
            memo: '상세 개발 사양',
            memo_placeholder: '재질, 크기, 필수 기능 등 상세 아이디어를 자유롭게 공유해주세요.'
          }
        }
      },
      faq_page: {
        title: '자주 묻는 질문',
        items: [
          {
            q: '배송 기간은 얼마나 걸리나요?',
            a: '항공편의 경우 통관 포함 3~5일, 해상편의 경우 7~10일 정도 소요됩니다. (산간 도서 지역 제외)'
          },
          {
            q: '구매대행 수수료는 어떻게 되나요?',
            a: '제품 가액 및 수량에 따라 차등 적용됩니다. 일반적으로 5~10% 수준이며 대량 구매 시 별도 협의가 가능합니다.'
          },
          {
            q: 'KC인증 대행도 가능한가요?',
            a: '네, 저희는 한국 내 공식 인증 기관과 협업하여 시험 접수부터 인증서 발급까지 전 과정을 지원합니다.'
          },
          {
            q: '파손 보상이 가능한가요?',
            a: '안심 보험 서비스를 이용하실 경우, 검수 단계와 배송 단계에서의 파손에 대해 100% 보상이 가능합니다.'
          }
        ]
      },
      contact_page: {
        title: '고객 지원',
        subtitle: '궁금한 점이 있으신가요? 아래 폼을 통해 문의해 주시면 전문가가 직접 답변해 드립니다.',
        fields: {
          name: '성함',
          email: '이메일',
          message: '문의 내용',
          name_placeholder: '이름을 입력하세요',
          email_placeholder: 'example@mail.com',
          message_placeholder: '문의하실 내용을 입력해 주세요.'
        },
        submit: '문의 보내기'
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        about: 'About',
        services: 'Services',
        apply: 'Quote',
        contact: 'Support',
        faq: 'FAQ',
        track: 'Tracking',
        login: 'Login',
        signup: 'Sign Up',
        account: 'Account',
        adminPanel: 'Admin Panel',
        logout: 'Logout'
      },
      home: {
        subtitle: '// GLOBAL CONTROL SYSTEM',
        titlePart1: 'BEYOND',
        titlePart2: 'GLOBAL',
        titlePart3: 'BY',
        titlePart4: 'INSIGHT',
        desc: 'Leading complex global supply chains with sharp insight and seamless one-stop solutions. We perfectly monitor every step of logistics.',
        applyBtn: 'Free Quote Request',
        certBtn: 'Check Certification',
        feature1Title: 'One-stop Certification',
        feature1Desc: 'From Korea KC to local permits in China, Japan, USA, and Europe. We handle all certification procedures for your business at once.',
        feature2Title: 'Unmatched Speed',
        feature2Desc: 'Design optimal routes via air, sea, and rail in real-time to ensure the fastest logistics flow.',
        feature3Title: 'Production-linked Infra',
        feature3Desc: 'Support beyond procurement into manufacturing stages through local production lines and R&D networks.',
        mfgInfra: '// PRODUCTION_INFRASTRUCTURE',
        ctaTitle: 'The new standard in global logistics. Start now.',
        ctaBtn: 'Get Free Consulting',
        airCargo: 'Air Cargo',
        oceanVessel: 'Ocean Freight',
        purchaseProxy: 'Purchase Agency',
        logisticsProxy: 'Logistics Agency',
        certification: 'Certification',
        manufacturing: 'Manufacturing',
        mfgSectionTitlePart1: 'Where',
        mfgSectionTitlePart2: 'Ideas',
        mfgSectionTitlePart3: 'become Reality',
        mfgSectionDesc: 'Dreaming of developing your own unique products beyond simple sourcing? Globridge perfectly manages every stage from prototyping to OEM mass production through the best local precision manufacturing network in China.',
        mfgStep1Title: 'Local Factory Matching',
        mfgStep1Desc: 'Sourcing lines with optimized manufacturing processes for each product category',
        mfgStep2Title: 'Quality Control System',
        mfgStep2Desc: 'Strict sample and product inspection by local resident staff',
        mfgCta: 'Start Consulting'
      },
      about: {
        subtitle: '// CONNECTING GLOBAL BUSINESS',
        titlePart1: 'THE BRIDGE',
        titlePart2: 'BETWEEN',
        titlePart3: 'VISION &',
        titlePart4: 'REALITY',
        intro1: 'Globridge goes beyond simple logistics agency to serve as an innovative bridge that breaks down the borders of global business.',
        intro2: 'We analyze complex global market data with sharp insight and provide optimal paths for customers to grow without stopping through robust digital infrastructure.',
        architectureTitle: 'Architecture of Scale',
        philTitle: 'Deep Insight and Seamless Control',
        philDesc: 'Logistics is not just about moving things. It is about dominating the flow of information and preemptively controlling risks. Globridge combines human insight with digital control systems to create a logistics experience that never existed before.',
        strength1Title: 'High-precision Control',
        strength1Desc: 'Track all cargo in real-time and block risks proactively.',
        strength2Title: 'Optimized Path',
        strength2Desc: 'Design the shortest routes that drastically reduce costs and time.',
        strengthTitle: '4 Key Competitive Advantages',
        strengthsLabel: 'Our Strengths',
        verified: '// Verified Excellence.2024',
        mission: 'We dream of a future where all the worlds businesses are freely connected without the constraints of borders.',
        controlCenter: 'Globridge Global Control Center',
        card1Title: 'Global Infrastructure',
        card1Desc: 'Operating head office in Korea and a global network covering China, Japan, USA, and Europe, we have a unique value chain connecting all major markets.',
        card2Title: 'Production/Sourcing Mgmt',
        card2Desc: 'Beyond simple delivery, we join from the start of business including factory sourcing in China, OEM production, and sampling.',
        card3Title: 'Perfect One-stop Cert',
        card3Desc: 'Experts resolve complex import certification procedures such as KC certification and permit agencies all at once.',
        card4Title: 'Data-based Trust',
        card4Desc: 'We provide the most honest and transparent data in the opaque logistics market through an all-stage digital monitoring system.'
      },
      footer: {
        links: 'Links',
        contact: 'Contact',
        admin: 'Admin Login',
        desc: 'The bridge for global business connecting the world. Experience innovation in borderless logistics and procurement with Globridge.',
        sourcing: 'Sourcing Agency',
        certification: 'Certification Agency',
        services: 'Services',
        b2b: 'B2B Solution',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        inquiry: 'Inquiry',
        address: 'Teheran-ro, Gangnam-gu, Seoul'
      },
      agent: {
        dashboard: 'Referral Dashboard',
        desc: 'Real-time tracking of inquiries and progress from customers arriving through your unique link.',
        myPromoLink: 'My Promotional Link',
        copy: 'Copy',
        copied: 'Copied',
        linkDesc: 'Quote requests through this link will be recorded as your referral performance.',
        referralHistory: 'Referral History',
        referralHistoryDesc: 'List of recently acquired leads.',
        noData: 'No referral performance recorded yet.',
        table: {
          date: 'Date',
          customer: 'Customer / Company',
          service: 'Service',
          status: 'Status'
        },
        stats: {
          total: 'Total Leads',
          pending: 'Pending',
          inProgress: 'In Progress',
          completed: 'Completed',
          unit: 'Case(s)'
        },
        status: {
          received: 'Received',
          consulting: 'Consulting',
          completed: 'Success',
          cancelled: 'Cancelled'
        },
        tracking: {
          title: 'Logistics Tracking',
          desc: 'Track your logistics status in real-time with your order or tracking number.',
          inputPlaceholder: 'Enter Order/Tracking Number',
          search: 'Track',
          statusLabels: {
            ordered: 'Order Received',
            preparing: 'Preparing Item',
            warehouse: 'In Warehouse',
            export: 'Export Customs',
            shipping: 'In Transit',
            import: 'Import Customs',
            local: 'Local Delivery',
            delivered: 'Delivered'
          },
          currentStep: 'Current Step',
          lastUpdate: 'Last Update',
          location: 'Location',
          details: 'Details',
          myShipments: 'My Shipments',
          noShipments: 'No shipments found.',
          viewDetails: 'View Details',
          admin: {
            title: 'Logistics Chain Management',
            shipmentList: 'All Shipments',
            updateStatus: 'Update Status',
            trackingNumber: 'Tracking No.',
            customer: 'Customer',
            lastStep: 'Current Step',
            actions: 'Actions',
            edit: 'Edit Status',
            save: 'Save Changes',
            cancel: 'Cancel'
          }
        }
      },
      consult: {
        title: 'Consult',
        wechat: 'WeChat Chat',
        kakao: 'KakaoTalk Chat',
        email: 'Email Inquiry',
        live: 'Live Chat'
      },
      services_page: {
        title: 'CORE SERVICES',
        logistics: {
          title: 'Logistics Agency',
          desc: 'Manage everything from entry, storage, packaging, and order management to delivery using AI-based systems.'
        },
        buying: {
          title: 'Purchase Agency',
          desc: 'From local factory sourcing to quality inspection in China, Japan, USA, and Europe. We guarantee top-tier products.'
        },
        mfg: {
          title: 'Production & Manufacturing',
          desc: 'Turn ideas into products. We provide total solutions from OEM production to new product development through global manufacturing infra.'
        },
        delivery: {
          title: 'Delivery Agency',
          desc: 'Air, Sea, Rail. We match the most efficient logistics routes suitable for the characteristics of your cargo.'
        },
        customs: {
          title: 'Cert & Customs',
          desc: 'Experts handle complex overseas certification and customs clearance to eliminate risks.'
        }
      },
      apply_page: {
        title: 'Quote & Consultation',
        subtitle: 'We design the fastest and most accurate global business solutions for you.',
        success_title: 'Submission Complete',
        success_subtitle: 'Our manager will review and contact you shortly.',
        steps: {
          service: 'Service',
          details: 'Details',
          info: 'Info',
          success: 'Finish'
        },
        selection: {
          title: 'Please select a service',
          logistics: 'Logistics',
          buying: 'Purchase',
          kr_cert: 'Korea Cert',
          cn_cert: 'China Cert',
          mfg: 'Manufacturing'
        },
        service: {
          logistics: { desc: 'Proposing the fastest and most economical global shipping solutions.' },
          buying: { desc: 'From sourcing products to price negotiation and local inspection.' },
          kr_cert: { desc: 'Support for obtaining essential certifications in Korea.' },
          cn_cert: { desc: 'Handling major certifications like CCC needed for China export.' },
          mfg: { desc: 'Connecting from idea to prototyping and OEM production factories.' }
        },
        fields: {
          name: 'Name / Company',
          phone: 'Phone',
          email: 'Email',
          kakao: 'KakaoTalk ID (Optional)',
          method: 'Preferred Contact Method',
          privacy: 'Personal Information Collection Notice: Globridge collects name, phone, and email for smooth consultation. Collected info is used only for consultation and destroyed immediately after completion.'
        },
        btns: {
          prev: 'Previous',
          back: 'Back',
          next: 'Continue',
          almost: 'Almost there',
          submit: 'Submit Request',
          submitting: 'Submitting...',
          home: 'Go Home',
          kakao_chat: 'KakaoTalk Chat'
        },
        detailed_fields: {
          title: 'Please enter details',
          logistics: {
            route_from: 'Origin',
            route_from_placeholder: 'Country/City (e.g., China, Japan, USA)',
            route_to: 'Destination',
            route_to_placeholder: 'Country/City (e.g., Incheon, Korea)',
            method: 'Preferred Shipping',
            method_options: { air: 'Air', sea: 'Sea', rail: 'Rail', unknown: 'TBD' },
            link: 'Product Link (Optional)',
            link_placeholder: '1688, Alibaba link etc.',
            spec: 'Cargo Info (Qty/Weight)',
            spec_placeholder: 'e.g., 50 boxes / Total 200kg',
            memo: 'Additional Requests',
            memo_placeholder: 'Refrigerated, special packing etc.'
          },
          buying: {
            mall: 'Sourcing Channel',
            mall_options: { s1688: '1688', taobao: 'Taobao', tmall: 'Tmall', other: 'Other' },
            link: 'Product Link / URL',
            link_placeholder: 'Please enter link for sourcing.',
            qty: 'Est. Order Qty',
            qty_placeholder: 'e.g., 100 per SKU',
            target_price: 'Target Price',
            target_price_placeholder: 'e.g., Under 15 RMB each',
            nego: 'Price Negotiation',
            nego_options: { yes: 'Needed', already: 'Already Negotiated' }
          },
          kr_cert: {
            name: 'Product / Model Name',
            name_placeholder: 'Exact name of product for cert',
            cat: 'Product Category',
            cat_placeholder: 'e.g., Home appliances, toys etc.',
            battery: 'Contains Battery',
            wireless: 'Wireless Function',
            options: { yes: 'Yes', no: 'No' },
            memo: 'Prior Certs / Others',
            memo_placeholder: 'Mentioning overseas certs helps faster consultation.'
          },
          mfg: {
            stage: 'Current Stage',
            stage_options: { idea: 'Planning/Idea', design: 'Design Done', proto: 'Drawing/Proto' },
            cat: 'Manufacturing Category',
            cat_placeholder: 'e.g., Mold injection, sewing, circuits etc.',
            qty: 'Est. Annual Production',
            qty_placeholder: 'e.g., 5,000 per year',
            memo: 'Detailed Specs',
            memo_placeholder: 'Feel free to share materials, size, required functions etc.'
          }
        }
      },
      faq_page: {
        title: 'FAQ',
        items: [
          {
            q: 'How long does shipping take?',
            a: 'Air shipping takes 3-5 days including customs. Sea shipping takes 7-10 days. (Excluding remote areas)'
          },
          {
            q: 'What is the purchase agency fee?',
            a: 'Fees vary by product value and quantity. Usually 5-10%, with special negotiation available for bulk orders.'
          },
          {
            q: 'Do you support KC certification?',
            a: 'Yes, we collaborate with official Korean testing agencies to support the entire process from application to issuance.'
          },
          {
            q: 'Is damage compensation available?',
            a: 'If you use our insurance service, we provide 100% compensation for damages occurring during inspection or shipping.'
          }
        ]
      },
      contact_page: {
        title: 'Support',
        subtitle: 'Have questions? Contact us via the form below and our experts will get back to you.',
        fields: {
          name: 'Name',
          email: 'Email',
          message: 'Message',
          name_placeholder: 'Enter your name',
          email_placeholder: 'example@mail.com',
          message_placeholder: 'Enter your inquiry'
        },
        submit: 'Send Inquiry'
      }
    }
  },
  zh: {
    translation: {
      nav: {
        home: '首页',
        about: '关于我们',
        services: '服务',
        apply: '申请报价',
        contact: '客户支持',
        faq: '常见问题',
        track: '物流查询',
        login: '登录',
        signup: '注册',
        account: '账户',
        adminPanel: '管理后台',
        logout: '注销'
      },
      home: {
        subtitle: '// 环球桥梁 全程管控',
        titlePart1: '洞察',
        titlePart2: '超越',
        titlePart3: '全球',
        titlePart4: '领航',
        desc: '凭借敏锐的洞察力和无缝的一站式解决方案，领跑复杂的全球供应链。我们完美管控物流的每一个环节。',
        applyBtn: '免费报价咨询',
        certBtn: '验证认证可能性',
        feature1Title: '一站式认证',
        feature1Desc: '从韩国 KC 认证到中国当地许可。我们一次性为您解决业务所需的所有认证程序。',
        feature2Title: '卓越的速度',
        feature2Desc: '实时规划空运、海运、铁路等最佳路径，确保最快的物流流动。',
        feature3Title: '生产联动基础设施',
        feature3Desc: '通过当地生产线和研发网络，从采购延伸到制造阶段，为您提供全方位支持。',
        mfgInfra: '// 生产基础设施',
        ctaTitle: '全球物流新标准，立即开始。',
        ctaBtn: '获取免费咨询',
        airCargo: '航空运输',
        oceanVessel: '海洋运输',
        purchaseProxy: '海外代购',
        logisticsProxy: '物流代办',
        certification: '认证咨询',
        manufacturing: '生产与制造',
        mfgSectionTitlePart1: '让',
        mfgSectionTitlePart2: '创意',
        mfgSectionTitlePart3: '变为现实的完美流程',
        mfgSectionDesc: '除了简单的采购，您是否梦想开发独特的自有产品？Globridge 通过中国当地顶尖的精细制造网络，完美管理从原型制作到 OEM 量产的每一个阶段。',
        mfgStep1Title: '当地工厂匹配',
        mfgStep1Desc: '根据产品类别匹配最优化的制造工艺生产线',
        mfgStep2Title: '质量控制系统',
        mfgStep2Desc: '驻地人员进行严格的样品和成品检验',
        mfgCta: '开始咨询'
      },
      about: {
        subtitle: '// 连接全球业务',
        titlePart1: '连接',
        titlePart2: '愿景与',
        titlePart3: '现实的',
        titlePart4: '桥梁',
        intro1: '环球桥梁 不仅仅是简单的货运代理，它是打破全球业务边界的创新桥梁。',
        intro2: '我们以锐利的洞察力分析复杂的全球市场数据，并通过坚固的数字基础设施为客户提供不间断增长的最佳路径。',
        architectureTitle: '规模建筑',
        philTitle: '敏锐洞察与无缝管控',
        philDesc: '物流不仅仅是货物的移动。其核心是支配信息流并预先控制风险。环球桥梁 将人类智慧与数字控制系统相结合，创造前所未有的物流体验。',
        strength1Title: '超高精度管控',
        strength1Desc: '实时追踪所有货物运输，主动拦截风险。',
        strength2Title: '最佳路径设计',
        strength2Desc: '规划最短路线，大幅降低成本和时间。',
        strengthTitle: '4 大无可比拟的压倒性优势',
        strengthsLabel: '我们的优势',
        verified: '// 认证卓越.2024',
        mission: '我们梦想一个所有全球业务都能自由连接、不受国界限制的未来。',
        controlCenter: 'Globridge 全球控制中心',
        card1Title: '全球基础设施',
        card1Desc: '直营韩国总部及中国当地分公司和物流中心，拥有一条连接韩-中-全球的独特价值链。',
        card2Title: '生产/采购管理',
        card2Desc: '超越简单的配送，我们从业务开始就参与其中，包括中国当地工厂寻找、OEM 生产和样品制作。',
        card3Title: '完美一站式认证',
        card3Desc: '专业人员一次性解决 KC 认证、许可代理等复杂的进口认证程序。',
        card4Title: '基于数据的信任',
        card4Desc: '通过全阶段数字监控系统，我们在不透明的物流市场中提供最诚实、最透明的数据。'
      },
      footer: {
        links: '链接',
        contact: '联系方式',
        admin: '管理员登录',
        desc: '连接世界的全球业务桥梁。与 环球桥梁 一起体验无国界物流和采购的创新。',
        sourcing: '代购服务',
        certification: '认证代理',
        services: '服务中心',
        b2b: 'B2B 解决方案',
        privacy: '隐私政策',
        terms: '服务条款',
        inquiry: '咨询建议',
        address: '首尔特别市江南区德黑兰路'
      },
      agent: {
        dashboard: '我的推介管理',
        desc: '实时查看通过您的专属链接进入的客户咨询现状及进展状态。',
        myPromoLink: '我的推广链接',
        copy: '复制',
        copied: '已复制',
        linkDesc: '通过此链接访问并申请报价将记录为您的推介业绩。',
        referralHistory: '推介业绩明细',
        referralHistoryDesc: '最近流入的业绩列表。',
        noData: '尚无推介业绩。',
        table: {
          date: '日期',
          customer: '客户名 / 公司名',
          service: '服务',
          status: '状态'
        },
        stats: {
          total: '累计吸引',
          pending: '待处理',
          inProgress: '进行中',
          completed: '已完成',
          unit: '件'
        },
        status: {
          received: '受理完成',
          consulting: '咨询进行中',
          completed: '成功',
          cancelled: '取消'
        },
        tracking: {
          title: '物流查询',
          desc: '输入订单号或运单号，实时查看物流轨迹。',
          inputPlaceholder: '请输入订单/运单号',
          search: '查询',
          statusLabels: {
            ordered: '订单已接收',
            preparing: '商品筹备中',
            warehouse: '入库完成',
            export: '出口报关',
            shipping: '国际运输中',
            import: '进口清关',
            local: '国内派送',
            delivered: '签收完成'
          },
          currentStep: '当前状态',
          lastUpdate: '最后更新',
          location: '位置',
          details: '详细信息',
          myShipments: '我的物流',
          noShipments: '未发现物流信息',
          viewDetails: '查看详情',
          admin: {
            title: '物流供应链管理',
            shipmentList: '所有物流列表',
            updateStatus: '更新状态',
            trackingNumber: '运单号',
            customer: '客户',
            lastStep: '当前状态',
            actions: '操作',
            edit: '修改状态',
            save: '保存修改',
            cancel: '取消'
          }
        }
      },
      consult: {
        title: '咨询',
        wechat: '微信咨询',
        kakao: 'KakaoTalk 咨询',
        email: '邮件咨询',
        live: '实时聊天'
      },
      services_page: {
        title: '核心服务',
        logistics: {
          title: '物流代办',
          desc: '使用基于人工智能的系统管理从入库、存储、包装、订单管理到交付的所有环节。'
        },
        buying: {
          title: '海外代购',
          desc: '从中日欧美当地工厂直接采购并进行质量检查。我们保证提供顶级产品。'
        },
        mfg: {
          title: '生产与制造',
          desc: '将创意转化为产品。通过全球制造基础设施，提供从 OEM 生产到新产品开发的全面解决方案。'
        },
        delivery: {
          title: '货运代理',
          desc: '空运、海运、铁路。我们根据货物的特点匹配最有效的物流路线。'
        },
        customs: {
          title: '认证与清关',
          desc: '专家处理复杂的海外认证和清关业务，为您消除风险。'
        }
      },
      apply_page: {
        title: '询价与咨询',
        subtitle: '我们为您设计最快、最准确的全球业务解决方案。',
        success_title: '提交成功',
        success_subtitle: '我们的经理将尽快审核并与您联系。',
        steps: {
          service: '选择服务',
          details: '填写详情',
          info: '联系信息',
          success: '完成'
        },
        selection: {
          title: '请选择服务',
          logistics: '物流代办',
          buying: '海外代购',
          kr_cert: '韩国认证',
          cn_cert: '中国认证',
          mfg: '制造与开发'
        },
        service: {
          logistics: { desc: '提供最快、最经济的全球运输解决方案。' },
          buying: { desc: '从产品采购到价格谈判和当地检查的全流程代办。' },
          kr_cert: { desc: '支持在韩国获得必要的认证。' },
          cn_cert: { desc: '办理中国出口所需的CCC等主要认证。' },
          mfg: { desc: '连接从创意到原型制作和OEM生产工厂的所有环节。' }
        },
        fields: {
          name: '姓名 / 公司名',
          phone: '联系电话',
          email: '电子邮箱',
          kakao: 'KakaoTalk ID (选填)',
          method: '首选联络方式',
          privacy: '个人信息收集声明：环球桥梁 收集姓名、电话和邮箱以便进行咨询。收集的信息仅用于咨询，并在完成后立即销毁。'
        },
        btns: {
          prev: '上一步',
          back: '返回',
          next: '继续',
          almost: '即将完成',
          submit: '提交申请',
          submitting: '正在提交...',
          home: '返回首页',
          kakao_chat: 'KakaoTalk 实时咨询'
        }
      },
      faq_page: {
        title: '常见问题',
        items: [
          {
            q: '运输需要多长时间？',
            a: '空运通常需要 3-5 天（含清关）。海运通常需要 7-10 天。（偏远地区除外）'
          },
          {
            q: '代购手续费是多少？',
            a: '费用根据产品价值和数量而异。通常为 5-10%，大额订单可另行商议。'
          },
          {
            q: '支持韩国 KC 认证吗？',
            a: '是的，我们与韩国官方检测机构合作，支持从申请到发证的全过程。'
          },
          {
            q: '有损坏赔偿吗？',
            a: '如果您使用我们的保险服务，我们将对检查或运输过程中发生的损坏提供 100% 的赔偿。'
          }
        ]
      },
      contact_page: {
        title: '联系支持',
        subtitle: '有问题吗？通过下面的表格联系我们，我们的专家会尽快给您答复。',
        fields: {
          name: '姓名',
          email: '电子邮箱',
          message: '咨询内容',
          name_placeholder: '请输入您的姓名',
          email_placeholder: 'example@mail.com',
          message_placeholder: '请输入您的咨询内容'
        },
        submit: '发送咨询'
      }
    }
  },
  ja: {
    translation: {
      nav: {
        home: 'ホーム',
        about: '会社紹介',
        services: 'サービス',
        apply: '見積依頼',
        contact: 'サポート',
        faq: 'FAQ',
        track: '追跡',
        login: 'ログイン',
        signup: '新規登録',
        account: 'アカウント',
        adminPanel: '管理パネル',
        logout: 'ログアウト'
      },
      home: {
        subtitle: '// グローブリッジ 統合制御',
        titlePart1: '洞察で',
        titlePart2: '世界を',
        titlePart3: '超える',
        titlePart4: 'リーダー',
        desc: '複雑なグローバルサプライチェーンを鋭い洞察とシームレスなワンストップソリューションでリードします。物流の全工程を完璧に監視します。',
        applyBtn: '無料見積もり依頼',
        certBtn: '認証可能性を確認',
        feature1Title: 'ワンストップ認証代行',
        feature1Desc: '韓国のKC認証から中国現地の許可まで。ビジネスに必要なすべての認証手続きを一括で解決します。',
        feature2Title: '圧倒的なスピード',
        feature2Desc: '航空、海上、鉄道など最適なルートをリアルタイムで設計し、最速の物流フローを保証します。',
        feature3Title: '生産連携インフラ',
        feature3Desc: '中国現地の生産ラインや新製品開発ネットワークを通じて、購買を超えて製造段階までサポートします。',
        mfgInfra: '// 生産インフラ',
        ctaTitle: 'グローバル物流の新しい基準。今すぐ始めましょう。',
        ctaBtn: '無料コンサルティングを受ける',
        airCargo: '航空輸送',
        oceanVessel: '海上輸送',
        purchaseProxy: '購買代行',
        logisticsProxy: '物流代行',
        certification: '認証関連',
        manufacturing: '生産・製造',
        mfgSectionTitlePart1: 'アイデアが',
        mfgSectionTitlePart2: '製品',
        mfgSectionTitlePart3: 'になる完璧なプロセス',
        mfgSectionDesc: '単純なソーシングを超えて、独自の製品開発を夢見ていますか？グローブリッジは中国現地の最高の精密製造ネットワークを通じて、試作制作からOEM量産まで全ての段階を完璧に管理します。',
        mfgStep1Title: '現地工場マッチング',
        mfgStep1Desc: '製品カテゴリーに最適化された製造工程を持つラインを調達',
        mfgStep2Title: '品質管理システム',
        mfgStep2Desc: '現地駐在員による厳格なサンプルおよび本品の検収',
        mfgCta: '相談開始'
      },
      about: {
        subtitle: '// グローバルビジネス接続',
        titlePart1: 'ビジョンと',
        titlePart2: '現実を',
        titlePart3: '繋ぐ',
        titlePart4: '架け橋',
        intro1: 'グローブリッジは、単なる物流代行を超え、世界のビジネスの境界をなくす革新的な架け橋となります。',
        intro2: '複雑なグローバル市場のデータを鋭い洞察力で分析し、堅牢なデジタルインフラを通じてお客様のビジネスが止まることなく成長できる最適なルートを提供します。',
        architectureTitle: 'スケール建築',
        philTitle: '鋭い洞察と隙のない管理',
        philDesc: '物流は単に物を運ぶ過程ではありません。情報の流れを支配し、リスクを先制的に制御することが核心です。グローブリッジは人間の洞察力とデジタル観制システムを組み合わせ、これまでになかった物流体験を創造します。',
        strength1Title: '超精密観制',
        strength1Desc: 'すべての貨物量をリアルタイムで追跡し、リスクを遮断します。',
        strength2Title: '最適化ルート',
        strength2Desc: 'コストと時間を画期的に削減する最短ルートを設計します。',
        strengthTitle: '比較できない4つの圧倒的な強み',
        strengthsLabel: '私たちの強み',
        verified: '// 認証された卓越性.2024',
        mission: '私たちは、世界のすべてのビジネスが国境という制約なく自由に繋がる未来を夢見ています。',
        controlCenter: 'グローブリッジ・グローバル・コントロールセンター',
        card1Title: 'グローバルインフラ',
        card1Desc: '韓国本社と中国現地の支社および物流センターを直営し、韓・中・グローバルを繋ぐ独歩的なバリューチェーンを保有しています。',
        card2Title: '生産・ソーシング管理',
        card2Desc: '単純な配送を超え、中国現地の工場手配、OEM生産、サンプル制作までビジネスの起点から共に歩みます。',
        card3Title: '完璧なワンストップ認証',
        card3Desc: 'KC認証、電波認証、許可代行など複雑な輸入認証手続きを専門スタッフが一括で解決します。',
        card4Title: 'データに基づく信頼',
        card4Desc: '全過程のデジタルモニタリングシステムを通じて、不透明な物流市場において最も誠実で透明なデータを提供します。'
      },
      footer: {
        links: 'リンク',
        contact: 'お問い合わせ',
        admin: '管理者ログイン',
        desc: '世界を繋ぐグローバルビジネスの架け橋。グローブリッジと共に境界のない物流と購買の革新を体験してください。',
        sourcing: '購買代行',
        certification: '認証代行',
        services: 'サービス',
        b2b: 'B2Bソリューション',
        privacy: 'プライバシーポリシー',
        terms: '利用規約',
        inquiry: 'お問い合わせ',
        address: 'ソウル特別市江南区テヘラン路'
      },
      agent: {
        dashboard: 'マイリファラル管理',
        desc: 'エージェント様の専用リンク経由で流入した顧客の問い合わせ状況と進行状態をリアルタイムで確認できます。',
        myPromoLink: '私のプロモーションリンク',
        copy: 'コピー',
        copied: 'コピー済み',
        linkDesc: 'このリンク経由でアクセスし、見積もりを申請すると実績として記録されます。',
        referralHistory: 'リファラル実績内訳',
        referralHistoryDesc: '最近流入した実績リストです。',
        noData: 'まだ流入した実績がありません。',
        table: {
          date: '日時',
          customer: '顧客名 / 業者名',
          service: 'サービス',
          status: '状態'
        },
        stats: {
          total: '累計獲得',
          pending: '待機中',
          inProgress: '進行中',
          completed: '完了済み',
          unit: '件'
        },
        status: {
          received: '受付完了',
          consulting: '相談進行中',
          completed: '成功',
          cancelled: 'キャンセル'
        },
        tracking: {
          title: '物流配送追跡',
          desc: '注文番号または送り状番号を入力して、リアルタイムの物流経路を確認してください。',
          inputPlaceholder: '注文/送り状番号を入力',
          search: '追跡する',
          statusLabels: {
            ordered: '注文受付',
            preparing: '商品準備中',
            warehouse: '倉庫入庫',
            export: '輸出通関',
            shipping: '国際輸送中',
            import: '輸入通관',
            local: '国内配送',
            delivered: '配送完了'
          },
          currentStep: '現在の段階',
          lastUpdate: '最終更新',
          location: '位置',
          details: '詳細内容',
          myShipments: '私の配送状況',
          noShipments: '配送情報が見つかりません。',
          viewDetails: '詳細を見る',
          admin: {
            title: '物流配送チェーン管理',
            shipmentList: 'すべての配送リスト',
            updateStatus: 'ステータスの更新',
            trackingNumber: '送り状番号',
            customer: '顧客',
            lastStep: '現在の段階',
            actions: '操作',
            edit: 'ステータス編集',
            save: '変更を保存',
            cancel: 'キャンセル'
          }
        }
      },
      consult: {
        title: '相談する',
        wechat: 'WeChat相談',
        kakao: 'KakaoTalk相談',
        email: 'メール問い合わせ',
        live: 'リアルタイム相談'
      },
      services_page: {
        title: '主要サービス',
        logistics: {
          title: '物流代行',
          desc: 'AIベースのシステムを使用して、入庫、保管、包装、注文管理から配送まで管理します。'
        },
        buying: {
          title: '購買代行',
          desc: '中国、日本、米欧など現地工場のソーシングから品質検査まで。最高級の製品を保証します。'
        },
        mfg: {
          title: '生産・製造',
          desc: 'アイデアを製品に。グローバルな製造インフラを通じて、OEM生産から新製品開発までトータルソリューションを提供します。'
        },
        delivery: {
          title: '配送代行',
          desc: '航空、海上、鉄道。貨物の特性に合わせた最も効率的な物流ルートをマッチングします。'
        },
        customs: {
          title: '認証・通関',
          desc: '複雑な海外現地の認証や通関業務を専門スタッフが代行し、リスクを解消します。'
        }
      },
      apply_page: {
        title: '見積・相談申請',
        subtitle: '最も迅速で正確なグローバルビジネスソリューションを設計します。',
        success_title: '受付完了',
        success_subtitle: 'マネージャーが確認後、すぐにご連絡いたします。',
        steps: {
          service: 'サービス選択',
          details: '詳細入力',
          info: '顧客情報',
          success: '完了'
        },
        selection: {
          title: 'サービスを選択してください',
          logistics: '物流代行',
          buying: '購買代行',
          kr_cert: '韓国認証',
          cn_cert: '中国認証',
          mfg: '製造・開発'
        },
        service: {
          logistics: { desc: '最速で経済적인グローバル輸送ソリューションを提案します。' },
          buying: { desc: '製品のソーシングから価格交渉、現地検品まで代行します。' },
          kr_cert: { desc: '韓国国内での必須認証取得をサポートします。' },
          cn_cert: { desc: '中国輸出に必要なCCCなど主要認証を代行します。' },
          mfg: { desc: 'アイデアから試作、OEM生産工場までを繋ぎます。' }
        },
        fields: {
          name: '名前 / 業者名',
          phone: '連絡先',
          email: 'メールアドレス',
          kakao: 'KakaoTalk ID (任意)',
          method: '希望する相談方法',
          privacy: '個人情報収集・利用案内：グローブリッジは円滑な相談のために氏名、連絡先、メールアドレス情報を収集します。収集された情報は相談目的以外には使用されず、相談完了後直ちに破棄されます。'
        },
        btns: {
          prev: '前の段階',
          back: '戻る',
          next: '続ける',
          almost: 'あと少しです',
          submit: '申請完了',
          submitting: '申請中...',
          home: 'ホームへ移動',
          kakao_chat: 'KakaoTalk リアルタイム相談'
        }
      },
      faq_page: {
        title: 'よくある質問',
        items: [
          {
            q: '配送期間はどのくらいかかりますか？',
            a: '航空便の場合は通関を含めて3〜5日、船便の場合は7〜10日ほどかかります。（離島を除く）'
          },
          {
            q: '購買代行手数料はいくらですか？',
            a: '製品の価格や数量によって異なります。通常は5〜10%程度で、大量注文の場合は別途交渉が可能です。'
          },
          {
            q: 'KC認証の代行も可能ですか？',
            a: 'はい、韓国国内の公式認証機関と連携し、試験の申し込みから認証書の発行まで全プロセスをサポートします。'
          },
          {
            q: '破損補償はありますか？',
            a: '安心保険サービスをご利用の場合、検品段階や配送段階での破損に対して100%の補償が可能です。'
          }
        ]
      },
      contact_page: {
        title: 'サポート',
        subtitle: 'ご質問がありますか？以下のフォームからお問い合わせいただければ、専門スタッフが直接お答えします。',
        fields: {
          name: 'お名前',
          email: 'メールアドレス',
          message: 'お問い合わせ内容',
          name_placeholder: 'お名前を入力してください',
          email_placeholder: 'example@mail.com',
          message_placeholder: 'お問い合わせ内容を入力してください'
        },
        submit: '送信する'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
