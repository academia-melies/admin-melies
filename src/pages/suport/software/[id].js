import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createCourse, deleteCourse, editCourse } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditSoftwares(props) {
    const { setLoading, alert, colorPalette, user } = useAppContext()
    const userId = user?.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const newSoftware = id === 'new';
    const [softwareData, setSoftwareData] = useState({})
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const getSoftware = async () => {
        try {
            const response = await api.get(`/software/${id}`)
            const { data } = response
            let value = data?.valor_licenca.toFixed(2) || ''
            setSoftwareData({ ...data, valor_licenca: value })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        (async () => {
            if (newSoftware) {
                return
            }
            await handleItems();
        })();
    }, [id])


    const handleItems = async () => {
        setLoading(true)
        try {
            await getSoftware()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar Software')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (event) => {
        if (event.target.name === 'valor_licenca') {
            const rawValue = event.target.value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                event.target.value = '';
            } else {
                let intValue = rawValue.slice(0, -2) || 0; // Parte inteira
                const decimalValue = rawValue.slice(-2); // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValue = `${intValue}.${decimalValue}`;
                event.target.value = formattedValue;
            }

            setSoftwareData((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }

        setSoftwareData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));
    };

    const handleCreateSoftware = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/software/create`, { softwareData, userId });
            const { data } = response
            if (response?.status === 201) {
                alert.success('Software cadastrado com sucesso.');
                router.push(`/suport/software/${data?.software}`)
            }
        } catch (error) {
            alert.error('Tivemos um problema ao cadastrar o Software.');
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteSoftware = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/software/delete/${id}`)
            if (response?.status === 200) {
                alert.success('Software excluído com sucesso.');
                router.push(`/suport/software/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o Software.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditSoftware = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/software/update/${id}`, { softwareData })
            if (response?.status === 201) {
                alert.success('Software atualizado com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Software.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Software.');
        } finally {
            setLoading(false)
        }
    }

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupContract = [
        { label: 'Mensal', value: 'Mensal' },
        { label: 'Semestral', value: 'Semestral' },
        { label: 'Anual', value: 'Anual' },
        { label: 'Vitálicio', value: 'Vitálicio' },
    ]

    const groupTypeLicency = [
        { label: 'Servidor local', value: 'Servidor local' },
        { label: 'Nuvem', value: 'Nuvem' },
    ]

    const groupNivel = [
        { label: 'Bacharelado', value: 'Bacharelado' },
        { label: 'Tecnólogo', value: 'Tecnólogo' },
        { label: 'Pós-Graduação', value: 'Pós-Graduação' },
        { label: 'Extensão', value: 'Extensão' },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });


    return (
        <>
            <SectionHeader
                perfil={softwareData?.desenvolvedor}
                title={softwareData?.nome_software || `Novo Software`}
                saveButton
                saveButtonAction={newSoftware ? handleCreateSoftware : handleEditSoftware}
                deleteButton={!newSoftware}
                deleteButtonAction={() => handleDeleteSoftware()}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados do Software</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nome' name='nome_software' onChange={handleChange} value={softwareData?.nome_software || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput placeholder='TPA ...' name='desenvolvedor' onChange={handleChange} value={softwareData?.desenvolvedor || ''} label='Desenvolvedor' sx={{ flex: 1, }} />
                </Box>
                <Box sx={styles.inputSection}>
                    <SelectList fullWidth data={groupTypeLicency} valueSelection={softwareData?.tipo_licenciamento} onSelect={(value) => setSoftwareData({ ...softwareData, tipo_licenciamento: value })}
                        title="Tipo de licenciamento" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList fullWidth data={groupContract} valueSelection={softwareData?.tipo_contrato} onSelect={(value) => setSoftwareData({ ...softwareData, tipo_contrato: value })}
                        title="Tipo de contrato" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <TextInput placeholder='Inicio' name='inicio_licenca' onChange={handleChange} value={(softwareData?.inicio_licenca)?.split('T')[0] || ''} type="date" label='Inicio' sx={{ flex: 1, }} />
                    <TextInput placeholder='Fim' name='fim_licenca' onChange={handleChange} value={(softwareData?.fim_licenca)?.split('T')[0] || ''} label='Fim' type="date" sx={{ flex: 1, }} />
                </Box>
                <Box sx={{ ...styles.inputSection, alignItems: 'start' }}>
                    <TextInput
                        placeholder='0.00'
                        name='valor_licenca'
                        type="coin"
                        onChange={handleChange}
                        value={softwareData?.valor_licenca || ''}
                        label='Valor' sx={{ flex: 1, }}
                    />
                    <TextInput placeholder='Quantidade de Licenças' name='qnt_licenca' onChange={handleChange} type="number" value={softwareData?.qnt_licenca || ''} label='Quantidade de Licenças' sx={{ flex: 1, }} />
                </Box>
                <RadioItem valueRadio={softwareData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setSoftwareData({ ...softwareData, ativo: parseInt(value) })} />
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