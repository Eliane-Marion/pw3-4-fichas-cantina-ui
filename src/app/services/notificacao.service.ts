import { Injectable, signal } from '@angular/core';

export type TipoNotificacao = 'sucesso' | 'erro';

export interface Notificacao {
  tipo: TipoNotificacao;
  texto: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly _notificacao = signal<Notificacao | null>(null);

  readonly notificacao = this._notificacao.asReadonly();

  private timer?: ReturnType<typeof setTimeout>;

  sucesso(texto: string): void {
    this.exibir({ tipo: 'sucesso', texto });
  }

  erro(texto: string): void {
    this.exibir({ tipo: 'erro', texto });
  }

  fechar(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this._notificacao.set(null);
  }

  private exibir(notificacao: Notificacao): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this._notificacao.set(notificacao);
    this.timer = setTimeout(() => this._notificacao.set(null), 6000);
  }
}
