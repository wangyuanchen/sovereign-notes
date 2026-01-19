// 派生密钥的核心函数
async function deriveKey(password: string, salt: Uint8Array) {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey, { name: "AES-GCM", length: 256 }, false, ["decrypt", "encrypt"]
  );
}

// 解密函数
export async function decryptData(
  encryptedBase64: string, 
  ivBase64: string, 
  password: string,
  saltBase64: string // 每个用户或每条笔记应该有一个 salt，这里假设存了 salt
) {
  try {
    const ciphertext = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));

    const key = await deriveKey(password, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv }, key, ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    throw new Error("解密失败，密码可能错误");
  }
}