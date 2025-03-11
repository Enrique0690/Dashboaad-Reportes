import { Spinner } from "@/components/ui/Spinner";

interface DataStatusHandlerProps {
  isLoading: boolean;
  error: any;
  children: React.ReactNode;
}

export function DataStatusHandler({ isLoading, error, children }: DataStatusHandlerProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return <>{children}</>;
}