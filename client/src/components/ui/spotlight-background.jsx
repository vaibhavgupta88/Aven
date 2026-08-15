import { cn } from "@/lib/utils";
import { Spotlight } from "./spotlight";

export const SpotlightBackground = ({
  children,
  className,
  spotlightColor = "#FF4D5E",
}) => {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-[#09090B] antialiased flex flex-col items-center justify-center",
        className
      )}
    >
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill={spotlightColor}
      />
      <Spotlight
        className="-top-40 right-0 md:right-60 md:-top-20"
        fill={spotlightColor}
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

export default SpotlightBackground;
