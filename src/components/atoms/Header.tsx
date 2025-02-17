import { useState } from 'react';
import { Button } from 'src/components/ui/button';
import {
  FaHome,
  FaBook,
  FaQuestionCircle,
  FaEdit,
  FaChartLine,
  FaClipboardList,
  FaInfoCircle,
  FaBars,
} from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md p-2 mb-4 overflow-hidden z-[100]">
      <div className="container mx-auto flex justify-between items-center max-w-full px-4">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => (window.location.href = '/')}
          >
            <FaHome className="w-5 h-5" />
            ホーム
          </Button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-2">
          <div className="flex gap-2 border-r pr-2">
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

          <div className="flex gap-2">
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

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <FaBars className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-14 right-0 bg-white shadow-lg w-[95%] p-4 mx-auto">
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                window.location.href = '/';
                setIsMenuOpen(false);
              }}
            >
              <FaHome className="w-5 h-5 mr-2" />
              ホーム
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                window.location.href = '/exam';
                setIsMenuOpen(false);
              }}
            >
              <FaClipboardList className="w-5 h-5 mr-2" />
              受験する
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                window.location.href = '/viewer';
                setIsMenuOpen(false);
              }}
            >
              <FaChartLine className="w-5 h-5 mr-2" />
              結果確認
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                window.location.href = '/editor';
                setIsMenuOpen(false);
              }}
            >
              <FaEdit className="w-5 h-5 mr-2" />
              問題作成
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                window.location.href = '/manual';
                setIsMenuOpen(false);
              }}
            >
              <FaBook className="w-5 h-5 mr-2" />
              操作マニュアル
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                window.location.href = '/help-support';
                setIsMenuOpen(false);
              }}
            >
              <FaQuestionCircle className="w-5 h-5 mr-2" />
              ヘルプ・サポート
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                window.location.href = '/about';
                setIsMenuOpen(false);
              }}
            >
              <FaInfoCircle className="w-5 h-5 mr-2" />
              About
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
