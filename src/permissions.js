export const menuItems = [
   {
      text: 'Administrativo', icon_clear: 'https://mf-planejados.s3.amazonaws.com/icon_adm_dark.svg', icon_dark: 'https://mf-planejados.s3.amazonaws.com/employee_icon.png',
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
      text: 'Acadêmico', icon_clear: 'https://mf-planejados.s3.amazonaws.com/Icon_academico.svg', icon_dark: 'https://mf-planejados.s3.amazonaws.com/Icon_academico.svg',
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
      text: 'Biblioteca', icon_clear: 'https://mf-planejados.s3.amazonaws.com/Icon_biblioteca.svg', icon_dark: 'https://mf-planejados.s3.amazonaws.com/Icon_biblioteca.svg',
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
      text: 'Financeiro', icon_clear: 'icon_financeiro.svg', icon_dark: 'https://mf-planejados.s3.amazonaws.com/Icon_financeiro.svg',
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
      text: 'Marketing', icon_clear: 'icon_mkt.svg', icon_dark: 'https://mf-planejados.s3.amazonaws.com/Icon_mkt.svg',
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
      text: 'Suporte', icon_clear: 'icon_suporte.svg', icon_dark: 'https://mf-planejados.s3.amazonaws.com/Icon_suporte.svg',
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