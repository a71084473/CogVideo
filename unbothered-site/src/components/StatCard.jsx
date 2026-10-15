export default function StatCard({ value, label, className = '' }) {
  return (
    <div className={`glass px-5 py-4 lg:px-6 lg:py-5 ${className}`}>
      <div className="display text-4xl lg:text-5xl">{value}</div>
      <div className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-white/75">{label}</div>
    </div>
  )
}
