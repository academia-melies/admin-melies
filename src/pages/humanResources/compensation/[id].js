import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Avatar, Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../atoms"
import { PaginationTable, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { createCourse, deleteCourse, editCourse } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { IconStatus } from "../../../organisms/Table/table"
import Link from "next/link"
import { formatTimeStamp, formatValueReal } from "../../../helpers"

export default function EditCompensation(props) {
    const { setLoading, alert, colorPalette, user, theme, userPermissions, menuItemsList } = useAppContext()
    const userId = user?.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const [userData, setUserData] = useState({})
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [contract, setContract] = useState({})
    const [costCenterList, setCostCenterList] = useState([])
    const [accountTypesList, setAccountTypesList] = useState([])
    const [superiorData, setSuperiorData] = useState({})
    const [files, setFiles] = useState([])
    const [menuView, setMenuView] = useState('remuneracao')
    const [compensationData, setCompensationData] = useState({
        houve_alteracao: 2
    })
    const [compensationHistoricData, setCompensationHistoricData] = useState([])
    const [usersForCoordinator, setUsersForCoordinator] = useState([])
    const [showCompensationData, setShowCompensationData] = useState(false);
    const [showCompensationSalary, setShowCompensationSalary] = useState(false);



    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getUserData = async () => {
        try {
            const response = await api.get(`/user/${id}`)
            const { data } = response
            setUserData(data)
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getCompensation = async (userId, contract) => {
        try {
            const response = await api.get(`/compensation/employee/${userId}`)
            const { data } = response
            if (data) {
                setCompensationData({
                    ...data,
                    houve_alteracao: 2,
                    area: contract?.data?.area,
                    funcao: contract?.data?.funcao,
                    superior: contract?.data?.superior,
                    nivel_cargo: contract?.data?.nivel_cargo
                })
                const historic = await api.get(`/compensation/employee/historic/${data?.id_remuneracao}`)
                if (historic?.data?.length > 0) {
                    setCompensationHistoricData(historic?.data)
                }
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getContract = async () => {
        try {
            const contractData = await api.get(`/contract/${id}`)
            if (contractData?.data?.superior) {
                const superiorData = await api.get(`/user/${contractData?.data?.superior}`)
                const { data } = superiorData
                let contractDatas = data.response;
                setSuperiorData(data.response)
            }
            setContract(contractData?.data)
            return contractData
        } catch (error) {
            console.log(error)
            return error
        }
    }


    async function listUserByArea() {
        try {
            const response = await api.get(`/users`)
            const { data } = response

            const groupUser = data.filter(item => item.perfil.includes('funcionario'))?.map(responsible => ({
                label: responsible.nome,
                value: responsible?.id,
                area: responsible?.area
            }));

            const sortedUsers = groupUser?.sort((a, b) => a.label.localeCompare(b.label));
            setUsersForCoordinator(sortedUsers)
        } catch (error) {
            return error
        }
    }


    async function listCostCenter() {
        const response = await api.get(`/costCenters`)
        const { data } = response
        const groupCostCenter = data?.filter(item => item)?.map(cc => ({
            label: cc.nome_cc,
            value: cc?.id_centro_custo
        }));
        setCostCenterList(groupCostCenter)
    }



    async function listAccountTypes() {
        const response = await api.get(`/account/types`)
        const { data } = response
        const groupCostCenter = data?.filter(item => item)?.map(cc => ({
            label: cc.nome_tipo,
            value: cc?.id_tipo
        }));

        setAccountTypesList(groupCostCenter)
    }


    useEffect(() => {
        handleItems();
    }, [])


    const handleItems = async () => {
        setLoading(true)
        try {
            await fetchPermissions()
            const userdata = await getUserData()
            const contractdata = await getContract()
            await listUserByArea()
            await listCostCenter()
            await listAccountTypes()
            if (userdata && contractdata) {
                await getCompensation(userdata?.id, contractdata)
            }
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar Curso')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (event) => {

        if (event.target.name === 'valor') {
            event.target.value = event.target.value.replace(',', '.');
        }

        setUserData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!userData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreateCompensation = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {

                const response = await api.post(`/compensation/employee/create/${id}`, {
                    userResp: user?.id,
                    compensationData: {
                        ...compensationData,
                        usuario_id: id,
                        salario: compensationData?.valor
                    }
                });
                const { data } = response
                if (data?.success) {
                    alert.success('Salário Cadastrado.');
                    setShowCompensationSalary(false)
                    await handleItems()
                } else {
                    alert.error('Tivemos um problema ao cadastrar o Salário.');
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar o Salário.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleEditCompensation = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/compensation/employee/update/${compensationData?.id_remuneracao}`,
                { userResp: user?.id, compensationData })
            const { data } = response
            if (data?.success) {
                alert.success('Salário atualizado com sucesso.');
                await handleItems()
                setShowCompensationData(false)
            } else {
                alert.error('Tivemos um problema ao atualizar Salário.');
            }
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Salário.');
        } finally {
            setLoading(false)
        }
    }


    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });


    const menuUser = [
        { id: '01', text: 'Remuneração', screen: 'remuneracao' },
        { id: '02', text: 'Carreira', screen: 'carreira' },
        { id: '03', text: 'Equipe', screen: 'equipe' },
        { id: '04', text: 'Ponto', screen: 'ponto' }
    ]


    return (
        <>
            <SectionHeader
                perfil={'DP'}
                title={'Gestão de Pessoas'}
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Box sx={{
                    gap: 2,
                    backgroundColor: colorPalette?.secondary,
                    padding: '30px 60px', display: 'flex', width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    borderRadius: 2,
                    boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                }}>
                    <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
                        <Avatar src={userData?.location} sx={{
                            height: { xs: 100, sm: 100, md: 100, lg: 100 },
                            width: { xs: 100, sm: 100, md: 100, lg: 100 },
                        }} variant="circular" />
                        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: .5 }}>
                            <Text bold large>{userData?.nome}</Text>
                            <Text style={{ color: 'gray' }}>
                                {userData?.funcao || '-'}
                            </Text>
                            <Text light>{userData?.area}</Text>
                            <Link href={`/administrative/users/${userData?.id}`} target="_blank"><Text style={{
                                textDecoration: 'underline',
                                color: colorPalette.buttonColor
                            }}>Acessar meu perfil</Text></Link>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', height: '100px', width: '1px', backgroundColor: theme ? '#eaeaea' : '#404040' }} />
                    <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: .5 }}>
                            <Text light style={{ color: 'gray' }}>Departamento:</Text>
                            <Text light large>{contract?.area || '-'}</Text>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', height: '100px', width: '1px', backgroundColor: theme ? '#eaeaea' : '#404040' }} />


                    <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center', alignItems: 'center' }}>

                        <Avatar src={superiorData?.location} sx={{
                            height: { xs: 60, sm: 60, md: 60, lg: 60 },
                            width: { xs: 60, sm: 60, md: 60, lg: 60 },
                        }} variant="circular" />
                        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: .5 }}>
                            <Text light style={{ color: 'gray' }}>Superior:</Text>
                            <Text light large>{superiorData?.nome}</Text>
                            <Text style={{ color: 'gray' }}>
                                {superiorData?.funcao || '-'}
                            </Text>
                            <Text light>{superiorData?.area}</Text>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: `1px solid lightgray`, padding: 'px 0px' }}>
                    {menuUser?.map((item, index) => {
                        const isScreen = item?.screen === menuView;

                        return (
                            <Box key={index} sx={{
                                display: 'flex', padding: '25px',
                                borderRadius: 2,
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                gap: 2,
                                transition: '.3s',
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer',
                                    transform: 'scale(1.05, 1.05)'
                                }

                            }} onClick={() => setMenuView(item?.screen)}>
                                <Text bold style={{ color: isScreen ? colorPalette?.buttonColor : colorPalette?.textColor }}>{item?.text}</Text>
                            </Box>
                        )
                    })
                    }
                </Box>


                {menuView === 'remuneracao' &&
                    <Compensation
                        compensationData={compensationData}
                        setCompensationData={setCompensationData}
                        isPermissionEdit={isPermissionEdit}
                        usersForCoordinator={usersForCoordinator}
                        accountTypesList={accountTypesList}
                        costCenterList={costCenterList}
                        handleCreateCompensation={handleCreateCompensation}
                        handleEditCompensation={handleEditCompensation}
                        compensationHistoricData={compensationHistoricData}
                        showCompensationData={showCompensationData}
                        setShowCompensationData={setShowCompensationData}
                        showCompensationSalary={showCompensationSalary}
                        setShowCompensationSalary={setShowCompensationSalary}
                    />
                }

            </Box>
        </>
    )
}

const Compensation = (props) => {
    const { compensationData, setCompensationData, isPermissionEdit, usersForCoordinator,
        accountTypesList, costCenterList, handleCreateCompensation, handleEditCompensation,
        compensationHistoricData, showCompensationData, showCompensationSalary,
        setShowCompensationSalary, setShowCompensationData } = props
    const { setLoading, alert, colorPalette, user, theme, userPermissions, menuItemsList } = useAppContext()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [newCompensation, setNewCompensation] = useState(5000);
    const salarioAtual = 5000
    const router = useRouter()
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const handleChange = async (event) => {

        if (event.target.name === 'valor' || event.target.name === 'acrecimo_valor') {
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

            setCompensationData((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }

        setCompensationData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const handleBlur = async (event) => {
        const { name, value } = event.target
        const newCompensation = await calculationNewCompensation(name, value)
        setCompensationData({ ...compensationData, novo_salario: newCompensation })
    }

    const calculationNewCompensation = async (typeUpdate, value) => {
        try {
            let formattValue = value;
            let salary = parseFloat(compensationData?.salario);

            if (typeUpdate === 'valor') {
                formattValue = value.replace(/\./g, '').replace(',', '.');
                formattValue = parseFloat(formattValue)
                salary = formattValue;
            } else if (typeUpdate === 'porcentagem') {
                formattValue = parseFloat(formattValue)
                let aumento = (salary * (formattValue / 100)).toFixed(2);
                salary = (salary + parseFloat(aumento));
            } else if (typeUpdate === 'acrecimo_valor') {
                formattValue = value.replace(/\./g, '').replace(',', '.');
                formattValue = parseFloat(formattValue)
                salary = (salary + formattValue);
            }

            return salary
        } catch (error) {
            console.log(error);
            return error;
        }
    }


    const groupLevelEmployee = [
        { label: 'Junior', value: 'Junior' },
        { label: 'Pleno', value: 'Pleno' },
        { label: 'Sênior', value: 'Sênior' },
        { label: 'Instrutor', value: 'Instrutor' },
        { label: 'Especialista A', value: 'Especialista A' },
        { label: 'Especialista B', value: 'Especialista B' },
        { label: 'Especialista C', value: 'Especialista C' },
        { label: 'Especialista D', value: 'Especialista D' },
        { label: 'Especialista E', value: 'Especialista E' },
        { label: 'Especialista F', value: 'Especialista F' },
        { label: 'Mestre A', value: 'Mestre A' },
        { label: 'Mestre B', value: 'Mestre B' },
        { label: 'Mestre C', value: 'Mestre C' },
        { label: 'Mestre D', value: 'Mestre D' },
        { label: 'Mestre E', value: 'Mestre E' },
        { label: 'Mestre F', value: 'Mestre F' },
        { label: 'Doutor A', value: 'Doutor A' },
        { label: 'Doutor B', value: 'Doutor B' },
        { label: 'Doutor C', value: 'Doutor C' },
        { label: 'Doutor D', value: 'Doutor D' },
        { label: 'Doutor E', value: 'Doutor E' },
        { label: 'Doutor F', value: 'Doutor F' }
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


    const groupTypeAumento = [
        { label: 'Inserir novo salário', value: 1 },
        { label: 'Porcentagem', value: 2 },
        { label: 'Acrescentar valor', value: 3 }
    ]

    const groupAlteration = [
        { label: 'Sim', value: 1 },
        { label: 'Não', value: 2 },
    ]

    return (
        <>
            <Box sx={{
                gap: 2, display: 'flex', width: '100%',
                flexDirection: 'column',
            }}>
                <Box sx={{
                    display: 'flex', gap: 2, marginTop: 2, alignItems: 'start', justifyContent: 'space-between', width: '100%',
                    backgroundColor: colorPalette?.secondary, padding: '30px', borderRadius: 2,
                    boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                }}>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                        <Text bold>Remuneração Atual:</Text>
                        {compensationData?.salario ?
                            <Text large>{formatter.format(compensationData?.salario)}</Text>
                            :
                            <Button text="Cadastrar" small style={{ borderRadius: 2 }} onClick={() => setShowCompensationSalary(true)} />
                        }
                    </Box>
                    <Box sx={{ display: 'flex', height: '50px', width: '1px', backgroundColor: theme ? '#eaeaea' : '#404040' }} />

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                        <Text bold>Nível Atual:</Text>
                        <Text large>{compensationData?.nivel_cargo || 'Sem nível'}</Text>
                    </Box>
                    <Box sx={{ display: 'flex', height: '50px', width: '1px', backgroundColor: theme ? '#eaeaea' : '#404040' }} />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                        <Text bold>Alteração Salárial:</Text>
                        {compensationData?.salario ?
                            <Button text="Reajustar" small style={{ borderRadius: 2 }} onClick={() => setShowCompensationData(true)} />
                            :
                            <Text light>Cadastre o Salário</Text>}
                    </Box>
                </Box>


                <Box sx={{
                    display: 'flex', gap: 2, marginTop: 2, width: '100%', borderRadius: 2,
                    backgroundColor: colorPalette?.secondary, padding: '30px', flexDirection: 'column',
                    boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                }}>
                    <TitleDetails title="Evolução Salárial" />
                    {compensationHistoricData?.length > 0 ?
                        <div style={{
                            borderRadius: '8px', overflow: 'auto', marginTop: '10px', flexWrap: 'nowrap',
                            backgroundColor: colorPalette?.secondary,
                            border: `1px solid ${theme ? '#eaeaea' : '#404040'}`
                        }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Data</Text></th>
                                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Descrição</Text></th>
                                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Valor</Text></th>
                                    </tr>
                                </thead>
                                <tbody style={{ flex: 1, }}>
                                    {compensationHistoricData?.sort((a, b) => new Date(b.dt_criacao) - new Date(a.dt_criacao))?.slice(startIndex, endIndex)?.map((item, index) => {
                                        return (
                                            <tr key={index} style={{
                                                backgroundColor: colorPalette?.secondary
                                            }}>
                                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light>{formatTimeStamp(item?.dt_criacao, true)}</Text>
                                                </td>

                                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light>{item?.descricao || '-'}</Text>
                                                </td>

                                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light>{formatter.format(item?.salario)}</Text>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                            </table>

                            <PaginationTable data={compensationHistoricData}
                                page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
                            />
                        </div>
                        :
                        <Text light style={{ textAlign: 'center' }}>Não há histórico de evolução salarial.</Text>}
                </Box>
            </Box>

            <Backdrop open={showCompensationData} sx={{ zIndex: 999, paddingTop: 5 }}>
                <ContentContainer sx={{ zIndex: 9999, }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Dados do Reajuste</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 99999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowCompensationData(false)} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{
                        display: 'flex', gap: 1.75, flexDirection: 'column', padding: '20px',
                        maxHeight: { xs: 380, sm: 350, md: 350, lg: 400, xl: 600 }, overflow: 'auto'
                    }}>

                        <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between', padding: '20px 0px' }}>
                            <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column', padding: '10px', width: '100%', borderRadius: 2, backgroundColor: colorPalette?.primary }}>
                                <Text bold>Salário Atual:</Text>
                                <Text large>{formatter.format(parseFloat(compensationData?.salario))}</Text>
                            </Box>

                            <Box sx={{ display: 'flex', gap: .5, padding: '10px', flexDirection: 'column', borderRadius: 2, width: '100%', backgroundColor: '#90ee90' }}>
                                <Text bold>Novo Salário:</Text>
                                <Text large>{formatter.format(compensationData?.novo_salario || parseFloat(compensationData?.salario))}</Text>
                            </Box>
                        </Box>
                        <TextInput disabled={!isPermissionEdit && true}
                            name='dt_alteracao'
                            onChange={(event) => setCompensationData({ ...compensationData, dt_alteracao: event.target.value })}
                            value={(compensationData?.dt_alteracao)?.split('T')[0] || ''}
                            type="date"
                            label='Data da Alteração'
                            sx={{ width: 250 }} />

                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={compensationData?.forma_reajuste} group={groupTypeAumento}
                            horizontal={true}
                            title="De qual forma deseja seguir com o reajuste?"
                            onSelect={(value) => setCompensationData({
                                ...compensationData,
                                forma_reajuste: parseInt(value)
                            })} />

                        {compensationData?.forma_reajuste === 1 && <TextInput disabled={!isPermissionEdit && true}
                            label='Novo salário'
                            placeholder='0.00'
                            name='valor'
                            type="coin"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={(compensationData?.valor) || ''}
                        />}
                        {compensationData?.forma_reajuste === 2 &&
                            < TextInput placeholder="0.5" name='porcentagem'
                                label='Porcentagem do aumento'
                                onBlur={handleBlur}
                                onChange={(event) => setCompensationData({ ...compensationData, porcentagem: event.target.value })} value={compensationData?.porcentagem} sx={{ flex: 1 }} />
                        }

                        {compensationData?.forma_reajuste === 3 && <TextInput disabled={!isPermissionEdit && true}
                            label='Acrécimo de Valor'
                            placeholder='0.00'
                            name='acrecimo_valor'
                            type="coin"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={(compensationData?.acrecimo_valor) || ''}
                        />}
                        {compensationData?.forma_reajuste && <TextInput disabled={!isPermissionEdit && true} placeholder='Observação' name='observacao'
                            onChange={handleChange} value={compensationData?.observacao || ''} label='Observação:' sx={{ flex: 1, }} multiline rows={2} />}

                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={compensationData?.houve_alteracao} group={groupAlteration}
                            horizontal={true}
                            title="Houve alguma alteração dos dados abaixo?"
                            onSelect={(value) => setCompensationData({
                                ...compensationData,
                                houve_alteracao: parseInt(value)
                            })} />

                        {compensationData?.houve_alteracao === 1 ?
                            <>         <TextInput disabled={!isPermissionEdit && true} placeholder='Descrição da função' name='funcao' onChange={handleChange}
                                value={compensationData?.funcao || ''} label='Descrição da função' sx={{ flex: 1, }} />

                                <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupArea} valueSelection={compensationData?.area} onSelect={(value) => {
                                    setCompensationData({ ...compensationData, area: value })
                                    listUserByArea(value)
                                }}
                                    title="Área de atuação:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />
                                <SelectList onFilter={true} filterValue="label" disabled={!isPermissionEdit && true} fullWidth data={usersForCoordinator} valueSelection={compensationData?.superior} onSelect={(value) => setCompensationData({ ...compensationData, superior: value })}
                                    title="Superior Responsável:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />

                                <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupLevelEmployee} valueSelection={compensationData?.nivel_cargo}
                                    onSelect={(value) => setCompensationData({ ...compensationData, nivel_cargo: value })}
                                    title="Nível do cargo:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />

                                <Text light>Dados de Pagamento</Text>

                                <TextInput disabled={!isPermissionEdit && true} type="number"
                                    placeholder='ex: 5' name='dia_pagamento'
                                    onChange={handleChange}
                                    value={compensationData?.dia_pagamento || ''} label='Dia de Pagamento' sx={{ flex: 1, }} />

                                <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountTypesList}
                                    valueSelection={compensationData?.tipo}
                                    onSelect={(value) => setCompensationData({ ...compensationData, tipo: value })}
                                    title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />
                                <SelectList fullWidth disabled={!isPermissionEdit && true} data={costCenterList} valueSelection={compensationData?.centro_custo}
                                    onSelect={(value) => setCompensationData({ ...compensationData, centro_custo: value })}
                                    title="Centro de Custo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />
                            </>
                            :
                            <>
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold small>Descrição da função:</Text>
                                    <Text small>{compensationData?.funcao || ''}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold small>Área de atuação:</Text>
                                    <Text small>{compensationData?.area}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold small>Superior Responsável:</Text>
                                    <Text small>{compensationData?.superior}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold small>Nível do cargo:</Text>
                                    <Text small>{compensationData?.nivel_cargo}</Text>
                                </Box>
                                <Divider />

                                <Text light>Dados de Pagamento</Text>

                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold small>Dia de Pagamento:</Text>
                                    <Text small>{compensationData?.dia_pagamento || '-'}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold small>Tipo:</Text>
                                    <Text small>{compensationData?.tipo ? accountTypesList?.filter(item => item?.value === compensationData?.tipo)
                                        ?.map(item => item.label) : '-'}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold small>Centro de Custo:</Text>
                                    <Text small>{compensationData?.centro_custo ? costCenterList?.filter(item => item?.value === compensationData?.centro_custo)
                                        ?.map(item => item.label) : '-'}</Text>
                                </Box>
                            </>
                        }
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'center' }}>
                        <Button disabled={!isPermissionEdit && true} text="Salvar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => handleEditCompensation()} />
                        <Button disabled={!isPermissionEdit && true} cancel text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => {
                                setShowCompensationData(false);
                            }} />
                    </Box>
                </ContentContainer>
            </Backdrop>


            <Backdrop open={showCompensationSalary} sx={{ zIndex: 999, paddingTop: 5 }}>
                <ContentContainer sx={{ zIndex: 9999, }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Dados da Remuneração</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 99999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowCompensationSalary(false)} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{
                        display: 'flex', gap: 1.75, flexDirection: 'column', padding: '20px',
                        maxHeight: { xs: 380, sm: 350, md: 350, lg: 400, xl: 600 }, overflow: 'auto'
                    }}>

                        <TextInput disabled={!isPermissionEdit && true}
                            label='Novo salário'
                            placeholder='0.00'
                            name='valor'
                            type="coin"
                            onChange={handleChange}
                            value={(compensationData?.valor) || ''}
                        />

                        <TextInput disabled={!isPermissionEdit && true} placeholder='Observação' name='observacao'
                            onChange={handleChange} value={compensationData?.observacao || ''} label='Observação:' sx={{ flex: 1, }} multiline rows={2} />

                        <TextInput disabled={!isPermissionEdit && true} placeholder='Descrição da função' name='funcao' onChange={handleChange}
                            value={compensationData?.funcao || ''} label='Descrição da função' sx={{ flex: 1, }} />

                        <TextInput disabled={!isPermissionEdit && true} type="number"
                            placeholder='ex: 5' name='dia_pagamento'
                            onChange={handleChange}
                            value={compensationData?.dia_pagamento || ''} label='Dia de Pagamento' sx={{ flex: 1, }} />

                        <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountTypesList}
                            valueSelection={compensationData?.tipo}
                            onSelect={(value) => setCompensationData({ ...compensationData, tipo: value })}
                            title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <SelectList fullWidth disabled={!isPermissionEdit && true} data={costCenterList} valueSelection={compensationData?.centro_custo}
                            onSelect={(value) => setCompensationData({ ...compensationData, centro_custo: value })}
                            title="Centro de Custo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'center' }}>
                        <Button disabled={!isPermissionEdit && true} text="Salvar" style={{ height: '30px', borderRadius: '6px' }} onClick={() => handleCreateCompensation()} />
                        <Button disabled={!isPermissionEdit && true} cancel text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => {
                                setShowCompensationSalary(false)
                            }} />
                    </Box>
                </ContentContainer>
            </Backdrop >
        </>
    )
}





export const TitleDetails = ({ title = '' }) => {
    const { colorPalette } = useAppContext()
    return (
        <>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', }}>
                <Box sx={{ display: 'flex', height: 25, width: 4, backgroundColor: colorPalette?.buttonColor }} />
                <Text bold title>{title}</Text>
            </Box>
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