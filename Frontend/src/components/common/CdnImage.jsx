import { CDN_URL } from "../../utils/cdn";

export default function CdnImage({ src, alt, className }) {
  const imageUrl = src?.startsWith("http") ? src : `${CDN_URL}/${src}`;

  return (
    <img
      src={imageUrl}
      alt={alt || "Product image"}
      className={className || "w-full h-full object-cover"}
    />
  );
}