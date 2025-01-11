import { useState, useCallback, type DragEvent } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import { Progress } from 'src/components/ui/progress';

type ExamResultUploaderProps = {
  onUploadComplete: (data: {
    examData: any;
    questions: any[];
    answers: Record<string, any>;
  }) => void;
  onError: (message: string) => void;
};

const ExamResultUploader = ({ onUploadComplete, onError }: ExamResultUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) {
      setError('ファイルが選択されていません');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(files[0]);
      if (!zipContent) {
        setError('ZIPファイルの読み込みに失敗しました');
        return;
      }

      const encryptedDataPromise = zipContent
        .file('encrypted_data.json')
        ?.async('text');
      const keyDataPromise = zipContent.file('key.json')?.async('text');

      if (!encryptedDataPromise || !keyDataPromise) {
        setError('ZIPファイルに必要なファイルが含まれていません');
        return;
      }

      const [encryptedDataText, keyDataText] = await Promise.all([
        encryptedDataPromise,
        keyDataPromise,
      ]);

      const { iv, data } = JSON.parse(encryptedDataText);
      const { encryptedAesKey, privateKey } = JSON.parse(keyDataText);

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

      const decryptedAesKey = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKeyObj,
        new Uint8Array(encryptedAesKey).buffer
      );

      const aesKey = await window.crypto.subtle.importKey(
        'raw',
        decryptedAesKey,
        { name: 'AES-GCM' },
        true,
        ['decrypt']
      );

      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(iv),
        },
        aesKey,
        new Uint8Array(data).buffer
      );

      const decoded = new TextDecoder().decode(decryptedData);
      const examResult = JSON.parse(decoded);

      const questionsResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/exams/${examResult.examId}/questions.json`
      );
      const answersResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/exams/${examResult.examId}/answers.json`
      );

      if (!questionsResponse.ok || !answersResponse.ok) {
        throw new Error('Failed to fetch exam data');
      }

      const questionsData = await questionsResponse.json();
      const answersData = await answersResponse.json();

      onUploadComplete({
        examData: examResult,
        questions: questionsData.questions,
        answers: answersData.answers,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError('結果ファイルの読み込みに失敗しました: ' + message);
      onError(message);
      console.error('Error processing result file:', err);
    } finally {
      setLoading(false);
    }
  }, [onUploadComplete, onError]);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>試験結果確認（管理者用）</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-secondary/20"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
              fileInput.click();
            }
          }}
        >
          <input
            type="file"
            id="fileInput"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files);
              }
            }}
            accept=".zip"
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg mb-2">
            結果ファイル（ZIP）をドロップするか、クリックして選択
          </p>
          <p className="text-sm text-muted-foreground">
            exam_result_[examId]_[username].zip
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="text-center p-4">
            <Progress value={30} className="w-full mb-2" />
            <p>結果を読み込んでいます...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamResultUploader;
