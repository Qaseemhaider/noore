import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const defaults = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function MenuIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export function CloseIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="m5 5 14 14M19 5 5 19" /></svg>;
}

export function SearchIcon(props: IconProps) {
  return <svg {...defaults} {...props}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
}

export function AccountIcon(props: IconProps) {
  return <svg {...defaults} {...props}><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6" /></svg>;
}

export function HeartIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M20.5 9c0 5-8.5 10-8.5 10S3.5 14 3.5 9A4.5 4.5 0 0 1 12 6.8 4.5 4.5 0 0 1 20.5 9Z" /></svg>;
}

export function BagIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>;
}

export function ChevronIcon(props: IconProps) {
  return <svg {...defaults} viewBox="0 0 16 16" width="16" height="16" {...props}><path d="m6 3.5 4 4.5-4 4.5" /></svg>;
}

export function InstagramIcon(props: IconProps) {
  return <svg {...defaults} {...props}><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.5" /><circle cx="17.4" cy="6.7" r=".6" fill="currentColor" stroke="none" /></svg>;
}

export function FacebookIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M13.5 21v-8h3l.5-3h-3.5V8.2c0-.9.3-1.7 1.8-1.7H17V4.1c-.6-.1-1.4-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10H8v3h2.8v8" /></svg>;
}

export function TikTokIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M14 4v10.5a4.5 4.5 0 1 1-4-4.5" /><path d="M14 4c.5 2.5 2 4 4.5 4.5" /></svg>;
}

export function PinterestIcon(props: IconProps) {
  return <svg {...defaults} {...props}><circle cx="12" cy="12" r="8" /><path d="M10.5 17.5c1-2.5 1.5-4.7 2-7 .5-2 3.5-1.5 3 1-.4 2-1.8 3-3.4 2.5-2-.6-3-2.5-2.3-4.5.8-2.5 4.3-3.5 6.4-1.8 2.7 2.2 1.2 7.5-2.1 9" /><path d="M10.5 17.5 9.7 20" /></svg>;
}

export function PlusIcon(props: IconProps) {
  return <svg {...defaults} viewBox="0 0 16 16" width="16" height="16" {...props}><path d="M8 3v10M3 8h10" /></svg>;
}
