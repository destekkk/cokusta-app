import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import BrandLogo from "../components/BrandLogo";
import {
  fetchKontorShop,
  getMobilPaymentUrl,
  startKontorCheckout,
  type KontorPackage,
} from "../api";

type Props = {
  token: string;
  onBack: () => void;
};

export default function KontorScreen({ token, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditDebt, setCreditDebt] = useState(0);
  const [debtNote, setDebtNote] = useState<string | null>(null);
  const [packages, setPackages] = useState<KontorPackage[]>([]);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [webUrl, setWebUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchKontorShop();
      setCreditBalance(data.creditBalance);
      setCreditDebt(data.creditDebt);
      setDebtNote(data.debtSettlementFormatted);
      setPackages(data.packages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openFullPayment = () => {
    setWebUrl(getMobilPaymentUrl(token));
  };

  const payPackage = async (slug: string) => {
    setCheckingOut(slug);
    setError("");
    try {
      const { paymentUrl } = await startKontorCheckout(slug);
      setWebUrl(paymentUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ödeme başlatılamadı");
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>← Talepler</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <BrandLogo size="md" style={styles.logo} />
        <Text style={styles.title}>Kontör & Ödeme</Text>
        <Text style={styles.subtitle}>Güvenli ödeme ekranı</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Bakiye</Text>
          <Text style={styles.balanceValue}>{creditBalance} kontör</Text>
          {creditDebt > 0 ? (
            <Text style={styles.debt}>
              Borç kredisi: {creditDebt} kontör
              {debtNote ? ` · Tahsil: ${debtNote}` : ""}
            </Text>
          ) : null}
        </View>

        <Pressable style={styles.fullPayBtn} onPress={openFullPayment}>
          <Text style={styles.fullPayBtnText}>Ödeme ekranını aç (web)</Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#00A650" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          packages.map((pkg) => (
            <View key={pkg.slug} style={styles.pkgCard}>
              <Text style={styles.pkgName}>{pkg.name}</Text>
              <Text style={styles.pkgDesc}>{pkg.description}</Text>
              <Text style={styles.pkgPrice}>{pkg.formattedPrice}</Text>
              {pkg.savingsPercent > 0 ? (
                <Text style={styles.pkgSave}>%{pkg.savingsPercent} tasarruf</Text>
              ) : null}
              <Pressable
                style={styles.payBtn}
                disabled={!!checkingOut}
                onPress={() => void payPackage(pkg.slug)}
              >
                <Text style={styles.payBtnText}>
                  {checkingOut === pkg.slug ? "Hazırlanıyor…" : "Ödeme Yap"}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={!!webUrl} animationType="slide" onRequestClose={() => setWebUrl(null)}>
        <View style={styles.webHeader}>
          <BrandLogo size="md" />
          <Pressable onPress={() => setWebUrl(null)} style={styles.webClose}>
            <Text style={styles.webCloseText}>Kapat</Text>
          </Pressable>
        </View>
        {webUrl ? (
          <WebView source={{ uri: webUrl }} style={{ flex: 1 }} startInLoadingState />
        ) : null}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f7f5" },
  topBar: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  back: { color: "#00A650", fontWeight: "600", fontSize: 15 },
  scroll: { padding: 16, paddingBottom: 40 },
  logo: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", color: "#1d4d3c" },
  subtitle: { textAlign: "center", color: "#666", marginTop: 4, marginBottom: 20 },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  balanceLabel: { color: "#666", fontSize: 13 },
  balanceValue: { fontSize: 28, fontWeight: "800", color: "#00A650", marginTop: 4 },
  debt: { marginTop: 8, fontSize: 13, color: "#b45309" },
  fullPayBtn: {
    borderWidth: 1,
    borderColor: "#1d4d3c",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  fullPayBtnText: { color: "#1d4d3c", fontWeight: "700" },
  pkgCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  pkgName: { fontWeight: "800", fontSize: 16 },
  pkgDesc: { color: "#666", marginTop: 6, fontSize: 13 },
  pkgPrice: { fontSize: 24, fontWeight: "800", marginTop: 10 },
  pkgSave: { color: "#00A650", fontSize: 12, marginTop: 4 },
  payBtn: {
    marginTop: 12,
    backgroundColor: "#00A650",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  payBtnText: { color: "#fff", fontWeight: "700" },
  error: { color: "#c0392b", textAlign: "center", marginTop: 16 },
  webHeader: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  webClose: { position: "absolute", right: 16, top: 52 },
  webCloseText: { color: "#00A650", fontWeight: "700" },
});
