import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { ShoppingBag, CheckCircle, Info } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, '성함 또는 담당자명을 입력해주세요'),
  companyName: z.string().optional(),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  phone: z.string().min(10, '연락처를 정확히 입력해주세요'),
  productInfo: z.string().min(1, '제품명 또는 구매 링크를 입력해주세요'),
  optionQuantity: z.string().min(1, '옵션 및 수량을 입력해주세요'),
  budgetRange: z.string().optional(),
  productionRequired: z.boolean(),
  certAgencyRequired: z.boolean(),
  inspectionRequired: z.boolean(),
  requests: z.string().optional(),
  privacyConsent: z.boolean().refine(v => v === true, '개인정보 처리방침에 동의하셔야 합니다'),
});

export default function PurchaseForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      productionRequired: false,
      certAgencyRequired: false,
      inspectionRequired: true,
      privacyConsent: false
    }
  });

  const onSubmit = (data: any) => {
    console.log(data);
    alert('구매대행 신청이 정상적으로 등록되었습니다. 글로벌 소싱 전문가가 검토 후 연락드리겠습니다.');
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <span className="text-blue-500 font-mono text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Global Sourcing Service</span>
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 uppercase tracking-tighter">PURCHASE <span className="text-blue-500">PROXY</span></h1>
        <p className="text-zinc-300 text-xl font-medium">중국, 일본, 미·유럽 현지 소싱부터 제품 개발, 검수까지 한 번에 연결되는 통합 서비스를 제공합니다.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Sec 1: Basic Info */}
            <section className="glass-panel p-8 rounded-3xl space-y-6">
              <h2 className="text-sm font-mono text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                01. 신청인 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="신청인 성함" error={errors.name?.message}>
                  <input {...register('name')} className="form-input text-zinc-900 dark:text-white font-medium" placeholder="이름" />
                </FormGroup>
                <FormGroup label="회사명 (선택)" error={errors.companyName?.message}>
                  <input {...register('companyName')} className="form-input text-zinc-900 dark:text-white font-medium" placeholder="업체명" />
                </FormGroup>
                <FormGroup label="연락처" error={errors.phone?.message}>
                  <input {...register('phone')} className="form-input text-zinc-900 dark:text-white font-medium" placeholder="010-0000-0000" />
                </FormGroup>
                <FormGroup label="이메일" error={errors.email?.message}>
                  <input {...register('email')} className="form-input text-zinc-900 dark:text-white font-medium" placeholder="contact@example.com" />
                </FormGroup>
              </div>
            </section>

            {/* Sec 2: Product Info */}
            <section className="glass-panel p-8 rounded-3xl space-y-6">
              <h2 className="text-sm font-mono text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                02. 제품 및 서비스 요청
              </h2>
              <FormGroup label="제품명 또는 구매 링크" error={errors.productInfo?.message}>
                <input {...register('productInfo')} className="form-input" placeholder="예: 알리바바 링크 또는 제품 모델명" />
              </FormGroup>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="옵션 및 수량" error={errors.optionQuantity?.message}>
                  <input {...register('optionQuantity')} className="form-input" placeholder="예: 블랙 XL 100개" />
                </FormGroup>
                <FormGroup label="예산 범위 (선택)" error={errors.budgetRange?.message}>
                  <input {...register('budgetRange')} className="form-input" placeholder="예: 500만원 내외" />
                </FormGroup>
              </div>

              <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">추가 서비스 선택</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SelectBox 
                    id="productionRequired" 
                    label="생산 및 샘플제작" 
                    register={register('productionRequired', { value: false })} 
                    desc="신제품 개발 지원"
                  />
                  <SelectBox 
                    id="certAgencyRequired" 
                    label="인증 대행" 
                    register={register('certAgencyRequired', { value: false })} 
                    desc="KC/글로벌 인증"
                  />
                  <SelectBox 
                    id="inspectionRequired" 
                    label="현지 정밀 검수" 
                    register={register('inspectionRequired', { value: true })} 
                    desc="불량률 최소화"
                  />
                </div>
              </div>

              <FormGroup label="기타 요청사항">
                <textarea {...register('requests')} className="form-input min-h-[120px] py-4" placeholder="상세 사양이나 요구사항이 있다면 기입해주세요."></textarea>
              </FormGroup>
            </section>

            <section className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" {...register('privacyConsent')} id="privacyConsent" className="mt-1 w-5 h-5 accent-blue-600 rounded" />
                <label htmlFor="privacyConsent" className="text-sm text-zinc-500 leading-relaxed">
                  [필수] 개인정보 수집 및 이용에 동의합니다.
                </label>
              </div>
              {errors.privacyConsent && <span className="text-red-500 text-xs mt-1 block px-8">{errors.privacyConsent.message}</span>}

              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-bold text-lg transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)]"
              >
                구매 신청 완료
              </button>
            </section>
          </form>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <ShoppingBag className="text-blue-500" />
              Sourcing Process
            </h3>
            <div className="space-y-6">
              <Step num="01" title="신청 접수" desc="전문가 배정 및 데이터 확인" />
              <Step num="02" title="현지 소싱" desc="공장 협상 및 단가 산출" />
              <Step num="03" title="샘플 및 생산" desc="QA 및 공정 관리" />
              <Step num="04" title="검수 및 배송" desc="원스톱 통관 연계" />
            </div>
          </div>
          
          <div className="bg-zinc-100 dark:bg-zinc-900 p-8 rounded-3xl border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4">
              <CheckCircle size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">GlobLogix Benefit</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed italic">
              "우리는 단순한 구매를 넘어 비즈니스의 성공을 위한 파트너가 됩니다. 중국 현지 인프라를 활용하여 최상의 품질을 보장합니다."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormGroup({ label, error, children }: { label: string, error?: string, children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">{label}</label>
        {error && <div className="group relative"><Info className="w-3 h-3 text-red-500 cursor-help" /><span className="absolute bottom-full right-0 mb-2 w-max bg-red-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{error}</span></div>}
      </div>
      {children}
    </div>
  );
}

function SelectBox({ id, label, register, desc }: { id: string, label: string, register: any, desc: string }) {
  return (
    <div className="relative group">
      <input type="checkbox" id={id} {...register} className="peer hidden" />
      <label 
        htmlFor={id} 
        className="block p-4 border border-black/5 dark:border-white/5 rounded-2xl bg-black/5 dark:bg-white/5 text-center cursor-pointer transition-all peer-checked:bg-blue-600/20 peer-checked:border-blue-500 hover:bg-black/10 dark:hover:bg-white/10"
      >
        <span className="block text-xs font-bold mb-1 text-zinc-600 dark:text-zinc-300 peer-checked:text-zinc-900 dark:peer-checked:text-white font-display uppercase tracking-tight">{label}</span>
        <span className="text-[9px] text-zinc-500 font-medium group-hover:text-zinc-600 dark:group-hover:text-zinc-400">{desc}</span>
      </label>
    </div>
  );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-blue-500 font-mono text-sm font-bold">{num}</span>
      <div>
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-200">{title}</h4>
        <p className="text-xs text-zinc-600 dark:text-zinc-500">{desc}</p>
      </div>
    </div>
  );
}
