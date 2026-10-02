/*
Carrega as variáveis do .env antes de
qualquer outro módulo que dependa delas
(JWT_SECRET, FRONTEND_URL, PORT, etc).
*/
import "dotenv/config";

import express, {
  Request,
  Response
} from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

import { configurarBanco }
  from "./database/configurarBanco";

import { iniciarJobDeNotificacoes }
  from "./jobs/notificacaoJob";

import { autenticar, exigirAdmin }
  from "./middlewares/authMiddleware";

import authRoutes
  from "./routes/authRoutes";

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

import vacinalRoutes
  from "./routes/vacinalRoutes";

import scanRoutes
  from "./routes/scanRoutes";

import dependenteRoutes
  from "./routes/dependenteRoutes";

import grupoEspecialPessoaRoutes
  from "./routes/grupoEspecialPessoaRoutes";

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
Permite acesso do frontend.

Em produção, restrito exatamente à origem
configurada em FRONTEND_URL. Em desenvolvimento
(sem NODE_ENV=production), aceita qualquer porta
em localhost/127.0.0.1 — o Vite muda de porta
sozinho (5173, 5174...) quando a anterior já
está ocupada, e travar numa porta fixa só causa
"Failed to fetch" sem motivo aparente.

"credentials: true" porque o cookie de sessão
(httpOnly) precisa trafegar entre origens
diferentes (frontend numa porta, backend noutra).
*/
const ORIGEM_LOCALHOST =
  /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : (origin, callback) => {

            const permitido =
              !origin ||
              ORIGEM_LOCALHOST.test(origin) ||
              origin === process.env.FRONTEND_URL;

            callback(
              null,
              permitido
            );

          },
    credentials: true
  })
);

/*
Permite JSON.

Limite elevado para 10mb: a foto da carteirinha
enviada ao Claude Vision viaja em base64 dentro
do corpo da requisição.
*/
app.use(
  express.json({
    limit: "10mb"
  })
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
Lê o cookie httpOnly que carrega o token JWT
*/
app.use(
  cookieParser()
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
ROTAS DE AUTENTICAÇÃO (PÚBLICAS)
==================================================
*/
app.use(
  "/auth",
  authRoutes
);

/*
==================================================
ROTAS DE USUÁRIOS (ADMIN)
==================================================
*/
app.use(
  "/usuarios",
  autenticar,
  exigirAdmin,
  usuarioRoutes
);

/*
==================================================
ROTAS DE PESSOAS
==================================================
*/
app.use(
  "/pessoas",
  autenticar,
  pessoaRoutes
);

/*
==================================================
ROTAS DE VACINAS
==================================================

Lista de vacinas é informação pública do
sistema (não é dado pessoal), por isso
não exige login.
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
  autenticar,
  carteiraRoutes
);

/*
==================================================
ROTAS DE CALENDÁRIO VACINAL
==================================================
*/
app.use(
  "/calendario",
  autenticar,
  calendarioRoutes
);

/*
==================================================
ROTAS DE REGRAS VACINAIS (ADMIN)
==================================================
*/
app.use(
  "/regras-vacinais",
  autenticar,
  exigirAdmin,
  regraVacinalRoutes
);

/*
==================================================
ROTAS DE AGENDAMENTOS
==================================================
*/
app.use(
  "/agendamentos",
  autenticar,
  agendamentoRoutes
);

/*
==================================================
ROTAS DE PENDÊNCIAS (RESUMO VACINAL)
==================================================
*/
app.use(
  "/pendencias",
  autenticar,
  vacinalRoutes
);

/*
==================================================
ROTAS DE SCAN (CLAUDE VISION)
==================================================
*/
app.use(
  "/scan",
  autenticar,
  scanRoutes
);

/*
==================================================
ROTAS DE DEPENDENTES
==================================================
*/
app.use(
  "/dependentes",
  autenticar,
  dependenteRoutes
);

/*
==================================================
ROTAS DE GRUPOS ESPECIAIS
==================================================
*/
app.use(
  "/grupos-especiais",
  autenticar,
  grupoEspecialPessoaRoutes
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
    VALIDA VARIÁVEIS DE AMBIENTE
    ----------------------------------

    O sistema não sobe sem um segredo
    de assinatura de sessão configurado.
    */
    if (!process.env.JWT_SECRET) {

      throw new Error(
        "JWT_SECRET não definido no .env. " +
        "Defina uma string longa e aleatória " +
        "antes de iniciar o servidor."
      );

    }

    /*
    ----------------------------------
    CONFIGURA BANCO
    ----------------------------------
    */
    await configurarBanco();

    /*
    ----------------------------------
    AGENDA NOTIFICAÇÕES DIÁRIAS
    ----------------------------------

    Vacinas pendentes + agendamentos próximos.
    */
    iniciarJobDeNotificacoes();

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

