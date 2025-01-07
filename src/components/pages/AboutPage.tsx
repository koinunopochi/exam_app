import { Card } from 'src/components/ui/card';
import { FaInfoCircle, FaUsers, FaChartLine, FaLock } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <FaInfoCircle className="mr-2" />
        About Exam Application
      </h1>

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
          <p className="text-muted-foreground">
            本システムは、S3を活用した軽量な試験システムです。ログイン不要で利用可能な簡易的な試験環境を提供し、試験結果の暗号化による改ざん防止機能を実装しています。リアルタイムでの試験結果分析や、ユーザーフレンドリーなインターフェースを特徴としています。
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
