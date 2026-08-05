export function Logo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <span className="text-2xl font-black italic tracking-tighter text-f1-red">F1</span>
      {/* 红色斜杠，呼应 F1 标志的速度线 */}
      <span className="h-5 w-[3px] bg-f1-red -skew-x-[20deg] rounded-full" />
      <span className="text-xl font-black italic tracking-tighter">GUESS</span>
    </div>
  )
}
