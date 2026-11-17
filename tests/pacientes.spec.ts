import { test, expect } from '@playwright/test';
import { gerarCpfValido } from '../utils/cpf-generator';

test.describe('Cadastro e Gerenciamento de Pacientes', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `testuser_${timestamp}@exemplo.com`;
    const testPassword = 'Password123!';

    await page.goto('/Account/Register');

    // Preenche cadastro
    await page.fill('#Input\\.Email', testEmail);
    await page.fill('#Input\\.Password', testPassword);
    await page.fill('#Input\\.ConfirmPassword', testPassword);
    await page.click('button[type="submit"]');

    // Aguarda o login redirecionar para a home
    await page.waitForURL((url) => !url.pathname.includes('/Account/Register'), { timeout: 10000 });

    // Navega para a página de pacientes
    await page.goto('/pacientes');
    await page.waitForURL('**/pacientes');

    // Aguarda carregar o cabeçalho e os elementos interativos
    await expect(page.getByRole('heading', { name: 'Pacientes', exact: true })).toBeVisible({ timeout: 10000 });
    
    // Aguarda o botão "Novo paciente" estar visível
    await expect(page.getByRole('button', { name: /Novo paciente/i })).toBeVisible({ timeout: 10000 });
  });

  test('Deve cadastrar um novo paciente com sucesso', async ({ page }) => {
    const nomePaciente = `Paciente Teste ${Date.now()}`;
    const cpfValido = gerarCpfValido();
    const emailPaciente = `paciente_${Date.now()}@teste.com`;
    const telefonePaciente = '(11) 98765-4321';
    const dataNascimento = '1995-05-15';

    // Garante que o clique abre o modal
    const btnNovoPaciente = page.getByRole('button', { name: /Novo paciente/i });
    await expect(async () => {
      await btnNovoPaciente.click();
      await expect(page.locator('.modal-title:has-text("Novo paciente")')).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });

    // Preenche campos do formulário
    await page.fill('#nome', nomePaciente);
    await page.fill('#cpf', cpfValido);
    await page.fill('#nascimento', dataNascimento);
    await page.fill('#telefone', telefonePaciente);
    await page.fill('#email', emailPaciente);

    // Submete o formulário
    await page.click('.modal-footer button[type="submit"]');

    // Verifica feedback de sucesso
    await expect(page.locator('.alert-success')).toContainText('Paciente cadastrado com sucesso', { timeout: 10000 });

    // Verifica que o paciente aparece na tabela
    await expect(page.locator('table')).toContainText(nomePaciente);
    await expect(page.locator('table')).toContainText(emailPaciente);
  });

  test('Deve validar campos obrigatórios e CPF inválido', async ({ page }) => {
    // Abre modal de novo paciente
    const btnNovoPaciente = page.getByRole('button', { name: /Novo paciente/i });
    await expect(async () => {
      await btnNovoPaciente.click();
      await expect(page.locator('.modal-title:has-text("Novo paciente")')).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });

    // Tenta salvar com formulário em branco
    await page.click('.modal-footer button[type="submit"]');

    // Mensagens de validação esperadas
    await expect(page.locator('.text-danger:has-text("Informe o nome")')).toBeVisible();
    await expect(page.locator('.text-danger:has-text("Informe o CPF")')).toBeVisible();
    await expect(page.locator('.text-danger:has-text("Informe a data de nascimento")')).toBeVisible();

    // Insere CPF inválido
    await page.fill('#cpf', '111.111.111-11');
    await page.click('.modal-footer button[type="submit"]');
    await expect(page.locator('.text-danger:has-text("CPF inválido")')).toBeVisible();
  });

  test('Deve permitir buscar paciente na listagem', async ({ page }) => {
    const nomePaciente = `BuscaTeste ${Date.now()}`;
    const cpfValido = gerarCpfValido();

    // Abre modal de novo paciente
    const btnNovoPaciente = page.getByRole('button', { name: /Novo paciente/i });
    await expect(async () => {
      await btnNovoPaciente.click();
      await expect(page.locator('.modal-title:has-text("Novo paciente")')).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });

    // Preenche dados e salva
    await page.fill('#nome', nomePaciente);
    await page.fill('#cpf', cpfValido);
    await page.fill('#nascimento', '1990-01-01');
    await page.click('.modal-footer button[type="submit"]');
    await expect(page.locator('.alert-success')).toContainText('Paciente cadastrado com sucesso', { timeout: 10000 });

    // Utiliza o campo de busca
    const campoBusca = page.locator('input[type="search"]');
    await campoBusca.fill(nomePaciente);

    // Valida que apenas o registro buscado aparece na tabela
    await expect(page.locator('table tbody tr')).toHaveCount(1);
    await expect(page.locator('table tbody')).toContainText(nomePaciente);
  });
});
