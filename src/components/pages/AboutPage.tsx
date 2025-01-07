import { Card } from 'src/components/ui/card';
import { FaInfoCircle, FaUsers, FaChartLine, FaLock } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FaInfoCircle className="mr-2" />
          About Exam Application
        </h1>
        <div className="mt-2 text-sm text-yellow-600">
          本システムは現在β版です。重要な採用などでの利用はお控えください。
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <FaUsers className="w-8 h-8 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">ユーザーフレンドリー</h2>
          </div>
          <p className="text-muted-foreground">
            ログイン不要で誰でも簡単に利用可能。直感的なインターフェースでストレスフリーな操作を実現。
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <FaChartLine className="w-8 h-8 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">リアルタイム分析</h2>
          </div>
          <p className="text-muted-foreground">
            試験結果を即時分析。詳細な統計データと可視化で、パフォーマンスを多角的に評価。
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <FaLock className="w-8 h-8 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">セキュリティ</h2>
          </div>
          <p className="text-muted-foreground">
            試験結果の暗号化により、データの改ざんを防止。安全な環境で試験を実施可能。
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">システム概要</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              本システムは、S3を活用した軽量な試験システムです。ログイン不要で利用可能な簡易的な試験環境を提供しています。試験結果は自動的にダウンロードされるため、外部ストレージに保存される心配はありません。リアルタイムでの試験結果分析や、ユーザーフレンドリーなインターフェースを特徴としています。
            </p>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">システムアーキテクチャ</h3>
              <div className="text-muted-foreground space-y-4">
                <p>
                  本システムはシングルページアプリケーション（SPA）として設計されており、すべての処理がクライアントサイドで完結します。試験結果は自動ダウンロードされるため、ユーザーのローカル環境にのみ保存されます。解析結果はリアルタイムにブラウザ上で可視化されます。
                </p>

                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm">
                    {`[GitHub Repository]
    │
    ├── GitHub Actions
    │   ├── CD Pipeline
    │   │   └── S3への自動デプロイ
    │   └── コンテンツ管理
    │       ├── コンテンツの自動反映
    │       └── 管理者用ワークフロー
    │
    └── [AWS S3]
        ├── 静的ファイル (HTML/CSS/JS)
        └── 試験データ (暗号化)`}
                  </pre>
                </div>

                <p>
                  管理者はGitHub
                  Actionsのワークフローを通じて、試験コンテンツの更新や管理を効率的に行うことができます。これにより、手動での操作を最小限に抑え、信頼性の高い運用を実現しています。
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
