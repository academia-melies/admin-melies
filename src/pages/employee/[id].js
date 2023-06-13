import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { api } from "../../api/api"
import { Box, Button, ContentContainer, Text, TextInput } from "../../atoms"
import { SectionHeader } from "../../organisms"
import { formatTimeStamp } from "../../helpers"
export default function EditUser(props) {
   const router = useRouter()

   const { id } = router.query;
   const newUser = id === 'new';

   const [userData, setUserData] = useState({})
   const [showRegistration, setShowRegistration] = useState(false)
   const [showContract, setShowContract] = useState(false)
   const [dados_pessoais, setDadosPessoais] = useState({})
   const [usuario, setUsuario] = useState({})
   const [dados_titulo, setDadosTitulo] = useState({})
   const [dados_rg, setDadosRg] = useState({})
   const [endereco, setEndereco] = useState({})
   const [contrato, setContract] = useState({})


   const getUserData = async () => {
      try {
         const response = await api.get(`/user/${id}`)
         const { data } = response
         setUserData(data)
      } catch (error) {
         console.log(error)
      }
   }

   useEffect(() => {
      (async () => {
         if (newUser) {
            return
         }
         await getUserData();
      })();
   }, [])

   const handleChangeUsuario = (value) => {
      setUsuario((prevValues) => ({
         ...prevValues,
         [value.target.name]: value.target.value,
      }))
   }

   const handleChangeDadosPessoais = (value) => {
      setDadosPessoais((prevValues) => ({
         ...prevValues,
         [value.target.name]: value.target.value,
      }))
   }


   const handleChangeTitulo = (value) => {
      setDadosTitulo((prevValues) => ({
         ...prevValues,
         [value.target.name]: value.target.value,
      }))
   }

   const handleChangeDadosRg = (value) => {
      setDadosRg((prevValues) => ({
         ...prevValues,
         [value.target.name]: value.target.value,
      }))
   }

   const handleChangeEndereco = (value) => {
      setEndereco((prevValues) => ({
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


   return (
      <>
         <SectionHeader
            perfil={userData?.perfil}
            title={userData?.nome || `Novo Funcionario`}
            saveButton
            // saveButtonAction={newUser ? handleCreateUser : handleEditUser}
            resetButton={!newUser}
            // resetButtonAction={handleResetPassword}
            deleteButton={!newUser}
         // deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteUser })}
         />
         <ContentContainer style={{ backgroundColor: 'none', boxShadow: 'none' }}>

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5 }}>
               <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Contato</Text>
               <TextInput placeholder='Nome' name='nome' onChange={handleChangeUsuario} value={userData?.nome || ''} label='Nome' />
               <TextInput placeholder='E-mail' name='email' onChange={handleChangeUsuario} value={userData?.email || ''} label='E-mail' />
               <TextInput placeholder='Nascimento' name='nascimento' onChange={handleChangeUsuario} value={userData?.nascimento ? formatTimeStamp(userData?.nascimento) : ''} label='Nascimento' />
               <TextInput placeholder='Telefone' name='telefone' onChange={handleChangeUsuario} value={userData?.telefone || ''} label='Telefone' />
               <TextInput placeholder='Perfil' name='perfil' onChange={handleChangeUsuario} value={userData?.perfil || ''} label='Perfil' />
            </ContentContainer>


            <ContentContainer style={{ ...styles.containerRegister, padding: showRegistration ? '40px' : '25px' }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, padding: showRegistration ? '0px 0px 20px 0px' : '0px' }}>
                  <Text title bold >Cadastro Completo</Text>
                  <Box sx={{
                     ...styles.menuIcon,
                     backgroundImage: `url('/icons/gray_arrow_down.PNG')`,
                     transform: showRegistration ? 'rotate(0deg)' : 'rotate(-90deg)',
                     transition: '.3s',
                     "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                     }
                  }} onClick={() => setShowRegistration(!showRegistration)} />
               </Box>
               {showRegistration &&
                  <>
                     <TextInput placeholder='CPF' name='cpf' onChange={handleChangeDadosPessoais} value={userData?.cpf || ''} label='CPF' />
                     <TextInput placeholder='Naturalidade' name='naturalidade' onChange={handleChangeDadosPessoais} value={userData?.naturalidade || ''} label='Naturalidade' />
                     <TextInput placeholder='Nacionalidade' name='nacionalidade' onChange={handleChangeDadosPessoais} value={userData?.nacionalidade || ''} label='Nacionalidade' />
                     <TextInput placeholder='Estado Cívil' name='estado_civil' onChange={handleChangeDadosPessoais} value={userData?.estado_civil || ''} label='Estado Cívil' />
                     <TextInput placeholder='Conjuge' name='conjuge' onChange={handleChangeDadosPessoais} value={userData?.conjuge || ''} label='Conjuge' />
                     <TextInput placeholder='E-mail corporativo' name='email_corporativo' onChange={handleChangeDadosPessoais} value={userData?.email_corporativo || ''} label='E-mail corporativo' />
                     <TextInput placeholder='Dependente' name='dependente' onChange={handleChangeDadosPessoais} value={userData?.dependente || ''} label='Dependente' />
                     <TextInput placeholder='Nome do Pai' name='nome_pai' onChange={handleChangeDadosPessoais} value={userData?.nome_pai || ''} label='Nome do Pai' />
                     <TextInput placeholder='Nome da Mãe' name='nome_mae' onChange={handleChangeDadosPessoais} value={userData?.nome_mae || ''} label='Nome da Mãe' />
                     <TextInput placeholder='Escolaridade' name='escolaridade' onChange={handleChangeDadosPessoais} value={userData?.escolaridade || ''} label='Escolaridade' />
                  </>
               }
            </ContentContainer>

            {userData?.perfil?.includes('funcionario') &&
               <ContentContainer style={{ ...styles.containerContract, padding: showContract ? '40px' : '25px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', padding: showContract ? '0px 0px 20px 0px' : '0px', gap: 1 }}>
                     <Text title bold >Contrato</Text>
                     <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url('/icons/gray_arrow_down.PNG')`,
                        transform: showContract ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: '.3s',
                        "&:hover": {
                           opacity: 0.8,
                           cursor: 'pointer'
                        }
                     }} onClick={() => setShowContract(!showContract)} />
                  </Box>
                  {showContract &&
                     <>
                        <TextInput placeholder='Função' name='funcao' onChange={handleChangeContract} value={userData?.funcao || ''} label='Função' />
                        <TextInput placeholder='Horário' name='horario' onChange={handleChangeContract} value={userData?.horario || ''} label='Horário' />
                        <TextInput placeholder='Admissão' name='admissao' onChange={handleChangeContract} value={userData?.admissao ? formatTimeStamp(userData?.admissao) : ''} label='Admissão' />
                        <TextInput placeholder='Desligamento' name='desligamento' onChange={handleChangeContract} value={userData?.desligamento ? formatTimeStamp(userData?.desligamento) : ''} label='Desligamento' />
                        <TextInput placeholder='CTPS' name='ctps' onChange={handleChangeContract} value={userData?.ctps || ''} label='CTPS' />
                        <TextInput placeholder='Serie' name='serie' onChange={handleChangeContract} value={userData?.serie || ''} label='Serie' />
                        <TextInput placeholder='PIS' name='pis' onChange={handleChangeContract} value={userData?.pis || ''} label='PIS' />
                     </>
                  }
               </ContentContainer>}

         </ContentContainer>
         <Box sx={{ position: 'fixed', bottom: 0, left: 0, width: '100%', padding: 2, gap: 2, display: { xs: 'flex', sm: 'none', md: 'none', lg: 'none' } }}>
            <Button text='Salvar' style={{ flex: 1 }} onClick={() => console.log('Salvar')} />
            <Button text='Resetar senha' style={{ flex: 1 }} onClick={() => console.log('Resetar')} />
            <Button text='Excluir' style={{ flex: 1 }} onClick={() => console.log('Excluir')} />
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
}