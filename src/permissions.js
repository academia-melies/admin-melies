export const menuItems = [
   {
      text: 'Administrativo', icon: 'adm_icon.png',
      // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação'],
      items: [
         {
            to: '/employee/list',
            text: 'Funcionarios',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/student/list',
            text: 'Alunos',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
      ]
   },
   {
      text: 'Acadêmico', icon: 'academico_icon.png',
      // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação'],
      items: [
         {
            to: '/#',
            text: 'Nota',

            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/#',
            text: 'Frequência',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
      ]
   },
   {
      text: 'Biblioteca', icon: 'biblioteca_icon.png',
      // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação'],
      items: [
         {
            to: '/#',
            text: 'Cadastro',

            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/#',
            text: 'Empréstimo',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
      ]
   },
   {
      text: 'Financeiro', icon: 'financeiro_icon.png',
      // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação'],
      items: [
         {
            to: '/#',
            text: 'Contas',

            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/#',
            text: 'Valores',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/#',
            text: 'Relatórios',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
      ]
   },
   {
      text: 'Marketing', icon: 'mkt_icon.png',
      // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação'],
      items: [
         {
            to: '/#',
            text: 'Contato',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/#',
            text: 'Pesquisa',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
      ]
   },
   {
      text: 'Suporte', icon: 'suporte_icon.png',
      // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação'],
      items: [
         {
            to: '/#',
            text: 'Solicitações',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/#',
            text: 'Patrimônio',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
      ]
   },
];