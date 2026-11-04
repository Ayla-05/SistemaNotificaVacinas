import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  AlertTriangle,
  Syringe,
  MapPin,
  CalendarDays,
  Users,
  ChevronRight,
  Clock,
  PartyPopper,
  Lock,
  X
} from "lucide-react";
import {
  obterPendencias,
  obterAgendamentos,
  obterCarteira,
  obterDosesRegistro
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { BannerSaude } from "../components/IlustracaoSaude";
import Passeio from "../components/mascotes/Passeio";
import Chibi from "../components/mascotes/Chibi";
import { personagemDaVacina, artigoFadinha } from "../components/mascotes/catalogo";
import { ResumoDoses } from "../components/PainelVacina";
import { formatarData, descreverPrazo } from "../utils/formatacao";

const MESES_CURTOS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

const FAIXAS = {
  CRIANCA: "Criança",
  ADOLESCENTE: "Adolescente",
  ADULTO: "Adulto",
  IDOSO: "Idoso"
};

function calcularPorcentagem(resumo) {
  const total = resumo.em_dia.length + resumo.pendentes.length;
  return total > 0 ? Math.round((resumo.em_dia.length / total) * 100) : 0;
}

function iniciais(nome = "") {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

/** Anel de progresso (SVG) com o percentual no centro. */
function AnelProgresso({ valor, tamanho = 176 }) {
  const raio = 54;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = (valor / 100) * circunferencia;

  return (
    <div className="relative shrink-0" style={{ width: tamanho, height: tamanho }}>
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90" role="img" aria-label={`${valor}% das vacinas em dia`}>
        <defs>
          <linearGradient id="gAnel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#10b981" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r={raio} fill="none" stroke="#d1fae5" strokeWidth="13" />
        <circle
          cx="64"
          cy="64"
          r={raio}
          fill="none"
          stroke="url(#gAnel)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={`${preenchido} ${circunferencia}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-emerald-900 leading-none">{valor}%</span>
        <span className="text-sm font-bold text-slate-600 uppercase tracking-wide mt-1">em dia</span>
      </div>
    </div>
  );
}

/** Cartão do painel: título com ícone + link opcional. Cresce conforme o conteúdo. */
function Painel({ titulo, icone: Icone, linkTexto, linkPara, className = "", nome, children }) {
  return (
    <section
      data-perch="stand sit hold"
      data-perch-nome={nome ?? titulo}
      className={`flex flex-col bg-white rounded-3xl border border-emerald-900/10 shadow-sm shadow-emerald-900/5 p-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <h2 className="flex items-center gap-3 font-bold text-slate-900 text-xl">
          <span className="icon-chip w-10 h-10 rounded-xl shrink-0">
            <Icone className="w-5 h-5" />
          </span>
          {titulo}
        </h2>
        {linkPara && (
          <Link
            to={linkPara}
            className="text-base font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-900 flex items-center"
          >
            {linkTexto} <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

/** Cartão de uma vacina dentro do carrossel. */
function CartaoVacina({ item, aoClicar }) {
  const fadinha = personagemDaVacina(item.vacina);
  const pendente = item.tipo === "pendente";
  const atrasada = item.status === "ATRASADA";
  const progresso = item.necessarias > 0 ? Math.min(100, (item.tomadas / item.necessarias) * 100) : 0;

  const cores = !pendente
    ? { caixa: "bg-emerald-50 border-emerald-300 hover:border-emerald-500", icone: "text-emerald-700", barra: "bg-emerald-600", fundo: "bg-emerald-100", texto: "text-emerald-900" }
    : atrasada
      ? { caixa: "bg-rose-50 border-rose-300 hover:border-rose-500", icone: "text-rose-700", barra: "bg-rose-500", fundo: "bg-rose-100", texto: "text-rose-900" }
      : { caixa: "bg-amber-50 border-amber-300 hover:border-amber-500", icone: "text-amber-700", barra: "bg-amber-500", fundo: "bg-amber-100", texto: "text-amber-900" };

  return (
    <div className="pr-4 shrink-0">
      <button
        onClick={() => aoClicar(item)}
        className={`w-64 min-h-[150px] text-left rounded-2xl border-2 p-4 transition hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 ${cores.caixa}`}
      >
        <div className="flex items-start gap-3">
          <span className="relative w-14 shrink-0 -mt-1 -ml-1">
            <Chibi
              tema={fadinha.tema}
              genero={fadinha.genero}
              roupa={fadinha.roupa}
              cabelo={fadinha.cabelo}
              asas={fadinha.asas}
              estado={pendente ? "pendente" : "tomada"}
              largura={56}
              pose="parado"
              expressao={pendente ? "sonolento" : "sorrisao"}
              bloqueada={pendente}
            />
            {pendente && (
              <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center">
                <Lock className="w-3.5 h-3.5" />
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-lg text-slate-900 leading-snug">{item.vacina}</p>
            <p className="text-sm font-semibold text-slate-700">
              {pendente ? "Fadinha bloqueada" : `${fadinha.genero === "m" ? "Fadinho" : "Fadinha"} ${fadinha.nome}`}
            </p>
          </div>
        </div>
        <p className={`text-base font-semibold mt-3 ${cores.texto}`}>
          {pendente ? (atrasada ? "Atrasada" : "Pendente") : "Em dia"} · {item.tomadas}/{item.necessarias} {item.necessarias === 1 ? "dose" : "doses"}
        </p>
        <div className={`h-2.5 rounded-full mt-3 ${cores.fundo}`}>
          <div className={`h-2.5 rounded-full ${cores.barra}`} style={{ width: `${progresso}%` }} />
        </div>
      </button>
    </div>
  );
}

/** Janela com os detalhes da vacina clicada. */
function DetalhesVacina({ item, registro, proxima, doses, aoFechar }) {
  const pendente = item.tipo === "pendente";
  const fadinha = personagemDaVacina(item.vacina);
  const estadoFadinha = !pendente ? "tomada" : item.status === "ATRASADA" ? "atrasada" : "pendente";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={aoFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${item.vacina}`}
        className="bg-white rounded-3xl p-7 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={aoFechar} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100" aria-label="Fechar">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-5 pr-10">
          <span className={`w-24 shrink-0 rounded-2xl flex items-end justify-center pt-1 ${pendente ? "bg-amber-50" : "bg-emerald-50"}`}>
            <Chibi
              tema={fadinha.tema}
              genero={fadinha.genero}
              roupa={fadinha.roupa}
              cabelo={fadinha.cabelo}
              asas={fadinha.asas}
              estado={estadoFadinha}
              largura={84}
              pose={pendente ? "parado" : "comemorar"}
              expressao={pendente ? "sonolento" : "risada"}
              bloqueada={pendente}
            />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{item.vacina}</h2>
            <span className={`inline-block mt-1 text-base font-bold px-3 py-0.5 rounded-full ${pendente ? (item.status === "ATRASADA" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-900") : "bg-emerald-100 text-emerald-900"}`}>
              {pendente ? (item.status === "ATRASADA" ? "Atrasada" : "Pendente") : "Em dia"}
            </span>
          </div>
        </div>

        <div className="space-y-4 text-lg text-slate-800">
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-base text-emerald-950">
            {!pendente
              ? `Oi! Eu sou ${fadinha.nome}, ${artigoFadinha(fadinha.genero)} da vacina ${item.vacina}. Você me desbloqueou, obrigado!`
              : `Tome esta vacina para desbloquear ${artigoFadinha(fadinha.genero)} ${fadinha.nome}, que vai passear com você pelo sistema.`}
          </p>
          {registro?.descricao && <p>{registro.descricao}</p>}

          {registro?.doencas_evitadas && (
            <p>
              <strong>Protege contra:</strong> {registro.doencas_evitadas}
            </p>
          )}

          <ResumoDoses item={item} proxima={proxima} doses={doses} />

          {doses?.length > 0 && (
            <div>
              <p className="font-bold mb-2">Histórico</p>
              <ul className="space-y-2">
                {doses.map((d) => (
                  <li key={d.id} className="flex flex-wrap justify-between gap-x-4 bg-emerald-50 rounded-xl px-4 py-3 text-base">
                    <span className="font-semibold">{d.tipo || `Dose ${d.numero_dose}`}</span>
                    <span className="text-slate-700">
                      {d.data_aplicacao ? formatarData(d.data_aplicacao) : "sem data"}
                      {d.lote ? ` · lote ${d.lote}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Link
          to={pendente ? "/calendario" : "/carteira"}
          className="btn-primary mt-6 w-full flex items-center justify-center gap-2 text-lg !py-3"
        >
          {pendente ? "Agendar no calendário" : "Ver na carteira"}
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { pessoas, pessoaAtiva, selecionarPessoa } = useAuth();
  const [dados, setDados] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carteira, setCarteira] = useState([]);
  const [familia, setFamilia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [vacinaAberta, setVacinaAberta] = useState(null);
  const [dosesAbertas, setDosesAbertas] = useState([]);
  const [mostrarPersonagens, setMostrarPersonagens] = useState(() => {
    try {
      return localStorage.getItem("personagens") !== "off";
    } catch {
      return true;
    }
  });

  function alternarPersonagens() {
    const novo = !mostrarPersonagens;
    setMostrarPersonagens(novo);
    try {
      localStorage.setItem("personagens", novo ? "on" : "off");
    } catch {
      // sem armazenamento: vale só nesta visita
    }
  }

  // Dados completos da pessoa em exibição
  useEffect(() => {
    if (!pessoaAtiva) {
      setLoading(false);
      return;
    }

    async function carregar() {
      try {
        const [resumo, lista, reg] = await Promise.all([
          obterPendencias(pessoaAtiva.id),
          obterAgendamentos(pessoaAtiva.id).catch(() => []),
          obterCarteira(pessoaAtiva.id).catch(() => [])
        ]);
        setDados(resumo);
        setAgendamentos(lista);
        setCarteira(reg);
      } catch (erroCapturado) {
        console.error(erroCapturado);
        setErro(erroCapturado.message);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [pessoaAtiva]);

  // Resumo rápido de cada pessoa da conta (titular + dependentes)
  useEffect(() => {
    if (!pessoas?.length) return;

    Promise.all(
      pessoas.map((p) =>
        obterPendencias(p.id)
          .then((r) => ({ pessoa: p, resumo: r }))
          .catch(() => ({ pessoa: p, resumo: null }))
      )
    ).then(setFamilia);
  }, [pessoas]);

  // Vacinas (pendentes primeiro, depois em dia) usadas no carrossel
  const base = useMemo(() => {
    if (!dados) return [];
    return [
      ...dados.pendentes.map((v) => ({ ...v, tipo: "pendente" })),
      ...dados.em_dia.map((v) => ({ ...v, tipo: "tomada" }))
    ];
  }, [dados]);

  // Até 3 personagens passeiam pela tela: 2 vacinas pendentes e 1 em dia
  const personagens = useMemo(
    // só as fadinhas das vacinas em dia (desbloqueadas) passeiam pela tela
    () =>
      base
        .filter((v) => v.tipo === "tomada")
        .slice(0, 6)
        .map((v) => {
          const pc = personagemDaVacina(v.vacina);
          return { id: v.vacina, vacina: v.vacina, nome: pc.nome, genero: pc.genero, tema: pc.tema, roupa: pc.roupa, cabelo: pc.cabelo, asas: pc.asas, estado: "tomada" };
        }),
    [base]
  );

  function abrirVacina(item) {
    setVacinaAberta(item);
    setDosesAbertas([]);

    const registro = carteira.find((r) => r.nome === item.vacina);
    if (registro) {
      obterDosesRegistro(registro.id).then(setDosesAbertas).catch(() => {});
    }
  }

  function abrirPorPersonagem(p) {
    const item = base.find((v) => v.vacina === p.vacina);
    if (item) abrirVacina(item);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-slate-700">Carregando informações...</p>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="card text-lg">
        {erro
          ? `Erro ao carregar dados: ${erro}`
          : "Nenhuma pessoa vinculada à sua conta ainda."}
      </div>
    );
  }

  const total = dados.em_dia.length + dados.pendentes.length;
  const fadinhasLivres = base.filter((v) => v.tipo === "tomada").length;
  const porcentagem = calcularPorcentagem(dados);
  const proxima = dados.pendentes[0];

  const agora = new Date();
  const hojeISO = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
  const proximosAgendamentos = agendamentos
    .filter((a) => a.status === "PENDENTE" && a.data_prevista >= hojeISO)
    .slice(0, 4);

  const dataExtenso = agora.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  // Carrossel: repete a lista até preencher a faixa; a trilha é renderizada 2x para o laço.
  let cartoes = base;
  while (cartoes.length > 0 && cartoes.length < 8) {
    cartoes = [...cartoes, ...cartoes];
  }
  const duracao = Math.max(30, cartoes.length * 5);

  const registroAberto = vacinaAberta ? carteira.find((r) => r.nome === vacinaAberta.vacina) : null;
  const proximaDoseAberta = vacinaAberta
    ? dados.proximas?.find((p) => p.vacina === vacinaAberta.vacina)
    : null;

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 pb-6">

      {/* BANNER */}
      <div
        data-perch="stand sit"
        data-perch-nome="Seu resumo"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-600 to-sky-600 text-white shadow-lg shadow-emerald-900/10"
      >
        <BannerSaude />
        <div className="relative z-10 p-7 lg:p-9 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="min-w-0">
            <p className="text-white text-base font-semibold capitalize">{dataExtenso}</p>
            <h1 className="text-4xl lg:text-5xl font-extrabold mt-1">Olá, {dados.pessoa.split(" ")[0]}!</h1>
            <p className="text-lg text-white mt-2">
              {dados.pendentes.length === 0
                ? "Parabéns! Sua carteira de vacinação está em dia."
                : `${dados.pendentes.length} vacina${dados.pendentes.length === 1 ? "" : "s"} para atualizar. Vamos cuidar disso?`}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="px-4 py-1.5 rounded-full bg-black/25 text-base font-semibold">
                {FAIXAS[dados.faixa_etaria] ?? dados.faixa_etaria} · {dados.idade} anos
              </span>
              <span className="px-4 py-1.5 rounded-full bg-black/25 text-base font-semibold">
                Calendário Nacional 2026
              </span>
              <span className="px-4 py-1.5 rounded-full bg-black/25 text-base font-semibold">
                Fadinhas: {fadinhasLivres} de {base.length}
              </span>
              <button
                type="button"
                onClick={alternarPersonagens}
                aria-pressed={mostrarPersonagens}
                className="px-4 py-1.5 rounded-full bg-white text-emerald-900 text-base font-semibold hover:bg-emerald-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
              >
                Personagens: {mostrarPersonagens ? "ligados" : "desligados"}
              </button>
            </div>
          </div>

          {/* Próxima vacina recomendada */}
          {proxima ? (
            <div
              data-perch="stand sit"
              data-perch-nome="A próxima vacina"
              className="xl:max-w-lg rounded-2xl bg-white text-slate-900 p-5 shadow-lg flex flex-wrap items-center gap-4"
            >
              <span className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-bold uppercase tracking-wide text-amber-800">Próxima vacina recomendada</p>
                <p className="font-extrabold text-xl leading-tight">{proxima.vacina}</p>
                <p className="text-base text-slate-700">{proxima.rotulo}: {descreverPrazo(proxima)}</p>
              </div>
              <a
                href="https://www.google.com/maps/search/UBS+pr%C3%B3xima"
                target="_blank"
                rel="noreferrer"
                className="btn-primary flex items-center justify-center gap-2 text-base !py-3 w-full sm:w-auto"
              >
                <MapPin size={18} /> Encontrar UBS
              </a>
            </div>
          ) : (
            <div className="rounded-2xl bg-white text-emerald-800 px-6 py-4 shadow-lg flex items-center gap-3 font-bold text-xl">
              <PartyPopper className="w-6 h-6" /> Tudo em dia!
            </div>
          )}
        </div>
      </div>

      {/* PAINÉIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">

        <Painel titulo="Status vacinal" icone={ShieldCheck} linkTexto="Ver carteira" linkPara="/carteira">
          <div className="flex flex-wrap items-center justify-center gap-8 h-full">
            <AnelProgresso valor={porcentagem} />
            <ul className="space-y-4 min-w-[180px]">
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-emerald-600 shrink-0" />
                <span className="text-4xl font-extrabold text-slate-900 w-12">{dados.em_dia.length}</span>
                <span className="text-lg text-slate-700">em dia</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-amber-500 shrink-0" />
                <span className="text-4xl font-extrabold text-slate-900 w-12">{dados.pendentes.length}</span>
                <span className="text-lg text-slate-700">pendentes</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-sky-500 shrink-0" />
                <span className="text-4xl font-extrabold text-slate-900 w-12">{total}</span>
                <span className="text-lg text-slate-700">avaliadas</span>
              </li>
            </ul>
          </div>
        </Painel>

        <Painel titulo="Próximas doses" icone={Clock} linkTexto="Calendário" linkPara="/calendario">
          {dados.proximas?.length > 0 ? (
            <ul className="space-y-3">
              {dados.proximas.slice(0, 4).map((item) => (
                <li
                  key={`${item.vacina}-${item.rotulo}`}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-emerald-50 rounded-2xl px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-lg text-slate-900">{item.vacina}</p>
                    <p className="text-base text-slate-700">{item.rotulo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-900">{formatarData(item.data_prevista)}</p>
                    <p className={`text-base ${item.status === 'PROXIMA' ? 'text-amber-800 font-bold' : 'text-slate-600'}`}>
                      {item.dias_para_vencer === 0 ? "hoje" : `em ${item.dias_para_vencer} dias`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg text-slate-600 py-8 text-center">Nenhuma dose prevista por enquanto.</p>
          )}
        </Painel>

        <Painel titulo="Agendamentos" icone={CalendarDays} linkTexto="Ver todos" linkPara="/calendario" className="lg:col-span-2 2xl:col-span-1">
          {proximosAgendamentos.length > 0 ? (
            <ul className="space-y-3">
              {proximosAgendamentos.map((a) => {
                const [, mes, dia] = a.data_prevista.split("-");
                return (
                  <li key={a.id} className="flex items-center gap-4 bg-sky-50 rounded-2xl px-5 py-4">
                    <div className="w-16 shrink-0 rounded-xl bg-gradient-to-b from-emerald-600 to-sky-600 text-white text-center py-2">
                      <p className="text-2xl font-extrabold leading-none">{dia}</p>
                      <p className="text-sm font-bold tracking-wider">{MESES_CURTOS[Number(mes) - 1]}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-lg text-slate-900">{a.vacina}</p>
                      <p className="text-base text-slate-700">Dose {a.numero_dose}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-6 text-slate-700">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 text-slate-500" />
              <p className="text-lg">Nenhum agendamento.</p>
              <Link to="/calendario" className="text-base font-semibold text-emerald-800 underline">
                Agendar uma dose
              </Link>
            </div>
          )}
        </Painel>
      </div>

      {/* FAMÍLIA */}
      {familia.length > 1 && (
        <Painel titulo="Família" icone={Users} linkTexto="Dependentes" linkPara="/dependentes">
          <ul className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            {familia.map(({ pessoa, resumo }) => {
              const pct = resumo ? calcularPorcentagem(resumo) : 0;
              const ativa = pessoa.id === pessoaAtiva?.id;
              return (
                <li key={pessoa.id}>
                  <button
                    onClick={() => selecionarPessoa(pessoa.id)}
                    aria-pressed={ativa}
                    className={`w-full flex items-center gap-4 text-left rounded-2xl border-2 px-5 py-4 transition hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 ${
                      ativa ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-white text-lg font-bold flex items-center justify-center shrink-0">
                      {iniciais(pessoa.nome)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-bold text-lg text-slate-900">{pessoa.nome}</span>
                      <span className="block h-2.5 bg-slate-200 rounded-full mt-2">
                        <span className="block h-2.5 bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="block text-base text-slate-700 mt-1.5">
                        {resumo
                          ? resumo.pendentes.length === 0
                            ? "Tudo em dia"
                            : `${pct}% em dia · ${resumo.pendentes.length} pendente${resumo.pendentes.length === 1 ? "" : "s"}`
                          : "Sem dados"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Painel>
      )}

      {/* CARROSSEL DE VACINAS */}
      <section
        data-perch="stand sit"
        data-perch-nome="Minhas vacinas"
        className="bg-white rounded-3xl border border-emerald-900/10 shadow-sm shadow-emerald-900/5 p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <h2 className="flex items-center gap-3 font-bold text-slate-900 text-xl">
            <span className="icon-chip w-10 h-10 rounded-xl">
              <Syringe className="w-5 h-5" />
            </span>
            Minhas vacinas
          </h2>
          <span className="text-base text-slate-700">
            Passe o mouse para pausar · clique para ver os detalhes
          </span>
        </div>

        {cartoes.length > 0 ? (
          <div className="marquee py-1" style={{ "--duracao": `${duracao}s` }}>
            <div className="marquee-track">
              {[0, 1].map((copia) =>
                cartoes.map((item, i) => (
                  <CartaoVacina
                    key={`${copia}-${i}-${item.vacina}`}
                    item={item}
                    aoClicar={abrirVacina}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <p className="text-lg text-slate-600 py-8 text-center">
            Nenhuma vacina registrada ainda. Escaneie sua carteirinha para começar.
          </p>
        )}
      </section>

      {mostrarPersonagens && <Passeio personagens={personagens} onAbrir={abrirPorPersonagem} />}

      {vacinaAberta && (
        <DetalhesVacina
          item={vacinaAberta}
          registro={registroAberto}
          proxima={proximaDoseAberta}
          doses={dosesAbertas}
          aoFechar={() => setVacinaAberta(null)}
        />
      )}
    </div>
  );
}
