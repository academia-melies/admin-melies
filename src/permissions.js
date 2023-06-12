export const menuItems = [
   {
      text: 'Usuarios',
      permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação'],
      items: [
         {
            to: '/users/list',
            text: 'Usuario',
            icon: '',
            permissions: ['Diretor', 'Financeiro', 'Admin', 'Cordenação']
         },
      ]
   },
];