'use client';

import { Filter } from 'lucide-react';
import { MOCK_AUDIT } from '@/lib/mock-data';

export default function AuditoriaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">Auditoría del Sistema</h1>
        <p className="text-caption text-gray-600 dark:text-gray-400">
          Registro completo de acciones, accesos e interacciones realizadas por los usuarios.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap bg-white dark:bg-slate-800 p-4 border border-purple-900/10 dark:border-white/10 rounded-xl shadow-sm">
        <Filter className="w-4 h-4 text-purple-600 dark:text-emerald-400 shrink-0" />
        <select className="h-9 px-3 bg-gray-50 dark:bg-slate-900/50 border border-purple-900/15 dark:border-white/10 rounded-md text-body text-gray-700 dark:text-gray-300 outline-none focus:border-purple-600">
          <option>Todos los roles</option>
          <option>Analista</option>
          <option>Jefatura</option>
          <option>Administrador</option>
          <option>Gerencia</option>
        </select>

        <select className="h-9 px-3 bg-gray-50 dark:bg-slate-900/50 border border-purple-900/15 dark:border-white/10 rounded-md text-body text-gray-700 dark:text-gray-300 outline-none focus:border-purple-600">
          <option>Todas las acciones</option>
          <option>Creación</option>
          <option>Aprobación</option>
          <option>Rechazo</option>
          <option>Login</option>
        </select>

        <select className="h-9 px-3 bg-gray-50 dark:bg-slate-900/50 border border-purple-900/15 dark:border-white/10 rounded-md text-body text-gray-700 dark:text-gray-300 outline-none focus:border-purple-600">
          <option>Últimos 7 días</option>
          <option>Últimos 30 días</option>
          <option>Este mes</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body">
            <thead className="bg-purple-50/50 dark:bg-white/5 border-b border-purple-900/10 dark:border-white/10 text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider text-micro">
              <tr>
                <th className="py-3 px-5">Fecha / Hora</th>
                <th className="py-3 px-5">Usuario</th>
                <th className="py-3 px-5">Rol</th>
                <th className="py-3 px-5">Acción</th>
                <th className="py-3 px-5">Recurso Afectado</th>
                <th className="py-3 px-5">IP de Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {MOCK_AUDIT.map((item) => (
                <tr key={item.id} className="hover:bg-purple-50/30 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-caption text-gray-600 dark:text-gray-400">{item.ts}</td>
                  <td className="py-3.5 px-5 font-medium text-gray-900 dark:text-gray-100">{item.usuario}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-micro font-bold uppercase tracking-wider ${item.rol === 'Analista'
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                          : item.rol === 'Jefatura'
                            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : item.rol === 'Administrador'
                              ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        }`}
                    >
                      {item.rol}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-micro font-bold ${item.accion === 'Creación'
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                          : item.accion === 'Aprobación'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : item.accion === 'Rechazo'
                              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                              : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {item.accion}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-caption text-gray-700 dark:text-gray-300">{item.recurso}</td>
                  <td className="py-3.5 px-5 font-mono text-caption text-gray-600 dark:text-gray-400">{item.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
