import JSZip from 'jszip';
import { generateKeyPair, generateAESKey, encryptAESKey, encryptData } from '../../utils/crypto';

// ユニークなIDを生成する関数
export const generateUniqueId = (prefix: string = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}${timestamp}${random}`;
};

export const downloadZIP = async (files: Array<{name: string, data: any}>) => {
  const zip = new JSZip();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  // 鍵ペアの生成
  const keyPair = await generateKeyPair();
  const aesKey = await generateAESKey();

  // AES鍵を公開鍵で暗号化
  const encryptedAesKey = await encryptAESKey(keyPair.publicKey, aesKey);

  // 各ファイルを暗号化してzipに追加
  const encryptedFiles = await Promise.all(files.map(async file => {
    const encrypted = await encryptData(file.data, aesKey);
    return {
      name: file.name,
      data: encrypted
    };
  }));

  // 暗号化されたファイルをzipに追加
  encryptedFiles.forEach(file => {
    zip.file(`encrypted_${file.name}`, JSON.stringify(file.data, null, 2));
  });

  // 鍵情報をzipに追加
  const privateKeyJwk = await window.crypto.subtle.exportKey(
    'jwk',
    keyPair.privateKey
  );

  zip.file('key_info.json', JSON.stringify({
    encryptedAesKey: Array.from(new Uint8Array(encryptedAesKey)),
    privateKey: privateKeyJwk
  }, null, 2));

  // zipファイルを生成してダウンロード
  const content = await zip.generateAsync({type: 'blob'});
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `exam_export_${date}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importZIP = async (file: File) => {
  try {
    const zip = new JSZip();
    const content = await zip.loadAsync(file);
    
    // 暗号化されたZIPかどうかを判定
    const isEncrypted = Object.keys(content.files).some(name => 
      name.startsWith('encrypted_') || name === 'key_info.json'
    );

    if (isEncrypted) {
      // 暗号化されたZIPの処理
      const keyInfoFile = content.file('key_info.json');
      if (!keyInfoFile) {
        throw new Error('key_info.jsonが見つかりません');
      }

      const keyInfo = JSON.parse(await keyInfoFile.async('text'));
      const { encryptedAesKey, privateKey } = keyInfo;

      // 秘密鍵の復元
      const privateKeyObj = await window.crypto.subtle.importKey(
        'jwk',
        privateKey,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['decrypt']
      );

      // AES鍵の復号
      const decryptedAesKey = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKeyObj,
        new Uint8Array(encryptedAesKey).buffer
      );

      // AES鍵の復元
      const aesKey = await window.crypto.subtle.importKey(
        'raw',
        decryptedAesKey,
        { name: 'AES-GCM' },
        true,
        ['decrypt']
      );

      // 暗号化されたファイルを復号
      const decryptedFiles = await Promise.all(
        Object.entries(content.files)
          .filter(([name]) => name.startsWith('encrypted_'))
          .map(async ([name, file]) => {
            const encryptedData = JSON.parse(await file.async('text'));
            const { iv, data } = encryptedData;

            const decryptedData = await window.crypto.subtle.decrypt(
              {
                name: 'AES-GCM',
                iv: new Uint8Array(iv)
              },
              aesKey,
              new Uint8Array(data).buffer
            );

            const originalName = name.replace('encrypted_', '');
            return {
              name: originalName,
              data: JSON.parse(new TextDecoder().decode(decryptedData))
            };
          })
      );

      return decryptedFiles;
    } else {
      // 暗号化されていないZIPの処理
      const files = await Promise.all(
        Object.entries(content.files).map(async ([name, file]) => {
          const data = JSON.parse(await file.async('text'));
          return { name, data };
        })
      );
      return files;
    }
  } catch (error) {
    console.error('ZIPインポートエラー:', error);
    throw new Error('ZIPファイルのインポートに失敗しました');
  }
};
