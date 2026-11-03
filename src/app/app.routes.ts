import { Routes } from '@angular/router';

import { Formulario } from './components/formulario/formulario';
import { Listagem } from './components/listagem/listagem';

export const routes: Routes = [
  { path: '', component: Listagem, title: 'Fichas da Cantina' },
  { path: 'novo', component: Formulario, title: 'Nova ficha do aluno' },
  { path: 'editar/:id', component: Formulario, title: 'Editar ficha do aluno' },
  { path: '**', redirectTo: '' },
];
