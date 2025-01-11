import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

const ManualPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">操作マニュアル</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 受験者向けセクション */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <h2 className="text-xl font-semibold">受験者向けガイド</h2>
              <ChevronDown className="h-5 w-5 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pt-2 space-y-4">
              <section>
                <h3 className="text-lg font-medium mb-2">1. 試験の開始</h3>
                <p className="text-muted-foreground">
                  試験を開始するには、受験IDとユーザー名を入力し「開始」ボタンをクリックしてください。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-medium mb-2">2. 試験の確認</h3>
                <p className="text-muted-foreground">
                  試験開始前に、入力内容と問題数を確認できます。問題に進むか、情報を修正できます。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-medium mb-2">3. 問題の解答</h3>
                <p className="text-muted-foreground">
                  各問題に対して選択肢を選ぶか、テキストを入力してください。画面のリロード等の操作を行うと試験開始前の画面まで戻り回答が消えてしまうためご注意ください。
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>「前の問題」{" "}「次の問題」ボタンで問題間を移動できます</li>
                  <li>画面上部に現在の問題番号と制限時間が表示されます</li>
                  <li>制限時間が終了すると自動的に試験が終了します</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-medium mb-2">4. 試験の終了</h3>
                <p className="text-muted-foreground">
                  すべての問題に解答したら、「試験を終了する」ボタンをクリックしてください。
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>未回答の問題がある場合は確認ダイアログが表示されます</li>
                  <li>終了すると結果が表示され、ZIPファイルとしてダウンロードされます</li>
                  <li>結果にはスコアと各問題の正誤が含まれます</li>
                </ul>
              </section>
            </CollapsibleContent>
          </Collapsible>

          {/* 管理者向けセクション */}
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <h2 className="text-xl font-semibold">管理者向けガイド</h2>
              <ChevronDown className="h-5 w-5 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pt-2 space-y-4">
              <section>
                <h3 className="text-lg font-medium mb-2">1. 試験結果の確認</h3>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>指定の形式のzipファイルより試験者情報を取得する</li>
                  <li>表形式で結果を一覧表示</li>
                  <li>各受験者の詳細情報を表示：
                    <ul className="list-[circle] pl-6">
                      <li>受験者名</li>
                      <li>受験日時</li>
                      <li>総合スコア</li>
                      <li>各問題の正誤</li>
                      <li>解答内容</li>
                    </ul>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-medium mb-2">2. 結果の分析</h3>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>問題ごとの正答率を表示</li>
                  <li>受験者全体のスコア分布をグラフ表示</li>
                  <li>各問題の解答傾向を分析</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-medium mb-2">3. 結果のエクスポート</h3>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>CSV形式で結果をエクスポート</li>
                  <li>エクスポート項目を選択可能：
                    <ul className="list-[circle] pl-6">
                      <li>受験者情報</li>
                      <li>解答内容</li>
                      <li>採点結果</li>
                      <li>統計データ</li>
                    </ul>
                  </li>
                </ul>
              </section>
            </CollapsibleContent>
          </Collapsible>

          {/* 問題作成セクション */}
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <h2 className="text-xl font-semibold">問題作成ガイド</h2>
              <ChevronDown className="h-5 w-5 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pt-2 space-y-4">
              <section>
                <h3 className="text-lg font-medium mb-2">1. 試験の基本設定</h3>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>試験IDを入力または自動生成</li>
                  <li>制限時間を分単位で設定</li>
                  <li>JSON形式で問題をインポート/エクスポート可能</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-medium mb-2">2. 問題の作成</h3>
                <p className="text-muted-foreground">
                  以下の形式の問題を作成できます：
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>単一選択問題</li>
                  <li>複数選択問題</li>
                  <li>テキスト入力問題（短文/長文）</li>
                  <li>並び替え問題</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-medium mb-2">3. 問題の詳細設定</h3>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>各問題に配点を設定</li>
                  <li>自動採点または手動採点を選択</li>
                  <li>選択問題では選択肢の追加/削除と正解設定</li>
                  <li>テキスト問題では大文字小文字の区別設定</li>
                  <li>並び替え問題では項目の順序設定</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-medium mb-2">4. 問題の管理</h3>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>問題の追加/削除</li>
                  <li>問題文と設定の編集</li>
                  <li>JSON形式での保存と読み込み</li>
                  <li>問題IDによる個別管理</li>
                </ul>
              </section>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualPage;
