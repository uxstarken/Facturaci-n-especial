'use client';

import React from 'react';
import { FileText, ArrowLeft, Save, Send, Loader2 } from 'lucide-react';

interface ObservacionesSectionProps {
  observaciones: string;
  buttonGradient?: string;
  isSubmitting?: boolean;
  onChangeObservaciones: (val: string) => void;
  onGoPrevStep: () => void;
  onSaveDraft: () => void;
}

export const ObservacionesSection: React.FC<ObservacionesSectionProps> = ({
  observaciones,
  buttonGradient = 'from-purple-600 to-indigo-600',
  isSubmitting = false,
  onChangeObservaciones,
  onGoPrevStep,
  onSaveDraft,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
      {/* HEADER DE LA CARD VISUAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-eyebrow font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Observaciones para Aprobación de Jefatura
            </h3>
            <span className="text-caption text-gray-600 dark:text-gray-400 font-medium block">
              Comentarios y notas internas para el flujo de aprobación comercial
            </span>
          </div>
        </div>
      </div>

      <div>
        <textarea
          rows={3}
          value={observaciones}
          onChange={(e) => onChangeObservaciones(e.target.value)}
          placeholder="Escribe aquí observaciones relevantes para el flujo de aprobación..."
          className="w-full p-3 bg-gray-50/50 dark:bg-slate-900/50 border border-purple-900/15 dark:border-white/10 rounded-md text-body text-gray-900 dark:text-gray-100 focus:border-purple-600 focus:bg-white dark:focus:bg-slate-800 outline-none resize-none"
        />
      </div>

      {/* STEP 4 ACTIONS */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
        <button
          type="button"
          onClick={onGoPrevStep}
          disabled={isSubmitting}
          className="px-4 h-10 border border-purple-900/20 dark:border-white/10 text-gray-700 dark:text-gray-300 text-body font-semibold rounded-lg hover:bg-purple-50 dark:hover:bg-white/5 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Paso 3</span>
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="px-4 h-11 border border-purple-900/20 dark:border-white/10 text-gray-700 dark:text-gray-300 text-body font-semibold rounded-lg hover:bg-purple-50 dark:hover:bg-white/5 transition-colors inline-flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Guardar Borrador
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 h-11 bg-gradient-to-r ${buttonGradient} text-white text-body font-bold rounded-lg transition-all inline-flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] ${isSubmitting ? 'opacity-80 cursor-wait' : ''}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Validando Proforma...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Crear Proforma</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
