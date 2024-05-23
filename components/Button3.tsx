import { Pressable, StyleSheet, Text, View } from "react-native";
import { forwardRef } from "react";

type ButtonProps = {
  text: string;
} & React.ComponentPropsWithoutRef<typeof Pressable>;

const Button = forwardRef<View | null, ButtonProps>(
  ({ text, ...pressableProps }, ref) => {
    return (
      <Pressable ref={ref} {...pressableProps} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.text}>{text}</Text>
        </View>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    padding: 17,
    alignItems: "center",
    borderRadius: 20,
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default Button;
