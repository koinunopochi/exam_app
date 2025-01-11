import JSZip from 'jszip';

// ユニークなIDを生成する関数
export const generateUniqueId = (prefix: string = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}${timestamp}${random}`;
};

export const downloadZIP = async (files: Array<{name: string, data: any}>) => {
  const zip = new JSZip();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  // 各ファイルをzipに追加
  files.forEach(file => {
    zip.file(file.name, JSON.stringify(file.data, null, 2));
  });

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
