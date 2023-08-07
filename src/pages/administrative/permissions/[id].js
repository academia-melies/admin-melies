import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Avatar, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { formatCNPJ } from "../../../helpers"
import { icons } from "../../../organisms/layout/Colors"

const permissions = [
    {
        text: 'Administrativo',
        icon: 'https://mf-planejados.s3.amazonaws.com/icon_adm_dark.svg',
        items: [
            {
                to: '/administrative/institution/list',
                text: 'Instituição',
            },
            {
                to: '/administrative/users/list',
                text: 'Usuários',
            },
            {
                to: '/administrative/permissions/list',
                text: 'Permissões',
            },
            {
                to: '/administrative/calendar/calendar',
                text: 'Calendário',
            },
            {
                to: '/administrative/course/list',
                text: 'Curso',
            },
            {
                to: '/administrative/discipline/list',
                text: 'Disciplina',
            },
            {
                to: '/administrative/grid/list',
                text: 'Grade',
            },
            {
                to: '/administrative/class/list',
                text: 'Turma',
            },
            {
                to: '/administrative/classSchedule/list',
                text: 'Cronograma',
            },
        ]
    },
    {
        text: 'Acadêmico',
        icon: 'https://mf-planejados.s3.amazonaws.com/Icon_academico.svg',
        items: [
            {
                to: '/#',
                text: 'Nota',
            },
            {
                to: '/#',
                text: 'Frequência',
            },
        ]
    },
    {
        text: 'Biblioteca',
        icon: 'https://mf-planejados.s3.amazonaws.com/Icon_biblioteca.svg',
        items: [
            {
                to: '/#',
                text: 'Cadastro',

            },
            {
                to: '/#',
                text: 'Empréstimo',
            },
        ]
    },
    {
        text: 'Financeiro',
        icon: 'https://mf-planejados.s3.amazonaws.com/Icon_financeiro.svg',
        items: [
            {
                to: '/#',
                text: 'Contas',

            },
            {
                to: '/#',
                text: 'Valores',
            },
            {
                to: '/#',
                text: 'Relatórios',
            },
        ]
    },
    {
        text: 'Marketing',
        icon: 'https://mf-planejados.s3.amazonaws.com/Icon_mkt.svg',
        to: '/#',
        items: [
            {
                to: '/#',
                text: 'Contato',
            },
            {
                to: '/#',
                text: 'Pesquisa',
            },
            {
                to: '/marketing/imageManagement/images',
                text: 'Imagens',
            },
        ]
    },
    {
        text: 'Suporte',
        icon: 'https://mf-planejados.s3.amazonaws.com/Icon_suporte.svg',
        to: '/#',
        items: [
            {
                to: '/#',
                text: 'Solicitações',
            },
            {
                to: '/#',
                text: 'Patrimônio',
            },
        ]
    },
]

export default function EditPermissions(props) {
    const { setLoading, alert, colorPalette, theme } = useAppContext()
    const router = useRouter()
    const { id } = router.query;
    const newPermissions = id === 'new';
    const [permissionGroup, setPermissionGroup] = useState({
        permissoes: []
    })
    const [actionPermission, setActionPermission] = useState('')
    const [showScreens, setShowScreens] = useState({});
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const getGroupPermission = async () => {
        try {
            const response = await api.get(`/groupPermission/${id}`)
            const { data } = response
            setPermissionGroup(data)
        } catch (error) {
            console.log(error)
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
            alert.error('Ocorreu um arro ao carregar A instituição')
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
    const handleScreenPermissionChange = (screen, action, value) => {
        setPermissionGroup((prevPermissionGroup) => ({
            ...prevPermissionGroup,
            permissoes: {
                ...prevPermissionGroup.permissoes,
                [screen]: {
                    ...prevPermissionGroup.permissoes[screen],
                    [action]: value,
                },
            },
        }));
    };


    console.log(permissionGroup)

    const handleCreate = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/institution/create`, { permissionGroup });
                const { data } = response
                console.group(data)
                if (response?.status === 201) {
                    alert.success('Instituição cadastrada com sucesso.');
                    router.push(`/administrative/institution/${data?.institution}`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar Instituição.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/institution/delete/${id}`)
            if (response?.status == 201) {
                alert.success('Instituição excluída com sucesso.');
                router.push(`/administrative/institution/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir Instituição.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/institution/update/${id}`, { permissionGroup })
            if (response?.status === 201) {
                alert.success('Instituição atualizada com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Instituição.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Instituição.');
        } finally {
            setLoading(false)
        }
    }

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupPerfil = [
        { label: 'edição', value: 'edição' },
        { label: 'leitura', value: 'leitura' },
    ]

    return (
        <>
            <SectionHeader
                title={permissionGroup.permissao || `Nova Permissão`}
                saveButton
                saveButtonAction={newPermissions ? handleCreate : handleEdit}
                deleteButton={!newPermissions}
                deleteButtonAction={() => handleDelete()}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, boxShadow: 'none' }}>
                <Box>
                    <Text title style={{ padding: '0px 0px 20px 0px' }}>Lista de permissões</Text>
                </Box>
                <TextInput placeholder='ex: Master' name='permissao' onChange={handleChange} value={permissionGroup.permissao || ''} label='Permissão *' sx={{ flex: 1, }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {permissions.map((item, index) => {
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
                                    onClick={() => toggleScreens(index)}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5 }}>
                                        <Box sx={{ ...styles.icon, backgroundImage: `url(${item?.icon})`, width: 'auto', height: 20, aspectRatio: '1/1', filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)', transition: 'background-color 1s' }} />
                                        <Text bold style={{ color: colorPalette.textColor, transition: 'background-color 1s', }}>
                                            {menu}
                                        </Text>
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
                                        return (
                                            <Box sx={{ display: 'flex', alignItem: 'center', flexDirection: 'column', padding: '20px 0px 0px 30px' }}
                                            key={`${item}-${index}`}>
                                                <Text bold style={{ color: colorPalette.buttonColor }}>{menu.text}</Text>
                                                <CheckBoxComponent
                                                    valueChecked={permissionGroup[menu]?.actionPermission}
                                                    boxGroup={groupPerfil}
                                                    horizontal={mobile ? false : true}
                                                    onSelect={(value) => handleScreenPermissionChange(menu.text, 'action', value)}
                                                    // handleDayDataChange(dayWeek, 'disciplina_id', value)
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
    }
}