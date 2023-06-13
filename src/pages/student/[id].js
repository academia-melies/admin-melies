import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { api } from "../../api/api"
import { Box, Button, ContentContainer, Text, TextInput } from "../../atoms"
import { SectionHeader } from "../../organisms"
import { formatCPF, formatTimeStamp } from "../../helpers"
export default function EditUser(props) {
   const router = useRouter()

   const { id } = router.query;
   const newUser = id === 'new';

   const [userData, setUserData] = useState({})
   const [showRegistration, setShowRegistration] = useState(false)
   const [showEnrollment, setShowEnrollment] = useState(false)


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


   const handleChange = (value) => {
      setUserData((prevValues) => ({
         ...prevValues,
         [value.target.name]: value.target.value,
      }))
   }


   return (
      <>
         <SectionHeader
            perfil={userData?.perfil}
            title={userData?.nome || `Novo Usuario`}
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
               <TextInput placeholder='Nome' name='nome' onChange={handleChange} value={userData?.nome || ''} label='Nome' />
               <TextInput placeholder='E-mail' name='email' onChange={handleChange} value={userData?.email || ''} label='E-mail' />
               <TextInput placeholder='Nascimento' name='nascimento' onChange={handleChange} value={userData?.nascimento ? formatTimeStamp(userData?.nascimento) : ''} label='Nascimento' />
               <TextInput placeholder='Telefone' name='telefone' onChange={handleChange} value={userData?.telefone || ''} label='Telefone' />
               <TextInput placeholder='Perfil' name='perfil' onChange={handleChange} value={userData?.perfil || ''} label='Perfil' />
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
                     <TextInput placeholder='CPF' name='cpf' onChange={handleChange} value={userData?.cpf ? formatCPF(userData?.cpf) : ''} label='CPF' />
                     <TextInput placeholder='Naturalidade' name='naturalidade' onChange={handleChange} value={userData?.naturalidade || ''} label='Naturalidade' />
                     <TextInput placeholder='Nacionalidade' name='nacionalidade' onChange={handleChange} value={userData?.nacionalidade || ''} label='Nacionalidade' />
                     <TextInput placeholder='Estado Cívil' name='estado_civil' onChange={handleChange} value={userData?.estado_civil || ''} label='Estado Cívil' />
                     <TextInput placeholder='Conjuge' name='conjuge' onChange={handleChange} value={userData?.conjuge || ''} label='Conjuge' />
                     <TextInput placeholder='E-mail corporativo' name='email_corporativo' onChange={handleChange} value={userData?.email_corporativo || ''} label='E-mail corporativo' />
                     <TextInput placeholder='Dependente' name='dependente' onChange={handleChange} value={userData?.dependente || ''} label='Dependente' />
                     <TextInput placeholder='Nome do Pai' name='nome_pai' onChange={handleChange} value={userData?.nome_pai || ''} label='Nome do Pai' />
                     <TextInput placeholder='Nome da Mãe' name='nome_mae' onChange={handleChange} value={userData?.nome_mae || ''} label='Nome da Mãe' />
                     <TextInput placeholder='Escolaridade' name='escolaridade' onChange={handleChange} value={userData?.escolaridade || ''} label='Escolaridade' />
                  </>
               }
            </ContentContainer>

            <ContentContainer style={{ ...styles.containerContract, padding: showEnrollment ? '40px' : '25px' }}>
               <Box sx={{ display: 'flex', alignItems: 'center', padding: showEnrollment ? '0px 0px 20px 0px' : '0px', gap: 1 }}>
                  <Text title bold >Matrícula</Text>
                  <Box sx={{
                     ...styles.menuIcon,
                     backgroundImage: `url('/icons/gray_arrow_down.PNG')`,
                     transform: showEnrollment ? 'rotate(0deg)' : 'rotate(-90deg)',
                     transition: '.3s',
                     "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                     }
                  }} onClick={() => setShowEnrollment(!showEnrollment)} />
               </Box>
               {showEnrollment &&
                  <>
                     <TextInput placeholder='Financeiro' name='financeiro' onChange={handleChange} value={userData?.financeiro || ''} label='Financeiro' />
                     <TextInput placeholder='Situação' name='situacao' onChange={handleChange} value={userData?.situacao || ''} label='Situação' />
                     <TextInput placeholder='Periodo' name='periodo' onChange={handleChange} value={userData?.periodo || ''} label='Periodo' />
                  </>
               }
            </ContentContainer>

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
      gap: 2,
   },
   containerErollment: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 2,
   },
   menuIcon: {
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: 20,
      height: 20,
   },
}