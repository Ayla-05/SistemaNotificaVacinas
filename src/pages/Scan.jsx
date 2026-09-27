// src/pages/Scan.jsx

import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Check,
  ZoomIn,
  FileText,
  Sparkles,
  X,
  AlertTriangle
} from 'lucide-react';
import { useDependente } from '../context/DependenteContext';
import { useAuth } from '../context/AuthContext';
import { analisarCarteirinha, confirmarScanNaCarteira } from '../services/api';

/**
 * Página de Scan de Documentos com IA (Claude Vision)
 * Fluxo: Dropzone → upload real do arquivo → Claude Vision (backend)
 * → Modal de Revisão → confirmação salva na carteira vacinal.
 */
export default function Scan() {
  const { dependenteAtivo } = useDependente();
  const { pessoaAtiva } = useAuth();

  const inputArquivoRef = useRef(null);

  // Estados de controle do fluxo de Upload e leitura por IA
  const [isHovering, setIsHovering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSalvando, setIsSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Prévia da imagem enviada, mostrada ao lado dos dados extraídos
  const [imagemPreview, setImagemPreview] = useState(null);

  // Dados extraídos pelo Claude Vision, editáveis antes de salvar
  const [extractedData, setExtractedData] = useState(null);

  /** Lê um File do input/drop e devolve { base64, mediaType, previewUrl }. */
  function lerArquivoComoBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();

      leitor.onload = () => {
        const resultado = leitor.result; // "data:image/jpeg;base64,AAAA..."
        const [cabecalho, base64] = resultado.split(',');
        const mediaType = cabecalho.match(/data:(.*);base64/)?.[1];

        resolve({ base64, mediaType, previewUrl: resultado });
      };

      leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
      leitor.readAsDataURL(arquivo);
    });
  }

  async function processarArquivo(arquivo) {
    if (!arquivo) return;

    if (!pessoaAtiva) {
      setErro('Nenhuma pessoa vinculada à sua conta ainda.');
      return;
    }

    setErro('');
    setIsProcessing(true);

    try {
      const { base64, mediaType, previewUrl } = await lerArquivoComoBase64(arquivo);
      setImagemPreview(previewUrl);

      const dados = await analisarCarteirinha({
        pessoaId: pessoaAtiva.id,
        imagemBase64: base64,
        mediaType
      });

      setExtractedData(dados);
      setShowReviewModal(true);
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsHovering(false);
    processarArquivo(e.dataTransfer.files?.[0]);
  }

  function handleSelecionarArquivo(e) {
    processarArquivo(e.target.files?.[0]);
    // Permite selecionar o mesmo arquivo de novo depois
    e.target.value = '';
  }

  async function handleSalvar() {
    setIsSalvando(true);
    setErro('');

    try {
      await confirmarScanNaCarteira({
        pessoaId: pessoaAtiva.id,
        vacina: extractedData.vacina,
        dose: extractedData.dose,
        dataAplicacao: extractedData.dataAplicacao,
        lote: extractedData.lote,
        localAplicacao: extractedData.localAplicacao
      });

      setShowReviewModal(false);
      setExtractedData(null);
      setImagemPreview(null);
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setIsSalvando(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ============================================
          CABEÇALHO DA PÁGINA
          ============================================ */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          Escanear Carteirinha de Vacinação
          <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-600" /> Claude Vision
          </span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Envie a foto ou PDF da carteirinha física de <strong className="text-slate-700">{dependenteAtivo.nome}</strong>.
          A IA fará a leitura automática dos registros.
        </p>
      </div>

      {erro && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl p-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {erro}
        </div>
      )}

      {/* ============================================
          ÁREA DE DROPZONE (Drag & Drop + seleção manual)
          ============================================ */}
      <input
        ref={inputArquivoRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleSelecionarArquivo}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && inputArquivoRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 bg-white/70 backdrop-blur flex flex-col items-center justify-center min-h-[360px] shadow-sm ${
          isHovering
            ? 'border-sky-500 bg-sky-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-sky-500 hover:bg-slate-50/50'
        }`}
      >
        {isProcessing ? (
          /* --- Estado: Processamento da IA --- */
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-sky-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">O Claude está analisando o documento...</h3>
              <p className="text-xs text-slate-500 mt-1">Extraindo vacina, dose, lote e data de aplicação</p>
            </div>
          </div>
        ) : (
          /* --- Estado: Pronto para Upload --- */
          <>
            <div className="icon-chip w-16 h-16 mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Arraste e solte o arquivo da carteirinha aqui</h3>
            <p className="text-xs text-slate-400 mt-1">ou clique em qualquer área para selecionar do seu computador</p>
            <div className="flex gap-2 mt-4 text-[11px] font-medium text-slate-400">
              <span className="bg-slate-100 px-2 py-1 rounded">PNG</span>
              <span className="bg-slate-100 px-2 py-1 rounded">JPG</span>
              <span className="bg-slate-100 px-2 py-1 rounded">WEBP</span>
            </div>
          </>
        )}
      </div>

      {/* ============================================
          MODAL DE REVISÃO (Split-View)
          Exibe: Foto original (esq) vs Dados extraídos (dir)
          ============================================ */}
      {showReviewModal && extractedData && (
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

              {/* COLUNA ESQUERDA: Imagem enviada, com Zoom */}
              <div className="bg-slate-900 rounded-xl p-3 relative flex flex-col items-center justify-center min-h-[320px]">
                <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur-md text-slate-200 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" /> Documento Enviado
                </div>

                {imagemPreview && (
                  <img
                    src={imagemPreview}
                    alt="Carteirinha enviada"
                    className="max-h-[280px] rounded-lg object-contain"
                  />
                )}

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
                    <span className="text-emerald-600">Revise os campos antes de salvar.</span>
                  </p>
                </div>

                {/* Campos Editáveis */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nome da Vacina</label>
                    <input
                      type="text"
                      value={extractedData.vacina}
                      onChange={(e) => setExtractedData({ ...extractedData, vacina: e.target.value })}
                      className="campo-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Dose</label>
                    <input
                      type="text"
                      value={extractedData.dose}
                      onChange={(e) => setExtractedData({ ...extractedData, dose: e.target.value })}
                      className="campo-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Data da Aplicação</label>
                      <input
                        type="date"
                        value={extractedData.dataAplicacao ?? ''}
                        onChange={(e) => setExtractedData({ ...extractedData, dataAplicacao: e.target.value })}
                        className="campo-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Lote</label>
                      <input
                        type="text"
                        value={extractedData.lote ?? ''}
                        onChange={(e) => setExtractedData({ ...extractedData, lote: e.target.value })}
                        className="campo-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Local / Unidade de Saúde</label>
                    <input
                      type="text"
                      value={extractedData.localAplicacao ?? ''}
                      onChange={(e) => setExtractedData({ ...extractedData, localAplicacao: e.target.value })}
                      className="campo-input"
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
                onClick={handleSalvar}
                disabled={isSalvando}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
              >
                <Check className="w-4 h-4" /> {isSalvando ? 'Salvando...' : 'Salvar na Carteira'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
