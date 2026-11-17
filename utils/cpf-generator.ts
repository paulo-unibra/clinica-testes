/**
 * Gera um CPF válido com dígitos verificadores corretos
 */
export function gerarCpfValido(): string {
  const aleatorio = (n: number) => Math.floor(Math.random() * n);

  const n = Array.from({ length: 9 }, () => aleatorio(10));

  let d1 = 0;
  for (let i = 0; i < 9; i++) {
    d1 += n[i] * (10 - i);
  }
  let resto1 = d1 % 11;
  d1 = resto1 < 2 ? 0 : 11 - resto1;

  let d2 = 0;
  for (let i = 0; i < 9; i++) {
    d2 += n[i] * (11 - i);
  }
  d2 += d1 * 2;
  let resto2 = d2 % 11;
  d2 = resto2 < 2 ? 0 : 11 - resto2;

  const digitos = [...n, d1, d2].join('');
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9, 11)}`;
}
