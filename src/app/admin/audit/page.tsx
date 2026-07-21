import { db } from '@/lib/db';
import { Calendar, ShieldAlert, User, Network, FileText } from 'lucide-react';

export const revalidate = 0; // Pas de cache pour charger les logs en temps réel

export default async function AdminAuditPage() {
  // Récupérer les 100 derniers logs d'audit
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Récupérer les informations utilisateur pour afficher les noms
  const userIds = Array.from(new Set(logs.map(l => l.userId).filter(Boolean))) as string[];
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });

  const userMap = new Map(users.map(u => [u.id, u]));

  // Helper pour styliser les tags d'action
  const getActionStyle = (action: string) => {
    switch (action) {
      case 'ARTICLE_CREATE':
      case 'USER_CREATE':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'ARTICLE_UPDATE':
      case 'USER_UPDATE':
      case 'USER_UPDATE_ROLE':
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
      case 'ARTICLE_DELETE':
      case 'USER_DELETE':
      case 'USER_TOGGLE_BAN':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'RATING_ADD':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'ARTICLE_SHARE':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      case 'ARTICLE_VIEW':
        return 'bg-slate-800 border-slate-700 text-slate-300';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
          Journal d'Audit &amp; Sécurité
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historique des 100 dernières actions administratives et activités publiques clés sur PressTonik.
        </p>
      </div>

      <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-800">
                <th className="py-4 px-6 font-extrabold">Date &amp; Heure</th>
                <th className="py-4 px-6 font-extrabold">Action</th>
                <th className="py-4 px-6 font-extrabold">Détails de l'événement</th>
                <th className="py-4 px-6 font-extrabold">Opérateur</th>
                <th className="py-4 px-6 font-extrabold">Adresse IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Aucune action répertoriée dans le journal d'audit pour le moment.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const operator = log.userId ? userMap.get(log.userId) : null;
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-900/30 transition-colors"
                    >
                      {/* Date & Heure */}
                      <td className="py-3.5 px-6 text-slate-400 font-medium whitespace-nowrap">
                        <span className="flex items-center gap-1.5 font-mono text-[10px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {new Date(log.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Action Code */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded border text-[9px] font-black tracking-wider uppercase inline-block ${getActionStyle(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-6 text-slate-200 font-semibold max-w-sm sm:max-w-md break-words">
                        <span className="flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                          <span>{log.details}</span>
                        </span>
                      </td>

                      {/* Operator (User or Anonyme) */}
                      <td className="py-3.5 px-6 whitespace-nowrap text-slate-400">
                        {operator ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-200 flex items-center gap-1">
                              <User className="w-3 h-3 text-cyan-400" />
                              {operator.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">{operator.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic font-medium">Session Public / Visiteur</span>
                        )}
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                          <Network className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {log.ipAddress || '127.0.0.1'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
