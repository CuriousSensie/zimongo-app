import React, { ReactNode } from "react";

export type ICondition = {
  children: ReactNode | ReactNode[];
  condition: boolean;
};

const WithCondition = ({ children, condition }: ICondition) => {
  if (condition) {
    return children;
  }
  return <></>;
};

export default WithCondition;
