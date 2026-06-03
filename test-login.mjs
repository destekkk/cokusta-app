const res = await fetch("http://127.0.0.1:3000/api/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: "Btl.2012" }),
});

console.log("login status:", res.status);
const cookie = res.headers.get("set-cookie");
console.log("cookie:", cookie?.slice(0, 80) + "...");

if (res.status === 200 && cookie) {
  const adminRes = await fetch("http://127.0.0.1:3000/admin", {
    headers: { cookie: cookie.split(";")[0] },
    redirect: "manual",
  });
  console.log("/admin status (expect 404):", adminRes.status);
}
