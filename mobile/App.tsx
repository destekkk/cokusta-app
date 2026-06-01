import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  clearToken,
  fetchProfile,
  fetchQuotes,
  getAlertDistrict,
  getToken,
  login,
  setAlertDistrict,
  setToken,
  type ProviderProfile,
  type QuoteSummary,
} from "./src/api";
import { useQuoteAlerts } from "./src/useQuoteAlerts";

export default function App() {
  const [booting, setBooting] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [districts, setDistricts] = useState<string[]>([]);
  const [district, setDistrict] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [alertsOn, setAlertsOn] = useState(true);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  const { latestAlert, checkNow } = useQuoteAlerts(district, alertsOn && !!token);

  const loadSession = useCallback(async () => {
    const savedToken = await getToken();
    if (!savedToken) {
      setBooting(false);
      return;
    }
    setTokenState(savedToken);
    try {
      const data = await fetchProfile();
      setProfile(data.provider);
      setDistricts(data.districts);
      const savedDistrict = await getAlertDistrict();
      const pick =
        savedDistrict && data.districts.includes(savedDistrict)
          ? savedDistrict
          : data.districts[0] ?? null;
      setDistrict(pick);
    } catch {
      await clearToken();
      setTokenState(null);
    } finally {
      setBooting(false);
    }
  }, []);

  const loadQuotes = useCallback(async (d: string) => {
    setLoadingQuotes(true);
    try {
      const data = await fetchQuotes(d);
      setQuotes(data.quotes);
    } catch {
      setQuotes([]);
    } finally {
      setLoadingQuotes(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (district && token) void loadQuotes(district);
  }, [district, token, loadQuotes, latestAlert]);

  const onLogin = async () => {
    setLoggingIn(true);
    setLoginError("");
    try {
      const data = await login(phone.trim(), pin.trim());
      await setToken(data.token);
      setTokenState(data.token);
      setProfile(data.provider);
      const prof = await fetchProfile();
      setDistricts(prof.districts);
      const savedDistrict = await getAlertDistrict();
      const pick =
        savedDistrict && prof.districts.includes(savedDistrict)
          ? savedDistrict
          : prof.districts[0] ?? null;
      setDistrict(pick);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setLoggingIn(false);
    }
  };

  const onSelectDistrict = async (d: string) => {
    setDistrict(d);
    await setAlertDistrict(d);
  };

  const onLogout = async () => {
    await clearToken();
    setTokenState(null);
    setProfile(null);
    setQuotes([]);
  };

  if (booting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00A650" />
      </View>
    );
  }

  if (!token || !profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.loginBox}>
          <Text style={styles.brand}>Çok Usta</Text>
          <Text style={styles.subtitle}>Usta mobil — ilçe bazlı talep uyarısı</Text>
          <TextInput
            style={styles.input}
            placeholder="Telefon (05xx...)"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={styles.input}
            placeholder="4 haneli şifre"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            value={pin}
            onChangeText={setPin}
          />
          {loginError ? <Text style={styles.error}>{loginError}</Text> : null}
          <Pressable style={styles.primaryBtn} onPress={onLogin} disabled={loggingIn}>
            <Text style={styles.primaryBtnText}>{loggingIn ? "Giriş..." : "Giriş Yap"}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Merhaba, {profile.name}</Text>
          <Text style={styles.meta}>
            {profile.city} · {profile.creditBalance} kontör
          </Text>
        </View>
        <Pressable onPress={onLogout}>
          <Text style={styles.link}>Çıkış</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Uyarı ilçesi</Text>
        <Text style={styles.cardHint}>
          Seçtiğiniz ilçede yeni talep açılınca ses + titreşim bildirimi gelir.
        </Text>
        <View style={styles.chips}>
          {districts.map((d) => (
            <Pressable
              key={d}
              onPress={() => void onSelectDistrict(d)}
              style={[styles.chip, district === d && styles.chipActive]}
            >
              <Text style={[styles.chipText, district === d && styles.chipTextActive]}>{d}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          <Text style={styles.switchLabel}>Sesli uyarı açık</Text>
          <Switch value={alertsOn} onValueChange={setAlertsOn} trackColor={{ true: "#00A650" }} />
        </View>
      </View>

      {latestAlert ? (
        <View style={styles.alertBanner}>
          <Text style={styles.alertTitle}>Yeni talep: {latestAlert.serviceName}</Text>
          <Text style={styles.alertBody}>
            {latestAlert.district} · {latestAlert.urgent ? "Acil" : "Normal"}
          </Text>
        </View>
      ) : null}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Açık talepler ({quotes.length})</Text>
        <Pressable onPress={() => void checkNow()}>
          <Text style={styles.link}>Yenile</Text>
        </Pressable>
      </View>

      {loadingQuotes ? (
        <ActivityIndicator style={{ marginTop: 24 }} color="#00A650" />
      ) : (
        <FlatList
          data={quotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Bu ilçede şu an size uygun açık talep yok.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.quoteCard}>
              <Text style={styles.quoteTitle}>
                {item.urgent ? "🚨 " : ""}
                {item.serviceName}
              </Text>
              <Text style={styles.quoteMeta}>
                {item.district}, {item.city} · {item.offerCount ?? 0} teklif
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f7f5" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loginBox: { flex: 1, padding: 24, justifyContent: "center" },
  brand: { fontSize: 28, fontWeight: "800", color: "#00A650" },
  subtitle: { marginTop: 8, marginBottom: 24, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  error: { color: "#c0392b", marginBottom: 8 },
  primaryBtn: {
    backgroundColor: "#00A650",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  hello: { fontSize: 20, fontWeight: "700" },
  meta: { color: "#666", marginTop: 4 },
  link: { color: "#00A650", fontWeight: "600" },
  card: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: "700", fontSize: 16 },
  cardHint: { color: "#666", marginTop: 6, fontSize: 13, lineHeight: 18 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: "#00A650", borderColor: "#00A650" },
  chipText: { color: "#333", fontSize: 13 },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  switchLabel: { fontWeight: "600" },
  alertBanner: {
    marginHorizontal: 16,
    backgroundColor: "#e8f8ef",
    borderColor: "#00A650",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertTitle: { fontWeight: "700", color: "#007a3d" },
  alertBody: { color: "#333", marginTop: 4 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listTitle: { fontWeight: "700", fontSize: 16 },
  empty: { textAlign: "center", color: "#888", marginTop: 32, paddingHorizontal: 24 },
  quoteCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
  },
  quoteTitle: { fontWeight: "700", fontSize: 15 },
  quoteMeta: { color: "#666", marginTop: 4, fontSize: 13 },
});
