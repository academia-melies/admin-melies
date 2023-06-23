import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { api } from "../../api/api"
import { Box, Button, ContentContainer, Text, TextInput } from "../../atoms"
import { RadioItem, SectionHeader } from "../../organisms"
import { emailValidator, formatCEP, formatCPF, formatRg, formatTimeStamp } from "../../helpers"
import { createEnrollment, createUser, deleteUser, editeEnrollment, editeUser } from "../../validators/api-requests"
import axios from "axios"
import { useAppContext } from "../../context/AppContext"
import { icons } from "../../organisms/layout/Colors"
import { Avatar, useMediaQuery, useTheme } from "@mui/material"


export default function EditUser(props) {
   const router = useRouter()
   const { setLoading, alert } = useAppContext()
   const { id } = router.query;
   const newUser = id === 'new';

   const [userData, setUserData] = useState({})
   const [enrollmentData, setEnrollmentData] = useState({})
   const [showRegistration, setShowRegistration] = useState(false)
   const [showEnrollment, setShowEnrollment] = useState(false)

   const themeApp = useTheme()
   const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))


   const getUserData = async () => {
      try {
         const response = await api.get(`/user/${id}`)
         const { data } = response
         setUserData(data)
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
   }, [])

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
         console.log(error)
      } finally {
         setLoading(false)
      }
   }

   const handleBlurCEP = (event) => {
      findCEP(event.target.value);
   };

   const handleItems = async () => {
      try {
         setLoading(true)
         await getUserData()
         await getEnrollment()
      } catch (error) {
         alert.error('Ocorreu um erro ao carregar o usuario')
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
      if (!emailValidator(userData.email)) {
         alert.error('O e-mail inserido parece estar incorreto.')
         return false
      }
      return true
   }

   const handleCreateUser = async () => {
      if (checkRequiredFields()) {
         setLoading(true)
         try {
            const response = await createUser(userData);
            const { data } = response;
            const responseEnrollment = await createEnrollment(data?.userId, enrollmentData);
            if (response?.status === 201) {
               alert.success('Usuário cadastrado com sucesso.');
               router.push(`/student/${data?.userId}`)
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
         if (response?.status == 201) {
            alert.success('Usuário excluído com sucesso.');
            router.push('/employee/list')
         }
      } catch (error) {
         alert.error('Tivemos um problema ao excluir usuário.');
         console.log(error.response.data)
      } finally {
         setLoading(false)
      }
   }

   const handleEditUser = async () => {
      if (checkRequiredFields()) {
         setLoading(true)
         try {
            const response = await editeUser({ id, userData })
            const enrollmentResponse = await editeEnrollment({ id, enrollmentData })
            if (response?.status === 201 && enrollmentResponse?.status === 201) {
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




   return (
      <>
         <SectionHeader
            perfil={userData?.perfil}
            title={userData?.nome || `Novo Aluno`}
            saveButton
            saveButtonAction={newUser ? handleCreateUser : handleEditUser}
            deleteButton={!newUser}
            deleteButtonAction={() => handleDeleteUser()}
         />

         <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5 }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, padding: '0px 0px 25px 0px', alignItems: 'center' }}>
               <Box>
                  <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Contato</Text>
               </Box>

               <Box sx={{ '&:hover': { opacity: 0.8, cursor: 'pointer' } }}>
                  <Avatar src={userData?.foto} sx={{ width: 140, height: 140, borderRadius: '16PX' }} variant="square" />
               </Box>
            </Box>
            <TextInput placeholder='Nome' name='nome' onChange={handleChange} value={userData?.nome || ''} label='Nome' />
            <TextInput placeholder='E-mail' name='email' onChange={handleChange} value={userData?.email || ''} label='E-mail' />
            <TextInput placeholder='Nascimento' name='nascimento' onChange={handleChange} type="date" value={(userData?.nascimento)?.split('T')[0] || ''} label='Nascimento' />
            <TextInput placeholder='Telefone' name='telefone' onChange={handleChange} value={userData?.telefone || ''} label='Telefone' />
            <RadioItem valueRadio={userData?.perfil} group={groupPerfil} title="Perfil" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, perfil: value })} />
            {/* <TextInput placeholder='Perfil' name='perfil' onChange={handleChange} value={userData?.perfil || ''} label='Perfil' /> */}
            <TextInput placeholder='Login' name='login' onChange={handleChange} value={userData?.login || ''} label='Login' />
            <TextInput placeholder='URL (foto perfil)' name='foto' onChange={handleChange} value={userData?.foto || ''} label='URL (foto perfil)' />
            {!newUser && <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-around', gap: 1.8 }}>
               <TextInput placeholder='Nova senha' name='nova_senha' onChange={handleChange} value={userData?.nova_senha || ''} type="password" label='Nova senha' sx={{ flex: 1, }} />
            </Box>}
         </ContentContainer>


         <ContentContainer style={{ ...styles.containerRegister, padding: showRegistration ? '40px' : '25px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, padding: showRegistration ? '0px 0px 20px 0px' : '0px' }}>
               <Text title bold >Cadastro Completo</Text>
               <Box sx={{
                  ...styles.menuIcon,
                  backgroundImage: `url(${icons.gray_arrow_down})`,
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
               <RadioItem valueRadio={userData?.estado_civil} group={groupCivil} title="Estado Cívil" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, estado_civil: value })} />
               {/* <TextInput placeholder='Estado Cívil' name='estado_civil' onChange={handleChange} value={userData?.estado_civil || ''} label='Estado Cívil' /> */}
               <TextInput placeholder='Conjuge' name='conjuge' onChange={handleChange} value={userData?.conjuge || ''} label='Conjuge' />
               <TextInput placeholder='E-mail corporativo' name='email_melies' onChange={handleChange} value={userData?.email_melies || ''} label='E-mail corporativo' />
               <TextInput placeholder='Dependente' name='dependente' onChange={handleChange} value={userData?.dependente || ''} label='Dependente' />
               <TextInput placeholder='Nome do Pai' name='nome_pai' onChange={handleChange} value={userData?.nome_pai || ''} label='Nome do Pai' />
               <TextInput placeholder='Nome da Mãe' name='nome_mae' onChange={handleChange} value={userData?.nome_mae || ''} label='Nome da Mãe' />
               <RadioItem valueRadio={userData?.escolaridade} group={groupEscolaridade} title="Escolaridade" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, escolaridade: value })} />
               {/* <TextInput placeholder='Escolaridade' name='escolaridade' onChange={handleChange} value={userData?.escolaridade || ''} label='Escolaridade' /> */}
               <TextInput placeholder='CEP' name='cep' onChange={handleChange} value={userData?.cep || ''} label='CEP' onBlur={handleBlurCEP} />
               <TextInput placeholder='Endereço' name='rua' onChange={handleChange} value={userData?.rua || ''} label='Endereço' />
               <TextInput placeholder='Cidade' name='cidade' onChange={handleChange} value={userData?.cidade || ''} label='Cidade' />
               <TextInput placeholder='UF' name='uf' onChange={handleChange} value={userData?.uf || ''} label='UF' />
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
                  backgroundImage: `url(${icons.gray_arrow_down})`,
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
                  <TextInput placeholder='Financeiro' name='financeiro' onChange={handleChangeEnrollment} value={enrollmentData?.financeiro || ''} label='Financeiro' />
                  <TextInput placeholder='Situação' name='situacao' onChange={handleChangeEnrollment} value={enrollmentData?.situacao || ''} label='Situação' />
                  <TextInput placeholder='Periodo' name='periodo' onChange={handleChangeEnrollment} value={enrollmentData?.periodo || ''} label='Periodo' />
               </>
            }
         </ContentContainer>
         {/* <Box sx={{ position: 'fixed', bottom: 0, left: 0, width: '100%', padding: 2, gap: 2, display: { xs: 'flex', sm: 'none', md: 'none', lg: 'none' } }}>
            <Button text='Salvar' style={{ flex: 1 }} onClick={newUser ? handleCreateUser : handleEditUser} />
            <Button text='Excluir' style={{ flex: 1 }} onClick={() => handleDeleteUser()} />
         </Box> */}
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