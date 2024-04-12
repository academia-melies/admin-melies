import { api } from "../api/api";

export const checkUserPermissions = async (router, userPermissions, menuItems) => {

    const menu = router.pathname === '/' ? null : router.asPath.split('/')[1]
    const subMenu = router.pathname === '/' ? null : router.asPath.split('/')[2]

    console.log(menu)

    console.log(subMenu)

    let menuItemsList = menuItems;
    let permissionsItem;
    let itemMenuId;

    if (menuItemsList?.length < 1) {
        menuItemsList = await handleMenuItems()
    }
    const menuItem = menuItemsList?.find(item => item?.items.some(subitem => subitem?.to?.includes(`/${menu}/${subMenu}`)));

    if (menuItem && menuItem.items) {
        const subMenuItem = menuItem?.items?.find(subitem => subitem?.to?.includes(`/${menu}/${subMenu}`));
        itemMenuId = subMenuItem?.id_item;
        permissionsItem = subMenuItem.permissoes;
    }

    console.log(menuItem)
    console.log(permissionsItem)

    const userHasPermissions = userPermissions?.some(userPerm =>
        permissionsItem?.some(reqPerm => userPerm.id_grupo_perm === reqPerm.grupo_perm_id)
    );

    const userHasEditPermission = userHasPermissions ? userPermissions?.some(userPerm =>
        userPerm.item_id === itemMenuId && userPerm.acao?.includes('edição')
    ) : false;

    return userHasEditPermission
}

const handleMenuItems = async () => {
    try {
        const response = await api.get(`/menuItems`)
        const { data } = response
        return data
    } catch (error) {
        console.log(error)
        return error
    }
}