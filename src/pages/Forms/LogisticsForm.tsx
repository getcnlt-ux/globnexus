import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Shield, Info } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, '성함 또는 담당자명을 입력해주세요'),
  companyName: z.string().optional(),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  phone: z.string().min(10, '연락처를 정확히 입력해주세요'),
  origin: z.string().min(1, '출발지를 입력해주세요'),
  destination: z.string().min(1, '도착지를 입력해주세요'),
  itemName: z.string().min(1, '품목명을 입력해주세요'),
  quantity: z.string().min(1, '수량을 입력해주세요'),
  weight: z.string().min(1, '예상 중량을 입력해주세요'),
  transportMode: z.enum(['air', 'sea', 'rail', 'truck']),
  certRequired: z.boolean(),
  requests: z.string().optional(),
  privacyConsent: z.boolean().refine(v => v === true, '개인정보 처리방침에 동의하셔야 합니다'),
});

export default function LogisticsForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      transportMode: 'air',
      certRequired: false,
      privacyConsent: false
    }
  });

  const onSubmit = (data: any) => {
    console.log(data);
    alert('물류 신청이 정상적으로 접수되었습니다. 담당자가 신속히 연락드리겠습니다.');
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 uppercase tracking-tighter">LOGISTICS <span className="text-blue-500 underline decoration-blue-500/20 underline-offset-8">REQUEST</span></h1>
        <p className="text-zinc-300 text-xl font-medium">최첨단 물류 인프라를 통한 최적의 경로 제안. 지금 바로 신청하세요.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Sec 1: Basic Info */}
            <section className="glass-panel p-8 rounded-3xl space-y-6">
              <h2 className="text-sm font-mono text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                01. 고객 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="피신청인 / 담당자" error={errors.name?.message}>
                  <input {...register('name')} className="form-input border-white/20 text-white font-medium" placeholder="성함" />
                </FormGroup>
                <FormGroup label="회사명 (선택)" error={errors.companyName?.message}>
                  <input {...register('companyName')} className="form-input border-white/20 text-white font-medium" placeholder="기구명 / 업체명" />
                </FormGroup>
                <FormGroup label="연락처" error={errors.phone?.message}>
                  <input {...register('phone')} className="form-input border-white/20 text-white font-medium" placeholder="010-0000-0000" />
                </FormGroup>
                <FormGroup label="이메일" error={errors.email?.message}>
                  <input {...register('email')} className="form-input border-white/20 text-white font-medium" placeholder="contact@example.com" />
                </FormGroup>
              </div>
            </section>

            {/* Sec 2: Cargo Info */}
            <section className="glass-panel p-8 rounded-3xl space-y-6">
              <h2 className="text-sm font-mono text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                02. 화물 및 운송 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="출발지" error={errors.origin?.message}>
                  <input {...register('origin')} className="form-input" placeholder="국가, 도시명" />
                </FormGroup>
                <FormGroup label="도착지" error={errors.destination?.message}>
                  <input {...register('destination')} className="form-input" placeholder="국가, 도시명" />
                </FormGroup>
                <FormGroup label="품목명" error={errors.itemName?.message}>
                  <input {...register('itemName')} className="form-input" placeholder="예: 전자부품, 의류" />
                </FormGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="수량" error={errors.quantity?.message}>
                    <input {...register('quantity')} className="form-input" placeholder="예: 100pcs" />
                  </FormGroup>
                  <FormGroup label="예상 중량" error={errors.weight?.message}>
                    <input {...register('weight')} className="form-input" placeholder="예: 50kg" />
                  </FormGroup>
                </div>
                <FormGroup label="운송 방식" error={errors.transportMode?.message}>
                  <select {...register('transportMode')} className="form-input appearance-none">
                    <option value="air">항공 운송</option>
                    <option value="sea">해상 운송</option>
                    <option value="rail">철도 운송</option>
                    <option value="truck">트럭 운송</option>
                  </select>
                </FormGroup>
                <div className="flex items-center gap-3 pt-6 px-1">
                  <input type="checkbox" {...register('certRequired')} id="certRequired" className="w-5 h-5 accent-blue-600 rounded" />
                  <label htmlFor="certRequired" className="text-sm text-zinc-300 font-medium">인증/통관 대행 필요</label>
                </div>
              </div>
              <FormGroup label="추가 요청사항">
                <textarea {...register('requests')} className="form-input min-h-[120px] py-4" placeholder="특이사항이나 특별한 요청이 있다면 기입해주세요."></textarea>
              </FormGroup>
            </section>

            {/* Sec 3: Consent */}
            <section className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" {...register('privacyConsent')} id="privacyConsent" className="mt-1 w-5 h-5 accent-blue-600 rounded" />
                <label htmlFor="privacyConsent" className="text-sm text-zinc-500 leading-relaxed">
                  [필수] 개인정보 수집 및 이용에 동의합니다. <br />
                  수집된 정보는 물류 신청 및 상담을 위한 목적으로만 사용되며, 관련 법령에 따라 안전하게 보호됩니다.
                </label>
              </div>
              {errors.privacyConsent && <span className="text-red-500 text-xs mt-1 block px-8">{errors.privacyConsent.message}</span>}

              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-bold text-lg transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)]"
              >
                신청 완료하기
              </button>
            </section>
          </form>
        </div>

        {/* Info Column */}
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-3xl border-blue-500/20 bg-blue-500/5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
              <Shield className="w-5 h-5" /> 
              안전한 신청
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              GlobLogix Robotics는 고도의 보안 시스템을 통해 고객님의 화물 정보를 관리합니다. 모든 정보는 암호화되어 전송됩니다.
            </p>
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                <span>24/7 실시간 관제</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                <span>글로벌 네트워크 보안</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">?</div>
                <div>
                   <h4 className="font-bold">도움이 필요하신가요?</h4>
                   <p className="text-xs text-zinc-500">전문 상담원이 대기 중입니다.</p>
                </div>
             </div>
             <a href="tel:0212345678" className="block text-center py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all font-mono font-bold text-blue-400">
                TEL. 02-1234-5678
             </a>
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
