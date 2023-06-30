import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
import { Avatar, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { createContract, createEnrollment, createUser, editContract, editeEnrollment, editeUser } from "../../../validators/api-requests"
import { emailValidator } from "../../../helpers"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditUser(props) {
    const { setLoading, alert, colorPalette } = useAppContext()
    const router = useRouter()
    const { id, slug } = router.query;
    const newUser = id === 'new';
    const [perfil, setPerfil] = useState('')
    const [userData, setUserData] = useState({})
    const [contract, setContract] = useState({})
    const [enrollmentData, setEnrollmentData] = useState({})
    const [showRegistration, setShowRegistration] = useState(false)
    const [countries, setCountries] = useState([])
    const [foreigner, setForeigner] = useState(false)
    const [showContract, setShowContract] = useState(false)
    const [showEnrollment, setShowEnrollment] = useState(false)
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    useEffect(() => {
        findCountries()
    }, [slug])

    const getUserData = async () => {
        try {
            const response = await api.get(`/user/${id}`)
            const { data } = response
            setUserData(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getContract = async () => {
        try {
            const response = await api.get(`/contract/${id}`)
            const { data } = response
            setContract(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getEnrollment = async () => {
        try {
            const response = await api.get(`/enrollment/${id}`)
            const { data } = response
            setEnrollmentData(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        (async () => {
            if (newUser) {
                return
            }
            await handleItems();
        })();
    }, [perfil])

    async function findCEP(cep) {
        setLoading(true)
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
            const { data } = response;

            setUserData((prevValues) => ({
                ...prevValues,
                rua: data.logradouro,
                cidade: data.localidade,
                uf: data.uf,
                bairro: data.bairro,
            }))
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    async function findCountries() {
        try {
            const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/paises/paises`);
            const { data = [] } = response;
            const abbreviatedNames = data.map(country => country.nome.abreviado);
            const uniqueAbbreviatedNames = [...new Set(abbreviatedNames)];

            uniqueAbbreviatedNames.sort()

            const groupAccount = uniqueAbbreviatedNames.map(name => ({
                label: name,
                value: name
            }));

            setCountries(groupAccount);
        } catch (error) {
        }
    }



    // async function verifyCPF(cpf, nascimento) {
    //     setLoading(true)
    //     let token_access = 'F285AF4D-13C7-46B9-8C66-583DBE14E017';
    //     let cpf = cpf;
    //     let dataNascimento = nascimento;
    //     let plugin = 'CPF';


    //     try {
    //         const response = await axios.get(`https://www.sintegraws.com.br/api/v1/execute-api.php?token=${token_access}&cpf=${cpf}&data-nascimento=${dataNascimento}&plugin=${plugin}`)
    //         const { data } = response;

    //     } catch (error) {
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    async function autoEmailMelies(email) {
        try {
            const name = userData?.nome?.split(' ');
            const firstName = name[0];
            const lastName = name.length > 1 ? name[name.length - 1] : '';
            let firstEmail = `${firstName}.${lastName}@melies.com.br`;

            if (!lastName) {
                firstEmail = `${firstName}01@melies.com.br`;
            }

            setUserData((prevValues) => ({
                ...prevValues,
                email_melies: firstEmail.toLowerCase(),
            }))
        } catch (error) {
        }
    }

    const handleBlurCEP = (event) => {
        const { value } = event.target;
        findCEP(value);
    };

    const handleItems = async () => {
        setLoading(true)
        try {
            await getUserData()
            if (perfil === 'student') return getEnrollment()
            if (perfil === 'employee') return getContract()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar Usuarios')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {
        if (value.target.name == 'telefone') {
            const regex = /^\(?([0-9]{2})\)?([0-9]{4,5})\-?([0-9]{4})$/mg;
            let str = value.target.value.replace(/[^0-9]/g, "").slice(0, 11);
            value.target.value = str.replace(regex, "($1) $2-$3")
        }

        if (value.target.name == 'cpf') {
            let str = value.target.value;
            value.target.value = formatCPF(str)
        }

        if (value.target.name == 'rg') {
            let str = value.target.value;
            value.target.value = formatRg(str)
        }

        if (value.target.name == 'cep') {
            let str = value.target.value;
            value.target.value = formatCEP(str)
        }


        setUserData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleChangeContract = (value) => {
        setContract((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleChangeEnrollment = (value) => {

        setEnrollmentData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const checkRequiredFields = () => {
        if (!userData.nome) {
            alert.error('Usuário precisa de nome')
            return false
        }
        if (!userData?.email) {
            alert.error('Usuário precisa de email')
            return false
        }
        if (!emailValidator(userData.email)) {
            alert.error('O e-mail inserido parece estar incorreto.')
            return false
        }

        if (userData.senha !== userData.confirmar_senha) {
            alert.error('As senhas não correspondem. Por favor, verifique novamente.')
            return false
        }
        return true
    }

    const handleCreateUser = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await createUser(userData);
                const { data } = response
                if (userData.perfil === 'funcionario') {
                    const responseData = await createContract(data?.userId, contract)
                    return responseData;
                }
                if (userData.perfil === 'aluno') {
                    const responseData = await createEnrollment(data?.userId, enrollmentData);
                    return responseData;
                }
                if (response?.status === 201) {
                    alert.success('Usuário cadastrado com sucesso.');
                    router.push(`/administrative/user/${data?.userId}`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar usuário.');
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteUser = async () => {
        setLoading(true)
        try {
            const response = await deleteUser(id)
            if (response?.status == 201) {
                alert.success('Usuário excluído com sucesso.');
                router.push(`/administrative/user`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir usuário.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditUser = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await editeUser({ id, userData })
                if (perfil === 'employee') {
                    const responseData = await editContract({ id, contract })
                }
                if (perfil === 'student') {
                    const responseData = await editeEnrollment({ id, enrollmentData })
                }
                if (response?.status === 201) {
                    alert.success('Usuário atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar usuário.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar usuário.');
            } finally {
                setLoading(false)
            }
        }
    }

    const groupPerfil = [
        { label: 'funcionario', value: 'funcionario' },
        { label: 'aluno', value: 'aluno' },
        { label: 'interessado', value: 'interessado' },
    ]

    const groupCivil = [
        { label: 'Solteiro', value: 'Solteiro' },
        { label: 'Casado', value: 'Casado' },
        { label: 'Separado', value: 'Separado' },
        { label: 'Divorciado', value: 'Divorciado' },
        { label: 'Viúvo', value: 'Viúvo' },
    ]

    const groupEscolaridade = [
        { label: 'Ensino fundamental', value: 'Ensino fundamental' },
        { label: 'Ensino médio', value: 'Ensino médio' },
        { label: 'Superior (Graduação)', value: 'Superior (Graduação)' },
        { label: 'Pós-graduação', value: 'Pós-graduação' },
        { label: 'Mestrado', value: 'Mestrado' },
        { label: 'Doutorado', value: 'Doutorado' },
    ]

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupAdmin = [
        { label: 'sim', value: 1 },
        { label: 'não', value: 0 },
    ]

    const groupRacaCor = [
        { label: 'Prefiro não declarar', value: 'Prefiro não declarar' },
        { label: 'Branca', value: 'Branca' },
        { label: 'Preta', value: 'Preta' },
        { label: 'Parda', value: 'Parda' },
        { label: 'Amarela', value: 'Amarela' },
        { label: 'Indigena', value: 'Indigena' },
    ]

    const groupGender = [
        { label: 'Masculino', value: 'Masculino' },
        { label: 'Feminino', value: 'Feminino' },
        { label: 'Outro', value: 'Outro' },
        { label: 'Prefiro não informar', value: 'Prefiro não informar' },
    ]

    const groupDisability = [
        { label: 'Sim', value: 'Sim' },
        { label: 'Não', value: 'Não' },
        { label: 'Não dispõe de informação', value: 'Não dispõe de informação' },
    ]

    const groupNationality = [
        { label: 'Brasileira Nata', value: 'Brasileira Nata' },
        { label: 'Brasileira por Naturalização', value: 'Brasileira por Naturalização' },
        { label: 'Estrangeira', value: 'Estrangeira' },
    ]

    return (
        <>
            <SectionHeader
                perfil={userData?.perfil}
                title={userData?.nome || `Novo ${userData.perfil === 'funcionario' && 'Funcionario' || userData.perfil === 'aluno' && 'Aluno' || userData.perfil === 'interessado' && 'Interessado'  || 'Usuario'}`}
                saveButton
                saveButtonAction={newUser ? handleCreateUser : handleEditUser}
                deleteButton={!newUser}
                deleteButtonAction={() => handleDeleteUser()}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, padding: '0px 0px 25px 0px', alignItems: 'center' }}>
                    <Box>
                        <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Contato</Text>
                    </Box>

                    <Box sx={{ '&:hover': { opacity: 0.8, cursor: 'pointer' } }}>
                        <Avatar src={userData?.foto} sx={{ width: 140, height: 140, borderRadius: '16PX' }} variant="square" />
                    </Box>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nome' name='nome' onChange={handleChange} value={userData?.nome || ''} label='Nome' onBlur={autoEmailMelies} sx={{ flex: 1, }} />
                    <TextInput placeholder='Nome Social' name='nome_social' onChange={handleChange} value={userData?.nome_social || ''} label='Nome Social' sx={{ flex: 1, }} />
                    <TextInput placeholder='E-mail' name='email' onChange={handleChange} value={userData?.email || ''} label='E-mail' sx={{ flex: 1, }} />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Login' name='login' onChange={handleChange} value={userData?.login || ''} label='Login' sx={{ flex: 1, }} />
                    <TextInput placeholder='Nascimento' name='nascimento' onChange={handleChange} type="date" value={(userData?.nascimento)?.split('T')[0] || ''} label='Nascimento' sx={{ flex: 1, }} />
                    <TextInput placeholder='Telefone' name='telefone' onChange={handleChange} value={userData?.telefone || ''} label='Telefone' sx={{ flex: 1, }} />
                </Box>
                <RadioItem valueRadio={userData?.perfil} group={groupPerfil} title="Perfil" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, perfil: value, admin_melies: value === 'interessado' ? 0 : userData.admin_melies })} sx={{ flex: 1, }} />

                <TextInput placeholder='URL (foto perfil)' name='foto' onChange={handleChange} value={userData?.foto || ''} label='URL (foto perfil)' sx={{ flex: 1, }} />
                {!newUser && <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-around', gap: 1.8 }}>
                    <TextInput placeholder='Nova senha' name='nova_senha' onChange={handleChange} value={userData?.nova_senha || ''} type="password" label='Nova senha' sx={{ flex: 1, }} />
                    <TextInput placeholder='Confirmar senha' name='confirmar_senha' onChange={handleChange} value={userData?.confirmar_senha || ''} type="password" label='Confirmar senha' sx={{ flex: 1, }} />
                </Box>}

                <RadioItem valueRadio={userData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, ativo: parseInt(value), admin_melies: value < 1 ? parseInt(value) : userData?.admin_melies })} />
                <RadioItem valueRadio={userData?.admin_melies} group={groupAdmin} title="Acesso ao AdminMéliès" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, admin_melies: parseInt(value) })} />

            </ContentContainer>


            {/* dados_pessoais */}
            <ContentContainer style={{ ...styles.containerRegister, padding: showRegistration ? '40px' : '25px' }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1, padding: showRegistration ? '0px 0px 20px 0px' : '0px', "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }} onClick={() => setShowRegistration(!showRegistration)}>
                    <Text title bold >Cadastro Completo</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_arrow_down})`,
                        transform: showRegistration ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: '.3s',
                    }} />
                </Box>
                {showRegistration &&
                    <>
                        <Box sx={{ padding: '0px 0px 20px 0px' }}>
                            <CheckBoxComponent label="Estrangeiro sem CPF" onSelect={(value) => {
                                setForeigner(value)
                                setUserData({...userData, nacionalidade: value === true ? 'Estrangeira' : ''})
                                }} />
                        </Box>
                        <Box sx={styles.inputSection}>
                            {!foreigner && <TextInput placeholder='CPF' name='cpf' onChange={handleChange} value={userData?.cpf || ''} label='CPF' sx={{ flex: 1, }} />}
                            {foreigner && <TextInput placeholder='Doc estrangeiro' name='doc_estrangeiro' onChange={handleChange} value={userData?.doc_estrangeiro || ''} label='Doc estrangeiro' sx={{ flex: 1, }} />}

                            <TextInput placeholder='Naturalidade' name='naturalidade' onChange={handleChange} value={userData?.naturalidade || ''} label='Naturalidade' sx={{ flex: 1, }} />

                            <SelectList fullWidth data={countries} valueSelection={userData?.pais_origem} onSelect={(value) => setUserData({ ...userData, pais_origem: value })}
                                title="Pais de origem" filterOpition="value" sx={{ backgroundColor: colorPalette.primary, color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                            <SelectList fullWidth data={groupNationality} valueSelection={userData?.nacionalidade} onSelect={(value) => setUserData({ ...userData, nacionalidade: value })}
                                title="Nacionalidade" filterOpition="value" sx={{ backgroundColor: colorPalette.primary, color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                        </Box>

                        {/* <RadioItem valueRadio={userData?.cor_raca} group={groupCivil} title="Cor/raça" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, cor_raca: value })} />
                         */}
                        <Box sx={styles.inputSection}>

                            <SelectList fullWidth data={groupRacaCor} valueSelection={userData.cor_raca} onSelect={(value) => setUserData({ ...userData, cor_raca: value })}
                                title="Cor/raça" filterOpition="value" sx={{ backgroundColor: colorPalette.primary, color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />

                            <SelectList fullWidth data={groupGender} valueSelection={userData?.genero} onSelect={(value) => setUserData({ ...userData, genero: value })}
                                title="Genêro" filterOpition="value" sx={{ backgroundColor: colorPalette.primary, color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />

                            <SelectList fullWidth data={groupDisability} valueSelection={userData?.deficiencia} onSelect={(value) => setUserData({ ...userData, deficiencia: value })}
                                title="Deficiência" filterOpition="value" sx={{ backgroundColor: colorPalette.primary, color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />

                        </Box>


                        <RadioItem valueRadio={userData?.estado_civil} group={groupCivil} title="Estado Cívil" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, estado_civil: value })} />

                        {/* <TextInput placeholder='Estado Cívil' name='estado_civil' onChange={handleChange} value={userData?.estado_civil || ''} label='Estado Cívil' /> */}
                        <TextInput placeholder='E-mail corporativo' name='email_melies' onChange={handleChange} value={userData?.email_melies || ''} label='E-mail corporativo' />
                        <Box sx={styles.inputSection}>
                            {userData?.estado_civil === 'Casado' && <TextInput placeholder='Conjuge' name='conjuge' onChange={handleChange} value={userData?.conjuge || ''} label='Conjuge' sx={{ flex: 1, }} />}
                            <TextInput placeholder='Dependente' name='sdependente' onChange={handleChange} value={userData?.dependente || ''} label='Dependente' sx={{ flex: 1, }} />
                            <TextInput placeholder='Nome do Pai' name='nome_pai' onChange={handleChange} value={userData?.nome_pai || ''} label='Nome do Pai' sx={{ flex: 1, }} />
                            <TextInput placeholder='Nome da Mãe' name='nome_mae' onChange={handleChange} value={userData?.nome_mae || ''} label='Nome da Mãe' sx={{ flex: 1, }} />
                        </Box>
                        <RadioItem valueRadio={userData?.escolaridade} group={groupEscolaridade} title="Escolaridade" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, escolaridade: value })} />
                        {/* <TextInput placeholder='Escolaridade' name='escolaridade' onChange={handleChange} value={userData?.escolaridade || ''} label='Escolaridade' /> */}
                        <Box sx={styles.inputSection}>
                            <TextInput placeholder='CEP' name='cep' onChange={handleChange} value={userData?.cep || ''} label='CEP' onBlur={handleBlurCEP} sx={{ flex: 1, }} />
                            <TextInput placeholder='Endereço' name='rua' onChange={handleChange} value={userData?.rua || ''} label='Endereço' sx={{ flex: 1, }} />
                            <TextInput placeholder='Nº' name='numero' onChange={handleChange} value={userData?.numero || ''} label='Nº' sx={{ flex: 1, }} />
                        </Box>
                        <Box sx={styles.inputSection}>
                            <TextInput placeholder='Cidade' name='cidade' onChange={handleChange} value={userData?.cidade || ''} label='Cidade' sx={{ flex: 1, }} />
                            <TextInput placeholder='UF' name='uf' onChange={handleChange} value={userData?.uf || ''} label='UF' sx={{ flex: 1, }} />
                            <TextInput placeholder='Bairro' name='bairro' onChange={handleChange} value={userData?.bairro || ''} label='Bairro' sx={{ flex: 1, }} />
                            <TextInput placeholder='Complemento' name='complemento' onChange={handleChange} value={userData?.complemento || ''} label='Complemento' sx={{ flex: 1, }} />
                        </Box>
                        <Box sx={styles.inputSection}>
                            <TextInput placeholder='RG' name='rg' onChange={handleChange} value={userData?.rg || ''} label='RG' sx={{ flex: 1, }} />
                            <TextInput placeholder='UF' name='uf_rg' onChange={handleChange} value={userData?.uf_rg || ''} label='UF' sx={{ flex: 1, }} />
                            <TextInput placeholder='Expedição' name='expedicao' onChange={handleChange} type="date" value={(userData?.expedicao)?.split('T')[0] || ''} label='Expedição' sx={{ flex: 1, }} />
                            <TextInput placeholder='Orgão' name='orgao' onChange={handleChange} value={userData?.orgao || ''} label='Orgão' sx={{ flex: 1, }} />
                        </Box>
                        <Box sx={styles.inputSection}>
                            <TextInput placeholder='Titulo de Eleitor' name='titulo' onChange={handleChange} value={userData?.titulo || ''} label='Titulo de Eleitor' sx={{ flex: 1, }} />
                            <TextInput placeholder='Zona' name='zona' onChange={handleChange} value={userData?.zona || ''} label='Zona' sx={{ flex: 1, }} />
                            <TextInput placeholder='Seção' name='secao' onChange={handleChange} value={userData?.secao || ''} label='Seção' sx={{ flex: 1, }} />
                        </Box>

                    </>
                }
            </ContentContainer>

            {/* contrato */}
            {userData.perfil === 'funcionario' &&
                <ContentContainer style={{ ...styles.containerContract, padding: showContract ? '40px' : '25px' }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', padding: showContract ? '0px 0px 20px 0px' : '0px', gap: 1, "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => setShowContract(!showContract)}>
                        <Text title bold >Contrato</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_arrow_down})`,
                            transform: showContract ? 'rotate(0deg)' : 'rotate(-90deg)',
                            transition: '.3s',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} />
                    </Box>
                    {showContract &&
                        <>
                            <Box sx={styles.inputSection}>
                                <TextInput placeholder='Função' name='funcao' onChange={handleChangeContract} value={contract?.funcao || ''} label='Função' sx={{ flex: 1, }} />
                                <TextInput placeholder='Horário' name='horario' onChange={handleChangeContract} value={contract?.horario || ''} label='Horário' sx={{ flex: 1, }} />
                            </Box>
                            <Box sx={styles.inputSection}>
                                <TextInput placeholder='Admissão' name='admissao' type="date" onChange={handleChangeContract} value={(contract?.admissao)?.split('T')[0] || ''} label='Admissão' sx={{ flex: 1, }} />
                                <TextInput placeholder='Desligamento' name='desligamento' type="date" onChange={handleChangeContract} value={(contract?.desligamento)?.split('T')[0] || ''} label='Desligamento' sx={{ flex: 1, }} />
                            </Box>
                            <Box sx={styles.inputSection}>
                                <TextInput placeholder='CTPS' name='ctps' onChange={handleChangeContract} value={contract?.ctps || ''} label='CTPS' sx={{ flex: 1, }} />
                                <TextInput placeholder='Serie' name='serie' onChange={handleChangeContract} value={contract?.serie || ''} label='Serie' sx={{ flex: 1, }} />
                                <TextInput placeholder='PIS' name='pis' onChange={handleChangeContract} value={contract?.pis || ''} label='PIS' sx={{ flex: 1, }} />
                            </Box>
                            <Box sx={styles.inputSection}>
                                <TextInput placeholder='Banco' name='banco_1' onChange={handleChangeContract} value={contract?.banco_1 || ''} label='Banco' sx={{ flex: 1, }} />
                                <TextInput placeholder='Conta' name='conta_1' onChange={handleChangeContract} value={contract?.conta_1 || ''} label='Conta' sx={{ flex: 1, }} />
                                <TextInput placeholder='Agência' name='agencia_1' onChange={handleChangeContract} value={contract?.agencia_1 || ''} label='Agência' sx={{ flex: 1, }} />
                                <SelectList fullWidth data={groupAccount} valueSelection={contract?.tipo_conta_1} onSelect={(value) => setContract({ ...contract, tipo_conta_1: value })}
                                    title="Tipo de conta" filterOpition="value" sx={{ backgroundColor: colorPalette.primary, color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />
                            </Box>
                            <Box sx={styles.inputSection}>
                                <TextInput placeholder='Banco 2' name='banco_2' onChange={handleChangeContract} value={contract?.banco_2 || ''} label='Banco 2' sx={{ flex: 1, }} />
                                <TextInput placeholder='Conta 2' name='conta_2' onChange={handleChangeContract} value={contract?.conta_2 || ''} label='Conta 2' sx={{ flex: 1, }} />
                                <TextInput placeholder='Agência 2' name='agencia_2' onChange={handleChangeContract} value={contract?.agencia_2 || ''} label='Agência 2' sx={{ flex: 1, }} />
                                <SelectList fullWidth data={groupAccount} valueSelection={contract?.tipo_conta_2} onSelect={(value) => setContract({ ...contract, tipo_conta_2: value })}
                                    title="Tipo de conta 2" filterOpition="value" sx={{ backgroundColor: colorPalette.primary, color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />
                            </Box>
                        </>
                    }
                </ContentContainer>
            }

            {userData.perfil === 'aluno' &&
                <ContentContainer style={{ ...styles.containerContract, padding: showEnrollment ? '40px' : '25px' }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', padding: showEnrollment ? '0px 0px 20px 0px' : '0px', gap: 1, "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => setShowEnrollment(!showEnrollment)}>
                        <Text title bold >Matrícula</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_arrow_down})`,
                            transform: showEnrollment ? 'rotate(0deg)' : 'rotate(-90deg)',
                            transition: '.3s',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} />
                    </Box>
                    {showEnrollment &&
                        <>
                            <TextInput placeholder='Financeiro' name='financeiro' onChange={handleChangeEnrollment} value={enrollmentData?.financeiro || ''} label='Financeiro' />
                            <TextInput placeholder='Situação' name='situacao' onChange={handleChangeEnrollment} value={enrollmentData?.situacao || ''} label='Situação' />
                            <TextInput placeholder='Periodo' name='periodo' onChange={handleChangeEnrollment} value={enrollmentData?.periodo || ''} label='Periodo' />
                        </>
                    }
                </ContentContainer>
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
    containerContract: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
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