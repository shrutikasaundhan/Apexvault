import mongoose from "mongoose";
import dns from "node:dns";
import dnsPromises from "node:dns/promises";

// Resolver fallback using DNS-over-HTTPS (DoH) to prevent querySrv ETIMEOUT / ECONNREFUSED
// when local ISPs or routers block port 53 UDP for SRV / TXT records
const origResolveSrv = dnsPromises.resolveSrv;
const origResolveTxt = dnsPromises.resolveTxt;

async function fetchDns(name, type) {
  // Try Google DNS first
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`);
    const data = await res.json();
    if (data.Answer && data.Answer.length > 0) return data.Answer;
  } catch {}

  // Fallback to Cloudflare DNS
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: { accept: "application/dns-json" },
    });
    const data = await res.json();
    if (data.Answer && data.Answer.length > 0) return data.Answer;
  } catch {}

  return null;
}

dnsPromises.resolveSrv = async function (hostname) {
  const answers = await fetchDns(hostname, "SRV");
  if (answers) {
    return answers.map((ans) => {
      const parts = ans.data.trim().split(/\s+/);
      return {
        priority: parseInt(parts[0], 10),
        weight: parseInt(parts[1], 10),
        port: parseInt(parts[2], 10),
        name: parts[3].replace(/\.$/, ""),
      };
    });
  }
  return origResolveSrv.call(dnsPromises, hostname);
};

dnsPromises.resolveTxt = async function (hostname) {
  const answers = await fetchDns(hostname, "TXT");
  if (answers) {
    return answers.map((ans) => [ans.data.replace(/^"|"$/g, "")]);
  }
  return origResolveTxt.call(dnsPromises, hostname);
};

dns.resolveSrv = function (hostname, callback) {
  dnsPromises.resolveSrv(hostname)
    .then((records) => callback(null, records))
    .catch((err) => callback(err));
};

dns.resolveTxt = function (hostname, callback) {
  dnsPromises.resolveTxt(hostname)
    .then((records) => callback(null, records))
    .catch((err) => callback(err));
};

export async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Database connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
