import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { Aluno, OperacaoSaldo, ValorRequest } from '../models/aluno.model';

@Injectable({ providedIn: 'root' })
export class AlunoService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/alunos';

  listar(): Observable<Aluno[]> {
    return this.http
      .get<Aluno[]>(this.apiUrl)
      .pipe(catchError((erro) => this.tratarErro(erro)));
  }

  buscarPorId(id: number): Observable<Aluno> {
    return this.http
      .get<Aluno>(`${this.apiUrl}/${id}`)
      .pipe(catchError((erro) => this.tratarErro(erro)));
  }

  cadastrar(aluno: Aluno): Observable<Aluno> {
    return this.http
      .post<Aluno>(this.apiUrl, aluno)
      .pipe(catchError((erro) => this.tratarErro(erro)));
  }

  atualizar(id: number, aluno: Aluno): Observable<Aluno> {
    return this.http
      .put<Aluno>(`${this.apiUrl}/${id}`, aluno)
      .pipe(catchError((erro) => this.tratarErro(erro)));
  }

  excluir(id: number): Observable<Aluno> {
    return this.http
      .delete<Aluno>(`${this.apiUrl}/${id}`)
      .pipe(catchError((erro) => this.tratarErro(erro)));
  }

  debitar(id: number, valor: number): Observable<Aluno> {
    return this.executarRegra(id, 'debitar', valor);
  }

  recarregar(id: number, valor: number): Observable<Aluno> {
    return this.executarRegra(id, 'recarregar', valor);
  }

  executarRegra(id: number, operacao: OperacaoSaldo, valor: number): Observable<Aluno> {
    const body: ValorRequest = { valor };

    return this.http
      .post<Aluno>(`${this.apiUrl}/${id}/${operacao}`, body)
      .pipe(catchError((erro) => this.tratarErro(erro)));
  }

  private tratarErro(erro: HttpErrorResponse): Observable<never> {
    let mensagem = 'Não foi possível concluir a operação. Tente novamente.';

    if (erro.status === 0) {
      mensagem =
        'Não foi possível conectar ao servidor (http://localhost:8080). ' +
        'Verifique se o backend Spring Boot está em execução.';
    } else if (typeof erro.error === 'string' && erro.error.trim().length > 0) {
      mensagem = erro.error.trim();
    } else if (erro.error && typeof erro.error === 'object' && 'message' in erro.error) {
      const message = (erro.error as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim().length > 0) {
        mensagem = message.trim();
      }
    } else if (erro.status === 404) {
      mensagem = 'Registro não encontrado.';
    } else if (erro.status === 409) {
      mensagem = 'A operação não pode ser concluída devido a um conflito nos dados.';
    }

    console.error('[AlunoService]', erro);
    return throwError(() => new Error(mensagem));
  }
}
