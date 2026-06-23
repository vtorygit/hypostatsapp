import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type CardProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  variant?: "default" | "hero" | "tool" | "result";
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Card<T extends ElementType = "div">({
  as,
  children,
  className = "",
  variant = "default",
  ...props
}: CardProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={`ui-card ui-card--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
