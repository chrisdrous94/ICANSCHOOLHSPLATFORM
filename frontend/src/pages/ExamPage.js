import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../lib/api';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, ArrowRight, RotateCcw, BookOpen } from 'lucide-react';

export default function ExamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(Array(10).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    API.get('/exams/questions')
      .then(r => { setQuestions(r.data.questions); setLoading(false); })
      .catch(() => { toast.error('Failed to load exam'); setLoading(false); });
  }, []);

  const selectAnswer = (qIdx, aIdx) => {
    if (submitted) return;
    const newAns = [...answers];
    newAns[qIdx] = aIdx;
    setAnswers(newAns);
  };

  const submitExam = async () => {
    if (answers.includes(-1)) { toast.error('Please answer all 10 questions'); return; }
    setSubmitting(true);
    try {
      const { data } = await API.post('/exams/submit', {
        path_id: user?.assigned_path_id || '',
        answers,
      });
      setResult(data);
      setSubmitted(true);
      if (data.passed) toast.success('Congratulations! You passed with 10/10!');
      else toast.error(`Score: ${data.score}/10. Review the listed modules and try again.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit');
    }
    setSubmitting(false);
  };

  const retake = () => {
    setSubmitted(false);
    setResult(null);
    setAnswers(Array(10).fill(-1));
    setCurrentQ(0);
    setLoading(true);
    API.get('/exams/questions')
      .then(r => { setQuestions(r.data.questions); setLoading(false); })
      .catch(() => setLoading(false));
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-[#707973]">Loading exam...</div>;

  // Results view
  if (submitted && result) {
    return (
      <div data-testid="exam-results" className="max-w-xl mx-auto animate-scale-in">
        <div className={`m3-card-elevated !rounded-[28px] text-center py-10 px-8 ${result.passed ? '' : ''}`}>
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${result.passed ? 'bg-[#D0E8D8]' : 'bg-[#FFDAD6]'}`}>
            {result.passed ? (
              <CheckCircle2 className="w-10 h-10 text-[#006C4C]" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-[#BA1A1A]" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-[#002114] mb-2">
            {result.passed ? 'Congratulations!' : 'Not Quite There'}
          </h2>
          <p className="text-[#707973] mb-6">
            {result.passed
              ? 'You scored a perfect 10/10 and earned your certificate!'
              : `You scored ${result.score}/10. You need 10/10 to pass.`}
          </p>
          <div className={`text-4xl font-bold mb-6 ${result.passed ? 'text-[#006C4C]' : 'text-[#BA1A1A]'}`}>
            {result.score}/10
          </div>

          {!result.passed && result.modules_to_review?.length > 0 && (
            <div className="m3-card !bg-[#FFDAD6]/30 text-left mb-6" data-testid="review-modules">
              <h4 className="text-sm font-semibold text-[#410002] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Review These Modules:
              </h4>
              <ul className="space-y-2">
                {result.modules_to_review.map((mod, i) => (
                  <li key={i} className="text-sm text-[#410002] flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 flex-shrink-0" /> {mod}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {result.passed ? (
              <button
                onClick={() => navigate('/certificates')}
                className="m3-btn-filled flex items-center justify-center gap-2"
                data-testid="view-certificate-btn"
              >
                <CheckCircle2 className="w-4 h-4" /> View Certificate
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/dashboard')} className="m3-btn-tonal flex items-center justify-center gap-2" data-testid="review-material-btn">
                  <BookOpen className="w-4 h-4" /> Review Material
                </button>
                <button onClick={retake} className="m3-btn-filled flex items-center justify-center gap-2" data-testid="retake-exam-btn">
                  <RotateCcw className="w-4 h-4" /> Retake Exam
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = answers.filter(a => a !== -1).length;

  return (
    <div data-testid="exam-page" className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#002114] tracking-tight">Final Assessment</h1>
          <p className="text-sm text-[#707973]">{user?.staff_category} &middot; 10 Questions &middot; 100% Required</p>
        </div>
        <div className="text-center bg-[#F0F5F1] rounded-[20px] px-4 py-2">
          <div className="text-lg font-bold text-[#006C4C]">{answeredCount}/10</div>
          <div className="text-[10px] text-[#707973]">Answered</div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
              i === currentQ ? 'bg-[#006C4C] text-white scale-110' :
              answers[i] !== -1 ? 'bg-[#D0E8D8] text-[#006C4C]' : 'bg-[#F0F5F1] text-[#707973]'
            }`}
            data-testid={`question-dot-${i}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      {questions[currentQ] && (
        <div className="m3-card-elevated !rounded-[28px] mb-6" data-testid={`question-${currentQ}`}>
          <div className="flex items-start gap-3 mb-5">
            <span className="w-8 h-8 rounded-full bg-[#D0E8D8] flex items-center justify-center text-[#006C4C] font-bold text-sm flex-shrink-0">
              {currentQ + 1}
            </span>
            <h3 className="text-[15px] font-semibold text-[#002114] leading-relaxed">{questions[currentQ].question}</h3>
          </div>
          <div className="space-y-3 ml-11">
            {questions[currentQ].options.map((opt, oIdx) => (
              <button
                key={oIdx}
                onClick={() => selectAnswer(currentQ, oIdx)}
                className={`w-full text-left px-4 py-3 rounded-[16px] text-sm transition-all ${
                  answers[currentQ] === oIdx
                    ? 'bg-[#006C4C] text-white font-semibold'
                    : 'bg-[#F0F5F1] text-[#404944] hover:bg-[#E8F0EB]'
                }`}
                data-testid={`option-${currentQ}-${oIdx}`}
              >
                <span className="mr-2 font-mono">{String.fromCharCode(65 + oIdx)}.</span> {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="m3-btn-tonal disabled:opacity-30"
          data-testid="prev-question-btn"
        >
          Previous
        </button>
        {currentQ < 9 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="m3-btn-filled"
            data-testid="next-question-btn"
          >
            Next
          </button>
        ) : (
          <button
            onClick={submitExam}
            disabled={submitting}
            className="m3-btn-filled disabled:opacity-50"
            data-testid="submit-exam-btn"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        )}
      </div>
    </div>
  );
}
