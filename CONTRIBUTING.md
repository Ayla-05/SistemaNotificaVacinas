# Como contribuir

## Nome de branch

Toda branch segue o padrão **`tipo/assunto-em-minusculas-com-hifens`**, e o nome precisa
descrever a mudança que a branch contém (nada de nomes gerados ou genéricos).

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | funcionalidade nova | `feat/aviso-dose-por-sms` |
| `fix` | correção de defeito | `fix/idade-fuso-brasil` |
| `security` | correção de segurança | `security/permissao-agendamentos` |
| `test` | testes | `test/modulo-seguranca-e-arquitetura` |
| `refactor` | reorganização sem mudar comportamento | `refactor/helpers-de-consulta-repositorios` |
| `perf` | desempenho (inclui banco) | `perf/indices-do-banco` |
| `docs` | documentação e monografia | `docs/monografia-ocr-e-banco` |
| `chore` | build, dependências, configuração | `chore/gitignore-banco-de-dados` |

Regras:

- Somente letras minúsculas sem acento, números e hífens no assunto; uma barra depois do tipo.
- Assunto curto (2 a 5 palavras), em português, dizendo **o quê**, não "ajustes" ou "alterações".
- Uma branch por assunto. Se a mudança passar a tratar de outra coisa, abra outra branch.
- Depois do merge, a branch não é reaproveitada: a próxima mudança parte da `main` com um nome novo.

## Commits e PR

- Mensagem de commit em português, no imperativo ou descrevendo a mudança ("Valida a data de nascimento").
- O PR leva o mesmo assunto da branch no título e descreve o que mudou e como foi testado.
- Antes de abrir o PR: `cd backend && npm test` (toda a suíte deve passar) e `npx tsc --noEmit`.
