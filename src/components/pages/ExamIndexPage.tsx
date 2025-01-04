import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamIndexItem } from '../../types/question';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { Button } from '../ui/button';

export default function ExamIndexPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch('/exam/index/1.json');
        if (!response.ok) {
          throw new Error('Failed to fetch exams');
        }
        const data = await response.json();
        setExams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Exam List</h1>
      <div className="grid gap-4">
        {exams.map((exam) => (
          <Collapsible key={exam.exam_id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{exam.title}</h2>
                <div className="mt-2 text-sm text-gray-500">
                  <span>Author: {exam.author}</span>
                  <span className="ml-4">Created: {new Date(exam.create_date).toLocaleDateString()}</span>
                </div>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  詳細を見る
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-4">
              <p className="text-gray-600 mb-4">{exam.description}</p>
              <Button 
                onClick={() => navigate(`/exam?exam_id=${exam.exam_id}`)}
                className="w-full"
              >
                受験する
              </Button>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
