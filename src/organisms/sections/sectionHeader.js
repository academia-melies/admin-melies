import { Box, Button, Text } from "../../atoms";
import { Colors } from "../layout/Colors";

export const SectionHeader = (props) => {
   const {
      perfil = '',
      title = '',
      newButton = false,
      newButtonAction = () => { },
      saveButton = false,
      saveButtonAction = () => { },
      deleteButton = false,
      deleteButtonAction = () => { },
      resetButton = false,
      resetButtonAction = () => { },
      customButton = false,
      customButtonText = '',
      customButtonAction = () => { }
   } = props;

   return (
      <>
         <Box sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
         }}>
            {perfil &&
               <Box sx={{position: 'absolute', top: 55, backgroundColor: Colors.orange, borderRadius: 2, padding: '2px 12px 2px 12px'}}>
                  <Text small bold style={{color: Colors.textPrimary}}>{perfil}</Text>
               </Box>
            }
            <Box sx={{ display: 'flex', flex: 1, height: '100%', maxWidth: '100%', gap: 3, overflow: 'hidden', position: 'relative', alignItems: 'center', }}>
               <Text
                  title='true'
                  bold='true'
                  style={{
                     whiteSpace: 'nowrap',
                     textAlign: { xs: `center`, sm: 'start', md: 'start', lg: 'start' },
                     color: Colors.backgroundPrimary
                  }}>{title}</Text>
               <Box sx={{ display: { xs: 'none', sm: 'flex', md: 'flex', lg: 'flex' }, position: 'absolute', top: 0, right: 0, height: '100%' }}>
                  <Box sx={{
                     width: { sm: 100, md: 100, lg: 200 }, height: '100%',
                  }} />
               </Box>
            </Box>
            <Box sx={{
               display: 'flex',
               position: { xs: 'fixed', sm: 'relative', md: 'relative', lg: 'relative' },
               justifyContent: { xs: 'center' },
               bottom: { xs: 0 },
               left: { xs: 0 },
               right: { xs: 0 },
               margin: { xs: 'auto' },
               zIndex: { xs: 9999, sm: 'auto', md: 'auto', lg: 'auto' },
               padding: { xs: 2, sm: 0, md: 0, lg: 0 },
               backgroundColor: Colors.background,
               gap: 1
            }}>
               {newButton && <Button text='Novo' style={{ width: 150 }} onClick={newButtonAction} />}
               {saveButton && <Button  text='Salvar' style={{ width: 150 }} onClick={saveButtonAction} />}
               {resetButton && <Button secondary text='Resetar senha' style={{ width: 150 }} onClick={resetButtonAction} />}
               {deleteButton && <Button secondary text='Excluir' style={{ width: 150 }} onClick={deleteButtonAction} />}
               {customButton && <Button tertiary text={customButtonText} style={{ width: 150 }} onClick={customButtonAction} />}
            </Box>
         </Box>
      </>
   )
}
