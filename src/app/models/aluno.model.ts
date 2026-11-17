export type StatusAluno = 'ATIVO' | 'INATIVO';

export interface Aluno {
  idAluno?: number;
  nomeAluno: string;
  matricula: number;
  saldo: number;
  status: StatusAluno;
}

export interface ValorRequest {
  valor: number;
}

export type OperacaoSaldo = 'debitar' | 'recarregar';
