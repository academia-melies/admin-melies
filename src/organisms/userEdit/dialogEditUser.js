import { Avatar, Backdrop } from "@mui/material"
import { useState } from "react"
import { Box, Text, ContentContainer, TextInput, Button } from "../../atoms"
import { useAppContext } from "../../context/AppContext"

export const DialogUserEdit = (props) => {

   const {
      onClick = () => { }
   } = props;

   const { user, setLoading, alert, colorPalette } = useAppContext()
   const name = user?.nome?.split(' ');
   const firstName = name[0];
   const lastName = name[name.length - 1];
   const userName = `${firstName} ${lastName}`;
   let fotoPerfil = user?.getPhoto?.location || '';
   const [userData, setUserData] = useState({})
   const handleChange = (value) => {
      setUserData((prevValues) => ({
         ...prevValues,
         [value.target.name]: value.target.value,
      }))
   }

   const checkRequiredFields = () => {
      const { password, newPassword, confirmPassword } = userData

      if (!newPassword) { return alert.error('Obrigatório nova senha') }
      if (password.length < 4) { return alert.error('A senha deve conter no mínimo 4 digitos.') }
      if (!password) { return alert.error('Obrigatório senha atual') }
      if (!confirmPassword) { return alert.error('Obrigatório confirmar a senha') }
      if (newPassword != confirmPassword) { return alert.error('As senhas não conferem') }
      return true
   }

   const handleChangeUserData = async () => {
      if (checkRequiredFields()) {
         try {
            setLoading(true)
            const response = await editUser(user._id, userData)
            if (response?.data?._id) {
               onClick(false)
               return alert.success('Senha atualizada com sucesso.')
            }
            alert.error('Sua senha atual está incorreta.')
         } catch (error) {
            alert.error('Tivemos um problema ao atualizar sua senha.');
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
            <ContentContainer style={{ ...styles.box, zIndex: 99999, marginLeft: { md: '180px', lg: '280px', xl: '214px' } }}>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', width: '100%' }}>
                  <Text title='true' bold='true'>Informações pessoais</Text>
                  <Text>Informe os dados para alteração</Text>
               </Box>
               <Box sx={{display: 'flex', flex: 1, justifyContent: 'center'}}>
                  <Avatar
                     sx={{ width: '65px', height: '65px', fontSize: 14, border: `1px solid #fff`, cursor: 'pointer', '&hover': { opacity: 0.5 } }}
                     src={fotoPerfil || `https://mf-planejados.s3.us-east-1.amazonaws.com/melies/perfil-default.jpg`}
                     />
               </Box>
               <TextInput
                  placeholder='Senha Atual *'
                  onChange={handleChange}
                  name='password'
                  type="password"
                  margin='none'
                  fullWidth
                  InputProps={{
                     style: {
                        fontSize: 14,
                        backgroundColor: '#ffffff33',
                        outline: 'none'
                     }
                  }}
               />
               <TextInput
                  placeholder='Nova Senha *'
                  onChange={handleChange}
                  name='newPassword'
                  type="password"
                  margin='none'
                  fullWidth
                  InputProps={{
                     style: {
                        fontSize: 14,
                        backgroundColor: '#ffffff33',
                        outline: 'none',
                     }
                  }}
               />
               <TextInput
                  placeholder='Confirmar Senha *'
                  onChange={handleChange}
                  name='confirmPassword'
                  type="password"
                  margin='none'
                  fullWidth
                  InputProps={{
                     style: {
                        fontSize: 14,
                        backgroundColor: '#ffffff33',
                        outline: 'none',
                        marginBottom: 5
                     }
                  }}
               />
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
      backgroundColor: '#fff',
      opacity: 1,
      width: { xs: `300px`, xm: `400px`, md: `400px`, lg: `400px` },
      padding: 5
   }
}

