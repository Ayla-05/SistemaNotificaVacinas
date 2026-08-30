import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Syringe,
  MapPin,
  UserCircle
} from "lucide-react";

const API_URL = "http://localhost:3001";

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const response = await fetch(
          `${API_URL}/pendencias/1`
        );

        const json = await response.json();

        setDados(json);
      } catch (erro) {
        console.error(erro);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-slate-500">
            Carregando informações...
          </p>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="card">
        Erro ao carregar dados.
      </div>
    );
  }

  const total =
    dados.em_dia.length +
    dados.pendentes.length;

  const porcentagem =
    total > 0
      ? Math.round(
          (dados.em_dia.length / total) * 100
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* HERO */}

      <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 rounded-3xl p-8 text-white shadow-xl">

        <div className="flex flex-col lg:flex-row justify-between gap-8">

          <div>

            <div className="flex items-center gap-3 mb-4">

              <UserCircle size={42} />

              <div>

                <h1 className="text-4xl font-bold">
                  Olá, {dados.pessoa}
                </h1>

                <p className="text-green-100">
                  {dados.faixa_etaria} • {dados.idade} anos
                </p>

              </div>

            </div>

            <p className="text-green-100 max-w-2xl">
              Seu calendário vacinal foi analisado
              com base nas informações cadastradas
              e nas recomendações do calendário
              nacional.
            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 min-w-[260px]">

            <p className="text-sm text-green-100">
              Progresso Vacinal
            </p>

            <div className="mt-2 text-4xl font-bold">
              {porcentagem}%
            </div>

            <div className="w-full bg-white/20 rounded-full h-3 mt-4">

              <div
                className="bg-white h-3 rounded-full"
                style={{
                  width: `${porcentagem}%`
                }}
              />

            </div>

            <div className="mt-4 text-sm text-green-100">

              ✅ {dados.em_dia.length} em dia

              <br />

              ⚠ {dados.pendentes.length} pendentes

            </div>

          </div>

        </div>

      </div>

      {/* CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="card hover:shadow-lg transition">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500 text-sm">
                Em Dia
              </p>

              <h2 className="text-5xl font-bold text-green-600">
                {dados.em_dia.length}
              </h2>

            </div>

            <ShieldCheck
              className="text-green-600"
              size={42}
            />

          </div>

        </div>

        <div className="card hover:shadow-lg transition">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500 text-sm">
                Pendentes
              </p>

              <h2 className="text-5xl font-bold text-amber-500">
                {dados.pendentes.length}
              </h2>

            </div>

            <AlertTriangle
              className="text-amber-500"
              size={42}
            />

          </div>

        </div>

        <div className="card hover:shadow-lg transition">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500 text-sm">
                Total Avaliado
              </p>

              <h2 className="text-5xl font-bold text-emerald-600">
                {total}
              </h2>

            </div>

            <Syringe
              className="text-emerald-600"
              size={42}
            />

          </div>

        </div>

      </div>

      {/* ALERTA */}

      {dados.pendentes.length > 0 && (

        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">

          <div className="flex gap-3">

            <AlertTriangle
              className="text-amber-600"
            />

            <div>

              <h2 className="font-bold text-xl text-amber-800">
                Próxima Vacina Recomendada
              </h2>

              <p className="mt-2">
                <strong>
                  {dados.pendentes[0].vacina}
                </strong>
              </p>

              <p className="text-sm text-slate-600 mt-1">
                Faltam{" "}
                {dados.pendentes[0].faltam} dose(s)
              </p>

              <button className="btn-primary mt-4 flex items-center gap-2">

                <MapPin size={16} />

                Encontrar UBS Próxima

              </button>

            </div>

          </div>

        </div>

      )}

      {/* LISTAS */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <div className="card">

          <h2 className="text-2xl font-bold text-green-700 mb-5">
            ✅ Vacinas em Dia
          </h2>

          <div className="space-y-4">

            {dados.em_dia.map((vacina) => (

              <div
                key={vacina.vacina}
                className="bg-green-50 border border-green-200 rounded-2xl p-4"
              >

                <div className="flex justify-between">

                  <strong>
                    {vacina.vacina}
                  </strong>

                  <span className="badge badge-success">
                    Em dia
                  </span>

                </div>

                <p className="text-sm mt-2 text-slate-600">
                  {vacina.tomadas}/
                  {vacina.necessarias} doses
                </p>

                <div className="w-full h-2 bg-green-100 rounded-full mt-3">

                  <div
                    className="h-2 bg-green-500 rounded-full w-full"
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

        <div className="card">

          <h2 className="text-2xl font-bold text-amber-700 mb-5">
            ⚠ Vacinas Pendentes
          </h2>

          <div className="space-y-4">

            {dados.pendentes.map((vacina) => {

              const progresso =
                (vacina.tomadas /
                  vacina.necessarias) * 100;

              return (

                <div
                  key={vacina.vacina}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
                >

                  <div className="flex justify-between">

                    <strong>
                      {vacina.vacina}
                    </strong>

                    <span className="badge badge-warning">
                      Pendente
                    </span>

                  </div>

                  <p className="text-sm mt-2">
                    {vacina.tomadas}/
                    {vacina.necessarias} doses
                  </p>

                  <p className="text-sm text-red-600 font-semibold mt-1">
                    Faltam {vacina.faltam} dose(s)
                  </p>

                  <div className="w-full h-2 bg-amber-100 rounded-full mt-3">

                    <div
                      className="h-2 bg-amber-500 rounded-full"
                      style={{
                        width: `${progresso}%`
                      }}
                    />

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      </div>

    </div>
  );
}