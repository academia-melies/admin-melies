import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createCourse, deleteCourse, editCourse } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditInventory(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog } = useAppContext()
    const userId = user?.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const newInventoryItem = id === 'new';
    const [inventoryData, setInventoryData] = useState({
        ativo: 1,
        observacoes_ativo: '',
        patrimonio: null,
        hd: null,
        memoria: null,
        placa_video: null,
        processador: null,
        fonte: null,
        nome_ativo: null,
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [rooms, setRooms] = useState([])

    const getInventoryItem = async () => {
        try {
            const response = await api.get(`/inventory/${id}`)
            const { data } = response
            setInventoryData(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        (async () => {
            if (newInventoryItem) {
                return
            }
            await handleItems();
        })();
    }, [id])

    useEffect(() => {
        listSchoolRooms()
    }, [])

    async function listSchoolRooms() {
        try {
            const response = await api.get(`/schoolRooms`)
            const { data } = response
            const groupRooms = data.map(room => ({
                label: room.sala,
                value: room?.id_sala
            }));

            setRooms(groupRooms);
        } catch (error) {
        }
    }

    const handleItems = async () => {
        setLoading(true)
        try {
            await getInventoryItem()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar Item do inventário')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (event) => {

        setInventoryData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));
    };

    const handleCreateItem = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/inventory/create/${userId}`, { inventoryData });
            const { data } = response
            if (response?.status === 201) {
                alert.success('Item cadastrado no inventário com sucesso.');
                router.push(`/suport/inventory/list`)
            }
        } catch (error) {
            alert.error('Tivemos um problema ao cadastrar o Item.');
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteInventory = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/inventory/delete/${id}`)
            if (response?.status === 200) {
                alert.success('Item excluído com sucesso.');
                router.push(`/suport/inventory/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o Item.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditInventory = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/inventory/update/${id}`, { inventoryData })
            if (response?.status === 201) {
                alert.success('Item atualizado com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Item.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Item.');
            return error
        } finally {
            setLoading(false)
        }
    }

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupAtivo = [
        { label: 'Computador', value: 'Computador' },
        { label: 'Monitor', value: 'Monitor' },
        { label: 'TV', value: 'TV' },
        { label: 'Ar Condicionado', value: 'Ar Condicionado' },
        { label: 'Cadeira', value: 'Cadeira' },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });


    return (
        <>
            <SectionHeader
                perfil={inventoryData?.sala_id ? (rooms?.filter(item => item.value === inventoryData?.sala_id).map(room => room.label)) : ''}
                title={inventoryData?.tipo_ativo || `Novo Ativo`}
                saveButton
                saveButtonAction={newInventoryItem ? handleCreateItem : handleEditInventory}
                deleteButton={!newInventoryItem}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteInventory })}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados do Ativo/Item</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <SelectList fullWidth data={groupAtivo} valueSelection={inventoryData?.tipo_ativo} onSelect={(value) => setInventoryData({ ...inventoryData, tipo_ativo: value })}
                        title="Tipo de ativo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <TextInput placeholder='DELL OPITIPLEX 780..' name='nome_ativo' onChange={handleChange} value={inventoryData?.nome_ativo || ''} label='Nome/Equipamento' sx={{ flex: 1, }} />
                    <TextInput placeholder='Patrimônio' name='patrimonio' onChange={handleChange} value={inventoryData?.patrimonio || ''} label='Patrimônio' sx={{ flex: 1, }} />
                    <SelectList fullWidth data={rooms} valueSelection={inventoryData?.sala_id} onSelect={(value) => setInventoryData({ ...inventoryData, sala_id: value })}
                        title="Sala de aula" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                {inventoryData?.tipo_ativo?.includes('Computador') &&
                    <Box sx={styles.inputSection}>
                        <TextInput placeholder='HD' name='hd' onChange={handleChange} value={inventoryData?.hd || ''} label='HD' sx={{ flex: 1, }} />
                        <TextInput placeholder='Memória' name='memoria' onChange={handleChange} value={inventoryData?.memoria || ''} label='Memória' sx={{ flex: 1, }} />
                        <TextInput placeholder='Placa de video' name='placa_video' onChange={handleChange} value={inventoryData?.placa_video || ''} label='Placa de video' sx={{ flex: 1, }} />
                        <TextInput placeholder='Processador' name='processador' onChange={handleChange} value={inventoryData?.processador || ''} label='Processador' sx={{ flex: 1, }} />
                        <TextInput placeholder='Fonte' name='fonte' onChange={handleChange} value={inventoryData?.fonte || ''} label='Fonte' sx={{ flex: 1, }} />
                    </Box>
                }
                <TextInput
                    placeholder='Observações'
                    name='observacoes_ativo'
                    onChange={handleChange}
                    value={inventoryData?.observacoes_ativo || ''}
                    label='Observações'
                    multiline
                    maxRows={4}
                    rows={3}
                    sx={{ flex: 1, }}
                />
                <RadioItem valueRadio={inventoryData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setInventoryData({ ...inventoryData, ativo: parseInt(value) })} />
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