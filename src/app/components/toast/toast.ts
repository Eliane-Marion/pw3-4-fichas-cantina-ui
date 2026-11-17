import { Component, inject } from '@angular/core';

import { NotificacaoService } from '../../services/notificacao.service';

@Component({
  selector: 'app-toast',
  template: `
    @if (notificacao.notificacao(); as item) {
      <div
        class="toast"
        [class.toast-sucesso]="item.tipo === 'sucesso'"
        [class.toast-erro]="item.tipo === 'erro'"
        role="status"
        aria-live="polite"
      >
        <span class="toast-icone">{{ item.tipo === 'sucesso' ? '✅' : '❌' }}</span>
        <span class="toast-texto">{{ item.texto }}</span>
        <button
          type="button"
          class="toast-fechar"
          (click)="notificacao.fechar()"
          aria-label="Fechar mensagem"
        >
          ×
        </button>
      </div>
    }
  `,
  styles: [
    `
      .toast {
        position: fixed;
        right: 1.25rem;
        bottom: 1.25rem;
        z-index: 1000;
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        max-width: min(26rem, calc(100vw - 2.5rem));
        padding: 0.9rem 1rem;
        border-radius: 0.75rem;
        background: #ffffff;
        color: #1e293b;
        font-size: 0.9rem;
        line-height: 1.4;
        box-shadow: 0 18px 40px -18px rgba(15, 23, 42, 0.45);
        border-left: 5px solid #16a34a;
        animation: entrar 0.2s ease-out;
      }

      .toast-erro {
        border-left-color: #dc2626;
      }

      .toast-icone {
        flex-shrink: 0;
        line-height: 1.4;
      }

      .toast-texto {
        flex: 1;
      }

      .toast-fechar {
        flex-shrink: 0;
        border: 0;
        background: transparent;
        color: #64748b;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
        padding: 0 0.1rem;
      }

      .toast-fechar:hover {
        color: #0f172a;
      }

      @keyframes entrar {
        from {
          opacity: 0;
          transform: translateY(0.75rem);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class Toast {
  protected readonly notificacao = inject(NotificacaoService);
}
