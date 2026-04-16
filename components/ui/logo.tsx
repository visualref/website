export function Logo({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{ fontFamily: "var(--font-groote)" }}
    >
      VisualRef
    </span>
  );
}
