
import { useEffect, useState } from "react";
import { Box, Text } from "../../atoms";
import { Colors } from "../../organisms"

const getColors = (alertType) => {
   if (alertType === 'success') return {
      backgroundColor: '#e5e9e2',
      progressBarColor: Colors.green,
      borderColor: '#b3c2a8',
      progressBarBackgroundColor: '#b3c2a8',
      textColor: '#556746',
   }
   if (alertType === 'error') return {
      backgroundColor: '#f5f2f2',
      progressBarColor: Colors.red,
      borderColor: Colors.red + '44',
      progressBarBackgroundColor: '#f5f2f2',
      textColor: '#91604e',
   }
   if(alertType === 'info') return {
      backgroundColor: '#f5f3f2',
      progressBarColor: Colors.yellow,
      borderColor: '#71644844',
      progressBarBackgroundColor: '#716448',
      textColor: '#716448',
   }
}

export const Alert = (props) => {

   const defaultTimer = props.type === 'success' ? 5 : 5

   const [timer, setTimer] = useState(defaultTimer)
   const theme = getColors(props.type)

   useEffect(() => setTimer(defaultTimer), [props.active])
   useEffect(() => {
      if (props.type !== 'error') {
         if (props.active && timer > 0) {
            setTimeout(() => setTimer(prev => prev - 0.015), 15)
            return
         }
         props.handleClose()
      }
   }, [timer, props.active])

   return (
      <>
         {props.active ?
            <Box sx={styles.alertContainer}>
               <Box sx={{
                  ...styles.alertContent,
                  backgroundColor: theme.backgroundColor,
                  border: `1px solid ${theme.borderColor}`,
               }}>
                  <Box sx={{ ...styles.progressBarContainer, backgroundColor: theme.progressBarBackgroundColor, }}>
                     <Box sx={{
                        position: 'absolute',
                        width: '100%',
                        height: `${(timer * 100) / defaultTimer}%`,
                        backgroundColor: theme.progressBarColor
                     }} />
                  </Box>
                  <Box sx={styles.innerAlertContent}>
                     <Box sx={styles.alertTitleContainer}>
                        <Text bold='true' style={{ color: theme.textColor }}>
                           {props?.title}
                        </Text>
                     </Box>
                     <Box sx={styles.messageContainer}>
                        <Text small style={{ color: theme.textColor }}>
                           {props?.message}
                        </Text>
                     </Box>
                  </Box>
                  <Box
                     onClick={() => props.handleClose()}
                     sx={styles.closeButtonContainer}>
                     <Text bold='true' style={{ color: theme.textColor }}>
                        X
                     </Text>
                  </Box>
               </Box>
            </Box>
            :
            <></>
         }
      </>
   )
}

const styles = {
   alertContainer: {
      position: 'relative',
      zIndex: 99999999999,
   },
   alertContent: {
      position: 'fixed',
      top: 20,
      right: 50,
      display: 'flex',
      alignItems: 'center',
      maxWidth: 450,
      gap: 2,
      padding: 2,
      borderRadius: 3,
   },
   innerAlertContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
   },
   alertTitle: {
      fontSize: 16,
      color: '#555'
   },
   alertMessage: {
      fontSize: 14,
      color: '#555'
   },
   closeButtonContainer: {
      borderRadius: 2,
      padding: `10px`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      "&:hover": {
         cursor: 'pointer'
      }
   },
   alertTitleContainer: {
      width: '100%',
      display: 'flex',
   },
   progressBarContainer: {
      width: 6,
      height: 45,
      borderRadius: 1,

      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      position: 'relative'
   },
   themeIconContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%'
   },
   themeOuterContainer: {
      width: 35,
      height: 35,
      borderRadius: '50%',
      backgroundColor: '#f2f3f5',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
   },
   messageContainer: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
   }
}