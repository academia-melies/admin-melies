import { api } from "../api/api";

export const checkUserPermissions = async (router, userPermissions, menuItemsList) => {


    const menu = router.pathname === '/' ? null : router.asPath.split('/')[1]
    const subMenu = router.pathname === '/' ? null : router.asPath.split('/')[2]

    let permissionsItem;
    let itemMenuId;

    const menuItem = menuItemsList.find(item => item.items.some(subitem => subitem.to.includes(`/${menu}/${subMenu}`)));

    if (menuItem && menuItem.items) {
        const subMenuItem = menuItem.items.find(subitem => subitem.to.includes(`/${menu}/${subMenu}`));
        itemMenuId = subMenuItem?.id_item;
        permissionsItem = subMenuItem.permissoes;
    }

    const userHasPermissions = userPermissions?.some(userPerm =>
        permissionsItem?.some(reqPerm => userPerm.id_grupo_perm === reqPerm.grupo_perm_id)
    );

    const userHasEditPermission = userHasPermissions ? userPermissions?.some(userPerm =>
        userPerm.item_id === itemMenuId && userPerm.acao?.includes('edição')
    ) : false;

    return userHasEditPermission

    // groupPermissionId = userHasPermissions ? userPermissions.find(item => permissionsItem.some(perm => perm.grupo_perm_id === item.id_grupo_perm)) : null;
    // console.log(userPermissions)

    // groupPermissionId = groupPermissionId?.id_grupo_perm;

    // const actions = await handleActions(itemMenuId, groupPermissionId)
}


// const handleActions = async (itemMenuId, groupPermissionId) => {
//     try {
//         let isPermissionAction = {
//             edit: false,
//             read: false
//         }

//         console.log(itemMenuId, groupPermissionId)
//         const response = await api.get(`/permission/screen/${groupPermissionId}/${itemMenuId}`)
//         const { acao } = response?.data
//         if (acao.includes(`edição`)) {
//             isPermissionAction.edit = true;
//         }
//         if (acao.includes(`leitura`)) {
//             isPermissionAction.read = true;
//         }
//         return isPermissionAction
//     } catch (error) {
//         return false
//     }
// }