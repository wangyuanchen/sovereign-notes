export async function generateKey(password: string, salt: string) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return key;
}

export async function encryptData(text: string, password: string) {
  try {
    const salt = window.crypto.randomUUID(); // 每个笔记唯一的盐会更安全，这里简化为随机盐存在记录里
    const key = await generateKey(password, salt); // 实际生产中盐应该固定或存储
    // 为了简化 MVP，我们暂且用固定盐或者随密文存储盐。
    // 正确的做法：生成一个随机 IV 和随机 Salt，存下来。

    // 重新设计：encrypt 返回 { cipher, iv, salt }
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const finalSalt = window.crypto.getRandomValues(new Uint8Array(16));

    // Generate key from password and salt
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const cryptoKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: finalSalt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cryptoKey,
      enc.encode(text)
    );

    // Convert buffers to base64 strings for storage
    return {
      encryptedContent: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...new Uint8Array(iv))),
      salt: btoa(String.fromCharCode(...new Uint8Array(finalSalt)))
    };
  } catch (e) {
    console.error("Encryption failed:", e);
    throw e;
  }
}

export async function decryptData(encryptedContent: string, ivStr: string, saltStr: string, password: string) {
  try {
    const enc = new TextEncoder();

    // Helper to validate and decode base64
    const safeDecode = (str: string, name: string) => {
      if (!str) return '';
      try {
        // 简单的 Base64 格式检查 (可选)
        return atob(str);
      } catch (e) {
        throw new Error(`Invalid Base64 string for ${name}. Value: ${str?.substring(0, 10)}... Length: ${str?.length}`);
      }
    };

    // Decode base64 strings
    const encryptedData = new Uint8Array(safeDecode(encryptedContent, 'content').split('').map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(safeDecode(ivStr, 'IV').split('').map(c => c.charCodeAt(0)));
    const salt = new Uint8Array(safeDecode(saltStr, 'salt').split('').map(c => c.charCodeAt(0)));

    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const cryptoKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cryptoKey,
      encryptedData
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Decryption failed:", e);
    // 这里经常会因为密码错误而抛出 OperationError
    return null;
  }
}
