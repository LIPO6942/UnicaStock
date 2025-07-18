import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
