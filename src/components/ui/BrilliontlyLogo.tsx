import Image from 'next/image';

export function BrilliontlyLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brilliontly-logo.svg"
      alt="Brilliontly - Bull, Big Bull the Gator, and Bear"
      width={size}
      height={size}
      className={`select-none ${className}`}
      draggable={false}
      priority
    />
  );
}

export function BrilliontlyWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BrilliontlyLogo size={36} />
      <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
        Brilliontly
      </span>
    </div>
  );
}
