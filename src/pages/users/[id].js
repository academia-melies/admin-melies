import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { api } from "../../api/api"
import { Box, Button, ContentContainer, Text, TextInput } from "../../atoms"
import { SectionHeader } from "../../organisms"
export default function EditUser(props) {
   const router = useRouter()

   const { id } = router.query;
   const newUser = 'new';

   const [userData, setUserData] = useState({})
   const [activeStatus, setActive] = useState()

   const getUserData = async () => {
      try {
         const response = await api.get(`/user/${id}`)
         const { data } = response
         setUserData(data)
         setActive(data.active)
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

   // const checkRequiredFields = () => {
   //    if (!userData.name) { return alert.error('Usuário precisa de nome') }
   //    if (!userData?.email) { return alert.error('Usuário precisa de email') }
   //    if (!userData?.companyId) { return alert.error('Usuário precisa de empresa') }
   //    if (!userData?.permissions || userData?.permissions?.length === 0) { return alert.error('Usuário precisa de permissões') }
   //    if (!emailValidator(userData.email)) { return alert.error('O e-mail inserido parece estar incorreto.') }
   //    return true
   // }

   // const handleCreateUser = async () => {
   //    if (checkRequiredFields()) {
   //       try {
   //          const response = await createUser(userData);
   //          if (response?.status === 201) {
   //             alert('Usuário cadastrado com sucesso.');
   //             router.push(`/users/${response?.data._id}`)
   //          }
   //       } catch (error) {
   //          alert.error('Tivemos um problema ao cadastrar usuário.');
   //          console.log(error)
   //       } 
   //    }
   // }

   // const handleDeleteUser = async () => {
   //    try {
   //       const response = await deleteUser(id)
   //       if (response?.data?._id) {
   //          alert('Usuário excluído com sucesso.');
   //          router.push('/users/list')
   //       }
   //    } catch (error) {
   //       alert('Tivemos um problema ao excluir usuário.');
   //       console.log(error)
   //    }
   // }

   // const handleEditUser = async () => {
   //    if (checkRequiredFields()) {
   //       try {
   //          const response = await editeUser({ id, userData })
   //          if (response?.status === 200) {
   //             alert('Usuário atualizado com sucesso.');
   //             getUserData()
   //             return
   //          }
   //          alert.error('Tivemos um problema ao atualizar usuário.');
   //       } catch (error) {
   //          alert.error('Tivemos um problema ao atualizar usuário.');
   //          console.log(error)
   //       } finally {
   //          setLoading(false)
   //       }
   //    }
   // }

   // const handleResetPassword = async () => {
   //    try {
   //       setLoading(true)
   //       const response = await resetPasswordUser({ id, userData })
   //       if (response?.data?._id) {
   //          alert('Senha resetada com sucesso. Nova senha enviada por email');
   //       }
   //    } catch (error) {
   //       alert.error('Tivemos um problema ao resetar a senha do usuário.');
   //       console.log(error)
   //    } finally {
   //       setLoading(false)
   //    }

   // }


   return (
      <>
         <SectionHeader
            title={userData?.NAME || `Novo Usuario`}
            saveButton
            // saveButtonAction={newUser ? handleCreateUser : handleEditUser}
            resetButton={!newUser}
            // resetButtonAction={handleResetPassword}
            deleteButton={!newUser}
         // deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteUser })}
         />
         <ContentContainer>

            <Text title bold>Contato</Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.5 }}>
               <TextInput placeholder='Nome' name='name' onChange={handleChange} value={userData?.name} label='Nome' />
               <TextInput placeholder='E-mail' name='email' onChange={handleChange} value={userData?.email} label='E-mail' />
               <TextInput placeholder='Nascimento' name='nascimento' onChange={handleChange} value={userData?.email} label='Nascimento' />
               <TextInput placeholder='Telefone' name='telefone' onChange={handleChange} value={userData?.email} label='Telefone' />
               <TextInput placeholder='Perfil' name='perfil' onChange={handleChange} value={userData?.email} label='Perfil' />
            </Box>

            <Text title bold>Cadastro</Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.5 }}>
               <TextInput placeholder='CPF' name='cpf' onChange={handleChange} value={userData?.email} label='CPF' />
               <TextInput placeholder='Naturalidade' name='naturalidade' onChange={handleChange} value={userData?.email} label='Naturalidade' />
               <TextInput placeholder='Nacionalidade' name='nacionalidade' onChange={handleChange} value={userData?.email} label='Nacionalidade' />
               <TextInput placeholder='Estado Cívil' name='estado_civil' onChange={handleChange} value={userData?.email} label='Estado Cívil' />
               <TextInput placeholder='Conjuge' name='conjuge' onChange={handleChange} value={userData?.email} label='Conjuge' />
               <TextInput placeholder='E-mail corporativo' name='email_corporativo' onChange={handleChange} value={userData?.email} label='E-mail corporativo' />
               <TextInput placeholder='Dependente' name='dependente' onChange={handleChange} value={userData?.email} label='Dependente' />
               <TextInput placeholder='Nome do Pai' name='nome_pai' onChange={handleChange} value={userData?.email} label='Nome do Pai' />
               <TextInput placeholder='Nome da Mãe' name='nome_mae' onChange={handleChange} value={userData?.email} label='Nome da Mãe' />
               <TextInput placeholder='Escolaridade' name='escolaridade' onChange={handleChange} value={userData?.email} label='Escolaridade' />
            </Box>
         </ContentContainer>
         <Box sx={{ position: 'fixed', bottom: 0, left: 0, width: '100%', padding: 2, gap: 2, display: { xs: 'flex', sm: 'none', md: 'none', lg: 'none' } }}>
            <Button text='Salvar' style={{ flex: 1 }} onClick={() => console.log('Salvar')} />
            <Button secondary text='Resetar senha' style={{ flex: 1 }} onClick={() => console.log('Resetar')} />
            <Button secondary text='Excluir' style={{ flex: 1 }} onClick={() => console.log('Excluir')} />
         </Box>
      </>
   )
}