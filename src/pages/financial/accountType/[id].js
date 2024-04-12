import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createClass, deleteClass, editClass } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { IconStatus } from "../../../organisms/Table/table"

export default function EditAccountType(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newAccountType = id === 'new';
    const [accountTypeData, setAccountTypeData] = useState({
        nome_tipo: null,
        ativo: 1
    })
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
        fetchPermissions()
    }, [])
    const getAccountType = async () => {
        try {
            const response = await api.get(`/account/type/${id}`)
            const { data } = response
            setAccountTypeData(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        (async () => {
            if (newAccountType) {
                return
            }
            await handleItems();

        })();
    }, [id])



    const handleItems = async () => {
        setLoading(true)
        try {
            await getAccountType()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar o Tipo de Conta')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (event) => {

        setAccountTypeData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!accountTypeData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreate = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/account/type/create`, { accountTypeData, userId });
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Tipo de Conta cadastrado com sucesso.');
                    router.push(`/financial/accountType/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar o Tipo de Conta.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/account/type/delete/${id}`);
            if (response?.status === 200) {
                alert.success('Tipo de Conta excluído.');
                router.push(`/financial/accountType/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o Tipo de Conta.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/account/type/update/${id}`, { accountTypeData })
                if (response?.status === 201) {
                    alert.success('Tipo de Conta atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Tipo de Conta.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Tipo de Conta.');
            } finally {
                setLoading(false)
            }
        }
    }

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                perfil={accountTypeData?.area}
                title={accountTypeData?.nome_tipo || `Novo Tipo de Conta`}
                saveButton={isPermissionEdit}
                saveButtonAction={newAccountType ? handleCreate : handleEdit}
                inativeButton={!newAccountType && isPermissionEdit}
                inativeButtonAction={(event) => setShowConfirmationDialog({
                    active: true,
                    event,
                    acceptAction: handleDelete,
                    title: 'Inativar Tipo de conta',
                    message: 'O Tipo de conta será inativada, e ficará por um tempo no banco de dados, até que seja excluída.'
                })}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', padding: '0px 0px 20px 0px' }}>
                    <Text title bold>Dados do Tipo de conta</Text>
                    <IconStatus
                        style={{ backgroundColor: accountTypeData.ativo >= 1 ? 'green' : 'red', boxShadow: accountTypeData.ativo >= 1 ? `#2e8b57 0px 6px 24px` : `#900020 0px 6px 24px`, }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Ex: Administrativo terceirizado' name='nome_tipo' onChange={handleChange} value={accountTypeData?.nome_tipo || ''} label='Nome do Tipo:' sx={{ flex: 1, }} />
                </Box>
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={accountTypeData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setAccountTypeData({ ...accountTypeData, ativo: parseInt(value) })} />
            </ContentContainer>
        </>
    )
}

const styles = {
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