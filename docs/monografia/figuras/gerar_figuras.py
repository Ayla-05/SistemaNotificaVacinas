"""
Gera os diagramas da monografia em SVG (somente biblioteca padrão):

  figura-modelo-er.svg   Modelo de dados (16 tabelas do SQLite)
  figura-fluxo-ocr.svg   Fluxo da leitura da carteirinha por OCR
  figura-casos-de-uso.svg Diagrama de casos de uso

Uso: python3 gerar_figuras.py
Os PNG usados no .docx são renderizados a partir dos SVG (ver README da pasta).
"""
from html import escape
from pathlib import Path

DESTINO = Path(__file__).parent
FONTE = "DejaVu Sans, Arial, sans-serif"
COR_BORDA = "#1f3a5f"
COR_TXT = "#1a1a1a"

# ----------------------------------------------------------------------------
# MODELO ER
# ----------------------------------------------------------------------------
# cada tabela: (cor do cabeçalho, [(coluna, marca)]) ; marca: PK, FK, UK ou ""
TABELAS = {
    "sessoes": ("#6b7a8f", [("id (texto)", "PK"), ("usuario_id", "FK"), ("refresh_hash", "UK"),
                            ("expira_em", ""), ("revogada_em", "")]),
    "usuarios": ("#6b7a8f", [("id", "PK"), ("email", "UK"), ("senha (hash)", ""), ("perfil", ""),
                             ("ativo", ""), ("email_verificado", "")]),
    "redefinicoes_senha": ("#6b7a8f", [("id", "PK"), ("usuario_id", "FK"), ("token_hash", "UK"),
                                       ("expira_em", ""), ("usado_em", "")]),
    "avisos_dose": ("#b5651d", [("id", "PK"), ("pessoa_id", "FK"), ("vacina_codigo", "UK*"),
                                ("numero_dose", "UK*"), ("data_prevista", "UK*")]),
    "dependentes": ("#2e7d6b", [("id", "PK"), ("responsavel_id", "FK"), ("dependente_id", "FK"),
                                ("parentesco", "")]),
    "pessoas": ("#2e7d6b", [("id", "PK"), ("usuario_id", "FK"), ("nome", ""), ("data_nascimento", ""),
                            ("email / telefone", ""), ("frequencia_aviso", "")]),
    "pessoa_grupo_especial": ("#2e7d6b", [("id", "PK"), ("pessoa_id", "FK"), ("grupo_especial_id", "FK")]),
    "grupos_especiais": ("#7a4fa0", [("id", "PK"), ("nome", "UK"), ("descricao", "")]),
    "agendamentos_vacina": ("#b5651d", [("id", "PK"), ("pessoa_id", "FK"), ("vacina_id", "FK"),
                                        ("numero_dose", ""), ("data_prevista", ""), ("status", "")]),
    "registros_vacinacao": ("#b5651d", [("id", "PK"), ("pessoa_id", "FK"), ("vacina_id", "FK"),
                                        ("data_registro", "")]),
    "doses_vacina": ("#b5651d", [("id", "PK"), ("registro_vacinacao_id", "FK"), ("numero_dose", ""),
                                 ("data_aplicacao", ""), ("lote / fabricante", "")]),
    "configuracoes": ("#6b7a8f", [("chave", "PK"), ("valor", "")]),
    "calendario_vacinal": ("#7a4fa0", [("id", "PK"), ("vacina_id", "FK"), ("faixa_etaria", ""),
                                       ("idade_minima / maxima", ""), ("doses / reforcos", "")]),
    "vacinas": ("#7a4fa0", [("id", "PK"), ("codigo", "UK"), ("nome", "UK"), ("doencas_evitadas", ""),
                            ("ativa", "")]),
    "regras_vacinais": ("#7a4fa0", [("id", "PK"), ("vacina_id", "FK"), ("grupo_especial_id", "FK"),
                                    ("intervalos entre doses", ""), ("reforco_anos", "")]),
    "campanhas_vacinais": ("#7a4fa0", [("id", "PK"), ("vacina_id", "FK"), ("nome", ""),
                                       ("data_inicio / data_fim", ""), ("ativa", "")]),
}

W, GAP, MARGEM, CAB, LIN = 250, 80, 20, 28, 22
COLS = [MARGEM + i * (W + GAP) for i in range(4)]
LINHAS_Y = [20, 270, 540, 800]

POS = {  # tabela: (coluna, linha, deslocamento_y)
    "sessoes": (0, 0, 0), "usuarios": (0, 1, 0), "redefinicoes_senha": (0, 2, 0), "avisos_dose": (0, 3, 0),
    "dependentes": (1, 0, 0), "pessoas": (1, 1, 0), "pessoa_grupo_especial": (1, 2, 0),
    "grupos_especiais": (1, 3, 0),
    "agendamentos_vacina": (2, 0, 0), "registros_vacinacao": (2, 1, 0), "doses_vacina": (2, 2, 0),
    "configuracoes": (2, 3, 80),
    "calendario_vacinal": (3, 0, 0), "vacinas": (3, 1, 0), "regras_vacinais": (3, 2, 0),
    "campanhas_vacinais": (3, 3, 0),
}


def caixa(nome):
    cor, cols = TABELAS[nome]
    c, l, dy = POS[nome]
    x, y = COLS[c], LINHAS_Y[l] + dy
    h = CAB + LIN * len(cols) + 6
    return x, y, W, h


def desenhar_tabela(nome):
    cor, cols = TABELAS[nome]
    x, y, w, h = caixa(nome)
    s = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#ffffff" stroke="{COR_BORDA}" stroke-width="1.5"/>',
         f'<path d="M{x},{y+CAB} V{y+6} a6,6 0 0 1 6,-6 H{x+w-6} a6,6 0 0 1 6,6 V{y+CAB} Z" fill="{cor}"/>',
         f'<text x="{x+w/2}" y="{y+19}" text-anchor="middle" font-weight="bold" font-size="14" fill="#fff">{escape(nome)}</text>']
    for i, (col, marca) in enumerate(cols):
        ty = y + CAB + LIN * (i + 1) - 6
        peso = ' font-weight="bold"' if marca == "PK" else ""
        s.append(f'<text x="{x+10}" y="{ty}" font-size="13" fill="{COR_TXT}"{peso}>{escape(col)}</text>')
        if marca:
            s.append(f'<text x="{x+w-10}" y="{ty}" text-anchor="end" font-size="11" fill="#555">{escape(marca)}</text>')
    return "\n".join(s)


def ponto(nome, lado, frac=0.5):
    x, y, w, h = caixa(nome)
    return {"L": (x, y + h * frac), "R": (x + w, y + h * frac),
            "T": (x + w * frac, y), "B": (x + w * frac, y + h)}[lado]


def relacao(a, lado_a, fa, b, lado_b, fb, rot_a="1", rot_b="N", tracejado=False, caminho=None):
    """Linha entre a (lado '1') e b (lado 'N'); rótulos de cardinalidade nas pontas."""
    (x1, y1), (x2, y2) = ponto(a, lado_a, fa), ponto(b, lado_b, fb)
    dash = ' stroke-dasharray="6,4"' if tracejado else ""
    if caminho:
        d = f"M{x1},{y1} " + " ".join(caminho) + f" L{x2},{y2}"
    else:
        d = f"M{x1},{y1} L{x2},{y2}"
    s = [f'<path d="{d}" fill="none" stroke="#444" stroke-width="1.4"{dash}/>']

    def rotulo(px, py, lado, txt):
        dx, dy = {"L": (-10, -6), "R": (10, -6), "T": (8, -8), "B": (8, 16)}[lado]
        anc = "end" if lado == "L" else "start"
        return (f'<text x="{px+dx}" y="{py+dy}" text-anchor="{anc}" font-size="13" font-weight="bold" '
                f'fill="{COR_BORDA}">{txt}</text>')

    s.append(rotulo(x1, y1, lado_a, rot_a))
    s.append(rotulo(x2, y2, lado_b, rot_b))
    return "\n".join(s)


def figura_er():
    rels = [
        relacao("usuarios", "T", 0.5, "sessoes", "B", 0.5),
        relacao("usuarios", "B", 0.5, "redefinicoes_senha", "T", 0.5),
        relacao("usuarios", "R", 0.5, "pessoas", "L", 0.5),
        relacao("pessoas", "T", 0.3, "dependentes", "B", 0.3),
        relacao("pessoas", "T", 0.7, "dependentes", "B", 0.7),
        relacao("pessoas", "B", 0.5, "pessoa_grupo_especial", "T", 0.5),
        relacao("grupos_especiais", "T", 0.5, "pessoa_grupo_especial", "B", 0.5),
        relacao("pessoas", "R", 0.5, "registros_vacinacao", "L", 0.5),
        relacao("pessoas", "R", 0.2, "agendamentos_vacina", "L", 0.5),
        relacao("pessoas", "L", 0.85, "avisos_dose", "R", 0.3),
        relacao("registros_vacinacao", "B", 0.5, "doses_vacina", "T", 0.5),
        relacao("vacinas", "L", 0.5, "registros_vacinacao", "R", 0.5, "1", "N"),
        relacao("vacinas", "L", 0.2, "agendamentos_vacina", "R", 0.5, "1", "N"),
        relacao("vacinas", "T", 0.5, "calendario_vacinal", "B", 0.5),
        relacao("vacinas", "B", 0.5, "regras_vacinais", "T", 0.5),
    ]
    # vacinas -> campanhas_vacinais contorna regras_vacinais pela direita
    xv, yv, wv, hv = caixa("vacinas")
    xc, yc, wc, hc = caixa("campanhas_vacinais")
    xr = xv + wv + 30
    rels.append(
        f'<path d="M{xv+wv},{yv+hv*0.8} H{xr} V{yc+hc*0.5} H{xc+wc}" fill="none" stroke="#444" stroke-width="1.4"/>'
        f'<text x="{xv+wv+8}" y="{yv+hv*0.8-6}" font-size="13" font-weight="bold" fill="{COR_BORDA}">1</text>'
        f'<text x="{xc+wc+8}" y="{yc+hc*0.5-6}" font-size="13" font-weight="bold" fill="{COR_BORDA}">N</text>')
    # grupos_especiais -> regras_vacinais (opcional, tracejado) por baixo de configuracoes
    xg, yg, wg, hg = caixa("grupos_especiais")
    xrg, yrg, wrg, hrg = caixa("regras_vacinais")
    ybaixo = max(caixa("configuracoes")[1] + caixa("configuracoes")[3], yg + hg) + 30
    rels.append(
        f'<path d="M{xg+wg},{yg+hg*0.5} H{xg+wg+14} V{ybaixo} H{xrg-25} V{yrg+hrg*0.5} H{xrg}" '
        f'fill="none" stroke="#444" stroke-width="1.4" stroke-dasharray="6,4"/>'
        f'<text x="{xg+wg+18}" y="{yg+hg*0.5-6}" font-size="13" font-weight="bold" fill="{COR_BORDA}">1</text>'
        f'<text x="{xrg-14}" y="{yrg+hrg*0.5-6}" font-size="13" font-weight="bold" fill="{COR_BORDA}">N</text>')

    largura = COLS[3] + W + 60
    altura = ybaixo + 90
    # legenda
    lg_y = altura - 62
    legenda = (
        f'<g font-size="12" fill="{COR_TXT}">'
        f'<text x="{MARGEM}" y="{lg_y}">PK chave primária · FK chave estrangeira · UK valor único · UK* unicidade composta · '
        f'1 / N cardinalidade · linha tracejada: vínculo opcional</text>'
        f'<g transform="translate({MARGEM},{lg_y+14})">'
    )
    itens = [("#6b7a8f", "Acesso e sistema"), ("#2e7d6b", "Pessoas"), ("#b5651d", "Carteira e avisos"),
             ("#7a4fa0", "Catálogo vacinal")]
    x = 0
    for cor, nome in itens:
        legenda += f'<rect x="{x}" y="0" width="14" height="14" fill="{cor}" rx="3"/><text x="{x+20}" y="12">{nome}</text>'
        x += 190
    legenda += "</g></g>"

    corpo = "\n".join(rels) + "\n" + "\n".join(desenhar_tabela(n) for n in TABELAS) + legenda
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{largura}" height="{altura}" '
            f'viewBox="0 0 {largura} {altura}" font-family="{FONTE}">'
            f'<rect width="100%" height="100%" fill="#ffffff"/>{corpo}</svg>')


# ----------------------------------------------------------------------------
# FLUXO DO OCR
# ----------------------------------------------------------------------------
def figura_ocr():
    L, A = 1000, 1190
    def caixa_f(x, y, w, h, titulo, linhas, cor, txt="#fff"):
        s = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="#fff" stroke="{cor}" stroke-width="2"/>',
             f'<path d="M{x},{y+30} V{y+8} a8,8 0 0 1 8,-8 H{x+w-8} a8,8 0 0 1 8,8 V{y+30} Z" fill="{cor}"/>'.replace(f"M{x},{y+30} V{y+8}", f"M{x},{y+30} V{y+8}"),
             f'<text x="{x+w/2}" y="{y+21}" text-anchor="middle" font-size="15" font-weight="bold" fill="{txt}">{escape(titulo)}</text>']
        for i, t in enumerate(linhas):
            s.append(f'<text x="{x+14}" y="{y+52+i*20}" font-size="13.5" fill="{COR_TXT}">{escape(t)}</text>')
        return "\n".join(s)

    def seta(x1, y1, x2, y2, rot=None, dx=8):
        s = (f'<path d="M{x1},{y1} L{x2},{y2}" stroke="#333" stroke-width="2" fill="none" marker-end="url(#ponta)"/>')
        if rot:
            s += f'<text x="{x1+dx}" y="{(y1+y2)/2+4}" font-size="12.5" fill="#333">{escape(rot)}</text>'
        return s

    cx, cw = 250, 500
    blocos = [
        (20, 100, "1. Navegador (React)", ["Tela Scan: usuário escolhe a pessoa e envia", "a foto ou o PDF da carteirinha (base64)."], "#2e7d6b"),
        (160, 150, "2. API Node.js — POST /scan/analisar", ["autenticar (cookie httpOnly) + CSRF",
                                                           "limite de 20 análises / 15 min por usuário",
                                                           "pessoa pertence ao usuário (anti-IDOR)",
                                                           "tamanho ≤ 5 MB e tipo por magic bytes (JPEG/PNG/WEBP/PDF)"], "#1f3a5f"),
        (350, 90, "3. OcrService → serviço de OCR", ["HTTP multipart para POST /extrair (rede interna),",
                                                     "tempo limite de 120 s; falha → 503 sem derrubar a API."], "#1f3a5f"),
        (480, 170, "4. ocr-service (Python, FastAPI + Docling)", ["valida tipo e tamanho; grava arquivo temporário",
                                                                   "análise de layout da página",
                                                                   "estrutura de tabela (TableFormer)",
                                                                   "OCR EasyOCR (pt, en) onde não há texto digital",
                                                                   "→ devolve { texto: <Markdown> }"], "#b5651d"),
        (690, 170, "5. extratorCarteirinha (função pura, TypeScript)", ["vacina: nome do catálogo ou apelido (mais longo vence)",
                                                                         "dose, datas válidas (dd/mm/aaaa, aaaa-mm-dd)",
                                                                         "lote e unidade de saúde; data futura = próxima dose",
                                                                         "titular: nome e data de nascimento",
                                                                         "campo não encontrado → null"], "#1f3a5f"),
        (900, 90, "6. Revisão pelo usuário (humano no circuito)", ["A API só devolve a sugestão; o usuário corrige",
                                                                    "os campos e confirma na tela."], "#2e7d6b"),
        (1030, 130, "7. POST /carteira/confirmar-scan", ["grava registros_vacinacao e doses_vacina",
                                                         "cria dependente se a carteirinha for de outra pessoa",
                                                         "e-mail de confirmação da dose (em segundo plano)"], "#1f3a5f"),
    ]
    out = []
    for y, h, t, ls, cor in blocos:
        out.append(caixa_f(cx, y, cw, h, t, ls, cor))
    # setas entre blocos
    for (y1, h1, *_), (y2, *_r) in zip(blocos, blocos[1:]):
        out.append(seta(cx + cw / 2, y1 + h1, cx + cw / 2, y2))
    # notas laterais
    def nota(x, y, w, linhas, cor="#fff7e0"):
        h = 18 * len(linhas) + 14
        s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{cor}" stroke="#c9a227" stroke-width="1.2"/>'
        for i, t in enumerate(linhas):
            s += f'<text x="{x+10}" y="{y+22+i*18}" font-size="12.5" fill="{COR_TXT}">{escape(t)}</text>'
        return s
    out.append(nota(780, 475, 205, ["Modelos carregados ao subir", "o serviço (/saude). Sem GPU:", "segundos a ~1 min por foto."]))
    out.append(nota(780, 700, 205, ["Erros previstos: 413 (grande),", "415 (tipo), 422 (ilegível),", "503 (OCR fora do ar): o", "usuário lança a dose à mão."]))
    out.append(nota(15, 480, 215, ["O arquivo não sai da", "infraestrutura do sistema", "(sem terceiros — LGPD).", "Serviço sem autenticação:", "só rede interna."]))
    out.append(nota(15, 905, 215, ["Nada é gravado sem a", "confirmação do usuário", "(erro de OCR em letra", "manuscrita é esperado)."]))
    defs = ('<defs><marker id="ponta" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">'
            '<path d="M0,0 L10,4 L0,8 Z" fill="#333"/></marker></defs>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{L}" height="{A}" viewBox="0 0 {L} {A}" font-family="{FONTE}">'
            f'<rect width="100%" height="100%" fill="#ffffff"/>{defs}{"".join(out)}</svg>')


# ----------------------------------------------------------------------------
# DIAGRAMA DE CASOS DE USO
# ----------------------------------------------------------------------------
def figura_casos_de_uso():
    L, A = 1400, 1010
    out = []
    OVAL_W, OVAL_H = 232, 62

    def oval(cx, cy, codigo, linhas):
        t = "".join(
            f'<tspan x="{cx}" dy="{(-8 if len(linhas) > 1 else 5) if i == 0 else 16}">{escape(l)}</tspan>'
            for i, l in enumerate(linhas))
        return (f'<ellipse cx="{cx}" cy="{cy}" rx="{OVAL_W/2}" ry="{OVAL_H/2}" fill="#fff" stroke="{COR_BORDA}" stroke-width="1.5"/>'
                f'<text x="{cx}" y="{cy}" text-anchor="middle" font-size="12.5" fill="{COR_TXT}">'
                f'<tspan font-weight="bold" x="{cx}" dy="{-16 if len(linhas) > 1 else -8}">{codigo}</tspan>'
                + "".join(f'<tspan x="{cx}" dy="{16 if i == 0 else 15}">{escape(l)}</tspan>' for i, l in enumerate(linhas))
                + '</text>')

    def pacote(x, y, w, h, titulo, cor, ovais, colunas):
        s = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{cor}" fill-opacity="0.10" stroke="{cor}" stroke-width="1.8"/>',
             f'<text x="{x+14}" y="{y+24}" font-size="14.5" font-weight="bold" fill="{cor}">{escape(titulo)}</text>']
        for i, (cod, linhas) in enumerate(ovais):
            col, lin = i % colunas, i // colunas
            cx = x + w / (colunas * 2) * (2 * col + 1)
            cy = y + 62 + lin * 82
            s.append(oval(cx, cy, cod, linhas))
        return "\n".join(s)

    def ator(cx, cy, nome, cor="#1f3a5f"):
        return (f'<g stroke="{cor}" stroke-width="2.2" fill="none">'
                f'<circle cx="{cx}" cy="{cy-34}" r="12"/><path d="M{cx},{cy-22} V{cy+14} M{cx-22},{cy-8} H{cx+22} M{cx},{cy+14} L{cx-18},{cy+42} M{cx},{cy+14} L{cx+18},{cy+42}"/></g>'
                f'<text x="{cx}" y="{cy+62}" text-anchor="middle" font-size="13.5" font-weight="bold" fill="{cor}">{escape(nome)}</text>')

    def liga(x1, y1, x2, y2, tracejada=False, rotulo=None):
        d = ' stroke-dasharray="6,4"' if tracejada else ""
        r = (f'<text x="{(x1+x2)/2}" y="{(y1+y2)/2-6}" text-anchor="middle" font-size="11.5" fill="#444">{rotulo}</text>' if rotulo else "")
        return f'<path d="M{x1},{y1} L{x2},{y2}" stroke="#444" stroke-width="1.4"{d}/>{r}'

    # fronteira do sistema
    out.append(f'<rect x="170" y="14" width="1060" height="{A-28}" rx="14" fill="none" stroke="{COR_BORDA}" stroke-width="2.2"/>')
    out.append(f'<text x="200" y="44" font-size="17" font-weight="bold" fill="{COR_BORDA}">Notifica Vacinas</text>')

    XA, WA = 195, 520
    p1 = (XA, 66, WA, 236)
    p2 = (XA, 322, WA, 322)
    p3 = (XA, 664, WA, 322)
    out.append(pacote(*p1, "Conta e acesso", "#6b7a8f", [
        ("UC01", ["Cadastrar-se e confirmar e-mail"]), ("UC02", ["Entrar (login e sessão)"]),
        ("UC03", ["Recuperar senha"]), ("UC04", ["Sair e gerenciar dispositivos"])], 2))
    out.append(pacote(*p2, "Pessoas e carteira", "#2e7d6b", [
        ("UC05", ["Concluir cadastro inicial"]), ("UC06", ["Cadastrar e remover dependentes"]),
        ("UC07", ["Informar grupos especiais"]), ("UC08", ["Registrar dose manualmente"]),
        ("UC09", ["Registrar dose por foto/PDF"])], 2))
    out.append(pacote(*p3, "Situação, calendário e avisos", "#b5651d", [
        ("UC10", ["Consultar situação vacinal"]), ("UC11", ["Consultar calendário", "e agendar vacina"]),
        ("UC12", ["Confirmar vacina tomada"]), ("UC13", ["Ver notificações no painel"]),
        ("UC14", ["Definir preferências de aviso"])], 2))

    XB, WB = 905, 300
    p4 = (XB, 66, WB, 292)
    p5 = (XB, 700, WB, 210)
    out.append(pacote(*p4, "Administração (somente ADMIN)", "#7a4fa0", [
        ("UC15", ["Gerir usuários"]), ("UC16", ["Gerir vacinas"]), ("UC17", ["Gerir calendário e regras"])], 1))
    out.append(pacote(*p5, "Automático (agendador diário)", "#c0392b", [
        ("UC18", ["Verificar pendências", "e enviar avisos"]), ("UC19", ["Enviar lembrete", "de agendamento"])], 1))

    # atores e ligações
    out.append(ator(85, 470, "Usuário"))
    for (x, y, w, h) in (p1, p2, p3):
        out.append(liga(112, 470, x, y + h / 2))
    out.append(ator(1310, 210, "Administrador", "#7a4fa0"))
    out.append(liga(1288, 210, XB + WB, 210))
    out.append(ator(1310, 810, "Agendador", "#c0392b"))
    out.append(liga(1288, 810, XB + WB, 810))
    # serviço de OCR (ator secundário) ligado ao UC09
    out.append(ator(1310, 530, "Serviço de OCR", "#b5651d"))
    uc09 = (XA + WA / 4 * 1, 322 + 62 + 2 * 82)
    out.append(f'<path d="M1288,540 H{XB-20} V{uc09[1]} H{uc09[0]+OVAL_W/2}" fill="none" stroke="#444" stroke-width="1.4" stroke-dasharray="6,4"/>')
    out.append(f'<text x="{XB-12}" y="{uc09[1]-8}" font-size="11.5" fill="#444">«usa»</text>')
    # admin herda tudo do usuário (generalização, só texto)
    out.append(f'<text x="1310" y="296" text-anchor="middle" font-size="11" fill="#555">também executa</text>'
               f'<text x="1310" y="310" text-anchor="middle" font-size="11" fill="#555">UC01 a UC14</text>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{L}" height="{A}" viewBox="0 0 {L} {A}" font-family="{FONTE}">'
            f'<rect width="100%" height="100%" fill="#ffffff"/>{"".join(out)}</svg>')


if __name__ == "__main__":
    (DESTINO / "figura-modelo-er.svg").write_text(figura_er(), encoding="utf-8")
    (DESTINO / "figura-fluxo-ocr.svg").write_text(figura_ocr(), encoding="utf-8")
    (DESTINO / "figura-casos-de-uso.svg").write_text(figura_casos_de_uso(), encoding="utf-8")
    print("SVG gerados em", DESTINO)
