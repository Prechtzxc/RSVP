type BrandLockupProps = {
  className?: string;
  decorative?: boolean;
};

export function BrandLockup({ className = "", decorative = false }: BrandLockupProps) {
  return (
    <div className={`brand-lockup ${className}`}>
      <div className="brand-crop">
        <img
          src="/invitation-artwork.jpg"
          alt={decorative ? "" : "Eyelectric Incorporated and Eyelectrix Construction Corporation"}
          aria-hidden={decorative ? true : undefined}
          width={1536}
          height={1024}
          draggable={false}
        />
      </div>
    </div>
  );
}
