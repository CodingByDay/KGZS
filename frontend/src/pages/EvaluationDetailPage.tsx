import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/infrastructure/api/apiClient';
import { signalRService } from '@/infrastructure/realtime/SignalRService';
import { AppShell } from '@/app/components/AppShell';

interface EvaluationEvent {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface EvaluationSession {
  id: string;
  productSampleId: string;
  commissionId: string;
  status: string;
  activatedAt: string;
}

interface Score {
  productSampleId: string;
  finalScore?: number;
  evaluationCount: number;
  calculatedAt?: string;
}

export function EvaluationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<EvaluationEvent | null>(null);
  const [sessions, setSessions] = useState<EvaluationSession[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
      connectSignalR();
    }
    return () => {
      signalRService.leaveEvaluationGroup(id!);
    };
  }, [id]);

  const connectSignalR = async () => {
    try {
      await signalRService.connect();
      if (id) {
        await signalRService.joinEvaluationGroup(id);
        
        signalRService.onStatusChanged((event) => {
          if (event.evaluationEventId === id) {
            loadData();
          }
        });

        signalRService.onSessionCreated((event) => {
          if (event.evaluationEventId === id) {
            loadSessions();
          }
        });

        signalRService.onScoreCalculated((event) => {
          if (event.evaluationEventId === id) {
            loadScores();
          }
        });
      }
    } catch (error) {
      console.error('Failed to connect SignalR:', error);
    }
  };

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [evalData, sessionsData, scoresData] = await Promise.all([
        apiClient.get<EvaluationEvent>(`/api/evaluations/${id}`),
        apiClient.get<EvaluationSession[]>(`/api/evaluations/${id}/events`),
        apiClient.get<Score[]>(`/api/evaluations/${id}/scores`),
      ]);
      setEvaluation(evalData);
      setSessions(sessionsData);
      setScores(scoresData);
    } catch (error) {
      console.error('Failed to load evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    if (!id) return;
    try {
      const data = await apiClient.get<EvaluationSession[]>(`/api/evaluations/${id}/events`);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadScores = async () => {
    if (!id) return;
    try {
      const data = await apiClient.get<Score[]>(`/api/evaluations/${id}/scores`);
      setScores(data);
    } catch (error) {
      console.error('Failed to load scores:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      await apiClient.put(`/api/evaluations/${id}/status`, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleCreateSession = async (productSampleId: string, commissionId: string) => {
    if (!id) return;
    try {
      await apiClient.post(`/api/evaluations/${id}/events`, {
        productSampleId,
        commissionId,
      });
      setShowCreateSessionModal(false);
      loadSessions();
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create evaluation session');
    }
  };

  const handleCalculateScore = async (productSampleId: string) => {
    try {
      await apiClient.post('/api/evaluations/scores/calculate', productSampleId);
      loadScores();
    } catch (error) {
      console.error('Failed to calculate score:', error);
      alert('Failed to calculate score');
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AppShell>
    );
  }

  if (!evaluation) {
    return (
      <AppShell>
        <div className="text-center">
          <p className="text-red-600">Evaluation not found</p>
          <button onClick={() => navigate('/app/evaluations')} className="mt-4 text-blue-600">
            Back to Evaluations
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{evaluation.name}</h1>
            <p className="text-gray-600 mt-1">{evaluation.description}</p>
          </div>
          <div className="flex gap-2">
            <select
              value={evaluation.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
            <button
              onClick={() => setShowCreateSessionModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Session
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Evaluation Sessions</h2>
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <p className="text-gray-500">No sessions yet</p>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Session {session.id.slice(0, 8)}</span>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        {session.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Activated: {new Date(session.activatedAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Scores</h2>
            <div className="space-y-2">
              {scores.length === 0 ? (
                <p className="text-gray-500">No scores calculated yet</p>
              ) : (
                scores.map((score) => (
                  <div key={score.productSampleId} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sample {score.productSampleId.slice(0, 8)}</span>
                      <div className="flex gap-2">
                        <span className="text-sm font-medium">
                          {score.finalScore?.toFixed(2) ?? 'N/A'}
                        </span>
                        <button
                          onClick={() => handleCalculateScore(score.productSampleId)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Recalculate
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {score.evaluationCount} evaluations
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {showCreateSessionModal && (
          <CreateSessionModal
            evaluationEventId={id!}
            onClose={() => setShowCreateSessionModal(false)}
            onSubmit={handleCreateSession}
          />
        )}
      </div>
    </AppShell>
  );
}

function CreateSessionModal({
  evaluationEventId,
  onClose,
  onSubmit,
}: {
  evaluationEventId: string;
  onClose: () => void;
  onSubmit: (productSampleId: string, commissionId: string) => void;
}) {
  const [productSampleId, setProductSampleId] = useState('');
  const [commissionId, setCommissionId] = useState('');
  const [productSamples, setProductSamples] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [samples, comms] = await Promise.all([
        apiClient.get<any[]>(`/api/productsamples?evaluationEventId=${evaluationEventId}`),
        apiClient.get<any[]>(`/api/commissions?evaluationEventId=${evaluationEventId}`),
      ]);
      setProductSamples(samples);
      setCommissions(comms);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productSampleId && commissionId) {
      onSubmit(productSampleId, commissionId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Create Evaluation Session</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Sample</label>
            <select
              value={productSampleId}
              onChange={(e) => setProductSampleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select a product sample</option>
              {productSamples.map((sample) => (
                <option key={sample.id} value={sample.id}>
                  #{sample.sequentialNumber} - {sample.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Commission</label>
            <select
              value={commissionId}
              onChange={(e) => setCommissionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select a commission</option>
              {commissions.map((comm) => (
                <option key={comm.id} value={comm.id}>
                  {comm.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
