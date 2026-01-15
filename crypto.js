// 端到端加密工具类
class CryptoUtils {
    constructor() {
        this.masterKey = null;
    }

    // 从密码派生密钥
    async deriveKey(password, salt = null) {
        const encoder = new TextEncoder();
        
        // 如果没有 salt，生成新的
        if (!salt) {
            salt = crypto.getRandomValues(new Uint8Array(16));
        }
        
        // 导入密码作为密钥材料
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        
        // 使用 PBKDF2 派生密钥
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        
        return { key, salt };
    }

    // 加密文本
    async encrypt(text, key) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        
        // 生成随机 IV
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // 加密
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );
        
        // 返回 IV + 密文（都转为 base64）
        return {
            iv: this.arrayBufferToBase64(iv),
            data: this.arrayBufferToBase64(encrypted)
        };
    }

    // 解密文本
    async decrypt(encryptedData, key) {
        try {
            const iv = this.base64ToArrayBuffer(encryptedData.iv);
            const data = this.base64ToArrayBuffer(encryptedData.data);
            
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );
            
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (e) {
            console.error('解密失败:', e);
            return null;
        }
    }

    // ArrayBuffer 转 Base64
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // Base64 转 ArrayBuffer
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // 设置主密钥
    setMasterKey(key, salt) {
        this.masterKey = key;
        // 保存 salt 到 localStorage（salt 不是秘密）
        localStorage.setItem('salt', this.arrayBufferToBase64(salt));
    }

    // 获取保存的 salt
    getSalt() {
        const saltBase64 = localStorage.getItem('salt');
        if (saltBase64) {
            return this.base64ToArrayBuffer(saltBase64);
        }
        return null;
    }
}

const cryptoUtils = new CryptoUtils();
