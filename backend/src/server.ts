import express, {
  Request,
  Response
} from "express";

import cors from "cors";

import { configurarBanco }
  from "./database/configurarBanco";

import usuarioRoutes
  from "./routes/usuarioRoutes";

import pessoaRoutes
  from "./routes/pessoaRoutes";

import vacinaRoutes
  from "./routes/vacinaRoutes";

import carteiraRoutes
  from "./routes/carteiraRoutes";

import calendarioRoutes
  from "./routes/calendarioRoutes";

import regraVacinalRoutes
  from "./routes/regraVacinalRoutes";

import agendamentoRoutes
  from "./routes/agendamentoRoutes";

/*
==================================================
SERVER
==================================================

Responsabilidades:

- Inicializar aplicação
- Configurar middlewares
- Registrar rotas
- Configurar banco de dados
- Iniciar servidor HTTP

NÃO é responsável por:

- Regras de negócio
- SQL
- Persistência
- Autenticação
- Autorização

Dependências:

- express
- cors
- configurarBanco
- routes
*/

/*
==================================================
APP
==================================================
*/
const app = express();

/*
==================================================
PORTA
==================================================
*/
const PORT =
  Number(
    process.env.PORT
  ) || 3000;

/*
==================================================
MIDDLEWARES GLOBAIS
==================================================
*/

/*
Permite acesso do frontend
*/
app.use(
  cors()
);

/*
Permite JSON
*/
app.use(
  express.json()
);

/*
Permite envio de formulários
*/
app.use(
  express.urlencoded({
    extended: true
  })
);

/*
==================================================
HEALTH CHECK
==================================================

GET /
*/
app.get(
  "/",
  (
    req: Request,
    res: Response
  ) => {

    return res.status(200).json({

      sistema:
        "Sistema Notifica Vacinas",

      versao:
        "1.0.0",

      status:
        "ONLINE",

      data:
        new Date()

    });

  }
);

/*
==================================================
ROTAS DE USUÁRIOS
==================================================
*/
app.use(
  "/usuarios",
  usuarioRoutes
);

/*
==================================================
ROTAS DE PESSOAS
==================================================
*/
app.use(
  "/pessoas",
  pessoaRoutes
);

/*
==================================================
ROTAS DE VACINAS
==================================================
*/
app.use(
  "/vacinas",
  vacinaRoutes
);

/*
==================================================
ROTAS DE CARTEIRA VACINAL
==================================================
*/
app.use(
  "/carteira",
  carteiraRoutes
);

/*
==================================================
ROTAS DE CALENDÁRIO VACINAL
==================================================
*/
app.use(
  "/calendario",
  calendarioRoutes
);

/*
==================================================
ROTAS DE REGRAS VACINAIS
==================================================
*/
app.use(
  "/regras-vacinais",
  regraVacinalRoutes
);

/*
==================================================
ROTAS DE AGENDAMENTOS
==================================================
*/
app.use(
  "/agendamentos",
  agendamentoRoutes
);

/*
==================================================
ROTA NÃO ENCONTRADA
==================================================
*/
app.use(
  (
    req: Request,
    res: Response
  ) => {

    return res.status(404).json({

      erro:
        "Rota não encontrada.",

      metodo:
        req.method,

      rota:
        req.originalUrl

    });

  }
);

/*
==================================================
INICIALIZAÇÃO DO SISTEMA
==================================================
*/
async function iniciarServidor() {

  try {

    console.log(
      "=================================="
    );

    console.log(
      "INICIANDO SISTEMA..."
    );

    console.log(
      "=================================="
    );

    /*
    ----------------------------------
    CONFIGURA BANCO
    ----------------------------------
    */
    await configurarBanco();

    /*
    ----------------------------------
    INICIA SERVIDOR
    ----------------------------------
    */
    app.listen(
      PORT,
      () => {

        console.log(
          "=================================="
        );

        console.log(
          "SISTEMA NOTIFICA VACINAS"
        );

        console.log(
          `Servidor iniciado na porta ${PORT}`
        );

        console.log(
          `http://localhost:${PORT}`
        );

        console.log(
          "=================================="
        );

      }
    );

  } catch (erro) {

    console.error(
      "=================================="
    );

    console.error(
      "ERRO AO INICIAR SISTEMA"
    );

    console.error(
      erro
    );

    console.error(
      "=================================="
    );

    process.exit(1);

  }

}

/*
==================================================
BOOTSTRAP
==================================================
*/
iniciarServidor();

export default app;

