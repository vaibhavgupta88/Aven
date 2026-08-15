import { cn } from "@/lib/utils";

export const Spotlight = ({
  className,
  fill = "#FF4D5E",
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute z-[1] rounded-full blur-[140px] opacity-45",
        className
      )}
      style={{
        background: `radial-gradient(circle at center, ${fill}B3 0%, ${fill}4D 35%, ${fill}1A 60%, transparent 80%)`,
      }}
    />
  );
};

export default Spotlight;
