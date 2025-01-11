import { Card, CardHeader, CardContent, CardTitle } from 'src/components/ui/card';
import { Progress } from 'src/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type ExamResultSummaryProps = {
  examData: {
    totalScore: number;
    passingScore: number;
    totalQuestions: number;
    correctAnswers: number;
  };
  scores: number[];
};

const ExamResultSummary = ({ examData, scores }: ExamResultSummaryProps) => {
  const averageScore = scores.length > 0 
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : 0;

  const passRate = scores.length > 0
    ? ((scores.filter(score => score >= examData.passingScore).length / scores.length) * 100).toFixed(1)
    : 0;

  const scoreDistribution = Array.from({ length: 10 }, (_, i) => {
    const rangeStart = i * 10;
    const rangeEnd = rangeStart + 9;
    return {
      range: `${rangeStart}-${rangeEnd}`,
      count: scores.filter(score => score >= rangeStart && score <= rangeEnd).length
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>試験結果概要</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">平均点</p>
            <p className="text-2xl font-bold">{averageScore}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">合格率</p>
            <p className="text-2xl font-bold">{passRate}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">正答率</p>
            <p className="text-2xl font-bold">
              {((examData.correctAnswers / examData.totalQuestions) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">得点分布</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">全体進捗</p>
          <Progress 
            value={(examData.correctAnswers / examData.totalQuestions) * 100}
            className="h-3"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamResultSummary;
