const API_URL = "http://localhost:3001";

export async function obterPendencias(idPessoa) {
  const response = await fetch(
    `${API_URL}/pendencias/${idPessoa}`
  );

  return response.json();
}

export async function obterCarteira(idPessoa) {
  const response = await fetch(
    `${API_URL}/carteira/${idPessoa}`
  );

  return response.json();
}

export async function obterVacinas() {
  const response = await fetch(
    `${API_URL}/vacinas`
  );

  return response.json();
}

export async function obterCalendario() {
  const response = await fetch(
    `${API_URL}/calendario`
  );

  return response.json();
}