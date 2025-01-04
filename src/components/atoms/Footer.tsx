import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Github, Book, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = 2025;

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Links Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Button variant="link" className="justify-start p-0 h-auto" asChild>
                <Link to="/manual" className="inline-flex items-center">
                  <Book className="w-4 h-4 mr-2" />
                  操作マニュアル
                </Link>
              </Button>
              <Button
                variant="link"
                className="justify-start p-0 h-auto"
                asChild
              >
                <a
                  href="https://github.com/koinunopochi/exam_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <Github className="w-4 h-4 mr-2" />
                  プロジェクトページ
                </a>
              </Button>
              <Button variant="link" className="justify-start p-0 h-auto" asChild>
                <Link to="/help-support" className="inline-flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  ヘルプ・サポート
                </Link>
              </Button>
            </nav>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">システム概要</h3>
            <p className="text-sm text-muted-foreground">
              S3を活用した軽量な試験システムです。
              ログインなしで利用可能な簡易的な試験環境を提供し、
              試験結果の暗号化による改ざん防止機能を実装しています。
            </p>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">お問い合わせ</h3>
            <p className="text-sm text-muted-foreground">
              システムに関するお問い合わせは、 管理者までご連絡ください。
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScztUQCYEDIS0N_8lkEPgUst0cw6LOJWrS9IIVfHpcxw7rSXA/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
              >
                お問い合わせフォーム
              </a>
            </Button>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Exam Application. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
