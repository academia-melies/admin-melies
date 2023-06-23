import { useRouter } from "next/router";
import { Box, Button, Text } from "../../atoms";
import { useAppContext } from "../../context/AppContext";
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

   const { colorPalette } = useAppContext()

   return (
      <>
         <Box sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
         }}>
            <Box sx={{ display: 'flex', flex: 1, height: '100%', maxWidth: '100%', gap: 2, overflow: 'hidden', position: 'relative', alignItems: 'center' }}>
               <Text
                  veryLarge='true'
                  bold='true'
                  style={{
                     whiteSpace: 'nowrap',
                     textAlign: { xs: `center`, sm: 'start', md: 'start', lg: 'start' },
                     color: colorPalette.textColor
                  }}>{title}</Text>
               {perfil &&
                  <Box sx={{ backgroundColor: colorPalette.buttonColor, borderRadius: 2, padding: '5px 12px 2px 12px', transition: 'background-color 1s', }}>
                     <Text xsmall bold style={{ color: "#fff" }}>{perfil}</Text>
                  </Box>
               }
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
               backgroundColor: colorPalette.primary,
               gap: 1,
               transition: 'background-color 1s',
            }}>
               {newButton && <Button text='Novo' style={{ width: 150 }} onClick={newButtonAction} />}
               {saveButton && <Button text='Salvar' style={{ width: 150 }} onClick={saveButtonAction} />}
               {resetButton && <Button secondary text='Resetar senha' style={{ width: 150 }} onClick={resetButtonAction} />}
               {deleteButton && <Button secondary text='Excluir' style={{ width: 150 }} onClick={deleteButtonAction} />}
               {customButton && <Button tertiary text={customButtonText} style={{ width: 150 }} onClick={customButtonAction} />}
            </Box>
         </Box>
      </>
   )
}
