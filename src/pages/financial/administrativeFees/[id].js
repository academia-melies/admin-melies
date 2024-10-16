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

export default function EditAdministrativeFees(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newRate = id === 'new';
    const [rateData, setRateData] = useState({
        ensino_graduacao_taxa: null,
        prazo_taxa: null,
        valor_taxa: '0.00',
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
    const getRate = async () => {
        try {
            const response = await api.get(`/rate/${id}`)
            const { data } = response
            setRateData(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        (async () => {
            if (newRate) {
                return
            }
            await handleItems();

        })();
    }, [id])



    const handleItems = async () => {
        setLoading(true)
        try {
            await getRate()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Taxa')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (event) => {

        // if (event.target.name === 'valor_taxa') {
        //     const rawValue = event.target.value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

        //     if (rawValue === '') {
        //         event.target.value = '';
        //     } else {
        //         let intValue = rawValue.slice(0, -2) || 0; // Parte inteira
        //         const decimalValue = rawValue.slice(-2); // Parte decimal

        //         if (intValue === '0' && rawValue.length > 2) {
        //             intValue = '';
        //         }

        //         const formattedValue = `${intValue}.${decimalValue}`;
        //         event.target.value = formattedValue;
        //     }

        //     setRateData((prevValues) => ({
        //         ...prevValues,
        //         [event.target.name]: event.target.value,
        //     }));

        //     return;
        // }


        setRateData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!rateData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreateRate = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/rate/create`, { rateData, userId });
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Taxa cadastrada com sucesso.');
                    router.push(`/financial/administrativeFees/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar taxa.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteRate = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/rate/delete/${id}`);
            if (response?.status === 200) {
                alert.success('Taxa excluída.');
                router.push(`/financial/administrativeFees/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir a Taxa.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditRate = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/rate/update/${id}`, { rateData })
                if (response?.status === 201) {
                    alert.success('Taxa atualizada com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Taxa.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Taxa.');
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
                perfil={'taxa'}
                title={rateData?.ensino_graduacao_taxa || `Nova Taxa`}
                saveButton={isPermissionEdit}
                saveButtonAction={newRate ? handleCreateRate : handleEditRate}
                deleteButton={!newRate && isPermissionEdit}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteRate })}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Taxa Administrativa</Text>
                </Box>
                <TextInput disabled={!isPermissionEdit && true} placeholder='Ensino graduacao taxa' name='ensino_graduacao_taxa' onChange={handleChange} value={rateData?.ensino_graduacao_taxa || ''} label='Ensino graduacao taxa' sx={{ flex: 1, }} />
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Prazo' name='prazo_taxa' onChange={handleChange} value={rateData?.prazo_taxa || ''} label='Prazo' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='0.00'
                        name='valor_taxa'
                        type="coin"
                        onChange={handleChange}
                        value={(rateData?.valor_taxa) || ''}
                        label='Valor' sx={{ flex: 1, }}
                    />
                </Box>
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={rateData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setRateData({ ...rateData, ativo: parseInt(value) })} />
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