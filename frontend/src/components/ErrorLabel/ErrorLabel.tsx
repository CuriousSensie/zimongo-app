import { LuInfo } from "react-icons/lu";
export const ErrorLabel = ({ error }: { error: string | undefined }) => {
  return error?.includes("required") ? (
    <p className="text-sm text-red">{error}</p>
  ) : (
    <p className="flex items-center text-sm text-red">
      invalid field
      <span className="ml-1 cursor-pointer text-red" title={error}>
        {" "}
        <LuInfo className="h-4 w-4" />
      </span>
    </p>
  );
};
