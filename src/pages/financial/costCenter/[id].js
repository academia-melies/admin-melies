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

export default function EditCostCenter(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newCostCenter = id === 'new';
    const [costCenterData, setCostCenterData] = useState({
        nome_cc: null,
        area: '',
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
    const getCostCenter = async () => {
        try {
            const response = await api.get(`/costCenter/${id}`)
            const { data } = response
            setCostCenterData(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        (async () => {
            if (newCostCenter) {
                return
            }
            await handleItems();

        })();
    }, [id])



    const handleItems = async () => {
        setLoading(true)
        try {
            await getCostCenter()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar o Centro de Custo')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (event) => {

        setCostCenterData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!costCenterData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreate = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/costCenter/create`, { costCenterData, userId });
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Centro de Custo cadastrado com sucesso.');
                    router.push(`/financial/costCenter/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar o Centro de Custo.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/costCenter/delete/${id}`);
            if (response?.status === 200) {
                alert.success('Centro de Custo excluído.');
                router.push(`/financial/costCenter/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o Centro de Custo.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/costCenter/update/${id}`, { costCenterData })
                if (response?.status === 201) {
                    alert.success('Centro de Custo atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Centro de Custo.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Centro de Custo.');
            } finally {
                setLoading(false)
            }
        }
    }

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupArea = [
        { label: 'Financeiro', value: 'Financeiro' },
        { label: 'Biblioteca', value: 'Biblioteca' },
        { label: 'TI - Suporte', value: 'TI - Suporte' },
        { label: 'RH', value: 'RH' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Atendimento/Recepção', value: 'Atendimento/Recepção' },
        { label: 'Secretaria', value: 'Secretaria' },
        { label: 'Administrativo', value: 'Administrativo' },
        { label: 'Diretoria', value: 'Diretoria' },
        { label: 'Acadêmica', value: 'Acadêmica' },

    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                perfil={costCenterData?.area}
                title={costCenterData?.nome_cc || `Novo Centro de Custo`}
                saveButton={isPermissionEdit}
                saveButtonAction={newCostCenter ? handleCreate : handleEdit}
                deleteButton={!newCostCenter && isPermissionEdit}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDelete, title: 'Deseja Prosseguir?', message: 'Tem certeza que deseja excluír o centro de custo? Uma vez excluído, não será possível recupera-lo.' })}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados do Centro de Custo</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Ex: Administrativo terceirizado' name='nome_cc' onChange={handleChange} value={costCenterData?.nome_cc || ''} label='Nome do CC:' sx={{ flex: 1, }} />
                    <SelectList fullWidth data={groupArea} valueSelection={costCenterData?.area} onSelect={(value) => setCostCenterData({ ...costCenterData, area: value })}
                        title="Área:*" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={costCenterData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setCostCenterData({ ...costCenterData, ativo: parseInt(value) })} />
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