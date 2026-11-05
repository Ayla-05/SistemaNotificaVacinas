/*
Trechos de SQL (PostgreSQL) usados pelos testes para mexer no tempo
dos registros do banco. O sistema guarda datas como texto
"AAAA-MM-DD HH:MM:SS" em UTC.
*/
export const agoraMenos = (intervalo: string) =>
  `to_char(timezone('UTC', now()) - interval '${intervalo}', 'YYYY-MM-DD HH24:MI:SS')`;
