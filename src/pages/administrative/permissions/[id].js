import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"

export default function EditPermissions(props) {
    const { setLoading, alert, colorPalette, theme, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newPermissions = id === 'new';
    const [permissionGroup, setPermissionGroup] = useState({
        permissoes: []
    })
    const [showScreens, setShowScreens] = useState({});
    const [menuItems, setMenuItems] = useState([]);
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)


    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        const handleMenuItems = async () => {
            try {
                const response = await api.get(`/menuItems`)
                const { data } = response
                if (response.status === 200) {
                    setMenuItems(data)
                }
            } catch (error) {
                console.log(error)
                return error
            }
        }
        handleMenuItems()
    }, [])

    useEffect(() => {
        (async () => {
            if (newPermissions) {
                return
            }
            await handleItems();
        })();
    }, [id])

    useEffect(() => {
        fetchPermissions()
    }, [])

    const getGroupPermission = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/permission/${id}`)
            const { data } = response
            data.map((item) => setPermissionGroup(item))

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const toggleScreens = (index) => {
        setShowScreens(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };


    const handleItems = async () => {
        setLoading(true)
        try {
            await getGroupPermission()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar permissões')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setPermissionGroup((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleScreenPermissionChange = (screen, action, value, item) => {
        setPermissionGroup((prevPermissionGroup) => {
            const updatedPermissions = prevPermissionGroup.permissoes.map(permission => {
                if (permission.item === screen) {
                    return { ...permission, acao: value !== null ? value : null }
                }
                return permission;
            });

            if (!updatedPermissions.some(permission => permission.item === screen)) {
                updatedPermissions.push({ item: screen, acao: value !== null ? value : null, item_id: item });
            }

            return {
                ...prevPermissionGroup,
                permissoes: updatedPermissions,
            };
        });
    };


    const selectAllSubmenuPermissions = (subMenus) => {

        const isAnyCheckboxUnchecked = subMenus.some(menu => {
            const permissions = permissionGroup.permissoes;
            const permission = permissions.find(permission => permission.item === menu.text);
            return permission && permission.acao !== 'leitura, edição';
        });

        const value = isAnyCheckboxUnchecked ? 'leitura, edição' : null;

        subMenus.forEach(menu => {
            handleScreenPermissionChange(menu.text, 'action', value, menu.id_item)
        });
    };

    const handleCreate = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/permission/create/${userId}`, { permissionGroup });
            if (response?.status === 201) {
                const { groupId } = response.data
                alert.success('Permissões criadas com sucesso.');
                router.push(`/administrative/permissions/list`)
            }
        } catch (error) {
            console.log(error)
            alert.error('Tivemos um problema ao cadastrar Permissões.');
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/permission/delete/${id}`)
            if (response?.status == 201) {
                alert.success('Permissões excluídas com sucesso.');
                router.push(`/administrative/permission/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir Permissões.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/permission/update/${userId}`, { permissionGroup })
            if (response?.status === 201) {
                alert.success('Permissões atualizada com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Permissões.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Permissões.');
        } finally {
            setLoading(false)
        }
    }

    const groupPerfil = [
        { label: 'edição', value: 'edição' },
        { label: 'leitura', value: 'leitura' },
    ]

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={permissionGroup?.permissao || `Nova Permissão`}
                saveButton={isPermissionEdit}
                saveButtonAction={newPermissions ? handleCreate : handleEdit}
                deleteButton={!newPermissions && isPermissionEdit}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDelete })}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, boxShadow: 'none' }}>
                <Box>
                    <Text title style={{ padding: '0px 0px 20px 0px' }}>Lista de permissões</Text>
                </Box>
                <TextInput disabled={!isPermissionEdit && true} placeholder='ex: Master' name='permissao' onChange={handleChange} value={permissionGroup.permissao || ''} label='Permissão *' sx={{ flex: 1, }} />

                <RadioItem disabled={!isPermissionEdit && true} valueRadio={permissionGroup?.ativo} group={groupStatus} title="Status *" horizontal={mobile ? false : true} onSelect={(value) => setPermissionGroup({ ...permissionGroup, ativo: parseInt(value) })} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {menuItems?.map((item, index) => {
                        const menu = item?.text;
                        const subMenus = item.items;
                        return (
                            <ContentContainer style={{ display: 'flex', flexDirection: 'column', gap: 2 }} key={`${item}-${index}`}>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 4,
                                        width: '100%',
                                        "&:hover": {
                                            opacity: 0.8,
                                            cursor: 'pointer'
                                        }
                                    }}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        toggleScreens(index)
                                    }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 5, alignItems: 'center', }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5, alignItems: 'center', }}>
                                            <Box sx={{ ...styles.icon, backgroundImage: `url(${item?.icon})`, width: item.text === 'Administrativo' ? 15 : 18, height: item.text === 'Administrativo' ? 24 : 18, aspectRatio: '1/1', filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)', transition: 'background-color 1s' }} />
                                            <Text bold style={{ color: colorPalette.textColor, transition: 'background-color 1s', }}>
                                                {menu}
                                            </Text>
                                        </Box>
                                        <Button disabled={!isPermissionEdit && true} small text="selecionar tudo" sx={{ zIndex: 9999 }} onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            selectAllSubmenuPermissions(subMenus)
                                        }
                                        } />
                                    </Box>

                                    <Box
                                        sx={{
                                            ...styles.menuIcon,
                                            backgroundImage: `url(${icons.gray_arrow_down})`,
                                            transform: showScreens[index] ? 'rotate(0)' : 'rotate(-90deg)',
                                            transition: '.3s',
                                            width: 17,
                                            height: 17,
                                        }}
                                    />
                                </Box>

                                {showScreens[index] && (
                                    subMenus.map((menu, index) => {

                                        const groupPermissionsAction = {}; // Usar objeto em vez de array
                                        const permissions = permissionGroup.permissoes;
                                        permissions.forEach((permission) => {
                                            if (permission.item === menu.text) {
                                                if (!groupPermissionsAction[menu.text]) {
                                                    groupPermissionsAction[menu.text] = '';
                                                }
                                                if (groupPermissionsAction[menu.text]) {
                                                    groupPermissionsAction[menu.text] += ', ';
                                                }
                                                groupPermissionsAction[menu.text] += permission.acao;
                                            }
                                        });

                                        const valueCheckedItem = groupPermissionsAction[menu.text] || '';

                                        return (
                                            <Box sx={{ display: 'flex', alignItem: 'center', flexDirection: 'column', padding: '20px 0px 0px 30px' }}
                                                key={`${item}-${index}`}>
                                                <Text bold style={{ color: colorPalette.buttonColor }}>{menu.text}</Text>
                                                <CheckBoxComponent
                                                    disabled={!isPermissionEdit && true}
                                                    valueChecked={valueCheckedItem}
                                                    boxGroup={groupPerfil}
                                                    horizontal={mobile ? false : true}
                                                    onSelect={(value) => {
                                                        handleScreenPermissionChange(menu.text, 'action', value, menu.id_item)
                                                    }}
                                                    sx={{ flex: 1, }}
                                                />
                                            </Box>
                                        )
                                    })
                                )}

                            </ContentContainer>
                        )

                    })}
                </Box>
            </ContentContainer>
        </>
    )
}

const styles = {
    containerRegister: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
        padding: '40px'
    },
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
    inputSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-around',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    },
    icon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        width: '15px',
        height: '15px',
        marginRight: '0px',
        backgroundImage: `url('/favicon.svg')`,
    },
}