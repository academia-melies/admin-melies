import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { api } from "../../api/api"
import { Box, Button, ContentContainer, Text, TextInput } from "../../atoms"
import { SectionHeader } from "../../organisms"
import { formatCPF, formatTimeStamp } from "../../helpers"
import { createUser, deleteUser, editeUser } from "../../validators/api-requests"
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
      if (value.target.name == 'telefone') {
         const regex = /^\(?([0-9]{2})\)?([0-9]{4,5})\-?([0-9]{4})$/mg;
         let str = value.target.value.replace(/[^0-9]/g, "").slice(0, 11);
         value.target.value = str.replace(regex, "($1) $2-$3")
      }

      setUserData((prevValues) => ({
         ...prevValues,
         [value.target.name]: value.target.value,
      }))
   }

   const checkRequiredFields = () => {
      if (!userData.nome) {
         alert('Usuário precisa de nome')
         return false
      }
      if (!userData?.email) {
         alert('Usuário precisa de email')
         return false
      }
      if (!emailValidator(userData.email)) {
         alert('O e-mail inserido parece estar incorreto.')
         return false
      }
      return true
   }

   const handleCreateUser = async () => {
      if (checkRequiredFields()) {
         try {
            const response = await createUser(userData);
            if (response?.status === 201) {
               alert('Usuário cadastrado com sucesso.');
               router.push(`/student/list`)
            }
         } catch (error) {
            alert('Tivemos um problema ao cadastrar usuário.');
            console.log(error)
         }
      }
   }

   const handleDeleteUser = async () => {
      try {
         const response = await deleteUser(id)

         if (response?.status == 201) {
            alert('Usuário excluído com sucesso.');
            router.push('/employee/list')
         }

      } catch (error) {
         alert('Tivemos um problema ao excluir usuário.');
         console.log(error.response.data)
      }
   }

   const handleEditUser = async () => {
      if (checkRequiredFields()) {
         try {
            const response = await editeUser({ id, userData })
            if (response?.status === 200) {
               alert('Usuário atualizado com sucesso.');
               getUserData()
               return
            }
            alert.error('Tivemos um problema ao atualizar usuário.');
         } catch (error) {
            alert('Tivemos um problema ao atualizar usuário.');
            console.log(error)
         }
      }
   }


   return (
      <>
         <SectionHeader
            perfil={userData?.perfil}
            title={userData?.nome || `Novo Aluno`}
            saveButton
            saveButtonAction={newUser ? handleCreateUser : handleEditUser}
            resetButton={!newUser}
            // resetButtonAction={handleResetPassword}
            deleteButton={!newUser}
            deleteButtonAction={() => handleDeleteUser()}
         />

         <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5 }}>
            <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Contato</Text>
            <TextInput placeholder='Nome' name='nome' onChange={handleChange} value={userData?.nome || ''} label='Nome' />
            <TextInput placeholder='E-mail' name='email' onChange={handleChange} value={userData?.email || ''} label='E-mail' />
            <TextInput placeholder='Nascimento' name='nascimento' onChange={handleChange} type="date" value={(userData?.nascimento)?.split('T')[0] || ''} label='Nascimento' />
            <TextInput placeholder='Telefone' name='telefone' onChange={handleChange} value={userData?.telefone || ''} label='Telefone' />
            <TextInput placeholder='Perfil' name='perfil' onChange={handleChange} value={userData?.perfil || ''} label='Perfil' />
            <TextInput placeholder='Login' name='login' onChange={handleChange} value={userData?.login || ''} label='Login' />
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-around', gap: 1.8 }}>
               <TextInput placeholder='Senha' name='senha' onChange={handleChange} value={userData?.senha || ''} label='Senha' sx={{ flex: 1, }} type="password" />
               <TextInput placeholder='Nova senha' name='nova_senha' onChange={handleChange} value={userData?.nova_senha || ''} label='Nova senha' sx={{ flex: 1, }} />
            </Box>
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
                  <TextInput placeholder='CPF' name='cpf' onChange={handleChange} value={userData?.cpf || ''} label='CPF' />
                  <TextInput placeholder='Naturalidade' name='naturalidade' onChange={handleChange} value={userData?.naturalidade || ''} label='Naturalidade' />
                  <TextInput placeholder='Nacionalidade' name='nacionalidade' onChange={handleChange} value={userData?.nacionalidade || ''} label='Nacionalidade' />
                  <TextInput placeholder='Estado Cívil' name='estado_civil' onChange={handleChange} value={userData?.estado_civil || ''} label='Estado Cívil' />
                  <TextInput placeholder='Conjuge' name='conjuge' onChange={handleChange} value={userData?.conjuge || ''} label='Conjuge' />
                  <TextInput placeholder='E-mail corporativo' name='email_melies' onChange={handleChange} value={userData?.email_melies || ''} label='E-mail corporativo' />
                  <TextInput placeholder='Dependente' name='dependente' onChange={handleChange} value={userData?.dependente || ''} label='Dependente' />
                  <TextInput placeholder='Nome do Pai' name='nome_pai' onChange={handleChange} value={userData?.nome_pai || ''} label='Nome do Pai' />
                  <TextInput placeholder='Nome da Mãe' name='nome_mae' onChange={handleChange} value={userData?.nome_mae || ''} label='Nome da Mãe' />
                  <TextInput placeholder='Escolaridade' name='escolaridade' onChange={handleChange} value={userData?.escolaridade || ''} label='Escolaridade' />
                  <TextInput placeholder='Endereço' name='rua' onChange={handleChange} value={userData?.rua || ''} label='Endereço' />
                  <TextInput placeholder='Cidade' name='cidade' onChange={handleChange} value={userData?.cidade || ''} label='Cidade' />
                  <TextInput placeholder='UF' name='uf' onChange={handleChange} value={userData?.uf || ''} label='UF' />
                  <TextInput placeholder='CEP' name='cep' onChange={handleChange} value={userData?.cep || ''} label='CEP' />
                  <TextInput placeholder='Bairro' name='bairro' onChange={handleChange} value={userData?.bairro || ''} label='Bairro' />
                  <TextInput placeholder='Complemento' name='complemento' onChange={handleChange} value={userData?.complemento || ''} label='Complemento' />
                  <TextInput placeholder='RG' name='rg' onChange={handleChange} value={userData?.rg || ''} label='RG' />
                  <TextInput placeholder='UF' name='uf_rg' onChange={handleChange} value={userData?.uf_rg || ''} label='UF' />
                  <TextInput placeholder='Expedição' name='expedicao' onChange={handleChange} type="date" value={(userData?.expedicao)?.split('T')[0] || ''} label='Expedição' />
                  <TextInput placeholder='Orgão' name='orgao' onChange={handleChange} value={userData?.orgao || ''} label='Orgão' />
                  <TextInput placeholder='Titulo de Eleitor' name='titulo' onChange={handleChange} value={userData?.titulo || ''} label='Titulo de Eleitor' />
                  <TextInput placeholder='Zona' name='zona' onChange={handleChange} value={userData?.zona || ''} label='Zona' />
                  <TextInput placeholder='Seção' name='secao' onChange={handleChange} value={userData?.secao || ''} label='Seção' />

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