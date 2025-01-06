import { Button } from 'src/components/ui/button';

const Header = () => (
  <nav className="bg-gray-100 p-4 mb-4">
    <div className="container mx-auto flex gap-4">
      <Button
        variant="outline"
        onClick={() => (window.location.href = '/exam')}
      >
        受験する
      </Button>
      <Button
        variant="outline"
        onClick={() => (window.location.href = '/viewer')}
      >
        結果確認
      </Button>
      <Button
        variant="outline"
        onClick={() => (window.location.href = '/editor')}
      >
        問題作成
      </Button>
      <Button
        variant="outline"
        onClick={() => (window.location.href = '/manual')}
      >
        操作マニュアル
      </Button>
      <Button
        variant="outline"
        onClick={() => (window.location.href = '/help-support')}
      >
        ヘルプ・サポート
      </Button>
    </div>
  </nav>
);

export default Header;
