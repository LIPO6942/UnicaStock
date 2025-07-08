import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10.1 2.13a1 1 0 0 1 1.25.43l1.18 2.36a1 1 0 0 0 .74.53l2.61.38a1 1 0 0 1 .55 1.7l-1.89 1.84a1 1 0 0 0-.29.88l.45 2.6a1 1 0 0 1-1.45 1.05l-2.33-1.23a1 1 0 0 0-.93 0l-2.33 1.23a1 1 0 0 1-1.45-1.05l.45-2.6a1 1 0 0 0-.29-.88l-1.89-1.84a1 1 0 0 1 .55-1.7l2.61-.38a1 1 0 0 0 .74-.53l1.18-2.36a1 1 0 0 1 .43-.43z" />
      <path d="M12 22s-4-2-4-8 4-8 4-8 4 2 4 8-4 8-4 8z" />
    </svg>
  ),
};
