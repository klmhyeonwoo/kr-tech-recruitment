"use client";
import React, { PropsWithChildren } from "react";
import SpinnerLoading from "../loading/spinner-loading";

type ButtonProps = {
  loader?: boolean;
} & PropsWithChildren<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">
>;

function Button({ loader, children, ...props }: ButtonProps) {
  return (
    <button {...props} disabled={props.disabled || loader}>
      {loader ? <SpinnerLoading /> : null}
      {children}
    </button>
  );
}

export default Button;
