import { TextField, styled } from "@mui/material";
import { Colors } from "../organisms";
import { useAppContext } from "../context/AppContext";
import InputAdornment from '@mui/material/InputAdornment';
import { Box } from "./Box";
import { Text } from "./Text";


export const TextInput = (props) => {
   const { InputProps = {}, label = '', bold = false, InputLabelProps = {}, small = false } = props;
   const { colorPalette } = useAppContext();

   return (
         <TextField
            autoComplete='off'
            id="fieldssss"
            label={label}
            {...props}
            disabled={false}
            onChange={props.disabled ? () => { } : props.onChange}
            InputProps={{
               autocomplete: 'no',
               autoComplete: 'off',
               form: {
                  autocomplete: 'off',
               },
               sx: {
                  transition: 'background-color 1s',
                  disableUnderline: true,
                  borderRadius: 2,
                  fontSize: small ? '12px' : { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' },
                  fontFamily: bold ? 'MetropolisBold' : 'MetropolisRegular',
                  backgroundColor: colorPalette.inputColor,
                  color: colorPalette.textColor,
                  ...InputProps?.style,
                  height: props.multiline ? 'none' : '45px',
                  '&.disabled': {
                     color: 'white', // Cor do texto quando desabilitado
                  },
               },

               startAdornment: props.type === "coin"
                  ? (
                     <InputAdornment position="start">
                        <Text>R$ </Text>
                     </InputAdornment>
                  )
                  : props.type === "search"
                     ? (
                        <InputAdornment position="start">
                           <Box sx={{
                              ...styles.menuIcon,
                              filter: 'brightness(0) invert(.7)',
                              backgroundImage: `url('/icons/search_input_icon.png')`,
                              transition: '.3s',
                              "&:hover": {
                                 opacity: 0.8,
                                 cursor: 'pointer'
                              }
                           }} />
                        </InputAdornment>
                     )
                     : null,
            }}
            InputLabelProps={
               props.type === "date" || props.type === "datetime-local"
                  ? {
                     shrink: true,
                     style: {
                        color: colorPalette.textColor,
                        fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '13px', xl: '14px' },
                        fontFamily: 'MetropolisBold',
                        zIndex: 9
                     },
                     sx: {
                        zIndex: 9
                     }
                  }
                  : {
                     sx: {
                        color: colorPalette.textColor,
                        fontSize: {
                           xs: '16px',
                           xm: '13px',
                           md: '13px',
                           lg: '13px',
                           xl: '14px'
                        },
                        fontFamily: 'MetropolisBold',
                        zIndex: 99,
                        ...InputLabelProps?.style
                     }
                  }
            }
         />
   );
};


const styles = {
   date: {
      // display: 'none',
      display: 'block',
      fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' },
      fontFamily: 'MetropolisBold',
   },
   menuIcon: {
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: 20,
      height: 20,
   },
}