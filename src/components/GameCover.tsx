import Image from "next/image";
import { coverUrl } from "@/lib/igdb";

export default function GameCover({
  imageId,
  name,
  sizes = "200px",
  priority = false,
}: {
  imageId: string | null;
  name: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!imageId) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-hover p-2 text-center font-mono text-xs text-muted">
        {name}
      </div>
    );
  }
  return (
    <Image
      src={coverUrl(imageId)}
      alt={`${name} cover art`}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
    />
  );
}
