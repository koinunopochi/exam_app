import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DownloadCloud, AlertTriangle } from 'lucide-react';

interface ExamCompletionDialogsProps {
  onClose?: () => void;
}

export const ExamCompletionDialogs: React.FC<ExamCompletionDialogsProps> = ({
  onClose,
}) => {
  const [showDownloadDialog, setShowDownloadDialog] = useState(true);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  const handleDownloadDialogClose = () => {
    setShowDownloadDialog(false);
    setShowWarningDialog(true);
  };

  const handleWarningDialogClose = () => {
    setShowWarningDialog(false);
    onClose?.(); // onClose が undefined の可能性があるため、オプションチェーンを使用
  };

  return (
    <>
      <Dialog
        open={showDownloadDialog}
        onOpenChange={handleDownloadDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DownloadCloud className="h-5 w-5" />
              ダウンロード完了
            </DialogTitle>
            <DialogDescription className="pt-2">
              試験結果が暗号化されてダウンロードされました。
              このファイルを試験監督者に提出してください。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleDownloadDialogClose}>確認</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWarningDialog} onOpenChange={handleWarningDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              重要な注意事項
            </DialogTitle>
            <DialogDescription className="pt-2">
              これは暫定的な採点結果です。最終的な得点は、手動採点の結果や採点基準の調整により変更される可能性があります。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleWarningDialogClose}>理解しました</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
