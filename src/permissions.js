export const menuItems = [
   {
      text: 'Administrativo',
      // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação'],
      items: [
         {
            to: '/employee/list',
            text: 'Funcionarios',
            icon: 'employee_icon.png',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/student/list',
            text: 'Alunos',
            icon: 'student_icon.png',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
      ]
   },
   {
      text: 'Financeiro',
      // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação'],
      items: [
         {
            to: '/#',
            text: 'Notas',
            icon: 'employee_icon.png',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
         {
            to: '/#',
            text: 'Relatórios',
            icon: 'student_icon.png',
            // permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
      ]
   },
];