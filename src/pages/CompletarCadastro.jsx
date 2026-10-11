// src/pages/CompletarCadastro.jsx

import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Phone,
  ShieldAlert,
  Syringe,
  UploadCloud,
  PenLine,
  Clock,
  Loader2,
  Check,
  ArrowRight,
  Sparkles,
  Users,
  UserPlus,
  IdCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  atualizarPessoa,
  obterCatalogoGruposEspeciais,
  vincularGrupoEspecial,
  obterVacinas,
  analisarCarteirinha,
  confirmarScanNaCarteira,
  cadastrarDependente,
  concluirCadastro,
  buscarEnderecoPorCep
} from '../services/api';

const DADOS_VAZIOS = {
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: ''
};

const VACINA_VAZIA = { vacina: '', dose: '', dataAplicacao: '', lote: '', localAplicacao: '' };

const DEPENDENTE_VAZIO = { nome: '', data_nascimento: '', parentesco: 'filho' };

const PASSOS = [
  { numero: 1, chave: 'dados', label: 'Dados pessoais' },
  { numero: 2, chave: 'carteirinha', label: 'Carteirinha' }
];

/**
 * Onboarding pós-cadastro: exibido uma única vez, logo depois que a
 * pessoa cria a conta (ver Login.jsx -> registrar()).
 *
 * Etapa 1: completa os dados pessoais/endereço e grupos especiais que
 * não foram pedidos no cadastro rápido.
 *
 * Etapa 2: oferece o cadastro da carteirinha de vacinação — manual ou
 * por upload com leitura via Claude Vision — do próprio titular ou de
 * um dependente (que é cadastrado e vinculado automaticamente a partir
 * do nome/data de nascimento lidos na carteirinha), ou a opção de
 * pular e fazer isso depois.
 */
export default function CompletarCadastro() {
  const { pessoaAtiva, recarregarPessoas } = useAuth();
  const navigate = useNavigate();

  /*
   * Avisa o backend que o onboarding terminou (preenchido ou
   * pulado), disparando o e-mail de boas-vindas definitivo, e
   * só então segue pro Dashboard. Não trava a navegação se o
   * e-mail falhar — é só um aviso, a conta já está pronta.
   */
  function finalizarOnboarding() {
    concluirCadastro().catch(() => {});
    navigate('/dashboard');
  }

  const [etapa, setEtapa] = useState('dados'); // 'dados' | 'carteirinha' | 'manual' | 'upload'
  const [dono, setDono] = useState('titular'); // 'titular' | 'dependente' — de quem é a carteirinha sendo cadastrada

  // --- Etapa 1: dados pessoais ---
  const [form, setForm] = useState(DADOS_VAZIOS);
  const [catalogoGrupos, setCatalogoGrupos] = useState([]);
  const [gruposSelecionados, setGruposSelecionados] = useState([]);
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [erroDados, setErroDados] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  React.useEffect(() => {
    obterCatalogoGruposEspeciais().then(setCatalogoGrupos).catch(() => {});
  }, []);

  function atualizarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  /*
   * Ao digitar um CEP completo (8 dígitos), busca e
   * autopreenche logradouro/bairro/cidade/estado. Falha
   * silenciosamente (CEP inválido, API fora do ar) — é só
   * uma conveniência, a pessoa sempre pode preencher à mão.
   */
  async function atualizarCep(valor) {
    atualizarCampo('cep', valor);

    const cepLimpo = valor.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    const endereco = await buscarEnderecoPorCep(cepLimpo);
    setBuscandoCep(false);

    if (endereco) {
      setForm((atual) => ({ ...atual, ...endereco }));
    }
  }

  function alternarGrupo(grupoId) {
    setGruposSelecionados((atual) =>
      atual.includes(grupoId) ? atual.filter((id) => id !== grupoId) : [...atual, grupoId]
    );
  }

  async function handleSalvarDados(e) {
    e.preventDefault();
    setErroDados('');
    setSalvandoDados(true);

    try {
      await atualizarPessoa(pessoaAtiva.id, form);
      await Promise.all(gruposSelecionados.map((grupoId) => vincularGrupoEspecial(pessoaAtiva.id, grupoId)));
      await recarregarPessoas();
      setEtapa('carteirinha');
    } catch (erroCapturado) {
      setErroDados(erroCapturado.message);
    } finally {
      setSalvandoDados(false);
    }
  }

  // --- Etapa 2: cadastro manual da carteirinha ---
  const [vacinasDisponiveis, setVacinasDisponiveis] = useState([]);
  const [formVacina, setFormVacina] = useState(VACINA_VAZIA);
  const [salvandoVacina, setSalvandoVacina] = useState(false);
  const [vacinaSalva, setVacinaSalva] = useState(false);
  const [erroVacina, setErroVacina] = useState('');

  function abrirCadastroManual() {
    setErroVacina('');
    setVacinaSalva(false);
    if (vacinasDisponiveis.length === 0) {
      obterVacinas().then(setVacinasDisponiveis).catch(() => {});
    }
    setEtapa('manual');
  }

  async function handleSalvarVacinaManual(e) {
    e.preventDefault();
    setErroVacina('');
    setSalvandoVacina(true);

    try {
      await confirmarScanNaCarteira({ pessoaId: pessoaAtiva.id, ...formVacina });
      setVacinaSalva(true);
      setFormVacina(VACINA_VAZIA);
    } catch (erroCapturado) {
      setErroVacina(erroCapturado.message);
    } finally {
      setSalvandoVacina(false);
    }
  }

  // --- Etapa 2: upload + leitura por IA (titular ou dependente) ---
  const inputArquivoRef = useRef(null);
  const [processandoIA, setProcessandoIA] = useState(false);
  const [dadosExtraidos, setDadosExtraidos] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [salvandoScan, setSalvandoScan] = useState(false);
  const [erroUpload, setErroUpload] = useState('');
  const [concluidoUpload, setConcluidoUpload] = useState(false);

  const [dependente, setDependente] = useState(DEPENDENTE_VAZIO);

  function abrirUpload(paraDono) {
    setDono(paraDono);
    setErroUpload('');
    setDadosExtraidos(null);
    setImagemPreview(null);
    setConcluidoUpload(false);
    setDependente(DEPENDENTE_VAZIO);
    setEtapa('upload');
  }

  function lerArquivoComoBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => {
        const [cabecalho, base64] = leitor.result.split(',');
        const mediaType = cabecalho.match(/data:(.*);base64/)?.[1];
        resolve({ base64, mediaType, previewUrl: leitor.result });
      };
      leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
      leitor.readAsDataURL(arquivo);
    });
  }

  async function processarArquivo(arquivo) {
    if (!arquivo) return;
    setErroUpload('');
    setProcessandoIA(true);

    try {
      const { base64, mediaType, previewUrl } = await lerArquivoComoBase64(arquivo);
      setImagemPreview(previewUrl);

      const dados = await analisarCarteirinha({ pessoaId: pessoaAtiva.id, imagemBase64: base64, mediaType });
      setDadosExtraidos(dados);

      if (dono === 'dependente') {
        setDependente({
          nome: dados.nomeTitular || '',
          data_nascimento: dados.dataNascimentoTitular || '',
          parentesco: 'filho'
        });
      }
    } catch (erroCapturado) {
      setErroUpload(erroCapturado.message);
    } finally {
      setProcessandoIA(false);
    }
  }

  async function handleConfirmarScan() {
    setSalvandoScan(true);
    setErroUpload('');

    try {
      let pessoaIdDestino = pessoaAtiva.id;

      if (dono === 'dependente') {
        if (!dependente.nome.trim() || !dependente.data_nascimento) {
          throw new Error('Preencha o nome e a data de nascimento do dependente.');
        }

        const resultado = await cadastrarDependente({
          responsavelPessoaId: pessoaAtiva.id,
          nome: dependente.nome,
          data_nascimento: dependente.data_nascimento,
          parentesco: dependente.parentesco
        });

        pessoaIdDestino = resultado.id;
        await recarregarPessoas();
      }

      await confirmarScanNaCarteira({
        pessoaId: pessoaIdDestino,
        vacina: dadosExtraidos.vacina,
        dose: dadosExtraidos.dose,
        dataAplicacao: dadosExtraidos.dataAplicacao,
        lote: dadosExtraidos.lote,
        localAplicacao: dadosExtraidos.localAplicacao
      });

      setConcluidoUpload(true);
    } catch (erroCapturado) {
      setErroUpload(erroCapturado.message);
    } finally {
      setSalvandoScan(false);
    }
  }

  if (!pessoaAtiva) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      <FundoDecorativo />

      <div className="w-full max-w-2xl relative z-10">

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="icon-chip w-14 h-14 mb-3 shadow-md shadow-emerald-900/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Bem-vindo(a), {pessoaAtiva.nome.split(' ')[0]}!</h1>
          <p className="text-sm text-slate-500 mt-1">
            Só mais um passo antes de começar a acompanhar sua carteira de vacinação.
          </p>
        </div>

        <Stepper etapaAtual={etapa} />

        <div className="card-glass p-8 mt-6">

          {/* ===================== ETAPA 1 ===================== */}
          {etapa === 'dados' && (
            <form onSubmit={handleSalvarDados} className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" /> Contato
                </h2>
                <Campo label="Telefone">
                  <input type="tel" value={form.telefone} onChange={(e) => atualizarCampo('telefone', e.target.value)} className="campo-input" placeholder="(11) 99999-9999" />
                </Campo>
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Endereço
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Campo label="CEP">
                    <div className="relative">
                      <input
                        type="text"
                        value={form.cep}
                        onChange={(e) => atualizarCep(e.target.value)}
                        maxLength={9}
                        placeholder="00000-000"
                        className="campo-input"
                      />
                      {buscandoCep && (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </Campo>
                  <Campo label="Logradouro" className="sm:col-span-2">
                    <input type="text" value={form.logradouro} onChange={(e) => atualizarCampo('logradouro', e.target.value)} className="campo-input" />
                  </Campo>
                  <Campo label="Número">
                    <input type="text" value={form.numero} onChange={(e) => atualizarCampo('numero', e.target.value)} className="campo-input" />
                  </Campo>
                  <Campo label="Bairro">
                    <input type="text" value={form.bairro} onChange={(e) => atualizarCampo('bairro', e.target.value)} className="campo-input" />
                  </Campo>
                  <Campo label="Cidade">
                    <input type="text" value={form.cidade} onChange={(e) => atualizarCampo('cidade', e.target.value)} className="campo-input" />
                  </Campo>
                  <Campo label="Estado (UF)">
                    <input type="text" maxLength={2} value={form.estado} onChange={(e) => atualizarCampo('estado', e.target.value.toUpperCase())} className="campo-input" />
                  </Campo>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Grupos especiais / de risco
                </h2>
                <p className="text-xs text-slate-500 mb-3">Marque se algum se aplica a você.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catalogoGrupos.map((grupo) => (
                    <label key={grupo.id} className="flex items-center gap-2 text-sm bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer transition">
                      <input type="checkbox" checked={gruposSelecionados.includes(grupo.id)} onChange={() => alternarGrupo(grupo.id)} className="accent-emerald-600" />
                      <span className="font-medium text-slate-700">{grupo.nome.replaceAll('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {erroDados && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{erroDados}</p>}

              <div className="flex items-center justify-between">
                <button type="button" onClick={finalizarOnboarding} className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition">
                  Pular, fazer isso depois
                </button>
                <button type="submit" disabled={salvandoDados} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  {salvandoDados && <Loader2 className="w-4 h-4 animate-spin" />} Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ===================== ETAPA 2: ESCOLHA ===================== */}
          {etapa === 'carteirinha' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="icon-chip w-12 h-12 mx-auto mb-3">
                  <Syringe className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Já tem vacinas para registrar?</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Informe manualmente ou envie uma foto — nossa IA lê os dados pra você. Também dá pra cadastrar a carteirinha de um dependente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={abrirCadastroManual} className="flex flex-col items-center text-center gap-2 border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl p-5 transition">
                  <PenLine className="w-6 h-6 text-emerald-600" />
                  <span className="font-semibold text-slate-800 text-sm">Cadastrar manualmente</span>
                  <span className="text-xs text-slate-500">Minha carteirinha</span>
                </button>

                <button onClick={() => abrirUpload('titular')} className="flex flex-col items-center text-center gap-2 border-2 border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 rounded-2xl p-5 transition">
                  <UploadCloud className="w-6 h-6 text-sky-600" />
                  <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">Enviar foto <Sparkles className="w-3.5 h-3.5 text-sky-500" /></span>
                  <span className="text-xs text-slate-500">Minha carteirinha</span>
                </button>

                <button onClick={() => abrirUpload('dependente')} className="flex flex-col items-center text-center gap-2 border-2 border-slate-200 hover:border-violet-500 hover:bg-violet-50/50 rounded-2xl p-5 transition">
                  <UserPlus className="w-6 h-6 text-violet-600" />
                  <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">Enviar foto <Sparkles className="w-3.5 h-3.5 text-violet-500" /></span>
                  <span className="text-xs text-slate-500">Carteirinha de um dependente</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button onClick={finalizarOnboarding} className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition flex items-center gap-1.5 mx-auto">
                  <Clock className="w-3.5 h-3.5" /> Prefiro fazer isso depois
                </button>
              </div>
            </div>
          )}

          {/* ===================== ETAPA 2a: MANUAL ===================== */}
          {etapa === 'manual' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PenLine className="w-5 h-5 text-emerald-600" /> Cadastro manual de vacina
              </h2>

              {erroVacina && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{erroVacina}</p>}
              {vacinaSalva && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Vacina registrada! Pode adicionar outra ou seguir em frente.
                </p>
              )}

              <form onSubmit={handleSalvarVacinaManual} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Vacina</span>
                    <select required value={formVacina.vacina} onChange={(e) => setFormVacina({ ...formVacina, vacina: e.target.value })} className="campo-input">
                      <option value="">Selecione</option>
                      {vacinasDisponiveis.map((v) => <option key={v.id} value={v.nome}>{v.nome}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Dose</span>
                    <input type="text" required placeholder="Ex.: 1ª dose, Dose única, Reforço" value={formVacina.dose} onChange={(e) => setFormVacina({ ...formVacina, dose: e.target.value })} className="campo-input" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Data da aplicação</span>
                    <input type="date" value={formVacina.dataAplicacao} onChange={(e) => setFormVacina({ ...formVacina, dataAplicacao: e.target.value })} className="campo-input" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Lote (opcional)</span>
                    <input type="text" value={formVacina.lote} onChange={(e) => setFormVacina({ ...formVacina, lote: e.target.value })} className="campo-input" />
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => setEtapa('carteirinha')} className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition">Voltar</button>
                  <div className="flex gap-3">
                    <button type="submit" disabled={salvandoVacina} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                      {salvandoVacina && <Loader2 className="w-4 h-4 animate-spin" />} Salvar vacina
                    </button>
                    <button type="button" onClick={finalizarOnboarding} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition">Concluir</button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ===================== ETAPA 2b: UPLOAD / IA (titular ou dependente) ===================== */}
          {etapa === 'upload' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {dono === 'dependente' ? <Users className="w-5 h-5 text-violet-600" /> : <UploadCloud className="w-5 h-5 text-sky-600" />}
                Carteirinha {dono === 'dependente' ? 'de dependente' : 'própria'}
                <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Claude Vision
                </span>
              </h2>

              {erroUpload && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{erroUpload}</p>}

              {concluidoUpload ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">
                    {dono === 'dependente'
                      ? `${dependente.nome} foi cadastrado(a) como dependente e a vacina foi registrada na carteira.`
                      : 'Vacina registrada na sua carteira.'}
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button onClick={() => abrirUpload(dono)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
                      Anexar outra carteirinha
                    </button>
                    <button onClick={finalizarOnboarding} className="btn-primary">Concluir</button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Cartão visual da carteirinha: placeholder antes do upload, preenchido com os dados lidos depois */}
                  <CartaoCarteirinha
                    dono={dono}
                    processando={processandoIA}
                    dados={dadosExtraidos}
                    imagem={imagemPreview}
                    onClickVazio={() => inputArquivoRef.current?.click()}
                  />

                  <input
                    ref={inputArquivoRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => { processarArquivo(e.target.files?.[0]); e.target.value = ''; }}
                  />

                  {!dadosExtraidos && !processandoIA && (
                    <button onClick={() => inputArquivoRef.current?.click()} className="w-full border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-slate-50/50 rounded-2xl py-4 text-sm font-semibold text-slate-600 transition flex items-center justify-center gap-2">
                      <UploadCloud className="w-4 h-4" /> Selecionar foto (PNG, JPG ou WEBP)
                    </button>
                  )}

                  {dadosExtraidos && dono === 'dependente' && (
                    <div className="space-y-3 bg-violet-50/60 border border-violet-100 rounded-2xl p-4">
                      <p className="text-xs font-bold text-violet-700 uppercase tracking-wide flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5" /> Confirme os dados do dependente
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block sm:col-span-2">
                          <span className="text-xs font-semibold text-slate-600 mb-1 block">Nome completo</span>
                          <input type="text" required value={dependente.nome} onChange={(e) => setDependente({ ...dependente, nome: e.target.value })} className="campo-input" placeholder={dadosExtraidos.nomeTitular ? '' : 'Não identificado na imagem, preencha aqui'} />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-slate-600 mb-1 block">Data de nascimento</span>
                          <input type="date" required value={dependente.data_nascimento} onChange={(e) => setDependente({ ...dependente, data_nascimento: e.target.value })} className="campo-input" />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-slate-600 mb-1 block">Parentesco</span>
                          <select value={dependente.parentesco} onChange={(e) => setDependente({ ...dependente, parentesco: e.target.value })} className="campo-input">
                            <option value="filho">Filho(a)</option>
                            <option value="pai">Pai</option>
                            <option value="mae">Mãe</option>
                            <option value="conjuge">Cônjuge</option>
                            <option value="outro">Outro</option>
                          </select>
                        </label>
                      </div>
                      <p className="text-[11px] text-violet-600">
                        {dadosExtraidos.nomeTitular
                          ? 'Nome e data de nascimento lidos da carteirinha — confira antes de confirmar.'
                          : 'Não conseguimos ler o nome/data de nascimento na imagem — preencha manualmente.'}
                      </p>
                    </div>
                  )}

                  {dadosExtraidos && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dados da vacina (revise antes de confirmar)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-xs font-semibold text-slate-600 mb-1 block">Vacina</span>
                          <input type="text" value={dadosExtraidos.vacina} onChange={(e) => setDadosExtraidos({ ...dadosExtraidos, vacina: e.target.value })} className="campo-input" />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-slate-600 mb-1 block">Dose</span>
                          <input type="text" value={dadosExtraidos.dose} onChange={(e) => setDadosExtraidos({ ...dadosExtraidos, dose: e.target.value })} className="campo-input" />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-slate-600 mb-1 block">Data da aplicação</span>
                          <input type="date" value={dadosExtraidos.dataAplicacao ?? ''} onChange={(e) => setDadosExtraidos({ ...dadosExtraidos, dataAplicacao: e.target.value })} className="campo-input" />
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button type="button" onClick={() => setEtapa('carteirinha')} className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition">Voltar</button>
                    {dadosExtraidos && (
                      <button onClick={handleConfirmarScan} disabled={salvandoScan} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                        {salvandoScan && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar e salvar
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/** Blobs decorativos em degradê, fixos no fundo da tela (atrás do card). */
function FundoDecorativo() {
  return (
    <div className="absolute inset-0 -z-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 opacity-40 blur-2xl" />
      <div className="absolute top-1/3 -right-28 w-96 h-96 rounded-full bg-gradient-to-br from-sky-200 to-sky-300 opacity-40 blur-2xl" />
      <div className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-teal-200 to-emerald-200 opacity-40 blur-2xl" />
    </div>
  );
}

/** Indicador de etapas numerado, com linha conectando os passos (estilo "1 - 2 - 3"). */
function Stepper({ etapaAtual }) {
  const indiceAtual = etapaAtual === 'dados' ? 0 : 1;

  return (
    <div className="flex items-center justify-center gap-3">
      {PASSOS.map((passo, i) => (
        <React.Fragment key={passo.chave}>
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                i < indiceAtual
                  ? 'bg-emerald-600 text-white'
                  : i === indiceAtual
                  ? 'bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-md shadow-emerald-900/20'
                  : 'bg-white text-slate-400 border border-slate-200'
              }`}
            >
              {i < indiceAtual ? <Check className="w-4 h-4" /> : passo.numero}
            </span>
            <span className={`text-[11px] font-semibold ${i <= indiceAtual ? 'text-slate-700' : 'text-slate-400'}`}>{passo.label}</span>
          </div>
          {i < PASSOS.length - 1 && (
            <div className={`w-16 h-0.5 rounded-full mb-5 transition ${i < indiceAtual ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Representação visual da carteirinha, no lugar de uma lista de
 * "anexos": antes do upload é um placeholder clicável; depois, mostra
 * a foto enviada como miniatura dentro do cartão junto com o nome da
 * vacina/titular já lidos pela IA.
 */
function CartaoCarteirinha({ dono, processando, dados, imagem, onClickVazio }) {
  const corBorda = dono === 'dependente' ? 'border-violet-300' : 'border-sky-300';
  const corGradiente = dono === 'dependente'
    ? 'from-violet-500 via-violet-400 to-fuchsia-400'
    : 'from-sky-500 via-sky-400 to-emerald-400';

  if (processando) {
    return (
      <div className={`rounded-2xl border-2 ${corBorda} border-dashed p-6 flex flex-col items-center justify-center min-h-[180px] bg-white/60`}>
        <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">O Claude está lendo a carteirinha...</p>
      </div>
    );
  }

  if (!dados) {
    return (
      <button
        onClick={onClickVazio}
        className={`w-full rounded-2xl border-2 ${corBorda} border-dashed p-8 flex flex-col items-center justify-center min-h-[180px] bg-white/60 hover:bg-white transition`}
      >
        <IdCard className="w-9 h-9 text-slate-300 mb-2" />
        <p className="text-sm font-semibold text-slate-500">Clique para enviar a foto da carteirinha</p>
      </button>
    );
  }

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${corGradiente} p-5 text-white shadow-lg relative overflow-hidden`}>
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-white/10" />

      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">Carteira de Vacinação</p>
          <p className="text-lg font-bold mt-0.5">{dados.nomeTitular || (dono === 'dependente' ? 'Dependente' : 'Titular')}</p>
          {dados.dataNascimentoTitular && <p className="text-xs text-white/80">Nasc.: {dados.dataNascimentoTitular}</p>}
        </div>
        {imagem ? (
          <img src={imagem} alt="Carteirinha enviada" className="w-16 h-16 rounded-lg object-cover border-2 border-white/40 shadow" />
        ) : (
          <IdCard className="w-8 h-8 text-white/70" />
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/70 uppercase tracking-wide">Vacina identificada</p>
          <p className="text-sm font-bold">{dados.vacina}</p>
        </div>
        <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full">{dados.dose}</span>
      </div>
    </div>
  );
}

function Campo({ label, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-slate-600 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
