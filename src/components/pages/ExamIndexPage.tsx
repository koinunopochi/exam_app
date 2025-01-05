import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExamIndexItem } from '../../types/question';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { Button } from '../ui/button';

export default function ExamIndexPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [exams, setExams] = useState<ExamIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentPage = parseInt(searchParams.get('p') || '1', 10);
  const [hasNext, setHasNext] = useState(true);
  const [hasPrev, setHasPrev] = useState(currentPage > 1);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/exams/index/${currentPage}.json`
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`ページ ${currentPage} は存在しません`);
          }
          throw new Error(`ページ ${currentPage} の取得に失敗しました`);
        }
        
        const data = await response.json();
        setExams(data.items);
        setHasPrev(currentPage > 1);
        setHasNext(!data.end);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
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

      <div className="flex justify-center gap-4 mt-8">
        {hasPrev && (
          <Button
            onClick={() => navigate(`?p=${currentPage - 1}`)}
            variant="outline"
          >
            前へ
          </Button>
        )}
        {hasNext && (
          <Button
            onClick={() => navigate(`?p=${currentPage + 1}`)}
            variant="outline"
          >
            次へ
          </Button>
        )}
      </div>
    </div>
  );
}
