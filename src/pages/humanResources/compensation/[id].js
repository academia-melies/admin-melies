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
    const [superiorData, setSuperiorData] = useState({})
    const [files, setFiles] = useState([])
    const [menuView, setMenuView] = useState('remuneracao')
    const [compensationData, setCompensationData] = useState({})
    const [usersForCoordinator, setUsersForCoordinator] = useState([])




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
            console.log(data)
            setUserData(data.response)
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
                console.log
                setCompensationData({
                    area: contractData?.data?.area,
                    funcao: contractData?.data?.funcao,
                    superior: contractData?.data?.superior,
                    nivel_cargo: contractData?.data?.nivel_cargo
                })
            }
            setContract(contractData?.data)
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


    useEffect(() => {
        handleItems();
    }, [])


    const handleItems = async () => {
        setLoading(true)
        try {
            await fetchPermissions()
            await getUserData()
            await getContract()
            await listUserByArea()
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

    const handleCreateCourse = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await createCourse(userData, userId, files);
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Curso cadastrado com sucesso.');
                    router.push(`/administrative/course/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar o curso.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteCourse = async () => {
        setLoading(true)
        try {
            const response = await deleteCourse(id)
            if (response?.status == 201) {
                alert.success('Curso excluído com sucesso.');
                router.push(`/administrative/course/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o curso.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditCourse = async () => {
        setLoading(true)
        try {
            const response = await editCourse({ id, userData })
            if (response?.status === 201) {
                alert.success('Curso atualizado com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Curso.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Curso.');
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
                            <Text light large>{contract?.area}</Text>
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
                    <Compensation compensationData={compensationData} setCompensationData={setCompensationData} isPermissionEdit={isPermissionEdit}
                        usersForCoordinator={usersForCoordinator} />
                }

            </Box>
        </>
    )
}

const Compensation = (props) => {
    const { compensationData, setCompensationData, isPermissionEdit, usersForCoordinator } = props
    const { setLoading, alert, colorPalette, user, theme, userPermissions, menuItemsList } = useAppContext()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showCompensationData, setShowCompensationData] = useState(false);
    const newSalario = 5000
    const router = useRouter()
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const historicCompensation = [
    ]

    const handleChange = async (event) => {

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
                        <Text large>R$ 5.000,00</Text>
                    </Box>
                    <Box sx={{ display: 'flex', height: '50px', width: '1px', backgroundColor: theme ? '#eaeaea' : '#404040' }} />

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                        <Text bold>Nível Atual:</Text>
                        <Text large>Sênior</Text>
                    </Box>
                    <Box sx={{ display: 'flex', height: '50px', width: '1px', backgroundColor: theme ? '#eaeaea' : '#404040' }} />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                        <Text bold>Alteração Salárial:</Text>
                        <Button text="Promover" small style={{ borderRadius: 2 }} onClick={() => setShowCompensationData(true)} />
                    </Box>
                </Box>


                <Box sx={{
                    display: 'flex', gap: 2, marginTop: 2, width: '100%', borderRadius: 2,
                    backgroundColor: colorPalette?.secondary, padding: '30px', flexDirection: 'column',
                    boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                }}>
                    <TitleDetails title="Evolução Salárial" />
                    {historicCompensation?.length > 0 ?
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
                                    {historicCompensation?.slice(startIndex, endIndex).map((item, index) => {
                                        return (
                                            <tr key={index} style={{
                                                backgroundColor: colorPalette?.secondary
                                            }}>
                                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light>{formatTimeStamp(item?.vencimento)}</Text>
                                                </td>

                                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light>{item?.descricao || '-'}</Text>
                                                </td>

                                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light>{formatter.format(item?.valor)}</Text>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                            </table>

                            <PaginationTable data={historicCompensation}
                                page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
                            />
                        </div>
                        :
                        <Text light style={{ textAlign: 'center' }}>Não há histórico de evolução salarial.</Text>}
                </Box>
            </Box>

            <Backdrop open={showCompensationData} sx={{ zIndex: 999 }}>
                <ContentContainer sx={{ zIndex: 9999 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Dados da Promoção</Text>
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
                    <Box sx={{ display: 'flex', gap: 1.75, flexDirection: 'column', padding: '20px' }}>

                        <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between', padding: '20px 0px' }}>
                            <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column',padding: '10px', width: '100%', borderRadius: 2, backgroundColor: colorPalette?.primary }}>
                                <Text bold>Salário Atual:</Text>
                                <Text large>{formatter.format(newSalario)}</Text>
                            </Box>

                            <Box sx={{ display: 'flex', gap: .5, padding: '10px', flexDirection: 'column', borderRadius: 2, width: '100%', backgroundColor: '#90ee90' }}>
                                <Text bold>Novo Salário:</Text>
                                <Text large>{formatter.format(newSalario)}</Text>
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
                            value={(compensationData?.valor) || ''}
                        />}
                        {compensationData?.forma_reajuste === 2 &&
                            < TextInput placeholder="0.5" name='dissidio'
                                label='Porcentagem do aumento'
                                onChange={(event) => setCompensationData({ ...compensationData, procentagem: event.target.value })} value={compensationData?.procentagem} sx={{ flex: 1 }} />
                        }

                        <TextInput disabled={!isPermissionEdit && true} placeholder='Observação' name='observacao'
                            onChange={handleChange} value={compensationData?.observacao || ''} label='Observação:' sx={{ flex: 1, }} multiline rows={2} />

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
                            </>
                        }
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'center' }}>
                        <Button disabled={!isPermissionEdit && true} text="Salvar" style={{ height: '30px', borderRadius: '6px' }} />
                        <Button disabled={!isPermissionEdit && true} cancel text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => {
                                setShowCompensationData(false)
                                setCompensationData({});
                            }} />
                    </Box>
                </ContentContainer>
            </Backdrop>
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