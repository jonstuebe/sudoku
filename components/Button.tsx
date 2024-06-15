import Color from "color";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { iOSColors, iOSUIKit } from "react-native-typography";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  color?: string;
  variation?: "solid" | "outline";
  children: string | JSX.Element;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  children,
  variation = "solid",
  color = iOSColors.blue,
  isLoading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor:
            variation === "outline"
              ? "transparent"
              : pressed
              ? Color(color).lighten(0.2).hex()
              : color,
          borderColor:
            variation === "outline"
              ? pressed
                ? Color(color).lighten(0.2).hex()
                : color
              : "transparent",
          borderWidth: variation === "outline" ? 2 : 0,
          borderRadius: 8,
          paddingHorizontal: 16,
          opacity: disabled || isLoading ? 0.5 : 1,
        },
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={iOSColors.white}
          style={{
            paddingVertical: 16,
          }}
        />
      ) : typeof children === "string" ? (
        <Text
          style={[
            iOSUIKit.bodyEmphasizedWhite,
            { textAlign: "center", paddingVertical: 16 },
          ]}
        >
          {children}
        </Text>
      ) : (
        <View style={{ paddingVertical: 16 }}>{children}</View>
      )}
    </Pressable>
  );
}
