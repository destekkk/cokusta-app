import { StyleSheet, Text, View, ViewStyle } from "react-native";

type Props = {
  size?: "md" | "lg";
  style?: ViewStyle;
};

/** Web sitesindeki çok|usta logo stili */
export default function BrandLogo({ size = "lg", style }: Props) {
  const scale = size === "lg" ? 1 : 0.82;
  return (
    <View style={[styles.wrap, style]} accessibilityLabel="Çokusta">
      <View style={[styles.row, { transform: [{ scale }] }]}>
        <View style={[styles.half, styles.left]}>
          <Text style={styles.text}>çok</Text>
        </View>
        <View style={[styles.half, styles.right]}>
          <Text style={styles.text}>usta</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  row: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  half: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  left: { backgroundColor: "#1d4d3c" },
  right: { backgroundColor: "#00A650" },
  text: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
