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
      const { data } = await API.post('/exams/submit', { path_id: user?.assigned_path_id || '', answers });
      setResult(data);
      setSubmitted(true);
      if (data.passed) toast.success('Congratulations! Perfect score!');
      else toast.error(`Score: ${data.score}/10. Review modules and try again.`);
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
    API.get('/exams/questions').then(r => { setQuestions(r.data.questions); setLoading(false); }).catch(() => setLoading(false));
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-[#999]">Loading exam...</div>;

  if (submitted && result) {
    return (
      <div data-testid="exam-results" className="max-w-xl mx-auto animate-scale-in">
        <div className="bg-white rounded-2xl border border-[#E8E8E8] text-center py-10 px-8">
          <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center ${result.passed ? 'bg-[#E8F5E9]' : 'bg-[#FFEBEE]'}`}>
            {result.passed ? <CheckCircle2 className="w-10 h-10 text-[#2E7D32]" /> : <AlertTriangle className="w-10 h-10 text-[#D32F2F]" />}
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">{result.passed ? 'Congratulations!' : 'Not Quite There'}</h2>
          <p className="text-[#999] text-sm mb-5">{result.passed ? 'You scored a perfect 10/10 and earned your certificate!' : `You scored ${result.score}/10. You need 10/10 to pass.`}</p>
          <div className={`text-4xl font-bold mb-6 ${result.passed ? 'text-[#2E7D32]' : 'text-[#D32F2F]'}`}>{result.score}/10</div>

          {!result.passed && result.modules_to_review?.length > 0 && (
            <div className="rounded-xl bg-[#FFF3E0] p-4 text-left mb-6" data-testid="review-modules">
              <h4 className="text-sm font-semibold text-[#E65100] mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Review These Modules:
              </h4>
              <ul className="space-y-1.5">
                {result.modules_to_review.map((mod, i) => (
                  <li key={i} className="text-sm text-[#E65100]/80 flex items-center gap-2"><ArrowRight className="w-3 h-3 flex-shrink-0" /> {mod}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {result.passed ? (
              <button onClick={() => navigate('/certificates')} className="px-6 py-2.5 rounded-xl bg-[#FF8100] text-white font-semibold text-sm hover:bg-[#E67300] transition-all flex items-center justify-center gap-2" data-testid="view-certificate-btn">
                <CheckCircle2 className="w-4 h-4" /> View Certificate
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 rounded-xl border border-[#E8E8E8] text-[#555] font-semibold text-sm hover:bg-[#FAFAFA] transition-all flex items-center justify-center gap-2" data-testid="review-material-btn">
                  <BookOpen className="w-4 h-4" /> Review Material
                </button>
                <button onClick={retake} className="px-6 py-2.5 rounded-xl bg-[#FF8100] text-white font-semibold text-sm hover:bg-[#E67300] transition-all flex items-center justify-center gap-2" data-testid="retake-exam-btn">
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Final Assessment</h1>
          <p className="text-xs text-[#999]">{user?.staff_category} &middot; 10 Questions &middot; 100% Required</p>
        </div>
        <div className="text-center bg-white border border-[#E8E8E8] rounded-xl px-4 py-2">
          <div className="text-lg font-bold text-[#FF8100]">{answeredCount}/10</div>
          <div className="text-[10px] text-[#999]">Answered</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {questions.map((_, i) => (
          <button key={i} onClick={() => setCurrentQ(i)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
            i === currentQ ? 'bg-[#FF8100] text-white' :
            answers[i] !== -1 ? 'bg-[#FFF3E0] text-[#FF8100] border border-[#FF8100]/20' : 'bg-white border border-[#E8E8E8] text-[#BBB]'
          }`} data-testid={`question-dot-${i}`}>{i + 1}</button>
        ))}
      </div>

      {questions[currentQ] && (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 mb-5" data-testid={`question-${currentQ}`}>
          <div className="flex items-start gap-3 mb-5">
            <span className="w-8 h-8 rounded-lg bg-[#FF8100]/10 flex items-center justify-center text-[#FF8100] font-bold text-sm flex-shrink-0">{currentQ + 1}</span>
            <h3 className="text-[15px] font-semibold text-[#222] leading-relaxed">{questions[currentQ].question}</h3>
          </div>
          <div className="space-y-2 ml-11">
            {questions[currentQ].options.map((opt, oIdx) => (
              <button key={oIdx} onClick={() => selectAnswer(currentQ, oIdx)} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                answers[currentQ] === oIdx ? 'bg-[#FF8100] text-white border-[#FF8100] font-semibold' : 'bg-white border-[#E8E8E8] text-[#555] hover:border-[#FF8100]/30 hover:bg-[#FFF3E0]/30'
              }`} data-testid={`option-${currentQ}-${oIdx}`}>
                <span className="mr-2 font-mono text-xs opacity-60">{String.fromCharCode(65 + oIdx)}.</span> {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
          className="px-5 py-2.5 rounded-xl border border-[#E8E8E8] text-[#555] text-sm font-semibold hover:bg-[#FAFAFA] disabled:opacity-30 transition-all" data-testid="prev-question-btn">
          Previous
        </button>
        {currentQ < 9 ? (
          <button onClick={() => setCurrentQ(currentQ + 1)} className="px-5 py-2.5 rounded-xl bg-[#FF8100] text-white text-sm font-semibold hover:bg-[#E67300] transition-all" data-testid="next-question-btn">Next</button>
        ) : (
          <button onClick={submitExam} disabled={submitting} className="px-6 py-2.5 rounded-xl bg-[#FF8100] text-white text-sm font-semibold hover:bg-[#E67300] disabled:opacity-50 transition-all shadow-md shadow-[#FF8100]/15" data-testid="submit-exam-btn">
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        )}
      </div>
    </div>
  );
}
