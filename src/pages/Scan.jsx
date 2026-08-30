// src/pages/Scan.jsx

import React, { useState } from 'react';
import { 
  UploadCloud, 
  Check, 
  RefreshCw, 
  ZoomIn, 
  FileText, 
  Sparkles, 
  X 
} from 'lucide-react';
import { useDependente } from '../context/DependenteContext';

/**
 * Página de Scan de Documentos com IA (GPT-4o Vision)
 * Fluxo: Dropzone → Processamento (simulado) → Modal de Revisão
 * Diferencial competitivo: Extração automática de dados da carteirinha
 */
export default function Scan() {
  const { dependenteAtivo } = useDependente();
  
  // Estados para controle do fluxo de Upload e OCR
  const [isHovering, setIsHovering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Dados extraídos pela IA (simulados)
  const [extractedData, setExtractedData] = useState({
    vacina: 'Febre Amarela',
    dose: 'Dose Única',
    dataAplicacao: '2026-05-15',
    lote: 'FA2026-X99',
    localAplicacao: 'UBS Vila Fátima',
    precisaoLeitura: 0.97
  });

  /**
   * Simula o envio do arquivo para a Cloud Function
   * Em produção: upload para Firebase Storage → Trigger da Cloud Function → Resposta GPT-4o
   */
  const handleFileUpload = (e) => {
    e.preventDefault();
    setIsHovering(false);
    setIsProcessing(true);

    // Simula 2.5 segundos de processamento (tempo médio da API GPT-4o Vision)
    setTimeout(() => {
      setIsProcessing(false);
      setShowReviewModal(true);
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* ============================================
          CABEÇALHO DA PÁGINA
          ============================================ */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          Escanear Carteirinha de Vacinação
          <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-600" /> GPT-4o Vision
          </span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Envie a foto ou PDF da carteirinha física de <strong className="text-slate-700">{dependenteAtivo.nome}</strong>. 
          A IA fará a leitura automática dos registros.
        </p>
      </div>

      {/* ============================================
          ÁREA DE DROPZONE (Drag & Drop)
          ============================================ */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleFileUpload}
        onClick={handleFileUpload}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 bg-white flex flex-col items-center justify-center min-h-[360px] shadow-sm ${
          isHovering 
            ? 'border-cyan-500 bg-cyan-50/50 scale-[1.01]' 
            : 'border-slate-300 hover:border-cyan-500 hover:bg-slate-50/50'
        }`}
      >
        {isProcessing ? (
          /* --- Estado: Processamento da IA --- */
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-cyan-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">O GPT-4o está analisando o documento...</h3>
              <p className="text-xs text-slate-500 mt-1">Extraindo vacinas, lotes e datas de aplicação</p>
            </div>
          </div>
        ) : (
          /* --- Estado: Pronto para Upload --- */
          <>
            <div className="bg-cyan-50 text-cyan-600 p-4 rounded-2xl mb-4 border border-cyan-100">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Arraste e solte o arquivo da carteirinha aqui</h3>
            <p className="text-xs text-slate-400 mt-1">ou clique em qualquer área para selecionar do seu computador</p>
            <div className="flex gap-2 mt-4 text-[11px] font-medium text-slate-400">
              <span className="bg-slate-100 px-2 py-1 rounded">PNG</span>
              <span className="bg-slate-100 px-2 py-1 rounded">JPG</span>
              <span className="bg-slate-100 px-2 py-1 rounded">PDF</span>
            </div>
          </>
        )}
      </div>

      {/* ============================================
          MODAL DE REVISÃO (Split-View)
          Exibe: Foto original (esq) vs Dados extraídos (dir)
          ============================================ */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Header do Modal */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Revisão e Confirmação de Leitura</h3>
                <p className="text-xs text-slate-500">
                  Confirme se a IA interpretou os campos do documento impresso corretamente
                </p>
              </div>
              <button 
                onClick={() => setShowReviewModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo Split-View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-1">
              
              {/* COLUNA ESQUERDA: Imagem Original com Zoom */}
              <div className="bg-slate-900 rounded-xl p-3 relative flex flex-col items-center justify-center min-h-[320px]">
                <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur-md text-slate-200 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" /> Documento Original
                </div>
                
                {/* Placeholder da Imagem - Em produção: exibir a imagem enviada */}
                <div className="bg-slate-800 text-slate-400 text-xs p-8 rounded-lg border border-slate-700 text-center">
                  [ Imagem da Carteirinha com Marcações de Detecção ]
                </div>
                
                <button className="absolute bottom-4 right-4 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg text-xs flex items-center gap-1 shadow-md transition">
                  <ZoomIn className="w-4 h-4" /> Ampliar
                </button>
              </div>

              {/* COLUNA DIREITA: Formulário com Dados Extraídos */}
              <div className="space-y-4">
                {/* Indicador de Sucesso da IA */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800">
                    <strong>Sucesso:</strong> 1 novo registro identificado para <strong>{dependenteAtivo.nome}</strong>.
                    <br />
                    <span className="text-emerald-600">Precisão: {(extractedData.precisaoLeitura * 100).toFixed(0)}%</span>
                  </p>
                </div>

                {/* Campos Editáveis */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nome da Vacina</label>
                    <input 
                      type="text" 
                      value={extractedData.vacina} 
                      onChange={(e) => setExtractedData({...extractedData, vacina: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Dose</label>
                    <input 
                      type="text" 
                      value={extractedData.dose} 
                      onChange={(e) => setExtractedData({...extractedData, dose: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Data da Aplicação</label>
                      <input 
                        type="date" 
                        value={extractedData.dataAplicacao} 
                        onChange={(e) => setExtractedData({...extractedData, dataAplicacao: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Lote</label>
                      <input 
                        type="text" 
                        value={extractedData.lote} 
                        onChange={(e) => setExtractedData({...extractedData, lote: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Local / Unidade de Saúde</label>
                    <input 
                      type="text" 
                      value={extractedData.localAplicacao} 
                      onChange={(e) => setExtractedData({...extractedData, localAplicacao: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé: Botões de Ação */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowReviewModal(false)} 
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Descartar
              </button>
              <button 
                onClick={() => {
                  // Em produção: salvar no Firestore
                  alert('✅ Dados salvos na carteira de ' + dependenteAtivo.nome);
                  setShowReviewModal(false);
                }} 
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
              >
                <Check className="w-4 h-4" /> Salvar na Carteira
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}