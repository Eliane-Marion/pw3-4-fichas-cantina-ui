import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Aluno, OperacaoSaldo } from '../../models/aluno.model';
import { AlunoService } from '../../services/aluno.service';
import { NotificacaoService } from '../../services/notificacao.service';

@Component({
  selector: 'app-listagem',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './listagem.html',
  styleUrl: './listagem.css',
})
export class Listagem implements OnInit {
  private readonly alunoService = inject(AlunoService);
  private readonly notificacao = inject(NotificacaoService);

  protected readonly alunos = signal<Aluno[]>([]);
  protected readonly carregando = signal(true);
  protected readonly filtro = signal('');

  protected readonly totalAtivos = computed(
    () => this.alunos().filter((aluno) => aluno.status === 'ATIVO').length,
  );
  protected readonly saldoTotal = computed(() =>
    this.alunos().reduce((total, aluno) => total + (aluno.saldo ?? 0), 0),
  );

  protected readonly alunosFiltrados = computed(() => {
    const termo = this.filtro().trim().toLowerCase();
    if (!termo) {
      return this.alunos();
    }

    return this.alunos().filter(
      (aluno) =>
        aluno.nomeAluno?.toLowerCase().includes(termo) ||
        String(aluno.matricula ?? '').includes(termo) ||
        aluno.status?.toLowerCase().includes(termo),
    );
  });

  protected readonly operacao = signal<OperacaoSaldo | null>(null);
  protected readonly alunoSelecionado = signal<Aluno | null>(null);
  protected readonly valor = signal<number | null>(null);
  protected readonly processando = signal(false);
  protected readonly erroModal = signal<string | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);

    this.alunoService.listar().subscribe({
      next: (alunos) => {
        this.alunos.set(alunos);
        this.carregando.set(false);
      },
      error: (erro: Error) => {
        this.carregando.set(false);
        this.notificacao.erro(erro.message);
      },
    });
  }

  protected atualizarFiltro(event: Event): void {
    this.filtro.set((event.target as HTMLInputElement).value);
  }

  protected abrirOperacao(aluno: Aluno, operacao: OperacaoSaldo): void {
    this.alunoSelecionado.set(aluno);
    this.operacao.set(operacao);
    this.valor.set(null);
    this.erroModal.set(null);
  }

  protected fecharModal(): void {
    if (this.processando()) {
      return;
    }

    this.operacao.set(null);
    this.alunoSelecionado.set(null);
    this.valor.set(null);
    this.erroModal.set(null);
  }

  protected atualizarValor(event: Event): void {
    const texto = (event.target as HTMLInputElement).value;
    const valor = Number(texto);
    this.valor.set(texto === '' || Number.isNaN(valor) ? null : valor);
  }

  protected confirmarOperacao(): void {
    const aluno = this.alunoSelecionado();
    const operacao = this.operacao();
    const valor = this.valor();

    if (!aluno?.idAluno || !operacao) {
      return;
    }

    if (valor === null || !Number.isFinite(valor) || valor <= 0) {
      this.erroModal.set('Informe um valor maior que zero para continuar.');
      return;
    }

    this.processando.set(true);
    this.erroModal.set(null);

    const requisicao =
      operacao === 'debitar'
        ? this.alunoService.debitar(aluno.idAluno, valor)
        : this.alunoService.recarregar(aluno.idAluno, valor);

    requisicao.subscribe({
      next: (atualizado) => {
        this.alunos.update((alunos) =>
          alunos.map((item) => (item.idAluno === atualizado.idAluno ? atualizado : item)),
        );
        this.processando.set(false);
        this.fecharModal();

        const acao = operacao === 'debitar' ? 'Débito' : 'Recarga';
        const conclusao = operacao === 'debitar' ? 'realizado' : 'realizada';
        this.notificacao.sucesso(
          `${acao} de ${this.formatarMoeda(valor)} ${conclusao} com sucesso! ` +
            `Novo saldo: ${this.formatarMoeda(atualizado.saldo ?? 0)}.`,
        );
      },
      error: (erro: Error) => {
        this.processando.set(false);
        this.erroModal.set(erro.message);
      },
    });
  }

  protected excluir(aluno: Aluno): void {
    if (!aluno.idAluno) {
      return;
    }

    const confirmado = window.confirm(
      `Deseja realmente excluir/inativar a ficha de "${aluno.nomeAluno}"?`,
    );

    if (!confirmado) {
      return;
    }

    this.alunoService.excluir(aluno.idAluno).subscribe({
      next: (atualizado) => {
        this.alunos.update((alunos) =>
          alunos.map((item) => (item.idAluno === atualizado.idAluno ? atualizado : item)),
        );
        this.notificacao.sucesso(`Ficha de "${atualizado.nomeAluno}" inativada com sucesso.`);
      },
      error: (erro: Error) => this.notificacao.erro(erro.message),
    });
  }

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }
}
