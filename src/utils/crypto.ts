/* eslint-disable @typescript-eslint/no-explicit-any */
// crypto-utils.ts
import JSZip from 'jszip';

// 鍵生成のための関数
async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  return keyPair;
}

// AES鍵の生成
async function generateAESKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// 公開鍵でAES鍵を暗号化
async function encryptAESKey(publicKey: CryptoKey, aesKey: CryptoKey) {
  const exportedAesKey = await window.crypto.subtle.exportKey('raw', aesKey);
  const encryptedKey = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    exportedAesKey
  );
  return encryptedKey;
}

// データの暗号化
async function encryptData(data: any, aesKey: CryptoKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(JSON.stringify(data));

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    aesKey,
    encodedData
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encryptedData)),
  };
}

// ZIPファイルの作成
export async function createSecureZip(examData: any) {
  const zip = new JSZip();

  // 鍵ペアの生成
  const keyPair = await generateKeyPair();
  const aesKey = await generateAESKey();

  // AES鍵を公開鍵で暗号化
  const encryptedAesKey = await encryptAESKey(keyPair.publicKey, aesKey);

  // データの暗号化
  const encryptedData = await encryptData(examData, aesKey);

  // 秘密鍵のエクスポート（PEM形式）
  const privateKeyJwk = await window.crypto.subtle.exportKey(
    'jwk',
    keyPair.privateKey
  );

  // ZIPファイルの構成
  zip.file('encrypted_data.json', JSON.stringify(encryptedData));
  zip.file(
    'key.json',
    JSON.stringify({
      encryptedAesKey: Array.from(new Uint8Array(encryptedAesKey)),
      privateKey: privateKeyJwk,
    })
  );

  // 結果確認用のHTMLファイルも含める
  // crypto-utils.ts の createSecureZip 関数内の viewer.html テンプレート部分を更新

  const viewerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>試験結果確認</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 20px;
      line-height: 1.6;
    }
    .container { 
      max-width: 800px; 
      margin: 0 auto; 
    }
    .drop-zone { 
      border: 2px dashed #ccc; 
      padding: 20px; 
      text-align: center;
      margin: 20px 0;
      cursor: pointer;
    }
    .drop-zone.drag-over { 
      background-color: #e1f5fe;
      border-color: #2196f3;
    }
    pre { 
      background: #f5f5f5; 
      padding: 15px; 
      border-radius: 4px;
      overflow-x: auto;
      margin-top: 20px;
    }
    .error { 
      color: #f44336; 
    }
    .admin-link {
      margin-top: 20px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
      text-align: center;
    }
    .admin-link a {
      color: #2196f3;
      text-decoration: none;
      font-weight: bold;
    }
    .admin-link a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>簡易試験結果確認</h1>
    
    <div class="drop-zone" id="dropZone">
      <p>encrypted_data.json と key.json をここにドラッグ＆ドロップするか、クリックして選択してください</p>
      <input type="file" id="fileInput" multiple style="display: none">
    </div>
    
    <div class="admin-link">
      <p>
        ここでは一部の情報のみ確認が可能です。<br/>
        より詳細な確認が必要な場合は、ZIPファイルのまま次の場所でアップロードしてください:
      </p>
      <p><a href="https://exams.tetex.tech/viewer" target="_blank">https://exams.tetex.tech/viewer</a></p>
    </div>

    <pre id="result"></pre>
  </div>

  <script>
    let encryptedData = null;
    let keyData = null;

    function handleFiles(files) {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const content = JSON.parse(e.target.result);
            if (file.name === 'encrypted_data.json') {
              encryptedData = content;
            } else if (file.name === 'key.json') {
              keyData = content;
            }
            
            if (encryptedData && keyData) {
              decryptData();
            }
          } catch (error) {
            console.error('File parsing error:', error);
            document.getElementById('result').innerHTML = '<span class="error">ファイルの解析に失敗しました: ' + error.message + '</span>';
          }
        };
        reader.readAsText(file);
      }
    }

    async function decryptData() {
      try {
        const { iv, data } = encryptedData;
        const { encryptedAesKey, privateKey } = keyData;
        
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
        
        // データの復号
        const decryptedData = await window.crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: new Uint8Array(iv)
          },
          aesKey,
          new Uint8Array(data).buffer
        );
        
        const decoded = new TextDecoder().decode(decryptedData);
        const result = JSON.parse(decoded);
        
        // 結果の表示を整形
        const formattedResult = {
          examId: result.examId,
          username: result.username,
          timestamp: new Date(result.timestamp).toLocaleString(),
          result: {
            earnedPoints: result.result.earnedPoints,
            totalPoints: result.result.totalPoints,
            percentage: result.result.percentage.toFixed(2) + '%'
          }
        };
        
        document.getElementById('result').innerHTML = '<h3>復号成功</h3>' + 
          JSON.stringify(formattedResult, null, 2);
      } catch (error) {
        console.error('Decryption failed:', error);
        document.getElementById('result').innerHTML = '<span class="error">復号に失敗しました: ' + error.message + '</span>';
      }
    }

    // ドラッグ&ドロップの設定
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });
  </script>
</body>
</html>
`.trim();

  zip.file('viewer.html', viewerHtml);

  // ZIPファイルの生成
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
}
