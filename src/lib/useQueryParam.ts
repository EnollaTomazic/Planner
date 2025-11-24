import { useSearchParams } from "next/navigation";

export function useQueryParam(key: string, defaultValue: string): string {
  const searchParams = useSearchParams();
  const param = searchParams?.get(key) ?? defaultValue;
  return param;
}
