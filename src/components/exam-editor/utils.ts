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
