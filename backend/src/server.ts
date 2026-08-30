import express from "express";
import cors from "cors";
import axios from "axios";

import { db } from "./database/database";

const app = express();

app.use(cors());
app.use(express.json());

/*
========================================
HEALTH CHECK
========================================
*/
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend Notifica Vacinas funcionando"
  });
});

/*
========================================
LISTAR VACINAS
GET /vacinas
========================================
*/
app.get("/vacinas", (_req, res) => {
  db.all(
    `
      SELECT *
      FROM vacinas
      ORDER BY nome
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          erro: err.message
        });
      }

      res.json(rows);
    }
  );
});

/*
========================================
LISTAR CALENDÁRIO
GET /calendario
========================================
*/
app.get("/calendario", (_req, res) => {
  db.all(
    `
      SELECT
        c.id,
        v.nome AS vacina,
        c.faixa_etaria,
        c.doses,
        c.reforcos,
        c.observacao
      FROM calendario_vacinal c
      INNER JOIN vacinas v
        ON v.id = c.vacina_id
      ORDER BY c.faixa_etaria, v.nome
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          erro: err.message
        });
      }

      res.json(rows);
    }
  );
});

/*
========================================
BUSCAR CEP
GET /cep/:cep
========================================
*/
app.get("/cep/:cep", async (req, res) => {
  try {
    const { cep } = req.params;

    const cepLimpo = cep.replace(/\D/g, "");

    const response = await axios.get(
      `https://viacep.com.br/ws/${cepLimpo}/json/`
    );

    if (response.data.erro) {
      return res.status(404).json({
        erro: "CEP não encontrado"
      });
    }

    return res.json({
      cep: response.data.cep,
      logradouro: response.data.logradouro,
      complemento: response.data.complemento,
      bairro: response.data.bairro,
      cidade: response.data.localidade,
      estado: response.data.uf,
      ibge: response.data.ibge
    });
  } catch {
    return res.status(500).json({
      erro: "Erro ao consultar CEP"
    });
  }
});

/*
========================================
CRIAR PESSOA
POST /pessoas
========================================
*/
app.post("/pessoas", (req, res) => {
  const {
    nome,
    email,
    telefone,

    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,

    receber_email = 1,
    receber_whatsapp = 1,

    data_nascimento,

    gestante = 0,
    trabalhador_saude = 0,
    indigena = 0,
    imunocomprometido = 0
  } = req.body;

  db.run(
    `
      INSERT INTO pessoas (
        nome,
        email,
        telefone,

        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,

        receber_email,
        receber_whatsapp,

        data_nascimento,

        gestante,
        trabalhador_saude,
        indigena,
        imunocomprometido
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      nome,
      email,
      telefone,

      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,

      receber_email,
      receber_whatsapp,

      data_nascimento,

      gestante,
      trabalhador_saude,
      indigena,
      imunocomprometido
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          erro: err.message
        });
      }

      res.status(201).json({
        id: this.lastID,
        mensagem: "Pessoa cadastrada com sucesso"
      });
    }
  );
});

/*
========================================
LISTAR PESSOAS
GET /pessoas
========================================
*/
app.get("/pessoas", (_req, res) => {
  db.all(
    `
      SELECT *
      FROM pessoas
      ORDER BY id
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          erro: err.message
        });
      }

      res.json(rows);
    }
  );
});

/*
========================================
BUSCAR PESSOA
GET /pessoas/:id
========================================
*/
app.get("/pessoas/:id", (req, res) => {
  db.get(
    `
      SELECT *
      FROM pessoas
      WHERE id = ?
    `,
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          erro: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          erro: "Pessoa não encontrada"
        });
      }

      res.json(row);
    }
  );
});

/*
========================================
CADASTRAR VACINA NA CARTEIRA
POST /carteira
========================================
*/
app.post("/carteira", (req, res) => {
  const {
    pessoa_id,
    vacina_id,
    quantidade_doses
  } = req.body;

  db.run(
    `
      INSERT INTO registros_vacinacao (
        pessoa_id,
        vacina_id
      )
      VALUES (?, ?)
    `,
    [pessoa_id, vacina_id],
    function (err) {
      if (err) {
        return res.status(500).json({
          erro: err.message
        });
      }

      const registroId = this.lastID;

      const stmt = db.prepare(`
        INSERT INTO doses_vacina (
          registro_vacinacao_id,
          numero_dose,
          tipo
        )
        VALUES (?, ?, 'DOSE')
      `);

      for (let i = 1; i <= quantidade_doses; i++) {
        stmt.run(registroId, i);
      }

      stmt.finalize();

      res.status(201).json({
        registro_id: registroId,
        mensagem: "Carteira atualizada com sucesso"
      });
    }
  );
});

/*
========================================
CONSULTAR CARTEIRA
GET /carteira/:pessoaId
========================================
*/
app.get("/carteira/:pessoaId", (req, res) => {

  const { pessoaId } = req.params;

  db.all(
    `
    SELECT
      v.nome AS vacina,
      COUNT(dv.id) AS doses
    FROM registros_vacinacao rv

    INNER JOIN vacinas v
      ON v.id = rv.vacina_id

    LEFT JOIN doses_vacina dv
      ON dv.registro_vacinacao_id = rv.id

    WHERE rv.pessoa_id = ?

    GROUP BY v.id, v.nome

    ORDER BY v.nome
    `,
    [pessoaId],
    (err, vacinas) => {

      if (err) {
        return res.status(500).json({
          erro: err.message
        });
      }

      db.get(
        `
        SELECT
          id,
          nome
        FROM pessoas
        WHERE id = ?
        `,
        [pessoaId],
        (errPessoa, pessoa) => {

          if (errPessoa) {
            return res.status(500).json({
              erro: errPessoa.message
            });
          }

          if (!pessoa) {
            return res.status(404).json({
              erro: "Pessoa não encontrada"
            });
          }

          res.json({
            ...pessoa,
            vacinas
          });

        }
      );

    }
  );

})

/*
========================================
POPULAR CALENDÁRIO
POST /calendario/seed
========================================
*/
app.post("/calendario/seed", (_req, res) => {

  const dados = [
    {
      vacina_id: 3,
      faixa_etaria: "ADULTO",
      doses: 3,
      reforcos: 0,
      observacao: "Hepatite B"
    },
    {
      vacina_id: 6,
      faixa_etaria: "ADULTO",
      doses: 3,
      reforcos: 1,
      observacao: "Reforço a cada 10 anos"
    },
    {
      vacina_id: 10,
      faixa_etaria: "ADULTO",
      doses: 1,
      reforcos: 0,
      observacao: "Febre Amarela"
    },
    {
      vacina_id: 11,
      faixa_etaria: "ADULTO",
      doses: 1,
      reforcos: 0,
      observacao: "SCR"
    },

    {
      vacina_id: 3,
      faixa_etaria: "IDOSO",
      doses: 3,
      reforcos: 0,
      observacao: "Hepatite B"
    },
    {
      vacina_id: 14,
      faixa_etaria: "IDOSO",
      doses: 1,
      reforcos: 1,
      observacao: "Anual"
    },
    {
      vacina_id: 15,
      faixa_etaria: "IDOSO",
      doses: 1,
      reforcos: 1,
      observacao: "Semestral"
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO calendario_vacinal (
      vacina_id,
      faixa_etaria,
      doses,
      reforcos,
      observacao
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  dados.forEach(item => {
    stmt.run(
      item.vacina_id,
      item.faixa_etaria,
      item.doses,
      item.reforcos,
      item.observacao
    );
  });

  stmt.finalize();

  res.json({
    mensagem: "Calendário populado com sucesso"
  });

});

function obterFaixaEtaria(idade: number): string {

  if (idade <= 9) return "CRIANCA";

  if (idade <= 19) return "ADOLESCENTE";

  if (idade <= 24) return "JOVEM";

  if (idade <= 59) return "ADULTO";

  return "IDOSO";
}

function obterIntervaloDose(
  regra: any,
  dose: number
): number {

  if (dose === 1) {
    return 0;
  }

  if (dose === 2) {
    return regra.intervalo_dose_1_2 || 0;
  }

  if (dose === 3) {
    return regra.intervalo_dose_2_3 || 0;
  }

  if (dose === 4) {
    return regra.intervalo_dose_3_4 || 0;
  }

  return regra.intervalo_dose_reforco || 0;
}


/*
========================================
MEU CALENDÁRIO
GET /pendencias/:pessoaId
========================================
*/
app.get("/pendencias/:pessoaId", (req, res) => {

  const { pessoaId } = req.params;

  db.get(
    `
      SELECT *
      FROM pessoas
      WHERE id = ?
    `,
    [pessoaId],
    (err, pessoa: any) => {

      if (err) {
        return res.status(500).json({
          erro: err.message
        });
      }

      if (!pessoa) {
        return res.status(404).json({
          erro: "Pessoa não encontrada"
        });
      }

      const nascimento = new Date(pessoa.data_nascimento);

      const idade =
        new Date().getFullYear() -
        nascimento.getFullYear();

      const faixaEtaria =
        obterFaixaEtaria(idade);

      db.all(
        `
        SELECT
          v.nome AS vacina,
          c.doses AS necessarias
        FROM calendario_vacinal c

        INNER JOIN vacinas v
          ON v.id = c.vacina_id

        WHERE c.faixa_etaria = ?
        `,
        [faixaEtaria],
        (errCalendario, calendario: any[]) => {

          if (errCalendario) {
            return res.status(500).json({
              erro: errCalendario.message
            });
          }

          db.all(
            `
            SELECT
              v.nome AS vacina,
              COUNT(dv.id) AS tomadas
            FROM registros_vacinacao rv

            INNER JOIN vacinas v
              ON v.id = rv.vacina_id

            LEFT JOIN doses_vacina dv
              ON dv.registro_vacinacao_id = rv.id

            WHERE rv.pessoa_id = ?

            GROUP BY v.id, v.nome
            `,
            [pessoaId],
            (errCarteira, carteira: any[]) => {

              if (errCarteira) {
                return res.status(500).json({
                  erro: errCarteira.message
                });
              }

              const emDia: any[] = [];
              const pendentes: any[] = [];

              calendario.forEach((item) => {

                const vacinaCarteira =
                  carteira.find(
                    c => c.vacina === item.vacina
                  );

                const tomadas =
                  vacinaCarteira
                    ? Number(vacinaCarteira.tomadas)
                    : 0;

                const necessarias =
                  Number(item.necessarias);

                if (tomadas >= necessarias) {

                  emDia.push({
                    vacina: item.vacina,
                    tomadas,
                    necessarias
                  });

                } else {

                  pendentes.push({
                    vacina: item.vacina,
                    tomadas,
                    necessarias,
                    faltam: necessarias - tomadas
                  });

                }

              });

              res.json({
                pessoa: pessoa.nome,
                idade,
                faixa_etaria: faixaEtaria,
                em_dia: emDia,
                pendentes
              });

            }
          );

        }
      );

    }
  );

});

/*
========================================
GERAR AGENDAMENTOS
POST /agendamentos/gerar/:pessoaId
========================================
*/
app.post("/agendamentos/gerar/:pessoaId", (req, res) => {

  const { pessoaId } = req.params;

  db.get(
    `
      SELECT *
      FROM pessoas
      WHERE id = ?
    `,
    [pessoaId],
    (errPessoa, pessoa: any) => {

      if (errPessoa) {
        return res.status(500).json({
          erro: errPessoa.message
        });
      }

      if (!pessoa) {
        return res.status(404).json({
          erro: "Pessoa não encontrada"
        });
      }

      const nascimento = new Date(
        pessoa.data_nascimento
      );

      const idade =
        new Date().getFullYear() -
        nascimento.getFullYear();

      const faixaEtaria =
        obterFaixaEtaria(idade);

      db.all(
        `
        SELECT
          v.id AS vacina_id,
          v.nome AS vacina,
          c.doses AS necessarias
        FROM calendario_vacinal c

        INNER JOIN vacinas v
          ON v.id = c.vacina_id

        WHERE c.faixa_etaria = ?
        `,
        [faixaEtaria],
        (errCalendario, calendario: any[]) => {

          if (errCalendario) {
            return res.status(500).json({
              erro: errCalendario.message
            });
          }

          db.all(
            `
            SELECT
              v.id AS vacina_id,
              v.nome AS vacina,
              COUNT(dv.id) AS tomadas
            FROM registros_vacinacao rv

            INNER JOIN vacinas v
              ON v.id = rv.vacina_id

            LEFT JOIN doses_vacina dv
              ON dv.registro_vacinacao_id = rv.id

            WHERE rv.pessoa_id = ?

            GROUP BY v.id, v.nome
            `,
            [pessoaId],
            (errCarteira, carteira: any[]) => {

              if (errCarteira) {
                return res.status(500).json({
                  erro: errCarteira.message
                });
              }

              const agendamentos: any[] = [];

              calendario.forEach((item) => {

                const vacinaCarteira =
                  carteira.find(
                    c => c.vacina === item.vacina
                  );

                const tomadas =
                  vacinaCarteira
                    ? Number(vacinaCarteira.tomadas)
                    : 0;

                const necessarias =
                  Number(item.necessarias);

                const faltam =
                  necessarias - tomadas;

                if (faltam > 0) {

                  for (
                    let dose = tomadas + 1;
                    dose <= necessarias;
                    dose++
                  ) {

                    agendamentos.push({
                      vacina_id: item.vacina_id,
                      vacina: item.vacina,
                      numero_dose: dose
                    });

                  }

                }

              });

              db.run(
                `
                DELETE FROM agendamentos_vacina
                WHERE pessoa_id = ?
                `,
                [pessoaId],
                (errDelete) => {

                  if (errDelete) {
                    return res.status(500).json({
                      erro: errDelete.message
                    });
                  }

                  const stmt = db.prepare(`
                    INSERT INTO agendamentos_vacina (
                      pessoa_id,
                      vacina_id,
                      numero_dose,
                      data_prevista,
                      status,
                      observacao
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                  `);

                  const hoje = new Date();

                  agendamentos.forEach(
                    (item, index) => {

                      const data =
                        new Date(hoje);

                      data.setDate(
                        data.getDate() +
                        ((index + 1) * 15)
                      );

                      const dataPrevista =
                        data
                          .toISOString()
                          .split("T")[0];

                      stmt.run(
                        pessoaId,
                        item.vacina_id,
                        item.numero_dose,
                        dataPrevista,
                        "PENDENTE",
                        `${item.vacina} - Dose ${item.numero_dose}`
                      );

                    }
                  );

                  stmt.finalize();

                  res.json({
                    mensagem:
                      "Agendamentos gerados com sucesso",
                    quantidade:
                      agendamentos.length,
                    agendamentos
                  });

                }
              );

            }
          );

        }
      );

    }
  );

});

/*
========================================
LISTAR AGENDAMENTOS
GET /agendamentos/:pessoaId
========================================
*/
app.get("/agendamentos/:pessoaId", (req, res) => {

  const { pessoaId } = req.params;

  db.all(
    `
    SELECT
      av.id,
      v.nome AS vacina,
      av.numero_dose,
      av.data_prevista,
      av.status,
      av.observacao

    FROM agendamentos_vacina av

    INNER JOIN vacinas v
      ON v.id = av.vacina_id

    WHERE av.pessoa_id = ?

    ORDER BY av.data_prevista
    `,
    [pessoaId],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          erro: err.message
        });
      }

      res.json(rows);

    }
  );

});

/*
========================================
POPULAR REGRAS VACINAIS
POST /regras/seed
========================================
*/
app.post("/regras/seed", (_req, res) => {

  db.run(
    `DELETE FROM regras_vacinais`,
    [],
    (errDelete) => {

      if (errDelete) {
        return res.status(500).json({
          erro: errDelete.message
        });
      }

      const regras = [
        {
          vacina_id: 3,
          intervalo_dose_1_2: 30,
          intervalo_dose_2_3: 180,
          intervalo_dose_3_4: null,
          intervalo_dose_reforco: null,
          reforco_anos: null,
          campanha_anual: 0,
          idade_minima: 0,
          idade_maxima: 120,
          grupo_especial: null,
          observacao: "Hepatite B"
        },

        {
          vacina_id: 6,
          intervalo_dose_1_2: null,
          intervalo_dose_2_3: null,
          intervalo_dose_3_4: null,
          intervalo_dose_reforco: 3650,
          reforco_anos: 10,
          campanha_anual: 0,
          idade_minima: 0,
          idade_maxima: 120,
          grupo_especial: null,
          observacao: "dT"
        },

        {
          vacina_id: 14,
          intervalo_dose_1_2: null,
          intervalo_dose_2_3: null,
          intervalo_dose_3_4: null,
          intervalo_dose_reforco: 365,
          reforco_anos: 1,
          campanha_anual: 1,
          idade_minima: 60,
          idade_maxima: 120,
          grupo_especial: "IDOSO",
          observacao: "Influenza"
        },

        {
          vacina_id: 15,
          intervalo_dose_1_2: null,
          intervalo_dose_2_3: null,
          intervalo_dose_3_4: null,
          intervalo_dose_reforco: 365,
          reforco_anos: 1,
          campanha_anual: 1,
          idade_minima: 60,
          idade_maxima: 120,
          grupo_especial: "IDOSO",
          observacao: "COVID-19"
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO regras_vacinais (
          vacina_id,
          intervalo_dose_1_2,
          intervalo_dose_2_3,
          intervalo_dose_3_4,
          intervalo_dose_reforco,
          reforco_anos,
          campanha_anual,
          idade_minima,
          idade_maxima,
          grupo_especial,
          observacao
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      regras.forEach((regra) => {

        stmt.run(
          regra.vacina_id,
          regra.intervalo_dose_1_2,
          regra.intervalo_dose_2_3,
          regra.intervalo_dose_3_4,
          regra.intervalo_dose_reforco,
          regra.reforco_anos,
          regra.campanha_anual,
          regra.idade_minima,
          regra.idade_maxima,
          regra.grupo_especial,
          regra.observacao
        );

      });

      stmt.finalize();

      res.json({
        mensagem: "Regras vacinais populadas com sucesso"
      });

    }
  );

});
/*
========================================
LISTAR REGRAS VACINAIS
GET /regras
========================================
*/
app.get("/regras", (_req, res) => {

  db.all(
    `
    SELECT
      r.*,
      v.nome AS vacina

    FROM regras_vacinais r

    INNER JOIN vacinas v
      ON v.id = r.vacina_id

    ORDER BY v.nome
    `,
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          erro: err.message
        });
      }

      res.json(rows);

    }
  );

});


/*
========================================
BUSCAR REGRA POR VACINA
GET /regras/:vacinaId
========================================
*/
app.get("/regras/:vacinaId", (req, res) => {

  db.get(
    `
    SELECT
      r.*,
      v.nome AS vacina
    FROM regras_vacinais r
    INNER JOIN vacinas v
      ON v.id = r.vacina_id
    WHERE r.vacina_id = ?
    `,
    [req.params.vacinaId],
    (err, row) => {

      if (err) {
        return res.status(500).json({
          erro: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          erro: "Regra não encontrada"
        });
      }

      res.json(row);

    }
  );

});

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});