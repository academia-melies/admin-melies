import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { api } from "../../api/api"
import { Box, Button, ContentContainer, TextInput } from "../../atoms"
import { useAppContext } from "../../context/AppContext"
import { Forbidden } from "../../forbiddenPage/forbiddenPage"
import { CheckBoxGroup, DropList, SectionHeader } from "../../organisms"
import { createUser, deleteUser, editeUser, resetPasswordUser } from "../../validators/api-requests"
import { emailValidator } from "../../validators/auth-validator"

export default function EditUser(props) {

   const { setLoading, permissions = [], alert, setShowConfirmationDialog } = useAppContext()
   const router = useRouter()

   const { id, isPartner = false } = router.query;
   const newUser = id === 'new';
   const userIsAdmin = permissions.includes('Admin');
   const userHasMarketingPermission = permissions.includes('Marketing');

   const [userData, setUserData] = useState({ permissions: [] })
   const [activeStatus, setActive] = useState()
   const [companies, setCompanies] = useState([])

   const newUserPermissions = userHasMarketingPermission ? [
      {
         value: 'Partner',
         display: 'Parceiro'
      }] : [
      {
         value: 'Client',
         display: 'Cliente'
      },
      {
         value: 'Admin',
         display: 'Administrador'
      },
      {
         value: 'Auditor',
         display: 'Auditor'
      },
      {
         value: 'Marketing',
         display: 'Marketing'
      },
      {
         value: 'Partner',
         display: 'Parceiro'
      },
   ];

   useEffect(() => {
      (async () => {
         setLoading(true);
         await getCompanies();

         if (newUser) {
            // console.log(isPartner)
            isPartner === 'true' && setUserData({ ...userData, permissions: [...userData.permissions, 'Partner'] });
            setLoading(false)
            return
         }

         await getUserData();
         setLoading(false)
      })();
   }, [])

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

   const getCompanies = async () => {
      try {
         const response = await api.get(`/company/list?showPartnersOnly=${isPartner || userHasMarketingPermission}`);
         console.log(response.data)
         const { data } = response
         setCompanies(data)
      } catch (error) {
         console.log(error)
      }
   }

   const handleChange = (value) => {
      setUserData((prevValues) => ({
         ...prevValues,
         [value.target.name]: value.target.value,
      }))
   }

   const checkRequiredFields = () => {
      if (!userData.name) { return alert.error('Usuário precisa de nome') }
      if (!userData?.email) { return alert.error('Usuário precisa de email') }
      if (!userData?.companyId) { return alert.error('Usuário precisa de empresa') }
      if (!userData?.permissions || userData?.permissions?.length === 0) { return alert.error('Usuário precisa de permissões') }
      if (!emailValidator(userData.email)) { return alert.error('O e-mail inserido parece estar incorreto.') }
      return true
   }

   const handleCreateUser = async () => {
      if (checkRequiredFields()) {
         try {
            setLoading(true)
            const response = await createUser(userData);
            if (response?.status === 201) {
               alert.success('Usuário cadastrado com sucesso.');
               router.push(`/users/${response?.data._id}`)
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
      try {
         setLoading(true)
         const response = await deleteUser(id)
         if (response?.data?._id) {
            alert.success('Usuário excluído com sucesso.');
            router.push('/users/list')
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
         try {
            setLoading(true)
            const response = await editeUser({ id, userData })
            if (response?.status === 200) {
               alert.success('Usuário atualizado com sucesso.');
               getUserData()
               return
            }
            alert.error('Tivemos um problema ao atualizar usuário.');
         } catch (error) {
            alert.error('Tivemos um problema ao atualizar usuário.');
            console.log(error)
         } finally {
            setLoading(false)
         }
      }
   }

   const handleResetPassword = async () => {
      try {
         setLoading(true)
         const response = await resetPasswordUser({ id, userData })
         if (response?.data?._id) {
            alert.success('Senha resetada com sucesso. Nova senha enviada por email');
         }
      } catch (error) {
         alert.error('Tivemos um problema ao resetar a senha do usuário.');
         console.log(error)
      } finally {
         setLoading(false)
      }

   }

   const addPermission = (value) => {
      const newPermissions = [...userData?.permissions];
      const permissionsExists = newPermissions.includes(value);

      if (!!permissionsExists) {
         const indexToBeDeleted = newPermissions.indexOf(value);
         if (indexToBeDeleted !== -1) newPermissions.splice(indexToBeDeleted, 1);
      } else {
         newPermissions.push(value)
      }

      setUserData({ ...userData, permissions: newPermissions })
   }

   return (
      <>
         {userIsAdmin || userHasMarketingPermission ?
            <>
               <SectionHeader
                  title={userData?.name || `Novo ${isPartner === 'true' ? `Parceiro` : `Cliente`}`}
                  saveButton
                  saveButtonAction={newUser ? handleCreateUser : handleEditUser}
                  resetButton={!newUser}
                  resetButtonAction={handleResetPassword}
                  deleteButton={!newUser}
                  deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteUser })}
               />
               <ContentContainer>
                  <TextInput placeholder='Nome' name='name' onChange={handleChange} value={userData?.name} />
                  <TextInput placeholder='E-mail' name='email' onChange={handleChange} value={userData?.email} />
                  <DropList
                     data={companies}
                     filterField='name'
                     placeholder='Selecione uma empresa'
                     fieldToDisplay='name'
                     selectedOption={userData?.companyId}
                     onSelect={(value) => setUserData({ ...userData, companyId: value })}
                     maxHeight={150}
                  />
                  <Box sx={{
                     display: 'flex',
                     flexDirection: 'column',
                     gap: 2,
                     marginTop: 10
                  }}>
                     <CheckBoxGroup
                        title='Permissões'
                        onClick={addPermission}
                        values={userData?.permissions}
                        options={newUserPermissions}
                     />
                     <CheckBoxGroup
                        title='Status'
                        onClick={() => {
                           setActive(!activeStatus)
                           setUserData({ ...userData, active: !activeStatus })
                        }}
                        values={activeStatus}
                        toggle
                        options={[
                           {
                              value: true,
                              display: 'Ativo'
                           },
                        ]}
                     />
                  </Box>
               </ContentContainer>
               <Box sx={{ position: 'fixed', bottom: 0, left: 0, width: '100%', padding: 2, gap: 2, display: { xs: 'flex', sm: 'none', md: 'none', lg: 'none' } }}>
                  <Button text='Salvar' style={{ flex: 1 }} onClick={handleEditUser} />
                  <Button secondary text='Resetar senha' style={{ flex: 1 }} onClick={handleResetPassword} />
                  <Button secondary text='Excluir' style={{ flex: 1 }} onClick={handleEditUser} />
               </Box>
            </>
            :
            <Forbidden />
         }
      </>
   )
}