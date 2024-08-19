import { ChangeEvent, useEffect, useState } from "react"
import { Box, Button, ButtonIcon, ContentContainer, FileInput, Text, TextInput } from "../../../../../atoms"
import { SelectList, TableOfficeHours } from "../../../../../organisms"
import { icons } from "../../../../../organisms/layout/Colors"
import { EditFile } from "../../[id]"
import { groupData } from "../../../../../helpers/groupData"
import { useAppContext } from "../../../../../context/AppContext"
import { api } from "../../../../../api/api"
import { FilePreview, FileUser } from "../UserData/UserData"
import { CircularProgress } from "@mui/material"
import { useRouter } from "next/router"
import { createContract, editContract } from "../../../../../validators/api-requests"

interface ContractEmployeeProps {
    id: string | number
    isPermissionEdit: boolean
    newUser: boolean
}

interface UserArea {
    nome: string
    id: string
    area: string | null
    perfil: string
}

interface OfficeHours {
    dia_semana: string
    ent1: string | null
    sai1: string | null
    ent2: string | null
    sai2: string | null
    ent3: string | null
    sai3: string | null
}

interface Contract {
    funcao: string | null,
    area: string | null,
    horario: string | null,
    admissao: string | null,
    desligamento: string | null,
    ctps: string | null,
    serie: string | null,
    pis: string | null,
    conta_id: string | null | number,
    banco_1: string | null,
    conta_1: string | null,
    agencia_1: string | null,
    tipo_conta_1: string | null,
    banco_2: string | null,
    conta_2: string | null,
    agencia_2: null,
    tipo_conta_2: string | null,
    cartao_ponto: string | null,
    superior: string | null | number,
    nivel_cargo: string | null
}

interface UserCordinator {
    label: string,
    value: string,
    area: string
}

const ContractEmployee = ({
    id,
    isPermissionEdit,
    newUser
}: ContractEmployeeProps) => {

    const [contract, setContract] = useState<Contract>({
        funcao: null,
        area: null,
        horario: null,
        admissao: null,
        desligamento: null,
        ctps: null,
        serie: null,
        pis: null,
        conta_id: null,
        banco_1: null,
        conta_1: null,
        agencia_1: null,
        tipo_conta_1: null,
        banco_2: null,
        conta_2: null,
        agencia_2: null,
        tipo_conta_2: null,
        cartao_ponto: null,
        superior: null,
        nivel_cargo: null
    })
    const [officeHours, setOfficeHours] = useState<OfficeHours[]>([
        { dia_semana: '2ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '3ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '4ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '5ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '6ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: 'Sábado', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
    ]);
    const [showEditFile, setShowEditFiles] = useState({
        titleDoc: false,
        ctps: false,
        cert_nascimento: false,
        pis: false
    })
    const [usersForCoordinator, setUsersForCoordinator] = useState<UserCordinator[]>([])
    const [filesUser, setFilesUser] = useState<FileUser[]>([])
    const [loadingData, setLoadingData] = useState<boolean>(false)

    const { alert, setLoading, colorPalette } = useAppContext()
    const router = useRouter()


    const getContract = async () => {
        setLoadingData(true)
        try {
            const response = await api.get<Contract>(`/contract/${id}`)
            const { data } = response
            if (data) {
                await listUserByArea()
                await getOfficeHours()
                setContract(data)
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoadingData(false)
        }
    }

    const getOfficeHours = async () => {
        try {
            const response = await api.get(`/officeHours/${id}`)
            const { data = [] } = response
            if (data.length > 0) {
                setOfficeHours(data)
                return
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        getContract()
    }, [id])
    async function listUserByArea() {
        try {
            const response = await api.get<UserArea[]>(`/users`)
            const { data } = response

            const groupUser = data.filter(item => item.perfil.includes('funcionario'))
                ?.map(responsible => ({
                    label: responsible.nome,
                    value: responsible.id,
                    area: responsible.area || ''
                }));

            const sortedUsers = groupUser.length > 0 ? groupUser.sort((a, b) => a.label.localeCompare(b.label)) : []
            setUsersForCoordinator(sortedUsers)
        } catch (error) {
            return error
        }
    }

    const handleChange = (value: ChangeEvent<HTMLInputElement>) => {
        setContract((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleChangeFilesUser = (field: string, fileId: string | null, filePreview: string) => {
        setFilesUser((prevClassDays) => [
            ...prevClassDays,
            {
                id_doc_usuario: fileId,
                location: filePreview,
                campo: field,
            }
        ]);
    };

    const handleOfficeHours = (newData: OfficeHours[]) => {
        setOfficeHours(newData);
    };

    const replicateToDaysWork = () => {
        const firstWorkingHours = officeHours.find(day => day.dia_semana === '2ª Feira')
        if (firstWorkingHours && firstWorkingHours.ent1 !== '') {
            const updatedOfficeHours = officeHours.map(day => ({
                ...day,
                ent1: firstWorkingHours.ent1,
                sai1: firstWorkingHours.sai1,
                ent2: firstWorkingHours.ent2,
                sai2: firstWorkingHours.sai2,
                ent3: firstWorkingHours.ent3,
                sai3: firstWorkingHours.sai3,
            }))
            setOfficeHours(updatedOfficeHours)
        }
    }

    const handleContract = async () => {
        setLoading(true)
        try {
            let response;
            if (newUser) {
                response = await createContract(id, contract)
            } else {
                response = await editContract({ id, contract })
            }

            if (response?.status === 201 || response?.status === 200) {
                alert.success('Dados do Contrato atualizados.');
                await getContract()
            } else {
                alert.error('Tivemos um problema ao cadastrar dados do contrato.');
            }
        } catch (error) {
            alert.error('Tivemos um problema ao cadastrar dados do contrato.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    return (
        <Box>
            {loadingData &&
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', heigth: '100%', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
                    <CircularProgress />
                </Box>}
            <ContentContainer style={{ ...styles.containerContract, opacity: loadingData ? .6 : 1, padding: '25px' }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1, "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    },
                    justifyContent: 'space-between'
                }}>
                    <Text title bold >Contrato</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_arrow_down})`,
                        transition: '.3s',
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} />
                </Box>
                <>
                    <Box sx={styles.inputSection}>
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Função' name='funcao' onChange={handleChange} value={contract?.funcao || ''} label='Função' sx={{ flex: 1, }} />

                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupData.levelEmployee} valueSelection={contract?.nivel_cargo || ''} onSelect={(value: string) => setContract({ ...contract, nivel_cargo: value })}
                            title="Nível do cargo:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupData.area} valueSelection={contract?.area || ''} onSelect={(value: string) => {
                            setContract({ ...contract, area: value })
                            listUserByArea()
                        }}
                            title="Área de atuação:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <SelectList onFilter={true} filterValue="label" disabled={!isPermissionEdit && true} fullWidth data={usersForCoordinator} valueSelection={contract?.superior || ''}
                            onSelect={(value: string) => setContract({ ...contract, superior: value })}
                            title="Superior Responsável:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                    </Box>
                    <Box sx={styles.inputSection}>
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Cartão de Ponto' name='cartao_ponto' onChange={handleChange} value={contract?.cartao_ponto || ''} label='Cartão de Ponto' sx={{ flex: 1, }} />
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Admissão' name='admissao' type="date" onChange={handleChange} value={(contract?.admissao)?.split('T')[0] || ''} label='Admissão' sx={{ flex: 1, }} />
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Desligamento' name='desligamento' type="date" onChange={handleChange}
                            value={contract?.desligamento?.split('T')[0] || ''}
                            label='Desligamento' sx={{ flex: 1, }}
                        // onBlur={() => {
                        //     new Date(contract?.desligamento) > new Date(1001, 0, 1) &&
                        //         setUserData({ ...userData, ativo: 0, admin_melies: contract?.desligamento ? 0 : userData?.admin_melies })
                        // }}
                        />
                    </Box>
                    <Box sx={styles.inputSection}>
                        <FileInput onClick={(value: boolean) => setShowEditFiles({ ...showEditFile, ctps: value })}
                            existsFiles={filesUser?.filter((file) => file.campo === 'ctps').length > 0}>
                            <TextInput disabled={!isPermissionEdit && true} placeholder='CTPS' name='ctps' onChange={handleChange} value={contract?.ctps || ''} label='CTPS' sx={{ flex: 1, }} />

                            <EditFile
                                setFilesUser={setFilesUser}
                                filesUser={filesUser}
                                isPermissionEdit={isPermissionEdit}
                                columnId="id_doc_usuario"
                                open={showEditFile.ctps}
                                newUser={newUser}
                                onSet={(set: boolean) => {
                                    setShowEditFiles({ ...showEditFile, ctps: set })
                                }}
                                title='Carteira de Trabalho'
                                text='Faça o upload da dua carteira de trabalho, depois clique em salvar.'
                                textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                fileData={filesUser?.filter((file) => file.campo === 'ctps')}
                                usuarioId={id}
                                campo='ctps'
                                tipo='documento usuario'
                                callback={(file: FilePreview) => {
                                    if (file.status === 201 || file.status === 200) {
                                        if (!newUser) { getContract() }
                                        else {
                                            handleChangeFilesUser('ctps', file.fileId, file.filePreview)
                                        }
                                    }
                                }}
                            />

                        </FileInput>

                        <TextInput disabled={!isPermissionEdit && true} placeholder='Série' name='serie' onChange={handleChange} value={contract?.serie || ''} label='Série' sx={{ flex: 1, }} />
                        <FileInput onClick={(value: boolean) => setShowEditFiles({ ...showEditFile, pis: value })}
                            existsFiles={filesUser?.filter((file) => file.campo === 'pis').length > 0}>
                            <TextInput disabled={!isPermissionEdit && true} placeholder='PIS' name='pis' onChange={handleChange} value={contract?.pis || ''} label='PIS' sx={{ flex: 1, }} />

                            <EditFile
                                setFilesUser={setFilesUser}
                                filesUser={filesUser}
                                isPermissionEdit={isPermissionEdit}
                                columnId="id_doc_usuario"
                                open={showEditFile.pis}
                                newUser={newUser}
                                onSet={(set: boolean) => {
                                    setShowEditFiles({ ...showEditFile, pis: set })
                                }}
                                title='Pis'
                                text='Faça o upload do seu PIS, depois clique em salvar.'
                                textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                fileData={filesUser?.filter((file) => file.campo === 'pis')}
                                usuarioId={id}
                                campo='pis'
                                tipo='documento usuario'
                                callback={(file: FilePreview) => {
                                    if (file.status === 201 || file.status === 200) {
                                        if (!newUser) { getContract() }
                                        else {
                                            handleChangeFilesUser('pis', file.fileId, file.filePreview)
                                        }
                                    }
                                }}
                            />
                        </FileInput>
                    </Box>
                    <Box sx={styles.inputSection}>
                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupData.banks} valueSelection={contract?.banco_1 || ''}
                            onSelect={(value: string) => setContract({ ...contract, banco_1: value })}
                            title="Banco" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Agência' name='agencia_1' onChange={handleChange} value={contract?.agencia_1 || ''} label='Agência' sx={{ flex: 1, }} />
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Conta' name='conta_1' onChange={handleChange} value={contract?.conta_1 || ''} label='Conta' sx={{ flex: 1, }} />
                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupData.typesAccount} valueSelection={contract?.tipo_conta_1 || ''}
                            onSelect={(value: string) => setContract({ ...contract, tipo_conta_1: value })}
                            title="Tipo de conta" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                    </Box>
                    <Box sx={styles.inputSection}>
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Banco 2' name='banco_2' onChange={handleChange} value={contract?.banco_2 || ''} label='Banco 2' sx={{ flex: 1, }} />
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Agência 2' name='agencia_2' onChange={handleChange} value={contract?.agencia_2 || ''} label='Agência 2' sx={{ flex: 1, }} />
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Conta 2' name='conta_2' onChange={handleChange} value={contract?.conta_2 || ''} label='Conta 2' sx={{ flex: 1, }} />
                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupData.typesAccount || ''} valueSelection={contract?.tipo_conta_2}
                            onSelect={(value: string) => setContract({ ...contract, tipo_conta_2: value })}
                            title="Tipo de conta 2" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                    </Box>

                    <ContentContainer style={{ boxShadow: 'none' }}>
                        <Box sx={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                <Text bold title>Horário de trabalho</Text>
                                {officeHours && <Box sx={{ display: 'flex' }}>
                                    <Button disabled={!isPermissionEdit && true} small text='replicar' style={{ padding: '5px 16px 5px 16px' }} onClick={replicateToDaysWork} />
                                </Box>}
                            </Box>
                            <TableOfficeHours data={officeHours} onChange={handleOfficeHours} />
                        </Box>
                    </ContentContainer>

                </>
            </ContentContainer>


            <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end', padding: '20px 20px' }}>
                <Button cancel style={{ borderRadius: 2 }} text="Cancelar" onClick={() => { if (newUser) { router.push('/administrative/users/list') } else { getContract() } }} />
                <ButtonIcon text="Salvar Alterações" style={{ borderRadius: 2 }} color="#fff" onClick={() => handleContract()} />
            </Box>

        </Box>
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
    containerContract: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
    },
    menuIcon: {
        backgroundSize: 'contain',
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
    containerFile: {
        scrollbarWidth: 'thin',
        scrollbarColor: 'gray lightgray',
        '&::-webkit-scrollbar': {
            width: '5px',

        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'darkgray',
            borderRadius: '5px'
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'gray',

        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: 'gray',

        },
    }
}

export default ContractEmployee