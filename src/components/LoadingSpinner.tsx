import { Spinner } from "~/app/icons/spinner";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-12 w-full">
      <div className="spin h-4 w-4">
        <Spinner />
      </div>
    </div>
  );
}
