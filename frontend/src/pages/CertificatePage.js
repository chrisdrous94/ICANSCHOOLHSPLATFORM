import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../lib/api';
import { toast } from 'sonner';
import { Award, Download, Trash2, Calendar, User, Clock, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

export default function CertificatePage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    API.get('/certificates')
      .then(r => { setCertificates(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const downloadCert = (certId) => {
    window.open(`${process.env.REACT_APP_BACKEND_URL}/api/certificates/${certId}/download`, '_blank');
  };

  const confirmRevoke = (cert) => {
    setSelectedCert(cert);
    setShowDelete(true);
  };

  const revokeCert = async () => {
    try {
      await API.delete(`/certificates/${selectedCert.id}`);
      setCertificates(certificates.filter(c => c.id !== selectedCert.id));
      setShowDelete(false);
      toast.success('Certificate permanently deleted');
    } catch { toast.error('Failed to delete certificate'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-[#999]">Loading certificates...</div>;

  const isAdmin = user?.role === 'admin';

  return (
    <div data-testid="certificates-page" className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
          {isAdmin ? 'All Certificates' : 'My Certificates'}
        </h1>
        <p className="text-[#999] text-sm mt-0.5">
          {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} issued
        </p>
      </div>

      {certificates.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] text-center py-16 px-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FAFAFA] mx-auto mb-4 flex items-center justify-center">
            <Award className="w-8 h-8 text-[#DDD]" />
          </div>
          <h3 className="text-lg font-semibold text-[#222] mb-2">No Certificates Yet</h3>
          <p className="text-sm text-[#999] max-w-sm mx-auto">
            {isAdmin ? 'No certificates have been issued. Staff must complete all modules and pass the final exam.' : 'Complete all modules and pass the final exam to earn your certificate.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map(cert => {
          const isExpired = new Date(cert.expires_at) < new Date();
          const isExpiring = !isExpired && new Date(cert.expires_at) < new Date(Date.now() + 30 * 86400000);

          return (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-[#E8E8E8] p-5 hover:shadow-md transition-all"
              data-testid={`certificate-${cert.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isExpired ? 'bg-[#FFEBEE]' : isExpiring ? 'bg-[#FFF3E0]' : 'bg-[#E8F5E9]'
                  }`}>
                    <Award className={`w-5 h-5 ${
                      isExpired ? 'text-[#D32F2F]' : isExpiring ? 'text-[#E65100]' : 'text-[#2E7D32]'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#222] text-sm">{cert.path_name}</h3>
                    {isAdmin && <p className="text-xs text-[#999]">{cert.user_name}</p>}
                  </div>
                </div>
                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  isExpired ? 'bg-[#FFEBEE] text-[#D32F2F]' :
                  isExpiring ? 'bg-[#FFF3E0] text-[#E65100]' : 'bg-[#E8F5E9] text-[#2E7D32]'
                }`}>
                  {isExpired ? 'Expired' : isExpiring ? 'Expiring Soon' : 'Active'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#999] mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Issued: {new Date(cert.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Expires: {new Date(cert.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {cert.target_role && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{cert.target_role}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isExpired && (
                  <button
                    onClick={() => downloadCert(cert.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF8100] text-white text-xs font-semibold hover:bg-[#E67300] transition-all"
                    data-testid={`download-cert-${cert.id}`}
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => confirmRevoke(cert)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#FFCDD2] text-[#D32F2F] text-xs font-semibold hover:bg-[#FFEBEE] transition-all"
                    data-testid={`revoke-cert-${cert.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Certificate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="rounded-2xl border border-[#E8E8E8] bg-white max-w-sm shadow-xl">
          <DialogHeader><DialogTitle className="text-lg font-bold text-[#1A1A1A]">Delete Certificate</DialogTitle></DialogHeader>
          <div className="mt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FFEBEE] mb-4">
              <AlertTriangle className="w-5 h-5 text-[#D32F2F] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#D32F2F]">This action is permanent</p>
                <p className="text-xs text-[#D32F2F]/70 mt-0.5">The certificate will be removed from both the admin view and the staff member's account.</p>
              </div>
            </div>
            {selectedCert && (
              <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#F0F0F0] mb-4">
                <div className="text-sm font-semibold text-[#222]">{selectedCert.path_name}</div>
                <div className="text-xs text-[#999]">Issued to: {selectedCert.user_name}</div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 rounded-xl bg-[#F5F5F5] text-[#555] font-semibold text-sm hover:bg-[#E8E8E8] transition-all">
                Cancel
              </button>
              <button onClick={revokeCert} className="flex-1 py-2.5 rounded-xl bg-[#D32F2F] text-white font-semibold text-sm hover:bg-[#C62828] transition-all" data-testid="confirm-delete-cert">
                Delete Permanently
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
