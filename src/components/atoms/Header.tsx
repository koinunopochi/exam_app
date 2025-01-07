import { Button } from 'src/components/ui/button';
import { FaHome, FaBook, FaQuestionCircle, FaEdit, FaChartLine, FaClipboardList, FaInfoCircle } from 'react-icons/fa';

const Header = () => (
  <nav className="bg-white shadow-md p-4 mb-4">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex gap-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => (window.location.href = '/')}
        >
          <FaHome className="w-5 h-5" />
          ホーム
        </Button>
      </div>
      
      <div className="flex gap-4">
        <div className="flex gap-4 border-r pr-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => (window.location.href = '/exam')}
          >
            <FaClipboardList className="w-5 h-5" />
            受験する
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => (window.location.href = '/viewer')}
          >
            <FaChartLine className="w-5 h-5" />
            結果確認
          </Button>
        </div>
        
        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => (window.location.href = '/editor')}
          >
            <FaEdit className="w-5 h-5" />
            問題作成
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => (window.location.href = '/manual')}
          >
            <FaBook className="w-5 h-5" />
            操作マニュアル
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => (window.location.href = '/help-support')}
          >
            <FaQuestionCircle className="w-5 h-5" />
            ヘルプ・サポート
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => (window.location.href = '/about')}
          >
            <FaInfoCircle className="w-5 h-5" />
            About
          </Button>
        </div>
      </div>
    </div>
  </nav>
);

export default Header;
