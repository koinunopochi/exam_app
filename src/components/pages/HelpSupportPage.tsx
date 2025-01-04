import { Card, CardHeader, CardContent } from '@/components/ui/card';

const HelpSupportPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">ヘルプ・サポート</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold mb-2">よくある質問</h2>
            <div className="space-y-2">
              <div>
                <h3 className="font-medium">Q: 試験中にブラウザを閉じたらどうなりますか？</h3>
                <p className="text-muted-foreground">
                  それまでの回答はすべてなかったことになりますので、試験監督などに連絡したうえで再度受験をお願いいたします。
                </p>
              </div>
              <div>
                <h3 className="font-medium">Q: 解答を修正したい場合は？</h3>
                <p className="text-muted-foreground">
                  試験終了前であれば、いつでも解答を修正できます。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">サポート</h2>
            <p className="text-muted-foreground">
              システムに関するお問い合わせは、以下の方法でご連絡ください。
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>メール: koinunopoti@gmail.com</li>
              <li>お問い合わせフォーム</li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSupportPage;
