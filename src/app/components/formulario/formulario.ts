import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Aluno, StatusAluno } from '../../models/aluno.model';
import { AlunoService } from '../../services/aluno.service';
import { NotificacaoService } from '../../services/notificacao.service';

@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly alunoService = inject(AlunoService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly id = signal<number | null>(null);
  protected readonly editando = computed(() => this.id() !== null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nomeAluno: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(60)],
    ],
    matricula: [null as number | null, [Validators.required, Validators.min(1)]],
    saldo: [null as number | null, [Validators.required, Validators.min(0)]],
    status: ['ATIVO' as StatusAluno, [Validators.required]],
  });

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');

    if (param !== null) {
      const id = Number(param);

      if (Number.isNaN(id)) {
        this.erro.set('Identificador inválido.');
        return;
      }

      this.id.set(id);
      this.form.controls.matricula.disable();
      this.form.controls.status.disable();
      this.carregar(id);
    }
  }

  protected campoInvalido(campo: 'nomeAluno' | 'matricula' | 'saldo' | 'status'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Verifique os campos destacados antes de salvar.');
      return;
    }

    const valores = this.form.getRawValue();
    const aluno: Aluno = {
      nomeAluno: valores.nomeAluno ?? '',
      matricula: valores.matricula ?? 0,
      saldo: valores.saldo ?? 0,
      status: valores.status ?? 'ATIVO',
    };

    this.salvando.set(true);
    this.erro.set(null);

    const id = this.id();
    const requisicao =
      id !== null
        ? this.alunoService.atualizar(id, { ...aluno, idAluno: id })
        : this.alunoService.cadastrar(aluno);

    requisicao.subscribe({
      next: (salvo) => {
        this.salvando.set(false);
        this.notificacao.sucesso(
          id !== null
            ? `Ficha de "${salvo.nomeAluno}" atualizada com sucesso!`
            : `Ficha de "${salvo.nomeAluno}" cadastrada com sucesso!`,
        );
        this.router.navigate(['/']);
      },
      error: (erro: Error) => {
        this.salvando.set(false);
        this.erro.set(erro.message);
        this.notificacao.erro(erro.message);
      },
    });
  }

  private carregar(id: number): void {
    this.carregando.set(true);

    this.alunoService.buscarPorId(id).subscribe({
      next: (aluno) => {
        this.form.patchValue({
          nomeAluno: aluno.nomeAluno,
          matricula: aluno.matricula,
          saldo: aluno.saldo,
          status: aluno.status,
        });
        this.carregando.set(false);
      },
      error: (erro: Error) => {
        this.carregando.set(false);
        this.erro.set(erro.message);
        this.notificacao.erro(erro.message);
      },
    });
  }
}
