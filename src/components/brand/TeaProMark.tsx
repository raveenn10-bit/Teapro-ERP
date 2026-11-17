export function TeaProMark({ size = 38, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" role="img" aria-label="TeaPro ERP">
      <rect width="48" height="48" rx="14" fill="#14532D" />
      <path d="M12.5 28.8c8.6.2 15-3.3 19.6-10.7 1.5 7.8-1.1 14.2-7.4 17.5-4.8 2.5-9.9.5-12.2-6.8Z" fill="#9CCC65" />
      <path d="M15.2 33.2c4.8-5.8 10-9.6 17.4-12.4" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M31.8 12.5v7.1M35.4 14v4.8M28.2 14.8v6.7" stroke="#DFF2CB" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
