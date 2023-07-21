export const menuItems = [
   {
      text: 'Administrativo',
      icon_clear: 'https://mf-planejados.s3.amazonaws.com/icon_adm_dark.svg',
      icon_dark: 'https://mf-planejados.s3.amazonaws.com/employee_icon.png',
      to: '/administrative/users/list',
      // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação'],
      items: [
         {
            to: '/administrative/institution/list',
            text: 'Instituição',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/administrative/users/list',
            text: 'Usuarios',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/administrative/calendar/calendar',
            text: 'Calendario',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/administrative/course/list',
            text: 'Curso',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/administrative/discipline/list',
            text: 'Disciplina',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/administrative/grid/list',
            text: 'Grade',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/administrative/class/list',
            text: 'Turma',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/administrative/classSchedule/list',
            text: 'Cronograma de aulas',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
      ]
   },
   {
      text: 'Acadêmico',
      icon_clear: 'https://mf-planejados.s3.amazonaws.com/Icon_academico.svg',
      icon_dark: 'https://mf-planejados.s3.amazonaws.com/Icon_academico.svg',
      to: '/#',
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
      to: '/#',
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
      to: '/#',
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
      to: '/#',
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
         {
            to: '/marketing/imageManagement/editPages',
            text: 'Gerenciamento de imagens',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
      ]
   },
   {
      text: 'Suporte', icon_clear: 'icon_suporte.svg', icon_dark: 'https://mf-planejados.s3.amazonaws.com/Icon_suporte.svg',
      to: '/#',
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