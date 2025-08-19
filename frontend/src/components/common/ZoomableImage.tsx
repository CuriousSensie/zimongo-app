import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip } from "../ui/tooltip";

export default function ZoomableImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    <Tooltip content="Click on the image to zoom.">
        <Dialog>
          <DialogTrigger asChild>
            <Image
              src={src}
              alt={alt || ""}
              sizes="100vw"
              className={`${className}`}
              style={{
                width: "100%",
                height: "100%",
              }}
              width={500}
              height={100}
            />
          </DialogTrigger>
          <DialogContent className="max-w-7xl border-0 bg-transparent p-0">
            <div className="relative h-[calc(100vh-220px)] w-full overflow-clip rounded-md bg-slate-500 bg-opacity-30 shadow-md ">
              <Image
                src={src}
                fill
                alt={alt || ""}
                className="h-full w-full object-contain"
              />
              <h2>{alt}</h2>
            </div>
          </DialogContent>
        </Dialog>
    </Tooltip>
  );
}
