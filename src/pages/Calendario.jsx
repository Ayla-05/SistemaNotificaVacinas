import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Syringe,
  X
} from "lucide-react";

const API_URL = "http://localhost:3001";

export default function Calendario() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);

  const [mesAtual, setMesAtual] = useState(new Date());

  useEffect(() => {
    async function carregar() {
      try {
        const response = await fetch(
          `${API_URL}/agendamentos/1`
        );

        const json = await response.json();

        setAgendamentos(json);
      } catch (erro) {
        console.error(erro);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

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

      <div>

        <h1 className="text-4xl font-bold text-slate-800">
          Calendário Vacinal
        </h1>

        <p className="text-slate-500 mt-1">
          Datas previstas para aplicação
          das próximas doses.
        </p>

      </div>

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
                    key={index}
                    className="h-28"
                  />
                );
              }

              const eventos =
                eventosDoDia(dia);

              return (

                <div
                  key={dia}
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

          </div>

        </div>

      )}

    </div>
  );
}