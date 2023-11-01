import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { ContainDropzone, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createCourse, deleteCourse, editCourse } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import { icons } from "../../../organisms/layout/Colors"
import { formatValueReal } from "../../../helpers"

export default function EditService(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog } = useAppContext()
    const userId = user?.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const newService = id === 'new';
    const [serviceData, setServiceData] = useState({
        tipo_servico: '',
        nome_servico: '',
        descricao: '',
        valor: '0.00',
        quantidade: '',
        tipo_contrato: '',
        dt_inicio_contrato: '',
        dt_fim_contrato: '',
        fornecedor: '',
        login: '',
        tipo_licenciamento: '',
        ativo: 1,
    })
    const [contractData, setContractData] = useState([])
    const [arrayRenewal, setArrayRenewal] = useState([])
    const [renewalData, setRenewalData] = useState({})
    const [showNewRenewal, setShowNewRenewal] = useState(false)
    const [showRenewel, setShowRenewal] = useState({
        historicRenewal: false,
        newRenewal: false
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const getService = async () => {
        try {
            const response = await api.get(`/service/${id}`)
            const { data } = response
            let value = Number(data?.valor).toFixed(2);
            setServiceData({ ...data, valor: formatValueReal(value) })
            return data
        } catch (error) {
            console.log(error)
        }
    }

    const getRenewal = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/services/renewal/${id}`)
            const { data } = response
            if (data) {
                const formattedValue = data.map(item => ({
                    ...item,
                    reajuste: item.reajuste.toFixed(2)
                }));
                setArrayRenewal(formattedValue)
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const getContracts = async (tipo_servico) => {
        setLoading(true)
        try {
            let query = `?screen=${tipo_servico}`;
            const response = await api.get(`/contract/service/${id}${query}`)
            const { data } = response
            setContractData(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!newService) {
            handleItems();
        }
    }, [id]);


    const handleItems = async () => {
        setLoading(true)
        try {
            const serviceResponse = await getService()
            await getRenewal()
            if (serviceResponse) {
                await getContracts(serviceResponse.tipo_servico)
            }
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar serviço')
        } finally {

            setLoading(false)
        }
    }

    const handleChange = (event) => {

        if (event.target.name === 'valor') {
            const rawValue = event.target.value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                event.target.value = '';
            } else {
                let intValue = rawValue.slice(0, -2) || '0'; // Parte inteira
                const decimalValue = rawValue.slice(-2).padStart(2, '0');; // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
                event.target.value = formattedValue;

            }

            setServiceData((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }

        setServiceData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));
    };

    const checkRequiredFields = () => {
        if (!serviceData?.nome_servico) {
            alert?.error('O nome do serviço é obrigatório')
            return false
        }
        if (!serviceData?.fornecedor) {
            alert?.error('O nome do fornecedor é obrigatório')
            return false
        }
        if (!serviceData?.tipo_servico) {
            alert?.error('O Tipo de serviço é obrigatório')
            return false
        }
        if (!serviceData?.tipo_contrato) {
            alert?.error('O Tipo de contrato é obrigatório')
            return false
        }
        if (!serviceData?.dt_inicio_contrato) {
            alert?.error('A data de inicio é obrigatório')
            return false
        }
        if (!serviceData?.dt_fim_contrato) {
            alert?.error('A data de expiração é obrigatório')
            return false
        }

        return true
    }

    const handleCreateService = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/service/create`, { serviceData, userId });
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Serviço cadastrado com sucesso.');
                    router.push(`/suport/service/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar o Serviço.');
            }
            finally {
                setLoading(false)
            }
            return
        }
        setLoading(false)
    }

    const handleDeleteService = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/service/delete/${id}`)
            if (response?.status === 200) {
                alert.success('Serviço excluído com sucesso.');
                router.push(`/suport/service/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o Serviço.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditService = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/service/update/${id}`, { serviceData })
            if (response?.status === 201) {
                alert.success('Serviço atualizado com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Serviço.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Serviço.');
        } finally {
            setLoading(false)
        }
    }


    const handleChangeRenewal = (event) => {
      
        if (event.target.name === 'reajuste') {
            const rawValue = event.target.value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                event.target.value = '';
            } else {
                let intValue = rawValue.slice(0, -2) || '0'; // Parte inteira
                const decimalValue = rawValue.slice(-2).padStart(2, '0');; // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
                event.target.value = formattedValue;

            }

            setRenewalData((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }

        setRenewalData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    };

    const handleAddRenewal = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/services/renewal/create/${id}/${userId}`, { renewalData })
            if (response?.status === 201) {
                alert.success('Renovação adicionada')
                setRenewalData({ reajuste: '', dt_renovacao: '', dt_expiracao_r: '' })
                handleItems()
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteRenewal = async (id_renovacao_s) => {
        setLoading(true)
        try {
            const response = await api.delete(`/services/renewal/delete/${id_renovacao_s}`)
            if (response?.status === 200) {
                alert.success('Renovação excluida.');
                setShowRenewal({ ...showRenewel, newRenewal: false, historicRenewal: false })
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover a Renovação selecionada.');
            console.log(error)
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

    const groupServices = [
        { label: 'Serviços Gerais', value: 'Serviços Gerais' },
        { label: 'Software', value: 'Software' },
        { label: 'Domínio', value: 'Domínio' },
        { label: 'Servidor', value: 'Servidor' },
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
                perfil={serviceData?.fornecedor}
                title={serviceData?.nome_servico || `Novo Serviço`}
                saveButton
                saveButtonAction={newService ? handleCreateService : handleEditService}
                deleteButton={!newService}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteService })}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados do Serviço</Text>
                </Box>
                <SelectList fullWidth data={groupServices} valueSelection={serviceData?.tipo_servico} onSelect={(value) => setServiceData({ ...serviceData, tipo_servico: value })}
                    title="Tipo de Serviço" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nome' name='nome_servico' onChange={handleChange} value={serviceData?.nome_servico || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput placeholder='Vivo, Autodesk..' name='fornecedor' onChange={handleChange} value={serviceData?.fornecedor || ''} label='Fornecedor/Desenvolvedor/Provedor' sx={{ flex: 1, }} />
                </Box>
                <TextInput
                    placeholder='Descrição'
                    name='descricao'
                    onChange={handleChange} value={serviceData?.descricao || ''}
                    label='Descrição' sx={{ flex: 1, }}
                    multiline
                    maxRows={4}
                    rows={3}
                />
                <Box sx={styles.inputSection}>
                    {serviceData?.tipo_servico === 'Software' &&
                        <SelectList fullWidth data={groupTypeLicency} valueSelection={serviceData?.tipo_licenciamento} onSelect={(value) => setServiceData({ ...serviceData, tipo_licenciamento: value })}
                            title="Tipo de licenciamento" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />}
                    <SelectList fullWidth data={groupContract} valueSelection={serviceData?.tipo_contrato} onSelect={(value) => setServiceData({ ...serviceData, tipo_contrato: value })}
                        title="Tipo de contrato" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <TextInput placeholder='Inicio' name='dt_inicio_contrato' onChange={handleChange} value={(serviceData?.dt_inicio_contrato)?.split('T')[0] || ''} type="date" label='Inicio do contrato' sx={{ flex: 1, }} />
                    <TextInput placeholder='Fim' name='dt_fim_contrato' onChange={handleChange} value={(serviceData?.dt_fim_contrato)?.split('T')[0] || ''} label='Fim do contrato' type="date" sx={{ flex: 1, }} />
                </Box>
                <Box sx={{ ...styles.inputSection, alignItems: 'start' }}>
                    <TextInput
                        placeholder='0.00'
                        name='valor'
                        type="coin"
                        onChange={handleChange}
                        value={(serviceData?.valor) || ''}
                        label='Valor' sx={{ flex: 1, }}
                    />
                    {serviceData?.tipo_servico === 'Software' &&
                        <TextInput placeholder='Quantidade de Licenças' name='quantidade' onChange={handleChange} type="number" value={serviceData?.quantidade || ''} label='Quantidade de Licenças' sx={{ flex: 1, }} />
                    }
                    {(serviceData?.tipo_servico === 'Servidor' || serviceData?.tipo_servico === 'Domínio') && (
                        <TextInput
                            placeholder='login'
                            name='login'
                            onChange={handleChange}
                            value={serviceData?.login || ''}
                            label='Login de acesso'
                            sx={{ flex: 1 }}
                        />
                    )}
                </Box>
                {
                    !newService &&
                    <>
                        {!showRenewel?.historicRenewal ?
                            <Button text='Renovações' style={{ width: 120, height: 30 }} small={true} onClick={() => { setShowRenewal({ ...showRenewel, historicRenewal: true }) }} />
                            :
                            <Box sx={{ maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                                <ContentContainer gap={3}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999 }}>
                                        <Text bold large>Histórico de Renovação</Text>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            backgroundImage: `url(${icons.gray_close})`,
                                            transition: '.3s',
                                            zIndex: 999999999,
                                            "&:hover": {
                                                opacity: 0.8,
                                                cursor: 'pointer'
                                            }
                                        }} onClick={() => setShowRenewal({ ...showRenewel, historicRenewal: false })} />
                                    </Box>
                                    {arrayRenewal.length > 0 ?
                                        arrayRenewal.map((ren, index) => (
                                            <>
                                                <Box key={index} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                                    <TextInput
                                                        placeholder='0.00'
                                                        name={`reajuste-${index}`}
                                                        type="coin"
                                                        value={(ren?.reajuste) || ''}
                                                        label='Reajuste' sx={{ flex: 1, }}
                                                    />
                                                    <TextInput label="Data da Renovação" placeholder='Data da Renovação' name={`dt_renovacao-${index}`} value={(ren?.dt_renovacao)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                                                    <TextInput label="Data da Expiração" placeholder='Data da Expiração' name={`dt_expiracao_r-${index}`} value={(ren?.dt_expiracao_r)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                                                    <Box sx={{
                                                        backgroundSize: 'cover',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'center',
                                                        width: 25,
                                                        height: 25,
                                                        backgroundImage: `url(/icons/remove_icon.png)`,
                                                        transition: '.3s',
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                            cursor: 'pointer'
                                                        }
                                                    }} onClick={() => {
                                                        handleDeleteRenewal(ren?.id_renovacao_s)
                                                    }} />
                                                </Box>
                                            </>
                                        ))
                                        : <Text small>Este serviço não possui renovações ou reajustes.</Text>}
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button text='Novo' small={true} style={{ width: '80px', padding: '5px 0px' }} onClick={() => { setShowRenewal({ ...showRenewel, newRenewal: true }) }} />
                                        {showRenewel?.newRenewal &&
                                            <Button text='Cancelar' secondary={true} small={true} style={{ width: '80px', padding: '5px 0px' }} onClick={() => { setShowRenewal({ ...showRenewel, newRenewal: false }) }} />
                                        }
                                    </Box>
                                    {showRenewel?.newRenewal &&
                                        <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                            <TextInput
                                                placeholder='0.00'
                                                name="reajuste"
                                                type="coin"
                                                value={renewalData?.reajuste || ''}
                                                onChange={handleChangeRenewal}
                                                label='Reajuste' sx={{ flex: 1, }}
                                            />
                                            <TextInput label="Data da Renovação" placeholder='Data da Renovação' name="dt_renovacao" value={(renewalData?.dt_renovacao)?.split('T')[0] || ''} onChange={handleChangeRenewal} type="date" sx={{ flex: 1, }} />
                                            <TextInput label="Data da Expiração" placeholder='Data da Expiração' name="dt_expiracao_r" value={(renewalData?.dt_expiracao_r)?.split('T')[0] || ''} onChange={handleChangeRenewal} type="date" sx={{ flex: 1, }} />
                                            <Box sx={{
                                                backgroundSize: 'cover',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center',
                                                width: 25,
                                                height: 25,
                                                borderRadius: '50%',
                                                backgroundImage: `url(/icons/include_icon.png)`,
                                                transition: '.3s',
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer'
                                                }
                                            }} onClick={() => {
                                                handleAddRenewal()
                                            }} />
                                        </Box>
                                    }
                                </ContentContainer>
                            </Box>
                        }
                    </>
                }
                <RadioItem valueRadio={serviceData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setServiceData({ ...serviceData, ativo: parseInt(value) })} />
            </ContentContainer >
            {!newService &&
                <ContainDropzone
                    title="Contrato"
                    data={contractData}
                    callback={(file) => {
                        if (file.status === 201 || file === 200) {
                            handleItems()
                        }
                    }}
                    screen={serviceData?.tipo_servico}
                    servicoId={id}
                    userId={userId}
                />
            }
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