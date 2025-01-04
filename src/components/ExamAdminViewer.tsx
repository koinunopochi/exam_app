import { useState, useCallback } from 'react';
import type { Question, QuestionAnswer } from '../types/question';
import type { DragEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import { ScrollArea } from 'src/components/ui/scroll-area';
import { Progress } from 'src/components/ui/progress';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';

const ExamAdminViewer = () => {
  const [examData, setExamData] = useState<{
    examId: string;
    username: string;
    timestamp: number;
    result: {
      earnedPoints: number;
      totalPoints: number;
      percentage: number;
      questionResults: Record<string, {
        isCorrect: boolean;
        earnedPoints: number;
        possiblePoints: number;
      }>;
    };
    answers: Record<string, QuestionAnswer>;
    metadata: {
      userAgent: string;
      platform: string;
      language: string;
    };
  } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 暗号化された結果ファイルを読み込む
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

      // encrypted_data.jsonとkey.jsonを読み込む
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
          iv: new Uint8Array(iv),
        },
        aesKey,
        new Uint8Array(data).buffer
      );

      const decoded = new TextDecoder().decode(decryptedData);
      const examResult = JSON.parse(decoded);

      // 問題と正解データを取得
      const questionsResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/exams/${
          examResult.examId
        }/questions.json`
      );
      const answersResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/exams/${
          examResult.examId
        }/answers.json`
      );

      if (!questionsResponse.ok || !answersResponse.ok) {
        throw new Error('Failed to fetch exam data');
      }

      const questionsData = await questionsResponse.json();
      const answersData = await answersResponse.json();

      setQuestions(questionsData.questions);
      setAnswers(answersData.answers);
      setExamData(examResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError('結果ファイルの読み込みに失敗しました: ' + message);
      console.error('Error processing result file:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ドラッグ&ドロップの処理
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

  // 回答の表示をフォーマット
  const formatChoiceAnswer = (
    answer: Extract<QuestionAnswer, { type: 'single-choice' | 'multiple-choice' }>,
    question: Extract<Question, { type: 'single-choice' | 'multiple-choice' }>
  ): string => {
    return answer.selectedOptions
      .map((optId: string) => {
        const option = question.options.find((opt) => opt.id === optId);
        return option ? option.text : `不明な選択肢 (ID: ${optId})`;
      })
      .join(', ');
  };

  const formatTextAnswer = (
    answer: Extract<QuestionAnswer, { type: 'text' }>
  ): string => {
    return answer.text || '回答なし';
  };

  const formatFillInAnswer = (
    answer: Extract<QuestionAnswer, { type: 'fill-in' }>
  ): string => {
    return Object.entries(answer.answers)
      .map(([key, value]) => `空欄${key}: ${value || '未入力'}`)
      .join(', ');
  };

  const formatSortAnswer = (
    answer: Extract<QuestionAnswer, { type: 'sort' }>,
    question: Extract<Question, { type: 'sort' }>
  ): string => {
    return answer.order
      .map((itemId: string) => {
        const item = question.items[parseInt(itemId)];
        return item || `不明な項目 (ID: ${itemId})`;
      })
      .join(' → ');
  };

  const formatAnswer = (answer: QuestionAnswer, question: Question): string => {
    if (question.type !== answer.type) {
      return '回答形式が一致しません';
    }

    try {
      switch (question.type) {
        case 'single-choice':
        case 'multiple-choice':
          return formatChoiceAnswer(
            answer as Extract<QuestionAnswer, { type: 'single-choice' | 'multiple-choice' }>,
            question as Extract<Question, { type: 'single-choice' | 'multiple-choice' }>
          );
        case 'text':
          return formatTextAnswer(
            answer as Extract<QuestionAnswer, { type: 'text' }>
          );
        case 'fill-in':
          return formatFillInAnswer(
            answer as Extract<QuestionAnswer, { type: 'fill-in' }>
          );
        case 'sort':
          return formatSortAnswer(
            answer as Extract<QuestionAnswer, { type: 'sort' }>,
            question as Extract<Question, { type: 'sort' }>
          );
        default:
          return '不明な回答形式';
      }
    } catch (error) {
      console.error('回答のフォーマット中にエラーが発生しました:', error);
      return '回答の表示に失敗しました';
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>試験結果確認（管理者用）</CardTitle>
        </CardHeader>
        <CardContent>
          {!examData && (
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
          )}

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

          {examData && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <Card>
                <CardHeader>
                  <CardTitle>受験情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">試験ID</dt>
                      <dd>{examData.examId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        受験者名
                      </dt>
                      <dd>{examData.username}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        受験日時
                      </dt>
                      <dd>{new Date(examData.timestamp).toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">得点</dt>
                      <dd>
                        {examData.result.earnedPoints} /{' '}
                        {examData.result.totalPoints}点 （
                        {examData.result.percentage.toFixed(1)}%）
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* 詳細な回答 */}
              <Card>
                <CardHeader>
                  <CardTitle>回答詳細</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>問題</TableHead>
                          <TableHead>回答</TableHead>
                          <TableHead>正誤</TableHead>
                          <TableHead>得点</TableHead>
                          <TableHead>採点方式</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {questions.map((question, index) => {
                          const answer = examData.answers[question.id];
                          const result =
                            examData.result.questionResults[question.id];
                          if (!answer || !result) return null;

                          return (
                            <TableRow key={question.id}>
                              <TableCell>
                                <div className="font-medium">
                                  問題 {index + 1}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {question.text}
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatAnswer(answer, question)}
                              </TableCell>
                              <TableCell>
                                {result.isCorrect ? (
                                  <span className="text-green-600">○</span>
                                ) : (
                                  <span className="text-red-600">×</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {result.earnedPoints} / {result.possiblePoints}
                              </TableCell>
                              <TableCell>
                                {question.gradingType === 'auto'
                                  ? '自動'
                                  : '手動'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* メタデータ */}
              <Card>
                <CardHeader>
                  <CardTitle>環境情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        ブラウザ
                      </dt>
                      <dd className="break-all">
                        {examData.metadata.userAgent}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        プラットフォーム
                      </dt>
                      <dd>{examData.metadata.platform}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        言語設定
                      </dt>
                      <dd>{examData.metadata.language}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* アクション */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setExamData(null);
                    setQuestions([]);
                    setAnswers({});
                  }}
                >
                  別の結果を確認
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob(
                      [
                        JSON.stringify(
                          { examData, questions, answers },
                          null,
                          2
                        ),
                      ],
                      { type: 'application/json' }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `exam_result_details_${examData.examId}_${examData.username}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  詳細をダウンロード
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamAdminViewer;
