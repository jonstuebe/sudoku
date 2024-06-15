import { Children, Fragment, ReactNode, isValidElement, useMemo } from "react";
import { View, ViewProps } from "react-native";

export interface StackProps extends ViewProps {
  direction: "row" | "column";
  children: ReactNode;
  spacing?: number;
  align?: "flex-start" | "center" | "flex-end" | "stretch";
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
  wrap?: "wrap" | "nowrap";
}

export function Stack({
  children,
  direction,
  spacing,
  align,
  justify,
  style,
  ...props
}: StackProps) {
  const flattenedChildren = useMemo(() => {
    return Children.toArray(children)
      .filter(isValidElement)
      .reduce((acc: any[], child: any) => {
        if (child.type === Symbol.for("react.fragment")) {
          if (Array.isArray(child.props.children)) {
            return [...acc, ...child.props.children];
          } else {
            return [...acc, child.props.children];
          }
        }

        return [...acc, child];
      }, []);
  }, [children]);

  return (
    <View
      style={[
        {
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          gap: spacing,
        },
        style,
      ]}
      {...props}
    >
      {flattenedChildren.map((child, idx) => (
        <Fragment key={idx}>{child}</Fragment>
      ))}
    </View>
  );
}

export interface HStackProps extends Omit<StackProps, "direction"> {}

export function HStack({ children, ...props }: HStackProps) {
  return (
    <Stack direction="row" {...props}>
      {children}
    </Stack>
  );
}

export interface VStackProps extends Omit<StackProps, "direction"> {}

export function VStack({ children, ...props }: VStackProps) {
  return (
    <Stack direction="column" {...props}>
      {children}
    </Stack>
  );
}
