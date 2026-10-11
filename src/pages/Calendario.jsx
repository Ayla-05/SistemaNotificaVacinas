import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Syringe,
  X,
  PlusCircle,
  Trash2,
  Loader2
} from "lucide-react";
import { obterAgendamentos, criarAgendamento, removerAgendamento, obterVacinas } from "../services/api";
import SeletorDose from "../components/SeletorDose";
import { useAuth } from "../context/AuthContext";

const FORM_VAZIO = { vacinaId: "", dose: "", dataPrevista: "", observacao: "" };

export default function Calendario() {
  const { pessoaAtiva } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [vacinasDisponiveis, setVacinasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [mesAtual, setMesAtual] = useState(new Date());

  async function carregar() {
    if (!pessoaAtiva) {
      setLoading(false);
      return;
    }

    try {
      const lista = await obterAgendamentos(pessoaAtiva.id);
      setAgendamentos(lista);
    } catch (erro) {
      console.error(erro);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pessoaAtiva]);

  function abrirForm() {
    setErroForm("");
    setForm(FORM_VAZIO);
    if (vacinasDisponiveis.length === 0) {
      obterVacinas().then(setVacinasDisponiveis).catch(() => {});
    }
    setMostrarForm(true);
  }

  async function handleSalvarAgendamento(e) {
    e.preventDefault();
    setErroForm("");

    const numeroDose =
      form.dose === 'Dose única'
        ? 1
        : Number(form.dose.match(/\d+/)?.[0]);

    if (!numeroDose) {
      setErroForm('Escolha uma dose numerada (ex.: "1ª dose") ou "Dose única" para agendar. "Reforço" não tem um número fixo — use "Outra quantidade de doses" e informe o número.');
      return;
    }

    setSalvando(true);

    try {
      await criarAgendamento({
        pessoaId: pessoaAtiva.id,
        vacinaId: Number(form.vacinaId),
        numeroDose,
        dataPrevista: form.dataPrevista,
        observacao: form.observacao || undefined
      });

      setMostrarForm(false);
      setForm(FORM_VAZIO);
      await carregar();
    } catch (erroCapturado) {
      setErroForm(erroCapturado.message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemoverAgendamento() {
    setRemovendo(true);

    try {
      await removerAgendamento(eventoSelecionado.id);
      setEventoSelecionado(null);
      await carregar();
    } catch (erro) {
      console.error(erro);
    } finally {
      setRemovendo(false);
    }
  }

  const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ];

  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();

  const primeiroDia = new Date(ano, mes, 1);

  const ultimoDia = new Date(
    ano,
    mes + 1,
    0
  );

  const quantidadeDias =
    ultimoDia.getDate();

  const primeiroDiaSemana =
    primeiroDia.getDay();

  const diasCalendario = useMemo(() => {

    const dias = [];

    for (
      let i = 0;
      i < primeiroDiaSemana;
      i++
    ) {
      dias.push(null);
    }

    for (
      let dia = 1;
      dia <= quantidadeDias;
      dia++
    ) {
      dias.push(dia);
    }

    return dias;

  }, [
    primeiroDiaSemana,
    quantidadeDias
  ]);

  function eventosDoDia(dia) {

    const dataEsperada =
      `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

    return agendamentos.filter(
      evento =>
        evento.data_prevista ===
        dataEsperada
    );
  }

  function mudarMes(valor) {

    const novaData = new Date(
      mesAtual
    );

    novaData.setMonth(
      novaData.getMonth() + valor
    );

    setMesAtual(novaData);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-3 text-slate-500">
            Carregando calendário...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between gap-4">

        <div>

          <h1 className="text-4xl font-bold text-slate-800">
            Calendário Vacinal
          </h1>

          <p className="text-slate-500 mt-1">
            Datas previstas para aplicação
            das próximas doses.
          </p>

        </div>

        <button onClick={abrirForm} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <PlusCircle className="w-4 h-4" /> Novo agendamento
        </button>

      </div>

      {/* FORMULÁRIO DE NOVO AGENDAMENTO */}

      {mostrarForm && (
        <form onSubmit={handleSalvarAgendamento} className="card space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" /> Agendar aplicação de dose
          </h2>

          {erroForm && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{erroForm}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Vacina</span>
              <select
                required
                value={form.vacinaId}
                onChange={(e) => setForm({ ...form, vacinaId: e.target.value })}
                className="campo-input"
              >
                <option value="">Selecione</option>
                {vacinasDisponiveis.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Dose</span>
              <SeletorDose value={form.dose} onChange={(dose) => setForm({ ...form, dose })} />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Data prevista</span>
              <input
                type="date"
                required
                value={form.dataPrevista}
                onChange={(e) => setForm({ ...form, dataPrevista: e.target.value })}
                className="campo-input"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Observação (opcional)</span>
              <input
                type="text"
                value={form.observacao}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                className="campo-input"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={salvando} className="btn-primary flex items-center gap-2 disabled:opacity-60">
              {salvando && <Loader2 className="w-4 h-4 animate-spin" />} Salvar agendamento
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* CARD PRINCIPAL */}

      <div className="card">

        <div className="flex items-center justify-between mb-6">

          <button
            onClick={() =>
              mudarMes(-1)
            }
            className="p-2 hover:bg-slate-100 rounded-xl transition"
          >
            <ChevronLeft />
          </button>

          <div className="text-center">

            <h2 className="text-2xl font-bold text-green-700">
              {nomesMeses[mes]}
            </h2>

            <p className="text-slate-500">
              {ano}
            </p>

          </div>

          <button
            onClick={() =>
              mudarMes(1)
            }
            className="p-2 hover:bg-slate-100 rounded-xl transition"
          >
            <ChevronRight />
          </button>

        </div>

        {/* DIAS DA SEMANA */}

        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-bold text-slate-500">

          <div>DOM</div>
          <div>SEG</div>
          <div>TER</div>
          <div>QUA</div>
          <div>QUI</div>
          <div>SEX</div>
          <div>SAB</div>

        </div>

        {/* GRID */}

        <div className="grid grid-cols-7 gap-2">

          {diasCalendario.map(
            (dia, index) => {

              if (!dia) {
                return (
                  <div
                    key={`vazio-${index}`}
                    className="h-28"
                  />
                );
              }

              const eventos =
                eventosDoDia(dia);

              return (

                <div
                  key={`dia-${dia}`}
                  className="min-h-[120px] bg-slate-50 border border-slate-200 rounded-2xl p-2"
                >

                  <div className="font-bold text-sm text-slate-700 mb-2">
                    {dia}
                  </div>

                  <div className="space-y-1">

                    {eventos.map(
                      (evento) => (

                        <button
                          key={evento.id}
                          onClick={() =>
                            setEventoSelecionado(
                              evento
                            )
                          }
                          className="w-full text-left px-2 py-1 rounded-lg bg-green-100 hover:bg-green-200 text-green-800 text-xs font-semibold transition"
                        >

                          D{evento.numero_dose} •{" "}
                          {evento.vacina}

                        </button>
                      )
                    )}

                  </div>

                </div>

              );
            }
          )}

        </div>

      </div>

      {/* LISTA RÁPIDA */}

      <div className="card">

        <div className="flex items-center gap-2 mb-4">

          <CalendarDays
            className="text-green-600"
            size={20}
          />

          <h2 className="font-bold text-lg">
            Próximas Aplicações
          </h2>

        </div>

        <div className="space-y-3">

          {agendamentos.map(
            (item) => {

              const data =
                new Date(
                  item.data_prevista
                );

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-green-50 border border-green-200 rounded-xl px-4 py-3"
                >

                  <div>

                    <div className="font-semibold">
                      {item.vacina}
                    </div>

                    <div className="text-sm text-slate-500">
                      Dose {item.numero_dose}
                    </div>

                  </div>

                  <div className="text-sm font-semibold text-green-700">
                    {data.toLocaleDateString(
                      "pt-BR"
                    )}
                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

      {/* MODAL */}

      {eventoSelecionado && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-3xl p-6 w-full max-w-md relative">

            <button
              onClick={() =>
                setEventoSelecionado(null)
              }
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <div className="flex items-center gap-3 mb-4">

              <Syringe
                className="text-green-600"
              />

              <h2 className="text-xl font-bold">
                {eventoSelecionado.vacina}
              </h2>

            </div>

            <div className="space-y-3">

              <div>
                <strong>Dose:</strong>{" "}
                {eventoSelecionado.numero_dose}
              </div>

              <div>
                <strong>Data:</strong>{" "}
                {new Date(
                  eventoSelecionado.data_prevista
                ).toLocaleDateString(
                  "pt-BR"
                )}
              </div>

              <div>
                <strong>Status:</strong>{" "}
                {eventoSelecionado.status}
              </div>

              <div>
                <strong>Observação:</strong>{" "}
                {eventoSelecionado.observacao}
              </div>

            </div>

            <button
              onClick={handleRemoverAgendamento}
              disabled={removendo}
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-50 transition disabled:opacity-60"
            >
              {removendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Remover agendamento
            </button>

          </div>

        </div>

      )}

    </div>
  );
}