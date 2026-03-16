import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../lib/api';
import { toast } from 'sonner';
import { Award, Download, ShieldX, Calendar, User, Clock } from 'lucide-react';

export default function CertificatePage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/certificates')
      .then(r => { setCertificates(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const downloadCert = (certId) => {
    window.open(`${process.env.REACT_APP_BACKEND_URL}/api/certificates/${certId}/download`, '_blank');
  };

  const revokeCert = async (certId) => {
    try {
      await API.delete(`/certificates/${certId}`);
      setCertificates(certificates.map(c => c.id === certId ? { ...c, is_revoked: true } : c));
      toast.success('Certificate revoked');
    } catch { toast.error('Failed to revoke'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-[#707973]">Loading certificates...</div>;

  const isAdmin = user?.role === 'admin';
  const activeCerts = certificates.filter(c => !c.is_revoked);
  const revokedCerts = certificates.filter(c => c.is_revoked);

  return (
    <div data-testid="certificates-page" className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#002114] tracking-tight">
          {isAdmin ? 'All Certificates' : 'My Certificates'}
        </h1>
        <p className="text-[#707973] mt-1">
          {activeCerts.length} active certificate{activeCerts.length !== 1 ? 's' : ''}
          {revokedCerts.length > 0 && ` / ${revokedCerts.length} revoked`}
        </p>
      </div>

      {certificates.length === 0 && (
        <div className="m3-card text-center py-16">
          <div className="w-20 h-20 rounded-full bg-[#F0F5F1] mx-auto mb-4 flex items-center justify-center">
            <Award className="w-10 h-10 text-[#707973]" />
          </div>
          <h3 className="text-lg font-semibold text-[#002114] mb-2">No Certificates Yet</h3>
          <p className="text-sm text-[#707973]">Complete all modules and pass the final exam to earn your certificate.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map(cert => {
          const isExpired = new Date(cert.expires_at) < new Date();
          const isExpiring = !isExpired && new Date(cert.expires_at) < new Date(Date.now() + 30 * 86400000);

          return (
            <div
              key={cert.id}
              className={`m3-card-elevated !rounded-[28px] ${cert.is_revoked ? 'opacity-60' : ''}`}
              data-testid={`certificate-${cert.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center ${
                    cert.is_revoked ? 'bg-[#FFDAD6]' :
                    isExpired ? 'bg-[#FFDAD6]' :
                    isExpiring ? 'bg-[#FFDAD6]/60' : 'bg-[#D0E8D8]'
                  }`}>
                    <Award className={`w-6 h-6 ${
                      cert.is_revoked || isExpired ? 'text-[#BA1A1A]' : 'text-[#006C4C]'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#002114] text-sm">{cert.path_name}</h3>
                    {isAdmin && <p className="text-xs text-[#707973]">{cert.user_name}</p>}
                  </div>
                </div>
                {cert.is_revoked ? (
                  <span className="pill-warning">Revoked</span>
                ) : isExpired ? (
                  <span className="pill-warning">Expired</span>
                ) : isExpiring ? (
                  <span className="pill-warning">Expiring</span>
                ) : (
                  <span className="pill-success">Active</span>
                )}
              </div>

              <div className="space-y-2 text-xs text-[#707973] mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Issued: {new Date(cert.issued_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expires: {new Date(cert.expires_at).toLocaleDateString()}</span>
                </div>
                {cert.target_role && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span>{cert.target_role}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!cert.is_revoked && !isExpired && (
                  <button
                    onClick={() => downloadCert(cert.id)}
                    className="m3-btn-filled text-sm !px-5 !py-2 flex items-center gap-1.5"
                    data-testid={`download-cert-${cert.id}`}
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                )}
                {isAdmin && !cert.is_revoked && (
                  <button
                    onClick={() => revokeCert(cert.id)}
                    className="m3-btn-outlined text-sm !px-5 !py-2 !text-[#BA1A1A] !border-[#BA1A1A] flex items-center gap-1.5"
                    data-testid={`revoke-cert-${cert.id}`}
                  >
                    <ShieldX className="w-3.5 h-3.5" /> Revoke
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
