import { Avatar, Backdrop } from "@mui/material"
import { useEffect, useState } from "react"
import { Box, Text, ContentContainer, TextInput, Button, PhoneInputField } from "../../atoms"
import { useAppContext } from "../../context/AppContext"
import { api } from "../../api/api"
import { EditFile } from "../../pages/administrative/users/[id]"
import { icons } from "../layout/Colors"

export const DialogUserEdit = (props) => {

   const {
      onClick = () => { }
   } = props;

   const { user, setLoading, alert, matches } = useAppContext()
   const name = user?.nome?.split(' ');
   const firstName = name[0];
   const lastName = name[name.length - 1];
   const userName = `${firstName} ${lastName}`;
   let fotoPerfil = user?.getPhoto?.location || '';
   const [userData, setUserData] = useState({

   })
   const [bgPhoto, setBgPhoto] = useState({})
   const [showEditFile, setShowEditFiles] = useState({
      photoProfile: false
   })
   const [fileCallback, setFileCallback] = useState([])
   const [showEditPhoto, setShowEditPhoto] = useState(false)
   const handleChange = (value) => {
      setUserData((prevValues) => ({
         ...prevValues,
         [value.target.name]: value.target.value,
      }))
   }

   const getUserData = async () => {
      setLoading(true)
      try {
         const response = await api.get(`/userDetails/${user?.id}`)
         const { data } = response;
         setUserData(data)
      } catch (error) {
         console.log(error)
         return error
      } finally {
         setLoading(false)
      }
   }

   const getPhoto = async () => {
      setLoading(true)
      try {
         const response = await api.get(`/photo/${user?.id}`)
         const { data } = response
         setBgPhoto(data)
      } catch (error) {
         console.log(error)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      handleItems()
   }, [])

   const handleItems = async () => {
      setLoading(true)
      try {
         getUserData()
         getPhoto()
      } catch (error) {
         console.log(error)
         return error
      } finally {
         setLoading(false)
      }
   }

   const checkRequiredFields = () => {
      const { senha, nova_senha, confirmar_senha } = userData
      if (nova_senha) {
         if (!senha) { return alert.error('Obrigatório senha atual') }
         if (!confirmar_senha) { return alert.error('Obrigatório confirmar a senha') }
         if (nova_senha != confirmar_senha) { return alert.error('As senhas não conferem') }
      }
      return true
   }

   const handleChangeUserData = async () => {
      if (checkRequiredFields()) {
         try {
            setLoading(true)
            const response = await api.patch(`/userDetails/update/${user.id}`, { userData })
            if (response.status === 201) {
               return alert.success('Suas informações foram atualizadas.')
            }
         } catch (error) {
            if (error?.response?.status === 400) {
               return alert.error('A senha atual não confere.')
            }
            alert.error('Tivemos um problema ao atualizar sua senha.');
            return error
         } finally {
            setLoading(false)
         }
      }
   }

   return (
      <>
         <Backdrop
            sx={{ color: '#fff', zIndex: 99999999, alignItems: 'center', justifyContent: 'center' }}
            open={true}
         >
            <ContentContainer style={{
               ...styles.box, zIndex: 99999, marginLeft: { md: '180px', lg: '280px', xl: '214px' }, gap: 5, display: 'flex',
               maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '680px', lg: '900px', xl: '1280px' }, overflowY: matches && 'auto',
            }}>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', width: '100%', position: 'relative' }}>
                  <Text bold={true} title={true}>Informações pessoais</Text>
                  <Text>Informe os dados para alteração</Text>
                  <Box sx={{
                     ...styles.menuIcon,
                     backgroundImage: `url(${icons.gray_close})`,
                     transition: '.3s',
                     zIndex: 999999999,
                     position: 'absolute',
                     right: -10,
                     top: -10,
                     "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                     }
                  }} onClick={() => onClick(false)} />
               </Box>
               <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 1, position: 'relative', transition: '.3s', }}
                  onMouseEnter={() => setShowEditPhoto(true)}
                  onMouseLeave={() => setShowEditPhoto(false)}>
                  {/* <Avatar
                     sx={{ width: '65px', height: '65px', fontSize: 14, border: `1px solid #fff`, cursor: 'pointer', '&hover': { opacity: 0.5 } }}
                     src={fotoPerfil || `https://mf-planejados.s3.us-east-1.amazonaws.com/melies/perfil-default.jpg`}
                  /> */}
                  <Avatar src={bgPhoto?.location || fileCallback?.filePreview} sx={{
                     width: '90px',
                     height: '90px',
                     borderRadius: '100%',
                     // fontSize: 14,
                     border: `1px solid #fff`,
                     cursor: 'pointer',
                     transition: '.3s',
                     '&hover': { opacity: 0.4 }
                  }}
                     variant="square" onClick={() => setShowEditFiles({ ...showEditFile, photoProfile: true })}
                  />
                  {showEditPhoto &&
                     <Box sx={{ display: 'flex', position: 'absolute', justifyContent: 'center', alignItems: 'center', transition: '.3s', }}>
                        <Button
                           small
                           style={{ borderRadius: '8px', padding: '5px 10px', transition: '.3s', }}
                           text='editar'
                           onClick={() => setShowEditFiles({ ...showEditFile, photoProfile: true })}
                        />
                     </Box>}
                  <Text bold>{userName}</Text>
                  <EditFile
                     columnId="id_foto_perfil"
                     open={showEditFile.photoProfile}
                     newUser={false}
                     onSet={(set) => {
                        setShowEditFiles({ ...showEditFile, photoProfile: set })
                     }}
                     title='Foto de perfil'
                     text='Para alterar sua foto de perfil, clique ou arraste no local desejado.'
                     textDropzone='Arraste ou clique para selecionar a Foto que deseja'
                     fileData={bgPhoto}
                     usuarioId={user?.id}
                     campo='foto_perfil'
                     tipo='foto'
                     bgImage={bgPhoto?.location || fileCallback?.filePreview}
                     callback={(file) => {
                        if (file.status === 201 || file.status === 200) {
                           setFileCallback({
                              status: file.status,
                              id_foto_perfil: file.fileId,
                              filePreview: file.filePreview
                           })
                           handleItems()
                        }
                     }}
                  />
               </Box>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextInput
                     placeholder='Nome social'
                     label='Nome social'
                     onChange={handleChange}
                     name='nome_social'
                     value={userData?.nome_social || ''}
                     margin='none'
                     fullWidth
                     sx={{ flex: 1 }}
                  />
                  <PhoneInputField
                     // label='Telefone *'
                     name='telefone'
                     onChange={(phone) => setUserData({ ...userData, telefone: phone })}
                     value={userData?.telefone}
                     sx={{ flex: 1, }}
                  />
                  <TextInput
                     label='Senha Atual *'
                     placeholder='Senha Atual *'
                     onChange={handleChange}
                     name='senha'
                     type="password"
                     margin='none'
                     fullWidth
                     sx={{ flex: 1 }}
                  />
                  <TextInput
                     placeholder='Nova Senha *'
                     label='Nova Senha *'
                     onChange={handleChange}
                     name='nova_senha'
                     type="password"
                     margin='none'
                     fullWidth
                     sx={{ flex: 1 }}
                  />
                  <TextInput
                     placeholder='Confirmar Senha *'
                     label='Confirmar Senha *'
                     onChange={handleChange}
                     name='confirmar_senha'
                     type="password"
                     margin='none'
                     fullWidth
                     sx={{ flex: 1 }}
                  />
               </Box>
               <Box style={{ display: 'flex' }}>
                  <Button
                     style={{ width: '50%', marginRight: 1 }}
                     text='Alterar senha'
                     onClick={handleChangeUserData}
                  />
                  <Button secondary
                     style={{ width: '50%', }}
                     text='Cancelar'
                     onClick={() => onClick(false)}
                  />
               </Box>
            </ContentContainer>
         </Backdrop>
      </>
   )

}

const styles = {
   overlay: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      opacity: 0.8,
      justifyContent: 'center',
      alignItems: 'center'
   },
   box: {
      opacity: 1,
      minWidth: { xs: `300px`, xm: `400px`, md: `400px`, lg: `400px` },
      padding: 5
   },
   menuIcon: {
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: 20,
      height: 20,
   },
}

