import { createSecureZip } from '../../utils/crypto';

// ユニークなIDを生成する関数
export const generateUniqueId = (prefix: string = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}${timestamp}${random}`;
};

export const downloadZIP = async (files: Array<{name: string, data: any}>) => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  // データを暗号化してZIPを作成
  const examData = {
    files,
    metadata: {
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  const zipBlob = await createSecureZip(examData);
  
  // ZIPファイルをダウンロード
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `exam_export_${date}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
