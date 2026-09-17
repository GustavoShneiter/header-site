# Validação do Header

- Regras de hierarquia, movimento, duplicação e datas: `node --test lib/planner.test.mjs`.
- Tipos: `npx tsc --noEmit`.
- Build: `npm run build`.
- Prévia isolada: `node node_modules/vite/bin/vite.js --config tests/preview/vite.config.mjs`, em http://127.0.0.1:5174.

A prévia importa os componentes reais, mas substitui o cliente Supabase por dados fictícios em memória. Não usa credenciais nem altera registros reais. Recarregar restaura os exemplos. Não integra as rotas ou o build de produção.

Fluxos conferidos no navegador: navegação, criação de lista e subtarefa, duplicação, mudança de dia com descendentes, confirmação e exclusão, criação de evento, conclusão de hábito, check-in de desafio e histórico, salvamento de tema e abertura do perfil.

O acesso real autenticado ao Supabase deve ser conferido na sessão do proprietário. Testes isolados não comprovam permissões/configurações de um serviço externo.

O aplicativo Android existente sincroniza tarefas. As tabelas web de calendário, hábitos e desafios exigem suporte adicional no Android para sincronizar essas áreas também.
