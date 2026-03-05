/**
 * scripts/update-ip.js
 *
 * Tự động detect IP WiFi hiện tại của máy và cập nhật
 * API_BASE_URL_TEST trong .env.development.
 *
 * Dùng:
 *   node scripts/update-ip.js           → chỉ cập nhật IP
 *   node scripts/update-ip.js 5057      → cập nhật IP với port tuỳ chỉnh
 */

const os = require("os");
const fs = require("fs");
const path = require("path");

// ─── Config ────────────────────────────────────────────────────────────────

const ENV_FILE = path.resolve(__dirname, "../.env.development");
const DEFAULT_PORT = 5057;

// ─── Detect local WiFi/LAN IP ──────────────────────────────────────────────

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [ifaceName, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family !== "IPv4" || addr.internal) continue;

      // Ưu tiên interface có tên liên quan đến WiFi/LAN
      const isWifi =
        /wi.?fi|wlan|wireless|802\.11/i.test(ifaceName) ||
        /en\d/.test(ifaceName); // macOS style
      const isEthernet = /eth|ethernet|local area/i.test(ifaceName);
      const isVirtual =
        /vmware|virtualbox|hyper.?v|vethernet|loopback|docker|wsl/i.test(
          ifaceName,
        );

      if (isVirtual) continue;

      candidates.push({
        ip: addr.address,
        priority: isWifi ? 0 : isEthernet ? 1 : 2,
        ifaceName,
      });
    }
  }

  if (candidates.length === 0) return null;

  // Trả về IP ưu tiên nhất (WiFi > Ethernet > khác)
  candidates.sort((a, b) => a.priority - b.priority);
  return candidates[0];
}

// ─── Update .env.development ───────────────────────────────────────────────

function updateEnvFile(ip, port) {
  if (!fs.existsSync(ENV_FILE)) {
    console.error(`❌  Không tìm thấy file: ${ENV_FILE}`);
    process.exit(1);
  }

  const content = fs.readFileSync(ENV_FILE, "utf-8");
  const newUrl = `http://${ip}:${port}`;
  const regex = /^(API_BASE_URL_TEST\s*=\s*).+$/m;

  if (!regex.test(content)) {
    // Key chưa tồn tại → thêm vào đầu file
    const updated = `API_BASE_URL_TEST=${newUrl}\n` + content;
    fs.writeFileSync(ENV_FILE, updated, "utf-8");
    console.log(`✅  Đã thêm API_BASE_URL_TEST=${newUrl}`);
    return { oldUrl: null, newUrl };
  }

  // Lấy giá trị cũ để log
  const oldMatch = content.match(regex);
  const oldUrl = oldMatch ? oldMatch[0].split("=")[1].trim() : "(không rõ)";

  const updated = content.replace(regex, `$1${newUrl}`);
  fs.writeFileSync(ENV_FILE, updated, "utf-8");
  return { oldUrl, newUrl };
}

// ─── Main ──────────────────────────────────────────────────────────────────

function main() {
  const portArg = parseInt(process.argv[2], 10);
  const port = isNaN(portArg) ? DEFAULT_PORT : portArg;

  const result = getLocalIP();

  if (!result) {
    console.error(
      "❌  Không tìm thấy IP local. Kiểm tra kết nối WiFi/LAN của bạn.",
    );
    process.exit(1);
  }

  console.log(`🌐  Interface: ${result.ifaceName} → ${result.ip}`);

  const { oldUrl, newUrl } = updateEnvFile(result.ip, port);

  if (oldUrl && oldUrl === newUrl) {
    console.log(`ℹ️   IP không thay đổi: ${newUrl}`);
  } else {
    if (oldUrl) console.log(`🔄  Cũ: ${oldUrl}`);
    console.log(`✅  Mới: ${newUrl}`);
    console.log(`📄  Đã cập nhật: .env.development`);
  }
}

main();
